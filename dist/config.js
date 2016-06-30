'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const env = process.env;

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  require('dotenv').load();
}

const requiredEnvironmentVariables = ['HOST', 'PORT', 'DATABASE_URL', 'SBM_HOST', 'SBM_KEY', 'SBM_ORG', 'SBM_USER', 'SBM_USER_PWD'];

requiredEnvironmentVariables.forEach(key => {
  if (!env[key]) {
    throw new Error(`Environment variable ${ key } not set.`);
  }
});

exports.default = Object.freeze({
  server: {
    host: env.HOST,
    port: env.PORT
  },
  db: {
    url: env.DATABASE_URL
  },
  sbm: {
    host: env.SBM_HOST,
    key: env.SBM_KEY,
    org: env.SBM_ORG,
    user: env.SBM_USER,
    password: env.SBM_USER_PWD
  }
});
//# sourceMappingURL=config.js.map