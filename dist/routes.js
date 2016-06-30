'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _availabilityController = require('./controllers/availabilityController');

var availabilityController = _interopRequireWildcard(_availabilityController);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = [{ method: 'GET',
  path: '/availability/private',
  config: availabilityController.getPrivateLessonAvailabilityByDate
}]; /*eslint-disable object-curly-spacing*/
//# sourceMappingURL=routes.js.map