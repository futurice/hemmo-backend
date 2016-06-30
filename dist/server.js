'use strict';

var _hapi = require('hapi');

var _hapi2 = _interopRequireDefault(_hapi);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.env.TZ = 'UTC';

// Create a server with a host and port
const server = new _hapi2.default.Server();

server.connection({
  host: _config2.default.server.host,
  port: _config2.default.server.port,
  routes: {
    cors: true
  }
});

// Add the route
server.route({
  method: 'GET',
  path: '/hello',
  handler: function handler(request, reply) {
    return reply('hello world');
  }
});

server.route(_routes2.default);

// Start the server
server.start(err => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});
//# sourceMappingURL=server.js.map