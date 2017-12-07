'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getKeyValue = getKeyValue;
exports.getKey = getKey;
exports.getKeyType = getKeyType;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Resolve a WebGL enumeration name (returns itself if already a number)
function getKeyValue(gl, name) {
  // If not a string, return (assume number)
  if (typeof name !== 'string') {
    return name;
  }

  // If string converts to number, return number
  var number = Number(name);
  if (!isNaN(number)) {
    return number;
  }

  // Look up string, after removing any 'GL.' or 'gl.' prefix
  name = name.replace(/^.*\./, '');
  var value = gl[name];
  (0, _assert2.default)(value !== undefined, 'Accessing undefined constant GL.' + name);
  return value;
}

function getKey(gl, value) {
  value = Number(value);
  for (var key in gl) {
    if (gl[key] === value) {
      return 'gl.' + key;
    }
  }
  return String(value);
}

function getKeyType(gl, value) {
  (0, _assert2.default)(value !== undefined, 'undefined key');
  value = Number(value);
  for (var key in gl) {
    if (gl[key] === value) {
      return 'gl.' + key;
    }
  }
  return String(value);
}
//# sourceMappingURL=constants-to-keys.js.map