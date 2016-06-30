'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findUserById = findUserById;

var _queryUtil = require('../utils/queryUtil');

var _queryUtil2 = _interopRequireDefault(_queryUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function findUserById(userId) {
  return (0, _queryUtil2.default)('users', userId);
}
//# sourceMappingURL=userService.js.map