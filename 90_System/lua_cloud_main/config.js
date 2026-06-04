const REQUIRED_ENV = [
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_WEBHOOK_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

function validateCloudEnv(env = process.env) {
  const missing = REQUIRED_ENV.filter((key) => !env[key]);
  const present = {};
  for (const key of REQUIRED_ENV) {
    present[key] = Boolean(env[key]);
  }

  return {
    ok: missing.length === 0,
    missing,
    present,
    optional: {
      PORT: Boolean(env.PORT),
      LUA_DEPLOYMENT_TARGET: Boolean(env.LUA_DEPLOYMENT_TARGET),
      LUA_PROCESS_INTERVAL_MS: Boolean(env.LUA_PROCESS_INTERVAL_MS),
      LUA_PROCESS_LIMIT: Boolean(env.LUA_PROCESS_LIMIT),
      LUA_PROCESSOR_LOOP: Boolean(env.LUA_PROCESSOR_LOOP),
      UPSTASH_QSTASH_TOKEN: Boolean(env.UPSTASH_QSTASH_TOKEN),
    },
  };
}

module.exports = {
  REQUIRED_ENV,
  validateCloudEnv,
};
