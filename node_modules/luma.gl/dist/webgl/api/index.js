'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GL = exports.getShaderName = exports.formatGLSLCompilerError = exports.webGLTypesAvailable = exports.WebGL2RenderingContext = exports.WebGLShaderPrecisionFormat = exports.WebGLActiveInfo = exports.WebGLUniformLocation = exports.WebGLTexture = exports.WebGLRenderbuffer = exports.WebGLFramebuffer = exports.WebGLBuffer = exports.WebGLShader = exports.WebGLProgram = exports.WebGLRenderingContext = exports.Image = undefined;

var _types = require('./types');

Object.defineProperty(exports, 'Image', {
  enumerable: true,
  get: function get() {
    return _types.Image;
  }
});
Object.defineProperty(exports, 'WebGLRenderingContext', {
  enumerable: true,
  get: function get() {
    return _types.WebGLRenderingContext;
  }
});
Object.defineProperty(exports, 'WebGLProgram', {
  enumerable: true,
  get: function get() {
    return _types.WebGLProgram;
  }
});
Object.defineProperty(exports, 'WebGLShader', {
  enumerable: true,
  get: function get() {
    return _types.WebGLShader;
  }
});
Object.defineProperty(exports, 'WebGLBuffer', {
  enumerable: true,
  get: function get() {
    return _types.WebGLBuffer;
  }
});
Object.defineProperty(exports, 'WebGLFramebuffer', {
  enumerable: true,
  get: function get() {
    return _types.WebGLFramebuffer;
  }
});
Object.defineProperty(exports, 'WebGLRenderbuffer', {
  enumerable: true,
  get: function get() {
    return _types.WebGLRenderbuffer;
  }
});
Object.defineProperty(exports, 'WebGLTexture', {
  enumerable: true,
  get: function get() {
    return _types.WebGLTexture;
  }
});
Object.defineProperty(exports, 'WebGLUniformLocation', {
  enumerable: true,
  get: function get() {
    return _types.WebGLUniformLocation;
  }
});
Object.defineProperty(exports, 'WebGLActiveInfo', {
  enumerable: true,
  get: function get() {
    return _types.WebGLActiveInfo;
  }
});
Object.defineProperty(exports, 'WebGLShaderPrecisionFormat', {
  enumerable: true,
  get: function get() {
    return _types.WebGLShaderPrecisionFormat;
  }
});
Object.defineProperty(exports, 'WebGL2RenderingContext', {
  enumerable: true,
  get: function get() {
    return _types.WebGL2RenderingContext;
  }
});
Object.defineProperty(exports, 'webGLTypesAvailable', {
  enumerable: true,
  get: function get() {
    return _types.webGLTypesAvailable;
  }
});

var _webglUtils = require('../../webgl-utils');

Object.defineProperty(exports, 'formatGLSLCompilerError', {
  enumerable: true,
  get: function get() {
    return _webglUtils.formatGLSLCompilerError;
  }
});
Object.defineProperty(exports, 'getShaderName', {
  enumerable: true,
  get: function get() {
    return _webglUtils.getShaderName;
  }
});

var _constants = require('../../webgl-utils/constants');

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.GL = _constants2.default;

// TODO - avoid importing GL as it is a big file

exports.default = _constants2.default;
//# sourceMappingURL=index.js.map