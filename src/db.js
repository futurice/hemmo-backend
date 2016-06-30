'use strict';

import config from './config';
import knex from 'knex';

export default knex({
  client: 'pg',
  connection: config.db.url
});
