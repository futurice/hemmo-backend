"use strict";

// @NOTE: for validating full ISO8601 dates, use Joi.date().iso()
const isoDateWithoutTimeRegex = /^\d{4}-[01]\d-[0-3]\d$/;
const twentyFourHourTimeRegex = /^(0?[0-9]|1[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
const validUsernameRegex = /^\w+$/;

module.exports = {
  isoDateWithoutTimeRegex,
  twentyFourHourTimeRegex,
  validUsernameRegex
};
//# sourceMappingURL=validationUtil.js.map