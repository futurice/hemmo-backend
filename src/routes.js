/*eslint-disable object-curly-spacing*/

import knex from './db'
import Boom from 'boom';
import Promise from 'bluebird';
import _ from 'lodash';
import Joi from 'joi';
import letterCaseUtil from './utils/letterCaseUtil.js';
const authUtil = require('./utils/authUtil');


var randomBytes = Promise.promisify(require("crypto").randomBytes);

let routes = [];

routes.push({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    var users = knex.select('name').from('users')
    .then(function(rows) {
      var data = _.map(rows, function(row) {
        return row.name;
      })
      return reply.view('index', {users: data});
    });
  },
  config: {
    auth: {
      strategy: 'jwt',
      scope: 'employee'
    }
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

// Register app user, only name required, returns token
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

// Register for employees, post with email, name and password
routes.push({
  method: 'POST',
  path: '/employees/register',
  handler: function (request, reply) {
    console.log(request.payload);
    var name = request.payload['name'];
    var email = request.payload['email'];
    var password = request.payload['password'];

    authUtil.hashPassword(password)
    .then(function(hashed) {
      return knex('employees').insert({
        name: name,
        email: email,
        password: hashed
      }).returning('id');
    })
    .then(function(id) {
      console.log(id);
      var token = authUtil.createToken(id, name);
      return reply({token: token});
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  },
  config: {
    validate: {
      payload: {
        name: Joi.string().required(),
        password: Joi.string().min(6).required(),
        email: Joi.string().required()
      }
    }
  }
});

routes.push({
  method: 'POST',
  path: '/employees/authenticate',
  handler: function (request, reply) {
    // If password was incorrect, error is issued from the pre method verifyCredentials
    var token = authUtil.createToken(request.pre.user.id, request.pre.user.name);
    reply({token: token});
  },
  config: {
    validate: {
      payload: {
        email: Joi.string().required(),
        password: Joi.string().min(6).required(),
      }
    },
    pre: [
      { method: authUtil.verifyCredentials, assign: 'user' }
    ],
  }
});

export default routes;
