import knex from '../db';
import Boom from 'boom';
import Joi from 'joi';
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

exports.updateSessionData = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  pre: [
    {method: bindEmployeeData, assign: 'user'}
  ],
  validate: {
    params: {
      sessionId: Joi.string().length(36).required()
    }
  },
  handler: function(request, reply) {
    const sessionId = request.params.sessionId;
    const employeeId = _.get(request, 'payload.employeeId', null);
    const reviewed = _.get(request, 'payload.reviewed', null);

    const updateDict = {
      assigneeId: employeeId,
      reviewed: reviewed
    };
    // Strip null values
    const strippedDict = _.omitBy(updateDict, _.isNil);
    const empty = _.isEmpty(strippedDict);
    if (empty) {
      return reply('Success');
    }
    console.log(strippedDict);

    knex('sessions').where('sessionId', sessionId)
    .update(strippedDict)
    .then(function() {
      return reply('Success');
    })
    .catch(function(err) {
      console.log(err);
      return reply(Boom.badRequest(err));
    });
  }
};
