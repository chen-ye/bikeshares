'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.splat = splat;
exports.noop = noop;
exports.uid = uid;
exports.merge = merge;
exports.isPowerOfTwo = isPowerOfTwo;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wraps the argument in an array if it is not one.
 * @param {object} a - The object to wrap.
 * @return {Array} array
 **/
function splat(a) {
  return a ? Array.isArray(a) ? a : [a] : [];
}

/**
* Provides a standard noop function.
**/
function noop() {}

var uidCounters = {};

/**
 * Returns a UID.
 * @param {String} id= - Identifier base name
 * @return {number} uid
 **/
function uid() {
  var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'id';

  uidCounters[id] = uidCounters[id] || 1;
  var count = uidCounters[id]++;
  return id + '-' + count;
}

/**
 * Merge multiple objects into one.
 * @param {...object} objects - The objects to merge.
 * @return {object} object
 **/
function merge(objects) {
  var mix = {};
  for (var i = 0, l = arguments.length; i < l; i++) {
    var object = arguments[i];
    if (!object || object.constructor.name !== 'Object') {
      /* eslint-disable no-continue */
      continue;
    }
    for (var key in object) {
      var op = object[key];
      var mp = mix[key];
      if (mp && op.constructor.name === 'Object' && mp.constructor.name === 'Object') {
        mix[key] = merge(mp, op);
      } else {
        mix[key] = detach(op);
      }
    }
  }
  return mix;
}

/**
 * Internal function for duplicating an object.
 * @param {object} elem - The object to recursively duplicate.
 * @return {object} object
 **/
function detach(elem) {
  var t = elem.constructor.name;
  var ans = void 0;
  if (t === 'Object') {
    ans = {};
    for (var p in elem) {
      ans[p] = detach(elem[p]);
    }
  } else if (t === 'Array') {
    ans = [];
    for (var i = 0, l = elem.length; i < l; i++) {
      ans[i] = detach(elem[i]);
    }
  } else {
    ans = elem;
  }

  return ans;
}

/**
 * Verifies if a given number is power of two or not.
 * @param {object} n - The number to check.
 * @return {Array} Returns true if the given number is power of 2, false otherwise.
 **/
function isPowerOfTwo(n) {
  (0, _assert2.default)(typeof n === 'number', 'Input must be a number');
  return n && (n & n - 1) === 0;
}
//# sourceMappingURL=utils.js.map