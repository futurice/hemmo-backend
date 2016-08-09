import Hapi from 'hapi';
import routes from './routes';
import config from './config';

import Hoek from 'hoek';


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

// Register authentication stuff (for employees login)
server.register(require('hapi-auth-jwt'), (err) => {
  Hoek.assert(!err, err);

  server.auth.strategy('jwt', 'jwt', {
    key: config.auth.secret,
    verifyOptions: { algorithms: ['HS256'] }
  });
});

// Register file sending plugin
server.register(require('inert'), (err) => {
  Hoek.assert(!err, err);

  server.route(routes);
});


// Start the server
server.start((err) => {
  Hoek.assert(!err, err);

  console.log('Server running at:', server.info.uri);
});
