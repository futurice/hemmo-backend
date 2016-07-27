import Hapi from 'hapi';
import routes from './routes';
import config from './config';


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

server.route(routes);

// Start the server
server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});
