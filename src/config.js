const env = process.env;

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  require('dotenv').load();
}

const requiredEnvironmentVariables = [
  'HOST',
  'PORT',
  'DATABASE_URL',
  'SECRET',
];

requiredEnvironmentVariables.forEach(key => {
  if (!env[key]) {
    if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
      console.log(`Warning: Environment variable ${key} not set.`);
      throw new Error('Quitting.');
    }
  }
});

export default Object.freeze({
  server: {
    host: env.HOST || '0.0.0.0',
    port: env.PORT || 3001
  },
  db: {
    url: env.DATABASE_URL || 'postgres://postgres@127.0.0.1/'
  },
  auth: {
    secret: env.SECRET || 'really_secret_key'
  }
});
