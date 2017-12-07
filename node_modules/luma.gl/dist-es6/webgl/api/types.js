function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// WEBGL BUILT-IN TYPES
// 1) Exports all WebGL constants as {GL}
// 2) Enables app to "import" WebGL types
//    - Importing these types makes them known to eslint etc.
//    - Provides dummy types for WebGL2 when not available to streamline
//      library code.
//    - Exports types from headless gl when running under Node.js

import luma, { global } from '../../init';

var DummyType = /*#__PURE__*/function DummyType() {
  _classCallCheck(this, DummyType);
};

var _ref = luma.globals.headlessTypes || global,
    _ref$WebGLRenderingCo = _ref.WebGLRenderingContext,
    WebGLRenderingContext = _ref$WebGLRenderingCo === undefined ? DummyType : _ref$WebGLRenderingCo,
    _ref$WebGLProgram = _ref.WebGLProgram,
    WebGLProgram = _ref$WebGLProgram === undefined ? DummyType : _ref$WebGLProgram,
    _ref$WebGLShader = _ref.WebGLShader,
    WebGLShader = _ref$WebGLShader === undefined ? DummyType : _ref$WebGLShader,
    _ref$WebGLBuffer = _ref.WebGLBuffer,
    WebGLBuffer = _ref$WebGLBuffer === undefined ? DummyType : _ref$WebGLBuffer,
    _ref$WebGLFramebuffer = _ref.WebGLFramebuffer,
    WebGLFramebuffer = _ref$WebGLFramebuffer === undefined ? DummyType : _ref$WebGLFramebuffer,
    _ref$WebGLRenderbuffe = _ref.WebGLRenderbuffer,
    WebGLRenderbuffer = _ref$WebGLRenderbuffe === undefined ? DummyType : _ref$WebGLRenderbuffe,
    _ref$WebGLTexture = _ref.WebGLTexture,
    WebGLTexture = _ref$WebGLTexture === undefined ? DummyType : _ref$WebGLTexture,
    _ref$WebGLUniformLoca = _ref.WebGLUniformLocation,
    WebGLUniformLocation = _ref$WebGLUniformLoca === undefined ? DummyType : _ref$WebGLUniformLoca,
    _ref$WebGLActiveInfo = _ref.WebGLActiveInfo,
    WebGLActiveInfo = _ref$WebGLActiveInfo === undefined ? DummyType : _ref$WebGLActiveInfo,
    _ref$WebGLShaderPreci = _ref.WebGLShaderPrecisionFormat,
    WebGLShaderPrecisionFormat = _ref$WebGLShaderPreci === undefined ? DummyType : _ref$WebGLShaderPreci;

export var webGLTypesAvailable = WebGLRenderingContext !== DummyType && WebGLProgram !== DummyType && WebGLShader !== DummyType && WebGLBuffer !== DummyType && WebGLFramebuffer !== DummyType && WebGLRenderbuffer !== DummyType && WebGLTexture !== DummyType && WebGLUniformLocation !== DummyType && WebGLActiveInfo !== DummyType && WebGLShaderPrecisionFormat !== DummyType;

// Ensures that WebGL2RenderingContext is defined in non-WebGL2 environments
// so that apps can test their gl contexts with instanceof
// E.g. if (gl instanceof WebGL2RenderingContext) { }
function getWebGL2RenderingContext() {
  var WebGL2RenderingContextNotSupported = /*#__PURE__*/function WebGL2RenderingContextNotSupported() {
    _classCallCheck(this, WebGL2RenderingContextNotSupported);
  };

  return global.WebGL2RenderingContext || WebGL2RenderingContextNotSupported;
}

// Ensure that Image is defined under Node.js
function getImage() {
  var ImageNotSupported = /*#__PURE__*/function ImageNotSupported() {
    _classCallCheck(this, ImageNotSupported);
  };

  return global.Image || ImageNotSupported;
}

var WebGL2RenderingContext = getWebGL2RenderingContext();
var Image = getImage();

// Export the standard WebGL types
export { Image, WebGLRenderingContext, WebGLProgram, WebGLShader, WebGLBuffer, WebGLFramebuffer, WebGLRenderbuffer, WebGLTexture, WebGLUniformLocation, WebGLActiveInfo, WebGLShaderPrecisionFormat, WebGL2RenderingContext };
//# sourceMappingURL=types.js.map