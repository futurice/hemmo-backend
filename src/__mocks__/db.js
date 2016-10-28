import knex from 'knex';
import mockKnex from 'mock-knex';

let db = knex({
  client: 'pg'
});

mockKnex.mock(db);

module.exports = db;
