/*eslint-disable object-curly-spacing*/

import knex from './db'
import Boom from 'boom';
import Promise from 'bluebird';
import _ from 'lodash';
import Joi from 'joi';
import uuid from 'node-uuid';
import fs from 'fs';
import path from 'path';

import {
  hashPassword,
  createToken,
  verifyCredentials,
  bindEmployeeData,
  bindUserData
} from './utils/authUtil';

let mkdirp = Promise.promisify(require('mkdirp'));

let routes = [];

routes.push({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    console.log(request.pre.user.name);
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
    },
    pre: [
      { method: bindEmployeeData, assign: 'user' }
    ]
  }
});

routes.push({
  method: 'POST',
  path: '/session',
  handler: function(request, reply) {
    var sessionId = uuid.v4();
    knex('sessions').insert({
      userId: request.pre.user.id,
      startedAt: knex.fn.now(),
      sessionId: sessionId
    })
    .then(function(res) {
      return reply({
        sessionId: sessionId
      });
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  },
  config: {
    pre: [
      { method: bindUserData, assign: 'user' }
    ]
  }
});

let getUserSession = function(userId, sessionId) {
  return knex.first('sessionId').from('sessions').where({
    'userId': userId,
    'sessionId': sessionId
  });
}

routes.push({
  method: 'POST',
  path: '/content',
  handler: function(request, reply) {
    // Check that the user actually owns the session requested
    getUserSession(request.pre.user.id, request.headers.session).bind({})
    .then(function(session) {
      if (!session) {
        throw new Error('Session not found');
      }
      this.sessionId = session.sessionId;
      this.contentId = uuid.v4();

      return knex('content').insert(_.merge(request.payload, {
        contentId: this.contentId,
        sessionId: this.sessionId,
        createdAt: knex.fn.now()
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
        session: Joi.string().length(36).required()
      }).options({ allowUnknown: true }),
      payload: {  // TODO: VALIDATE CONTENT TYPE!!!
        contentType: Joi.string().required(),
        question: Joi.string().optional(),
        answer: Joi.string().optional()
      }
    },
    pre: [
      { method: bindUserData, assign: 'user' }
    ]
  }
});

routes.push({
  method: 'PUT',
  path: '/content/{contentId}',
  handler: function(request, reply) {
    // Find user session by auth token and sessionId
    getUserSession(request.pre.user.id, request.headers.session).bind({})
    .then(function(session) {
      if (!session) {
        throw new Error('Session not found');
      }

      this.contentId = request.params.contentId;
      this.sessionId = session.sessionId;

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
      console.log(err);
      return reply(Boom.badRequest(err));
    });
  },
  config: {
    validate: {
      headers: Joi.object({
        session: Joi.string().length(36).required()
      }).options({ allowUnknown: true }),
      params: {
        contentId: Joi.string().length(36).required()
      }
    },
    pre: [
      { method: bindUserData, assign: 'user' }
    ]
  }
});

routes.push({
  method: 'GET',
  path: '/attachment/{contentId}',
  handler:  {
    directory: {
      path: path.join(process.env.HOME, 'hemmo', 'uploads')
    }
  },
  config: {
    auth: {
      strategy: 'jwt',
      scope: 'employee'
    }
  }
});

routes.push({
  method: 'PUT',
  path: '/attachment/{contentId}',
  handler: function(request, reply) {
    let dir = path.join(process.env.HOME, 'hemmo', 'uploads');

    // Find user session by auth token and sessionId
    getUserSession(request.pre.user.id, request.headers.session).bind({})
    .then(function(session) {
      if (!session) {
        throw new Error('Session not found');
      }

      this.contentId = request.params.contentId;
      this.sessionId = request.headers.session;

      return mkdirp(dir);
    })
    .then(function() {
      return new Promise((resolve, reject) => {
        let file = fs.createWriteStream(path.join(dir, this.contentId));
        file.on('error', function (err) {
          reject(err);
        });

        var data = request.payload;
        if (!data.file) {
          throw new Error('Payload missing');
        }

        data.file.pipe(file);

        data.file.on('end', function (err) {
          resolve();
        });
      });
    })
    .then(function() {
      return knex('content').where({
        contentId: this.contentId,
        sessionId: this.sessionId
      }).update({
        contentPath: path.join(dir, this.contentId)
      });
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
    payload: {
      output: 'stream'
    },
    validate: {
      headers: Joi.object({
        session: Joi.string().length(36).required()
      }).options({ allowUnknown: true }),
      params: {
        contentId: Joi.string().length(36).required()
      },
      payload: Joi.any().required()
    },
    pre: [
      { method: bindUserData, assign: 'user' }
    ]
  }
});

routes.push({
  method: 'POST',
  path: '/register',
  handler: function (request, reply) {
    var name = request.payload['name'];
    knex('users').insert({
      name: name
    })
    .returning('id')
    .then(function(id) {
      var token = createToken(id, name, 'user');
      // Reply with token
      return reply({
        token: token
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

// TODO: add pre function to check if name is available
// Register for employees, post with email, name and password
routes.push({
  method: 'POST',
  path: '/employees/register',
  handler: function (request, reply) {
    console.log(request.payload);
    var name = request.payload['name'];
    var email = request.payload['email'];
    var password = request.payload['password'];

    hashPassword(password)
    .then(function(hashed) {
      return knex('employees').insert({
        name: name,
        email: email,
        password: hashed
      }).returning('id');
    })
    .then(function(id) {
      console.log(id);
      var token = createToken(id, name, 'employee');
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
    },
  }
});

routes.push({
  method: 'POST',
  path: '/employees/authenticate',
  handler: function (request, reply) {
    // If password was incorrect, error is issued from the pre method verifyCredentials
    var token = createToken(request.pre.user.id, request.pre.user.name, 'employee');
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
      { method: verifyCredentials, assign: 'user' }
    ],
  }
});

export default routes;
