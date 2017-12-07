'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RENDERBUFFER_FORMATS = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _RENDERBUFFER_FORMATS;

var _glConstants = require('./gl-constants');

var _glConstants2 = _interopRequireDefault(_glConstants);

var _context = require('./context');

var _resource = require('./resource');

var _resource2 = _interopRequireDefault(_resource);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /* eslint-disable no-inline-comments */


// Define local GL constants to optimize minification
var GL_RENDERBUFFER = 0x8D41;
var GL_SAMPLES = 0x80A9;
var GL_RENDERBUFFER_WIDTH = 0x8D42;
var GL_RENDERBUFFER_HEIGHT = 0x8D43;
var GL_RENDERBUFFER_INTERNAL_FORMAT = 0x8D44;
var GL_RENDERBUFFER_SAMPLES = 0x8CAB;

// Define local extension strings to optimize minification
// const SRGB = 'EXT_sRGB';
// const CB_FLOAT_WEBGL1 = 'WEBGL_color_buffer_float';
var CB_FLOAT_WEBGL2 = 'EXT_color_buffer_float';
// const CB_HALF_FLOAT_WEBGL1 = 'EXT_color_buffer_half_float';

var RENDERBUFFER_FORMATS = exports.RENDERBUFFER_FORMATS = (_RENDERBUFFER_FORMATS = {}, _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.DEPTH_COMPONENT16, {}), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.DEPTH_COMPONENT24, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.DEPTH_COMPONENT32F, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.STENCIL_INDEX8, {}), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.DEPTH_STENCIL, {}), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.DEPTH24_STENCIL8, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.DEPTH32F_STENCIL8, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RGBA4, {}), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RGB565, {}), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RGB5_A1, {}), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.R8, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.R8UI, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.R8I, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.R16UI, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.R16I, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.R32UI, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.R32I, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RG8, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RG8UI, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RG8I, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RG16UI, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RG16I, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RG32UI, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RG32I, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RGB8, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RGBA8, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RGB10_A2, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RGBA8UI, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RGBA8I, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RGB10_A2UI, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RGBA16UI, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RGBA16I, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RGBA32I, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RGBA32UI, { gl2: true }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.R16F, { gl2: CB_FLOAT_WEBGL2 }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RG16F, { gl2: CB_FLOAT_WEBGL2 }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RGBA16F, { gl2: CB_FLOAT_WEBGL2 }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.R32F, { gl2: CB_FLOAT_WEBGL2 }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RG32F, { gl2: CB_FLOAT_WEBGL2 }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.RGBA32F, { gl2: CB_FLOAT_WEBGL2 }), _defineProperty(_RENDERBUFFER_FORMATS, _glConstants2.default.R11F_G11F_B10F, { gl2: CB_FLOAT_WEBGL2 }), _RENDERBUFFER_FORMATS);

function isFormatSupported(gl, format, formats) {
  // assert(isWebGL(gl), ERR_WEBGL);
  var info = formats[format];
  if (!info) {
    return false;
  }
  var value = (0, _context.isWebGL2)(gl) ? info.gl2 || info.gl1 : info.gl1;
  if (typeof value === 'string') {
    return gl.getExtension(value);
  }
  return value;
}

var Renderbuffer = /*#__PURE__*/function (_Resource) {
  _inherits(Renderbuffer, _Resource);

  _createClass(Renderbuffer, null, [{
    key: 'isSupported',
    value: function isSupported(gl) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          format = _ref.format;

      return !format || isFormatSupported(gl, format, RENDERBUFFER_FORMATS);
    }
  }, {
    key: 'getSamplesForFormat',
    value: function getSamplesForFormat(gl, _ref2) {
      var format = _ref2.format;

      // Polyfilled to return [0] under WebGL1
      return gl.getInternalformatParameter(GL_RENDERBUFFER, format, GL_SAMPLES);
    }
  }]);

  function Renderbuffer(gl) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Renderbuffer);

    var _this = _possibleConstructorReturn(this, (Renderbuffer.__proto__ || Object.getPrototypeOf(Renderbuffer)).call(this, gl, opts));

    _this.initialize(opts);
    Object.seal(_this);
    return _this;
  }

  // Creates and initializes a renderbuffer object's data store


  _createClass(Renderbuffer, [{
    key: 'initialize',
    value: function initialize(_ref3) {
      var format = _ref3.format,
          _ref3$width = _ref3.width,
          width = _ref3$width === undefined ? 1 : _ref3$width,
          _ref3$height = _ref3.height,
          height = _ref3$height === undefined ? 1 : _ref3$height,
          _ref3$samples = _ref3.samples,
          samples = _ref3$samples === undefined ? 0 : _ref3$samples;

      (0, _assert2.default)(format, 'Needs format');
      this.gl.bindRenderbuffer(GL_RENDERBUFFER, this.handle);

      if (samples !== 0 && (0, _context.isWebGL2)(this.gl)) {
        this.gl.renderbufferStorageMultisample(GL_RENDERBUFFER, samples, format, width, height);
      } else {
        this.gl.renderbufferStorage(GL_RENDERBUFFER, format, width, height);
      }

      // this.gl.bindRenderbuffer(GL_RENDERBUFFER, null);

      this.format = format;
      this.width = width;
      this.height = height;
      this.samples = samples;

      return this;
    }
  }, {
    key: 'resize',
    value: function resize(_ref4) {
      var width = _ref4.width,
          height = _ref4.height;

      // Don't resize if width/height haven't changed
      if (width !== this.width || height !== this.height) {
        return this.initialize({ width: width, height: height, format: this.format, samples: this.samples });
      }
      return this;
    }

    // PRIVATE METHODS

  }, {
    key: '_createHandle',
    value: function _createHandle() {
      return this.gl.createRenderbuffer();
    }
  }, {
    key: '_deleteHandle',
    value: function _deleteHandle() {
      this.gl.deleteRenderbuffer(this.handle);
    }
  }, {
    key: '_syncHandle',
    value: function _syncHandle(handle) {
      this.format = this.getParameter(GL_RENDERBUFFER_INTERNAL_FORMAT);
      this.width = this.getParameter(GL_RENDERBUFFER_WIDTH);
      this.height = this.getParameter(GL_RENDERBUFFER_HEIGHT);
      this.samples = this.getParameter(GL_RENDERBUFFER_SAMPLES);
    }

    // @param {Boolean} opt.autobind=true - method call will bind/unbind object
    // @returns {GLenum|GLint} - depends on pname

  }, {
    key: '_getParameter',
    value: function _getParameter(pname) {
      this.gl.bindRenderbuffer(GL_RENDERBUFFER, this.handle);
      var value = this.gl.getRenderbufferParameter(GL_RENDERBUFFER, pname);
      // this.gl.bindRenderbuffer(GL_RENDERBUFFER, null);
      return value;
    }
  }]);

  return Renderbuffer;
}(_resource2.default);

exports.default = Renderbuffer;
//# sourceMappingURL=renderbuffer.js.map