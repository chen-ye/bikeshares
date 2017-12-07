'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createContext = createContext;
exports.trackContextCreation = trackContextCreation;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global HTMLCanvasElement, WebGLRenderingContext */

/**
 * Create a WebGL context for a canvas
 * Note calling this multiple time on the same canvas does return the same context
 */
function createContext(_ref) {
  var canvas = _ref.canvas,
      _ref$opts = _ref.opts,
      opts = _ref$opts === undefined ? {} : _ref$opts,
      _ref$onError = _ref.onError,
      onError = _ref$onError === undefined ? function (message) {
    return null;
  } : _ref$onError;

  // See if we can extract any extra information about why context creation failed
  function onContextCreationError(error) {
    onError('WebGL context: ' + (error.statusMessage || 'Unknown error'));
  }
  canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);

  var _opts$webgl = opts.webgl1,
      webgl1 = _opts$webgl === undefined ? true : _opts$webgl,
      _opts$webgl2 = opts.webgl2,
      webgl2 = _opts$webgl2 === undefined ? true : _opts$webgl2;

  var gl = null;
  // Prefer webgl2 over webgl1, prefer conformant over experimental
  if (webgl2) {
    gl = gl || canvas.getContext('webgl2', opts);
    gl = gl || canvas.getContext('experimental-webgl2', opts);
  }
  if (webgl1) {
    gl = gl || canvas.getContext('webgl', opts);
    gl = gl || canvas.getContext('experimental-webgl', opts);
  }

  canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);

  if (!gl) {
    return onError('Failed to create ' + (webgl2 && !webgl1 ? 'WebGL2' : 'WebGL') + ' context');
  }

  return gl;
}

/**
 * Installs a spy on Canvas.getContext
 * calls the provided callback with the {context}
 */
// Create a WebGL context
function trackContextCreation(_ref2) {
  var _ref2$onContextCreate = _ref2.onContextCreate,
      onContextCreate = _ref2$onContextCreate === undefined ? function () {
    return null;
  } : _ref2$onContextCreate,
      _ref2$onContextCreate2 = _ref2.onContextCreated,
      onContextCreated = _ref2$onContextCreate2 === undefined ? function () {} : _ref2$onContextCreate2;

  (0, _assert2.default)(onContextCreate || onContextCreated);
  if (typeof HTMLCanvasElement !== 'undefined') {
    var getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContextSpy(type, opts) {
      // Let intercepter create context
      var context = void 0;
      if (type === 'webgl') {
        context = onContextCreate({ canvas: this, type: type, opts: opts, getContext: getContext.bind(this) });
      }
      // If not, create context
      context = context || getContext.call(this, type, opts);
      // Report it created
      if (context instanceof WebGLRenderingContext) {
        onContextCreated({ canvas: this, context: context, type: type, opts: opts });
      }
      return context;
    };
  }
}
//# sourceMappingURL=create-context.js.map