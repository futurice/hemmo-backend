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
server.register(require('hapi-auth-jwt2'), (err) => {
  Hoek.assert(!err, err);

  server.auth.strategy('jwt', 'jwt', {
    key: config.auth.secret,
    validateFunc: (decoded, request, callback) => {
      console.log('TODO: TODO: TODO: implement validateFunc for jwt auth!');
      callback(null, true);
    },
    verifyOptions: { algorithms: ['HS256'] }
  });
});

// Register file sending plugin
server.register(require('inert'), (err) => {
  Hoek.assert(!err, err);

  server.route(routes);
});

server.register({
  register: require('good'),
  options: {
    includes: {
      request: ['headers', 'payload'],
      response: ['payload']
    },
    reporters: {
      myConsoleReporter: [{
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [{ log: '*', request: '*', response: '*' }]
      }, {
          module: 'good-console'
      }, 'stdout']
    }
  }
}, (err) => {
  Hoek.assert(!err, err);

  // Start the server
  server.start((err) => {
    console.log('Server running at:', server.info.uri);
  });
});


