import moment from 'moment';
import momentTz from 'moment-timezone';

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm';
const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const LESSON_DURATION_MINUTES = 50;
const LESSON_BREAK_MINUTES = 10;

export function windowToSlots({from, to}) {
  const start = moment(from, TIME_FORMAT);
  const end = moment(to, TIME_FORMAT);
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
export function shiftTimezone(time, date, fromTimezone, toTimezone) {
  return momentTz
    .tz(`${date} ${time}`, fromTimezone)
    .tz(toTimezone)
    .format(TIME_FORMAT);
}

export function getTimeString(dateTimeString) {
  return moment(dateTimeString, DATE_TIME_FORMAT).format(TIME_FORMAT);
}

export function getDateString(dateTimeString) {
  return moment(dateTimeString, DATE_TIME_FORMAT).format(DATE_FORMAT);
}

export function getISOWeekDay(dateString) {
  return moment(dateString, DATE_FORMAT).isoWeekday();
}

export function rangesIntersect(a, b) {
  return a.to > b.from && a.from < b.to;
}
