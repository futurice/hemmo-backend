const env = process.env;

if (!env.NODE_ENV || env.NODE_ENV === 'development') {
  require('dotenv').config({silent: true});
}

const requiredEnvironmentVariables = [
  'HOST',
  'PORT',
  'DATABASE_URL',
  'SECRET',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SMTP_TLS'
];

if (env.NODE_ENV && (env.NODE_ENV !== 'development' && env.NODE_ENV !== 'test')) {
  requiredEnvironmentVariables.forEach(key => {
    if (!env[key]) {
      console.log(`Warning: Environment variable ${key} not set.`);
      throw new Error('Quitting.');
    }
  });
}

module.exports = Object.freeze({
  server: {
    host: env.HOST || '0.0.0.0',
    port: env.PORT || 3001
  },
  db: env.DATABASE_URL || {
    host: '127.0.0.1',
    user: 'postgres', /* whoami */
    password: '',
    database: 'hemmo'
  },
  auth: {
    secret: env.SECRET || 'really_secret_key'
  },
  smtp: {
    host: env.SMTP_HOST,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
    tls: env.SMTP_TLS === 'true'
  }
});
