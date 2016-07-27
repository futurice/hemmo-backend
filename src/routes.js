/*eslint-disable object-curly-spacing*/

import knex from './db'
import Boom from 'boom';
import Promise from 'bluebird';
import Joi from 'joi';
import letterCaseUtil from './utils/letterCaseUtil.js';

var randomBytes = Promise.promisify(require("crypto").randomBytes);

let routes = [];

routes.push({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    var users = knex.select('name').from('users')
    .then(function(rows) {
      return reply(rows);
    });
  }
});

routes.push({
  method: 'POST',
  path: '/session',
  handler: function(request, reply) {

    knex.select('id').from('users').where('token', request.headers.authorization).bind({})
    .then(function(rows) {
      if (!rows.length) {
        throw new Error('User not found');
      }

      this.session = {
        userId: rows[0].id,
        startedAt: knex.fn.now()
      };

      return randomBytes(48);
    })
    .then(function(bytes) {
      this.session.sessionId = bytes.toString('hex');

      return knex('sessions').insert(letterCaseUtil.underscoreKeys(this.session));
    })
    .then(function(res) {
      return reply({
        sessionId: this.session.sessionId
      });
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  },
  config: {
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required()
      }).options({ allowUnknown: true })
    }
  }
});

routes.push({
  method: 'POST',
  path: '/register',
  handler: function (request, reply) {
    // Generate random 48 byte token
    randomBytes(48).bind({})
    .then(function(bytes) {
      this.token = bytes.toString('hex');

      // Store token in DB
      return knex('users').insert({
        name: request.payload['name'],
        token: this.token
      });
    })
    .then(function(res) {
      // Reply with token
      return reply({
        token: this.token
      });
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  },
  config: {
    validate: {
      payload: {
        name: Joi.string().required()
      }
    }
  }
});

export default routes;
