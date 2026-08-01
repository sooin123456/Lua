#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const LABEL = 'dev.lua.mac-worker';

function escapeXml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function servicePaths(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const launchAgentsDir = path.join(options.homeDir || os.homedir(), 'Library', 'LaunchAgents');
  return {
    rootDir,
    launchAgentsDir,
    plistPath: path.join(launchAgentsDir, `${LABEL}.plist`),
    workerPath: path.join(rootDir, '90_System', 'lua_cloud_main', 'mac_worker.js'),
    envPath: path.join(rootDir, '.env.worker'),
    logDir: path.join(rootDir, 'local-data'),
  };
}

function buildPlist(options = {}) {
  const paths = servicePaths(options);
  const nodePath = options.nodePath || process.execPath;
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${escapeXml(nodePath)}</string>
    <string>${escapeXml(paths.workerPath)}</string>
    <string>watch</string>
  </array>
  <key>WorkingDirectory</key><string>${escapeXml(paths.rootDir)}</string>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>15</integer>
  <key>StandardOutPath</key><string>${escapeXml(path.join(paths.logDir, 'lua-worker.log'))}</string>
  <key>StandardErrorPath</key><string>${escapeXml(path.join(paths.logDir, 'lua-worker-error.log'))}</string>
  <key>EnvironmentVariables</key>
  <dict><key>PATH</key><string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string></dict>
</dict>
</plist>
`;
}

function runLaunchctl(args, options = {}) {
  const result = (options.spawnSync || spawnSync)('/bin/launchctl', args, { encoding: 'utf8' });
  return { ok: result.status === 0, status: result.status, message: String(result.stderr || result.stdout || '').trim() };
}

function installService(options = {}) {
  const paths = servicePaths(options);
  if (!fs.existsSync(paths.envPath)) throw new Error('Mac Worker is not paired. Send /lua pair, then run npm run cloud:worker:pair -- CODE.');
  fs.mkdirSync(paths.launchAgentsDir, { recursive: true });
  fs.mkdirSync(paths.logDir, { recursive: true });
  fs.writeFileSync(paths.plistPath, buildPlist(options), { encoding: 'utf8', mode: 0o600 });
  const domain = `gui/${process.getuid()}`;
  runLaunchctl(['bootout', domain, paths.plistPath], options);
  const loaded = runLaunchctl(['bootstrap', domain, paths.plistPath], options);
  if (!loaded.ok) throw new Error(`Could not start Lua Mac Worker: ${loaded.message}`);
  return { ok: true, label: LABEL, plistPath: paths.plistPath };
}

function uninstallService(options = {}) {
  const paths = servicePaths(options);
  const domain = `gui/${process.getuid()}`;
  runLaunchctl(['bootout', domain, paths.plistPath], options);
  if (fs.existsSync(paths.plistPath)) fs.unlinkSync(paths.plistPath);
  return { ok: true, removed: paths.plistPath };
}

function serviceStatus(options = {}) {
  const result = runLaunchctl(['print', `gui/${process.getuid()}/${LABEL}`], options);
  return { ok: result.ok, installed: result.ok, label: LABEL, message: result.ok ? 'Lua Mac Worker is running.' : 'Lua Mac Worker is not loaded.' };
}

function main(argv = process.argv.slice(2)) {
  const command = argv[0] || 'status';
  if (command === 'install') return installService();
  if (command === 'uninstall') return uninstallService();
  if (command === 'status') return serviceStatus();
  throw new Error(`Unknown service command: ${command}`);
}

if (require.main === module) {
  try {
    console.log(JSON.stringify(main(), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  LABEL,
  buildPlist,
  installService,
  servicePaths,
  serviceStatus,
  uninstallService,
};
