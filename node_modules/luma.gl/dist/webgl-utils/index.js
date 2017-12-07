'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createCanvas = require('./create-canvas');

Object.defineProperty(exports, 'getPageLoadPromise', {
  enumerable: true,
  get: function get() {
    return _createCanvas.getPageLoadPromise;
  }
});
Object.defineProperty(exports, 'createCanvas', {
  enumerable: true,
  get: function get() {
    return _createCanvas.createCanvas;
  }
});
Object.defineProperty(exports, 'getCanvas', {
  enumerable: true,
  get: function get() {
    return _createCanvas.getCanvas;
  }
});
Object.defineProperty(exports, 'resizeCanvas', {
  enumerable: true,
  get: function get() {
    return _createCanvas.resizeCanvas;
  }
});
Object.defineProperty(exports, 'resizeDrawingBuffer', {
  enumerable: true,
  get: function get() {
    return _createCanvas.resizeDrawingBuffer;
  }
});

var _createContext = require('./create-context');

Object.defineProperty(exports, 'trackContextCreation', {
  enumerable: true,
  get: function get() {
    return _createContext.trackContextCreation;
  }
});
Object.defineProperty(exports, 'createContext', {
  enumerable: true,
  get: function get() {
    return _createContext.createContext;
  }
});
Object.defineProperty(exports, 'resizeViewport', {
  enumerable: true,
  get: function get() {
    return _createContext.resizeViewport;
  }
});

var _polyfillContext = require('./polyfill-context');

Object.defineProperty(exports, 'polyfillContext', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_polyfillContext).default;
  }
});

var _trackContextState = require('./track-context-state');

Object.defineProperty(exports, 'trackContextState', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_trackContextState).default;
  }
});

var _formatGlslError = require('./format-glsl-error');

Object.defineProperty(exports, 'formatGLSLCompilerError', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_formatGlslError).default;
  }
});
Object.defineProperty(exports, 'parseGLSLCompilerError', {
  enumerable: true,
  get: function get() {
    return _formatGlslError.parseGLSLCompilerError;
  }
});

var _getShaderName = require('./get-shader-name');

Object.defineProperty(exports, 'getShaderName', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_getShaderName).default;
  }
});

var _constants = require('./constants');

Object.defineProperty(exports, 'GL', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_constants).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=index.js.map