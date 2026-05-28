#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');

const DEFAULT_TEMPLATE_ROOT = path.join(os.tmpdir(), 'lua-template-inspect');

function readIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function exists(root, rel) {
  return fs.existsSync(path.join(root, rel));
}

function fileIncludes(root, rel, pattern) {
  const content = readIfExists(path.join(root, rel));
  return pattern instanceof RegExp ? pattern.test(content) : content.includes(pattern);
}

function listFiles(root, dirRel, predicate = () => true) {
  const dir = path.join(root, dirRel);
  if (!fs.existsSync(dir)) return [];
  const results = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (predicate(full)) {
        results.push(path.relative(root, full).replace(/\\/g, '/'));
      }
    }
  }
  return results.sort();
}

function detectTables(root) {
  const tables = new Set();
  const schemaFiles = listFiles(root, 'app/features', (file) => file.endsWith('schema.ts'));
  for (const rel of schemaFiles) {
    const content = readIfExists(path.join(root, rel));
    if (/\bprofiles\b/.test(content)) tables.add('profiles');
    if (/\bpayments\b/.test(content)) tables.add('payments');
  }
  const migrationFiles = listFiles(root, 'sql/migrations', (file) => file.endsWith('.sql'));
  for (const rel of migrationFiles) {
    const content = readIfExists(path.join(root, rel));
    for (const match of content.matchAll(/CREATE TABLE "([^"]+)"/g)) tables.add(match[1]);
  }
  return [...tables].sort();
}

function inspectLuaTemplate(options = {}) {
  const templateRoot = options.templateRoot || process.env.LUA_TEMPLATE_ROOT || DEFAULT_TEMPLATE_ROOT;
  if (!fs.existsSync(templateRoot)) {
    return {
      available: false,
      templateRoot,
      summary: [`Lua_template not found at ${templateRoot}`],
      auth: {},
      database: { tables: [] },
      verification: {},
      email: {},
    };
  }

  const auth = {
    supabaseServerClient: fileIncludes(templateRoot, 'app/core/lib/supa-client.server.ts', 'createServerClient'),
    supabaseAdminClient: fileIncludes(templateRoot, 'app/core/lib/supa-admin-client.server.ts', 'SUPABASE_SERVICE_ROLE_KEY'),
    emailPassword: fileIncludes(templateRoot, 'app/features/auth/screens/login.tsx', 'signInWithPassword'),
    join: fileIncludes(templateRoot, 'app/features/auth/screens/join.tsx', 'signUp'),
    magicLink: fileIncludes(templateRoot, 'app/features/auth/screens/magic-link.tsx', /signInWithOtp|magic/i),
    socialOAuth: fileIncludes(templateRoot, 'app/features/auth/screens/social/start.tsx', 'signInWithOAuth'),
    routeGuard: fileIncludes(templateRoot, 'app/core/lib/guards.server.ts', 'requireAuthentication'),
  };
  const database = {
    drizzle: fileIncludes(templateRoot, 'app/core/db/drizzle-client.server.ts', /drizzle|DATABASE_URL/),
    supabaseRls: listFiles(templateRoot, 'sql/migrations', (file) => file.endsWith('.sql'))
      .some((rel) => /ENABLE ROW LEVEL SECURITY|CREATE POLICY/.test(readIfExists(path.join(templateRoot, rel)))),
    tables: detectTables(templateRoot),
    signUpTrigger: exists(templateRoot, 'sql/functions/handle_sign_up.sql')
      || listFiles(templateRoot, 'sql/migrations', (file) => file.endsWith('.sql'))
        .some((rel) => /auth\.users|handle.*sign/i.test(readIfExists(path.join(templateRoot, rel)))),
  };
  const verification = {
    authE2e: exists(templateRoot, 'e2e/auth/login.spec.ts') || exists(templateRoot, 'e2e/auth/join.spec.ts'),
    userE2e: exists(templateRoot, 'e2e/users/edit-profile.spec.ts'),
    settingsE2e: exists(templateRoot, 'e2e/settings/settings.spec.ts'),
  };
  const email = {
    transactionalTemplates: listFiles(templateRoot, 'transactional-emails/emails', (file) => file.endsWith('.tsx')).length > 0,
  };

  const summary = [];
  if (auth.supabaseServerClient) summary.push('Supabase auth is already wired with a server client and cookie session handling.');
  if (auth.emailPassword) summary.push('Email/password login is already implemented.');
  if (auth.magicLink) summary.push('Magic-link or OTP auth screens are present.');
  if (auth.socialOAuth) summary.push('Social OAuth flow is present.');
  if (auth.routeGuard) summary.push('Protected routes can use requireAuthentication.');
  if (database.drizzle) summary.push('Drizzle is already configured against DATABASE_URL.');
  if (database.supabaseRls) summary.push('SQL migrations include Supabase RLS policies.');
  if (database.tables.length > 0) summary.push(`Existing tables: ${database.tables.join(', ')}.`);
  if (database.signUpTrigger) summary.push('Sign-up profile creation trigger/function is present.');
  if (verification.authE2e) summary.push('Auth e2e coverage is present.');
  if (email.transactionalTemplates) summary.push('Transactional email templates are present.');

  return { available: true, templateRoot, auth, database, verification, email, summary };
}

function main() {
  const result = inspectLuaTemplate();
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) main();

module.exports = {
  inspectLuaTemplate,
};
