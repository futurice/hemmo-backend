/*eslint-disable object-curly-spacing*/

import knex from './db'
import Boom from 'boom';
import Promise from 'bluebird';
import _ from 'lodash';
import Joi from 'joi';
import crypto from 'crypto';
import uuid from 'node-uuid';

const authUtil = require('./utils/authUtil');

let randomBytes = Promise.promisify(crypto.randomBytes);

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

      this.session.sessionId = uuid.v4();

      return knex('sessions').insert(this.session);
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
        authorization: Joi.string().length(96).required()
      }).options({ allowUnknown: true })
    }
  }
});

let getUserSession = function(authToken, sessionId) {
  return knex.select('id').from('users').where('token', authToken).bind({})
  .then(function(users) {
    if (!users.length) {
      throw new Error('User not found');
    }

    this.userId = users[0].id;
    this.sessionId = sessionId;

    return knex.select('sessionId').from('sessions').where({
      'userId': this.userId,
      'sessionId': this.sessionId
    });
  })
}

routes.push({
  method: 'POST',
  path: '/content',
  handler: function(request, reply) {
    // Find user session by auth token and sessionId
    getUserSession(request.headers.authorization, request.headers.session)
    .then(function(sessions) {
      if (!sessions.length) {
        throw new Error('Session not found');
      }

      this.contentId = uuid.v4();

      return knex('content').insert(_.merge(request.payload, {
        contentId: this.contentId,
        sessionId: this.sessionId,
      }))
    })

    .then(function() {
      return reply({
        contentId: this.contentId
      });
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  },
  config: {
    validate: {
      headers: Joi.object({
        authorization: Joi.string().length(96).required(),
        session: Joi.string().length(36).required()
      }).options({ allowUnknown: true }),
      payload: {
        contentType: Joi.string().required(),
        question: Joi.string().optional()
      }
    }
  }
});

routes.push({
  method: 'PUT',
  path: '/content/{contentId}',
  handler: function(request, reply) {
    // Find user session by auth token and sessionId
    getUserSession(request.headers.authorization, request.headers.session)
    .then(function(sessions) {
      if (!sessions.length) {
        throw new Error('Session not found');
      }

      this.contentId = request.params.contentId;
      this.sessionId = request.headers.session;

      return knex('content').where({
        'contentId': this.contentId,
        'sessionId': this.sessionId
      }).update(_.omit(request.payload, ['contentId', 'sessionId']));
    })
    .then(function() {
      return reply({
        contentId: this.contentId
      });
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  },
  config: {
    validate: {
      headers: Joi.object({
        authorization: Joi.string().length(96).required(),
        session: Joi.string().length(36).required()
      }).options({ allowUnknown: true }),
      params: {
        contentId: Joi.string().length(36).required()
      }
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
