'use strict';

import config from './config';
import knex from 'knex';

module.exports = knex({
  client: 'pg',
  connection: config.db.url
});
