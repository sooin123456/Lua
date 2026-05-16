const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { inspectLuaTemplate } = require('../scripts/lua_template_inspector');

function write(filePath, content = '') {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function makeTemplate() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-template-fixture-'));
  write(path.join(root, 'app', 'core', 'lib', 'supa-client.server.ts'), 'createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)');
  write(path.join(root, 'app', 'core', 'lib', 'supa-admin-client.server.ts'), 'SUPABASE_SERVICE_ROLE_KEY');
  write(path.join(root, 'app', 'core', 'db', 'drizzle-client.server.ts'), 'drizzle postgres process.env.DATABASE_URL');
  write(path.join(root, 'app', 'core', 'lib', 'guards.server.ts'), 'requireAuthentication');
  write(path.join(root, 'app', 'features', 'auth', 'screens', 'login.tsx'), 'signInWithPassword');
  write(path.join(root, 'app', 'features', 'auth', 'screens', 'join.tsx'), 'signUp');
  write(path.join(root, 'app', 'features', 'auth', 'screens', 'magic-link.tsx'), 'signInWithOtp');
  write(path.join(root, 'app', 'features', 'auth', 'screens', 'social', 'start.tsx'), 'signInWithOAuth');
  write(path.join(root, 'app', 'features', 'users', 'schema.ts'), 'pgTable profiles pgPolicy authUsers');
  write(path.join(root, 'app', 'features', 'payments', 'schema.ts'), 'pgTable payments pgPolicy authUsers');
  write(path.join(root, 'sql', 'migrations', '0000.sql'), 'ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY; CREATE POLICY "select-profile-policy" ON "profiles";');
  write(path.join(root, 'sql', 'functions', 'handle_sign_up.sql'), 'CREATE FUNCTION public.handle_new_user()');
  write(path.join(root, 'e2e', 'auth', 'login.spec.ts'), 'loginUser');
  write(path.join(root, 'transactional-emails', 'emails', 'magic-link.tsx'), 'Magic link');
  return root;
}

test('inspects Lua_template auth, database, and verification capabilities', () => {
  const root = makeTemplate();

  const result = inspectLuaTemplate({ templateRoot: root });

  assert.equal(result.available, true);
  assert.equal(result.auth.supabaseServerClient, true);
  assert.equal(result.auth.emailPassword, true);
  assert.equal(result.auth.magicLink, true);
  assert.equal(result.auth.socialOAuth, true);
  assert.equal(result.auth.routeGuard, true);
  assert.equal(result.database.drizzle, true);
  assert.equal(result.database.supabaseRls, true);
  assert.deepEqual(result.database.tables.sort(), ['payments', 'profiles']);
  assert.equal(result.database.signUpTrigger, true);
  assert.equal(result.verification.authE2e, true);
  assert.equal(result.email.transactionalTemplates, true);
  assert.match(result.summary.join('\n'), /Supabase auth/);
  assert.match(result.summary.join('\n'), /Drizzle/);
});
