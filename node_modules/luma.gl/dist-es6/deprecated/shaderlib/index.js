'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defaultVertex = require('./default-vertex.glsl');

var _defaultVertex2 = _interopRequireDefault(_defaultVertex);

var _defaultFragment = require('./default-fragment.glsl');

var _defaultFragment2 = _interopRequireDefault(_defaultFragment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Default Shaders
var defaultUniforms = require('./default-uniforms');

exports.default = {
  vs: _defaultVertex2.default,
  fs: _defaultFragment2.default,
  defaultUniforms: defaultUniforms
};
//# sourceMappingURL=index.js.map