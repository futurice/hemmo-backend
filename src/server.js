import Hapi from 'hapi';
//import routes from './routes';
import config from './config';
import knex from './db'

process.env.TZ = 'UTC';

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
    console.log(request.headers);
    console.log(token);
    knex.select('id').from('users').where('token', token)
    .then(function(rows) {
      var user_id = rows[0].id;
      var timestamp = knex.fn.now();
      require('crypto').randomBytes(48, function(err, buffer) {
        var session_id = buffer.toString('hex');

        knex('sessions').insert({
          session_id: session_id,
          user_id: user_id,
          started_at: timestamp
        })
        .then(function(res) {
          console.log(res);
          return reply({
            session_id: session_id
          });
        });
      });
    });
  }
});

server.route({
  method: 'POST',
  path: '/register',
  handler: function (request, reply) {
    var name = request.payload['name'];

    require('crypto').randomBytes(48, function(err, buffer) {
      var token = buffer.toString('hex');

      knex('users').insert({
        name: name,
        token: token
      })
      .then(function(res) {
        console.log(res);
        return reply({
          token: token
        });
      });
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
