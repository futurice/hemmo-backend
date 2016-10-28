import Hapi from 'hapi';
import routes from './routes';
import config from './config';

import Hoek from 'hoek';

import knex from './db';

process.env.TZ = 'UTC';

export default () => {
  return new Promise((resolve, reject) => {
    // Create a hapi.js server with host and port from config
    const server = new Hapi.Server({
      // Only affects verbosity of logging to console
      debug: process.env.NODE_ENV === 'test' ? false: true
    });

    server.connection({
      host: config.server.host,
      port: config.server.port,
      routes: {
        cors: true
      }
    });

    // Set up JWT authentication
    server.register(require('hapi-auth-jwt2'), (err) => {
      Hoek.assert(!err, err);

      server.auth.strategy('jwt', 'jwt', {
        key: config.auth.secret,
        validateFunc: (decoded, request, callback) => {
          // Invalidate old JWTs with missing fields
          let invalidToken = false;

          invalidToken |= !decoded.id;
          invalidToken |= !decoded.name;
          invalidToken |= !decoded.scope;

          if (invalidToken) {
            callback(new Error('JWT is missing some fields and not valid! Please log out and in again.'), false);
          } else {
            callback(null, true);
          }
        },
        verifyOptions: { algorithms: ['HS256'] }
      });

      // Register file sending plugin
      server.register(require('inert'), (err) => {
        Hoek.assert(!err, err);

        // Register routes
        server.route(routes);
      });
    });

    if (process.env.NODE_ENV === 'test') {
      // Don't do any extra logging to console in test environments
      resolve(server);
    } else {
      // Register logging plugin only in non-test environments
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

        // Responsibility of starting the server is left to callee
        resolve(server);
      });
    }
  });
}
