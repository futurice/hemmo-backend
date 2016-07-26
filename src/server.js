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

// Add the route
server.route({
  method: 'GET',
  path: '/adduser',
  handler: function (request, reply) {
    knex('users').insert({
      username: 'Pekka',
      token: 'akkajfksjdfkdfkjdf'
    })
    .then(function(shit) {
      console.log(shit);
    });
    return reply('Added user');
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

//server.route(routes);

// Start the server
server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});
