'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.windowToSlots = windowToSlots;
exports.shiftTimezone = shiftTimezone;
exports.getTimeString = getTimeString;
exports.getDateString = getDateString;
exports.getISOWeekDay = getISOWeekDay;
exports.rangesIntersect = rangesIntersect;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _momentTimezone = require('moment-timezone');

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm';
const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const LESSON_DURATION_MINUTES = 50;
const LESSON_BREAK_MINUTES = 10;

function windowToSlots({ from, to }) {
  const start = (0, _moment2.default)(from, TIME_FORMAT);
  const end = (0, _moment2.default)(to, TIME_FORMAT);
  const slots = [];

  let current = start;
  while (current.toDate().getTime() < end.toDate().getTime()) {
    if (!current.isValid()) {
      throw new Error('Slot start date is not valid!');
    }

    slots.push({
      from: current.format(TIME_FORMAT),
      to: current.add(LESSON_DURATION_MINUTES, 'minutes').format(TIME_FORMAT) // mutates!
    });

    current = current.add(LESSON_BREAK_MINUTES, 'minutes');
  }

  return slots;
}

/**
 * Converts a time and date from one timezone to another time
 * @param {String} time 'HH:mm'
 * @param {String} date 'YYYY-MM-DD'
 * @param {String} fromTimezone TZ* e.g. 'America/Bogota'
 * @param {String} toTimezone TZ* e.g. 'Europe/London'
 * @returns {String} 'HH:mm'
 */
function shiftTimezone(time, date, fromTimezone, toTimezone) {
  return _momentTimezone2.default.tz(`${ date } ${ time }`, fromTimezone).tz(toTimezone).format(TIME_FORMAT);
}

function getTimeString(dateTimeString) {
  return (0, _moment2.default)(dateTimeString, DATE_TIME_FORMAT).format(TIME_FORMAT);
}

function getDateString(dateTimeString) {
  return (0, _moment2.default)(dateTimeString, DATE_TIME_FORMAT).format(DATE_FORMAT);
}

function getISOWeekDay(dateString) {
  return (0, _moment2.default)(dateString, DATE_FORMAT).isoWeekday();
}

function rangesIntersect(a, b) {
  return a.to > b.from && a.from < b.to;
}
//# sourceMappingURL=timeUtil.js.map