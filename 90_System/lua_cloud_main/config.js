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
      UPSTASH_QSTASH_TOKEN: Boolean(env.UPSTASH_QSTASH_TOKEN),
    },
  };
}

module.exports = {
  REQUIRED_ENV,
  validateCloudEnv,
};
