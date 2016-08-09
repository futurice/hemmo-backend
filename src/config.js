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
    console.log(key);
    throw new Error(`Environment variable ${key} not set.`);
  }
});

export default Object.freeze({
  server: {
    host: env.HOST,
    port: env.PORT
  },
  db: {
    url: env.DATABASE_URL
  },
  auth: {
    secret: env.SECRET
  }
});
