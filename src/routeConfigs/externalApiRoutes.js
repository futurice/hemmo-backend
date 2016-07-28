import knex from '../db';
//import Boom from 'boom';
//import Joi from 'joi';
import _ from 'lodash';

import {
  bindEmployeeData
} from '../utils/authUtil';

exports.getIndexConfig = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  pre: [
    {method: bindEmployeeData, assign: 'user'}
  ],
  handler: function(request, reply) {
    knex.select('name').from('users')
    .then(function(rows) {
      const data = _.map(rows, function(row) {
        return row.name;
      });
      return reply.view('index', {users: data});
    });
  }
};
