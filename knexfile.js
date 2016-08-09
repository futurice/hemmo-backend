//This file is interpreted as ES5 CommonJS module.
'use strict';

let config = require('./src/config');

// By default we use a single configuration for all
// environments, and customize the database connection
// using environment variables. Feel free to create a
// custom config for any environment, if you prefer.
const ALL_ENVIRONMENTS = Object.freeze({
  client: 'postgresql',
  connection: config.db.url,
  // Use a single connection to execute migrations.
  pool: {
    min: 1,
    max: 1
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: 'db/migrations'
  },
  seeds: {
    directory: 'db/seeds'
  }
});

// Feel free to create any number of other environments.
// The ones below are a best attempt at sensible defaults.
module.exports = {
  // Developer's local machine
  development: ALL_ENVIRONMENTS,
  // Unit and integration test environment
  test: ALL_ENVIRONMENTS,
  // Shared test/qa/staging/preproduction
  staging: ALL_ENVIRONMENTS,
  // Production environment
  production: ALL_ENVIRONMENTS
};
