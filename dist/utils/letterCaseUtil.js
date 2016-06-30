'use strict';

const _ = require('lodash');
const camelize = require('underscore.string/camelize');
const underscored = require('underscore.string/underscored');

function transformKeys(fn) {
  return function transform(attrs) {
    return _.reduce(attrs, (result, val, key) => {
      result[fn(key)] = val;
      return result;
    }, {});
  };
}

// @NOTE the string manipulation functions are memoized here to
// reduce cpu load. The intended use case of converting database
// model fields, the functions will be called with a small
// set of often repeating strings, which should lead to high cache
// utilization for the memo

exports.camelKeys = transformKeys(_.memoize(camelize));
exports.underscoreKeys = transformKeys(_.memoize(underscored));
//# sourceMappingURL=letterCaseUtil.js.map