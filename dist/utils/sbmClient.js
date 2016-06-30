'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getSbmClient = getSbmClient;
exports.getSbmAdminClient = getSbmAdminClient;
exports.createAuthenticatedClient = createAuthenticatedClient;

var _jsonRpc = require('json-rpc2');

var _jsonRpc2 = _interopRequireDefault(_jsonRpc);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let sbmClientInstance = null;
let sbmAdminClientInstance = null;

function getSbmClient() {
  if (sbmClientInstance) {
    return _bluebird2.default.resolve(sbmClientInstance);
  }

  // log in with API key
  return createAuthenticatedClient({
    host: _config2.default.sbm.host,
    opts: {},
    authenticationHeader: 'X-Token',
    org: _config2.default.sbm.org,
    key: _config2.default.sbm.key
  }).then(client => {
    return sbmClientInstance = client;
  }).catch(error => {
    throw error;
  });
}

function getSbmAdminClient() {
  if (sbmAdminClientInstance) {
    return _bluebird2.default.resolve(sbmAdminClientInstance);
  }

  // log in with administrative user username/password
  return createAuthenticatedClient({
    host: _config2.default.sbm.host,
    opts: { path: '/admin' },
    authenticationHeader: 'X-User-Token',
    org: _config2.default.sbm.org,
    username: _config2.default.sbm.user,
    password: _config2.default.sbm.password
  }).then(client => {
    return sbmAdminClientInstance = client;
  }).catch(error => {
    throw error;
  });
}

/**
 * Creates a only slightly hacky SimplyBookMe JSON RPC 2.0 client over the given
 * endpoint. See usage for configuration options :)
 */
function createAuthenticatedClient(configuration) {
  const loginClient = _jsonRpc2.default.Client.$create(443, configuration.host);
  const loginCall = _bluebird2.default.promisify(loginClient.call, { context: loginClient });
  const loginOpts = { https: true, path: '/login' };

  // we call a different method for username:password authentication and key auth
  const onLoginComplete = configuration.username ? loginCall('getUserToken', [configuration.org, configuration.username, configuration.password], loginOpts) : loginCall('getToken', [configuration.org, configuration.key], loginOpts);

  return onLoginComplete.then(token => {

    // Create a client that authenticates with the non-standard authentication
    // headers used by SimplyBookMe
    const client = _jsonRpc2.default.Client.$create(443, configuration.host);
    client._authHeader = function authHeaderOverride(headers) {
      Object.assign(headers, {
        'X-Company-Login': configuration.org,
        [configuration.authenticationHeader]: token
      });
    }.bind(client);

    // Converts a node callback style method to a promise-returning one
    const callMethod = _bluebird2.default.promisify(client.call, { context: client });

    // Returns a fn(method, [...args]) that can be called to execute JSON RPC
    // calls over HTTPS to the given client
    return function sbmClientProxy(method, args) {
      // force all traffic over SSL
      const defaultOpts = configuration.opts || {};
      const mergedOpts = _extends({}, defaultOpts, { https: true });

      return callMethod(method, args, mergedOpts);
    };
  });
}
//# sourceMappingURL=sbmClient.js.map