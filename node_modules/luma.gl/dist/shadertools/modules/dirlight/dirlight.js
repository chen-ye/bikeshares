'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _project = require('../project/project');

var _project2 = _interopRequireDefault(_project);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable camelcase */
var DEFAULT_LIGHT_DIRECTION = new Float32Array([1, 1, 2]); // Cheap lighting - single directional light, single dot product, one uniform

var DEFAULT_MODULE_OPTIONS = {
  lightDirection: DEFAULT_LIGHT_DIRECTION
};

function getUniforms() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_MODULE_OPTIONS;

  var uniforms = {};
  if (opts.lightDirection) {
    uniforms.dirlight_uLightDirection = opts.lightDirection;
  }
  return uniforms;
}

// TODO - reuse normal from geometry module
var vs = null;

var fs = 'uniform vec3 dirlight_uLightDirection;\n\n/*\n * Returns color attenuated by angle from light source\n */\nvec4 dirlight_filterColor(vec4 color) {\n  vec3 normal = project_getNormal_World();\n  float d = abs(dot(normalize(normal), normalize(dirlight_uLightDirection)));\n  return vec4(color.rgb * d, color.a);\n}\n';

exports.default = {
  name: 'dirlight',
  vs: vs,
  fs: fs,
  getUniforms: getUniforms,
  dependencies: [_project2.default]
};
//# sourceMappingURL=dirlight.js.map