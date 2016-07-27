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

// Register templating engines
//
// vision adds template rendering support
// handlebars is the template engine module
// templates are found in templates-directory
server.register(require('vision'), (err) => {

  Hoek.assert(!err, err);

  server.views({
      engines: {
          html: require('handlebars')
      },
      relativeTo: __dirname,
      path: 'templates'
  });
});

// Register authentication stuff (for employees login)
server.register(require('hapi-auth-jwt'), (err) => {

    Hoek.assert(!err, err);

    server.auth.strategy('jwt', 'jwt', {
      key: config.auth.secret,
      verifyOptions: { algorithms: ['HS256'] }
    });

});

server.route(routes);

// Start the server
server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});
