import Hapi from 'hapi';
import Boom from 'boom';
import Promise from 'bluebird';
//import routes from './routes';
import config from './config';
import knex from './db'


process.env.TZ = 'UTC';

//var Promise = require('bluebird');
var randomBytes = Promise.promisify(require("crypto").randomBytes);

// Create a server with a host and port
const server = new Hapi.Server();

server.connection({
  host: config.server.host,
  port: config.server.port,
  routes: {
    cors: true
  }
});

server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    var users = knex.select('name').from('users')
    .then(function(rows) {
      return reply(rows);
    });
  }
});

server.route({
  method: 'POST',
  path: '/session',
  handler: function(request, reply) {
    var token = request.headers['token'];
    var sessionDictionary = {};

    knex.select('id').from('users').where('token', token)
    .then(function(rows) {
      var user_id = rows[0].id;
      var timestamp = knex.fn.now();

      sessionDictionary['user_id'] = user_id;
      sessionDictionary['started_at'] = timestamp;

      return randomBytes(48);
    })
    .then(function(bytes) {
      var session_id = bytes.toString('hex');
      sessionDictionary['session_id'] = session_id;

      return knex('sessions').insert(sessionDictionary);
    })
    .then(function(res) {
      return reply({
        session_id: sessionDictionary['session_id']
      });
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  }
});

server.route({
  method: 'POST',
  path: '/register',
  handler: function (request, reply) {
    var name = request.payload['name'];
    var userDictionary = {};
    randomBytes(48)
    .then(function(bytes) {
      var token = bytes.toString('hex');
      if (name === undefined || name.length === 0) {
        throw new Error('Invalid name');
      }

      userDictionary = {
        name: name,
        token: token
      };
      return knex('users').insert(userDictionary);
    })
    .then(function(res) {
      return reply({
        token: userDictionary['token']
      });
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  }
});

//server.route(routes);

// Start the server
server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});
