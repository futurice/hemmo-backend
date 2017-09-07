import dotenv from 'dotenv';

const env = process.env;

if (!env.NODE_ENV || env.NODE_ENV === 'development') {
  dotenv.config({ silent: true });
}

const requiredEnvironmentVariables = [
  'DATABASE_URL',
  'SECRET',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SMTP_TLS',
];

if (
  env.NODE_ENV &&
  (env.NODE_ENV !== 'development' && env.NODE_ENV !== 'test')
) {
  requiredEnvironmentVariables.forEach(key => {
    if (!env[key]) {
      /* eslint-disable no-console */
      console.log(`Warning: Environment variable ${key} not set.`);
      /* eslint-enable no-console */

      throw new Error('Quitting.');
    }
  });
}

export default {
  server: {
    host: env.HOST || '0.0.0.0',
    port: env.PORT || 3001,
  },
  adminUrl: env.ADMIN_URL || 'http://hemmo.pelastakaalapset.fi',
  db: {
    debug: false, // Toggle db debugging
    client: 'pg',
    connection: env.DATABASE_URL || {
      host: '127.0.0.1',
      user: 'postgres',
      password: '',
      database: 'hemmo',
      ssl: false,
    },
  },
  auth: {
    secret: env.SECRET || 'really_secret_key',
    saltRounds: 10,
    options: {
      algorithms: ['HS256'],
      expiresIn: '24h',
    },
  },
  defaults: {
    limit: 30,
  },
  smtp: {
    host: env.SMTP_HOST,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
    tls: env.SMTP_TLS === 'true',
  },
};
