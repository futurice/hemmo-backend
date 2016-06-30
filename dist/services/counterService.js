'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findCounterByUserId = findCounterByUserId;

var _queryUtil = require('../utils/queryUtil');

var _queryUtil2 = _interopRequireDefault(_queryUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function findCounterByUserId(userId) {
  return (0, _queryUtil2.default)('counter', { 'user_id': userId });
}
//# sourceMappingURL=counterService.js.map