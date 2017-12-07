'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GL = undefined;
exports.glGet = glGet;
exports.glKey = glKey;
exports.glKeyType = glKeyType;

var _constants = require('../webgl-utils/constants');

var _constants2 = _interopRequireDefault(_constants);

var _constantsToKeys = require('../webgl-utils/constants-to-keys');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// WEBGL BUILT-IN CONSTANTS
exports.GL = _constants2.default;
exports.default = _constants2.default;

// Resolve a WebGL enumeration name (returns itself if already a number)

function glGet(name) {
  return (0, _constantsToKeys.getKeyValue)(_constants2.default, name);
}

function glKey(value) {
  return (0, _constantsToKeys.getKey)(_constants2.default, value);
}

function glKeyType(value) {
  return (0, _constantsToKeys.getKeyType)(_constants2.default, value);
}
//# sourceMappingURL=gl-constants.js.map