'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleApiError = handleApiError;

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function handleApiError(reply) {
  return error => {
    if (error && error.isBoom) {
      reply(error);
    } else {
      console.log(error, error.stack);
      reply(_boom2.default.badImplementation(error));
    }
  };
}
//# sourceMappingURL=errorUtil.js.map