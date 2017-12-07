var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _TEXTURE_FORMATS;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* eslint-disable no-inline-comments, max-len */
import GL from './gl-constants';
import { WebGLBuffer } from './api';
import { isWebGL, ERR_WEBGL, isWebGL2, ERR_WEBGL2 } from './context';
import { withParameters } from './context-state';
import Resource from './resource';
import Buffer from './buffer';
import { uid, isPowerOfTwo, log } from '../utils';
import assert from 'assert';
import { glKey } from './gl-constants';

// Supported min filters for NPOT texture.
var NPOT_MIN_FILTERS = [GL.LINEAR, GL.NEAREST];

// const S3TC = 'WEBGL_compressed_texture_s3tc';
// const PVRTC = 'WEBGL_compressed_texture_pvrtc';
// const ES3 = 'WEBGL_compressed_texture_es3';
// const ETC1 = 'WEBGL_compressed_texture_etc1';
// const SRGB = 'EXT_sRGB';
// const DEPTH = 'WEBGL_depth_texture';

// Legal combinations for internalFormat, format and type
export var TEXTURE_FORMATS = (_TEXTURE_FORMATS = {}, _defineProperty(_TEXTURE_FORMATS, GL.RGB, { dataFormat: GL.RGB, types: [GL.UNSIGNED_BYTE, GL.UNSIGNED_SHORT_5_6_5] }), _defineProperty(_TEXTURE_FORMATS, GL.RGBA, { dataFormat: GL.RGBA, types: [GL.UNSIGNED_BYTE, GL.UNSIGNED_SHORT_4_4_4_4, GL.UNSIGNED_SHORT_5_5_5_1] }), _defineProperty(_TEXTURE_FORMATS, GL.ALPHA, { dataFormat: GL.ALPHA, types: [GL.UNSIGNED_BYTE] }), _defineProperty(_TEXTURE_FORMATS, GL.LUMINANCE, { dataFormat: GL.LUMINANCE, types: [GL.UNSIGNED_BYTE] }), _defineProperty(_TEXTURE_FORMATS, GL.LUMINANCE_ALPHA, { dataFormat: GL.LUMINANCE_ALPHA, types: [GL.UNSIGNED_BYTE]

  // [GL.DEPTH_COMPONENT]: {types: [GL.UNSIGNED_SHORT, GL.UNSIGNED_INT, GL.UNSIGNED_INT_24_8], gl1: DEPTH},
  // [GL.DEPTH_STENCIL]: {gl1: DEPTH},

  // Sized texture format - more performance
  // R
  // [GL.R8]: {dataFormat: GL.RED, types: [GL.UNSIGNED_BYTE], gl2: true},
  // [GL.R16F]: {dataFormat: GL.RED, types: [GL.HALF_FLOAT, GL.FLOAT], gl2: true},
  // [GL.R32F]: {dataFormat: GL.RED, types: [GL.FLOAT], gl2: true},
  // [GL.R8UI]: {dataFormat: GL.RED_INTEGER, types: [GL.UNSIGNED_BYTE], gl2: true},
  // // RG
  // [GL.RG8]: {dataFormat: GL.RG, types: [GL.UNSIGNED_BYTE], gl2: true},
  // [GL.RG16F]: {dataFormat: GL.RG, types: [GL.HALF_FLOAT, GL.FLOAT], gl2: true},
  // [GL.RG32F]: {dataFormat: GL.RG, types: [GL.FLOAT], gl2: true},
  // [GL.RG8UI]: {dataFormat: GL.RG_INTEGER, types: [GL.UNSIGNED_BYTE], gl2: true},
  // // RGB
  // [GL.RGB8]: {dataFormat: GL.RGB, types: [GL.UNSIGNED_BYTE], gl2: true, gl1: SRGB},
  // [GL.SRGB8]: {dataFormat: GL.RGB, types: [GL.UNSIGNED_BYTE], gl2: true, gl1: SRGB},
  // [GL.RGB565]: {dataFormat: GL.RGB, types: [GL.UNSIGNED_BYTE, GL.UNSIGNED_SHORT_5_6_5], gl2: true},
  // [GL.R11F_G11F_B10F]: {dataFormat: GL.RGB, types: [GL.UNSIGNED_INT_10F_11F_11F_REV, GL.HALF_FLOAT, GL.FLOAT], gl2: true},
  // [GL.RGB9_E5]: {dataFormat: GL.RGB, types: [GL.HALF_FLOAT, GL.FLOAT], gl2: true, gl1: 'WEBGL_color_buffer_half_float'},
  // [GL.RGB16F]: {dataFormat: GL.RGB, types: [GL.HALF_FLOAT, GL.FLOAT], gl2: true, gl1: 'WEBGL_color_buffer_float'},
  // [GL.RGB32F]: {dataFormat: GL.RGB, types: [GL.FLOAT], gl2: true},
  // [GL.RGB8UI]: {dataFormat: GL.RGB_INTEGER, types: [GL.UNSIGNED_BYTE], gl2: true},
  // // RGBA
  // [GL.RGBA8]: {dataFormat: GL.RGBA, types: [GL.UNSIGNED_BYTE], gl2: true, gl1: SRGB},
  // [GL.SRGB8_ALPHA8]: {dataFormat: GL.RGBA, types: [GL.UNSIGNED_BYTE], gl2: true, gl1: SRGB},
  // [GL.RGB5_A1]: {dataFormat: GL.RGBA, types: [GL.UNSIGNED_BYTE, GL.UNSIGNED_SHORT_5_5_5_1], gl2: true},
  // [GL.RGBA4]: {dataFormat: GL.RGBA, types: [GL.UNSIGNED_BYTE, GL.UNSIGNED_SHORT_4_4_4_4], gl2: true},
  // [GL.RGBA16F]: {dataFormat: GL.RGBA, types: [GL.HALF_FLOAT, GL.FLOAT], gl2: true},
  // [GL.RGBA32F]: {dataFormat: GL.RGBA, types: [GL.FLOAT], gl2: true},
  // [GL.RGBA8UI]: {dataFormat: GL.RGBA_INTEGER, types: [GL.UNSIGNED_BYTE], gl2: true}

  // Compressed formats

  // WEBGL_compressed_texture_s3tc

  // [GL.COMPRESSED_RGB_S3TC_DXT1_EXT]: {compressed: true, gl1: S3TC},
  // [GL.COMPRESSED_RGBA_S3TC_DXT1_EXT]: {compressed: true, gl1: S3TC},
  // [GL.COMPRESSED_RGBA_S3TC_DXT3_EXT]: {compressed: true, gl1: S3TC},
  // [GL.COMPRESSED_RGBA_S3TC_DXT5_EXT]: {compressed: true, gl1: S3TC},

  // WEBGL_compressed_texture_es3

  // [GL.COMPRESSED_R11_EAC]: {compressed: true, gl1: ES3}, // RED
  // [GL.COMPRESSED_SIGNED_R11_EAC]: {compressed: true, gl1: ES3}, // RED
  // [GL.COMPRESSED_RG11_EAC]: {compressed: true, gl1: ES3}, // RG
  // [GL.COMPRESSED_SIGNED_RG11_EAC]: {compressed: true, gl1: ES3}, // RG
  // [GL.COMPRESSED_RGB8_ETC2]: {compressed: true, gl1: ES3}, // RGB
  // [GL.COMPRESSED_RGBA8_ETC2_EAC]: {compressed: true, gl1: ES3}, // RBG
  // [GL.COMPRESSED_SRGB8_ETC2]: {compressed: true, gl1: ES3}, // RGB
  // [GL.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC]: {compressed: true, gl1: ES3}, // RGBA
  // [GL.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2]: {compressed: true, gl1: ES3}, // RGBA
  // [GL.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2]: {compressed: true, gl1: ES3}, // RGBA
  /* WebGL2 guaranteed availability compressed formats?
  COMPRESSED_R11_EAC RED
  COMPRESSED_SIGNED_R11_EAC RED
  COMPRESSED_RG11_EAC RG
  COMPRESSED_SIGNED_RG11_EAC RG
  COMPRESSED_RGB8_ETC2 RGB
  COMPRESSED_SRGB8_ETC2 RGB
  COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2 RGBA
  COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2 RGBA
  COMPRESSED_RGBA8_ETC2_EAC RGBA
  COMPRESSED_SRGB8_ALPHA8_ETC2_EAC
  */

  // WEBGL_compressed_texture_pvrtc

  // [GL.COMPRESSED_RGB_PVRTC_4BPPV1_IMG]: {compressed: true, gl1: PVRTC},
  // [GL.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG]: {compressed: true, gl1: PVRTC},
  // [GL.COMPRESSED_RGB_PVRTC_2BPPV1_IMG]: {compressed: true, gl1: PVRTC},
  // [GL.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG]: {compressed: true, gl1: PVRTC},

  // WEBGL_compressed_texture_etc1

  // [GL.COMPRESSED_RGB_ETC1_WEBGL]: {compressed: true, gl1: ETC1},

  // WEBGL_compressed_texture_atc

  // [GL.COMPRESSED_RGB_ATC_WEBGL]: {compressed: true, gl1: ETC1},
  // [GL.COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL]: {compressed: true, gl1: ETC1},
  // [GL.COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL]: {compressed: true, gl1: ETC1}
}), _TEXTURE_FORMATS);

function isFormatSupported(gl, format) {
  assert(isWebGL(gl), ERR_WEBGL);
  var info = TEXTURE_FORMATS[format];
  if (!info) {
    return false;
  }
  if (info.gl1 === undefined && info.gl2 === undefined) {
    // No info - always supported
    return true;
  }
  var value = isWebGL2(gl) ? info.gl2 || info.gl1 : info.gl1;
  return typeof value === 'string' ? gl.getExtension(value) : value;
}

function isLinearFilteringSupported(gl, format) {
  var info = TEXTURE_FORMATS[format];
  switch (info && info.types[0]) {
    // Both WebGL1 and WebGL2?
    case GL.FLOAT:
      return gl.getExtension('OES_texture_float_linear');
    // Not in WebGL2?
    case GL.HALF_FLOAT:
      return gl.getExtension('OES_texture_half_float_linear');
    default:
      return true;
  }
}

var Texture = /*#__PURE__*/function (_Resource) {
  _inherits(Texture, _Resource);

  _createClass(Texture, null, [{
    key: 'isSupported',
    value: function isSupported(gl) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          format = _ref.format,
          linearFiltering = _ref.linearFiltering;

      assert(isWebGL(gl), ERR_WEBGL);
      var supported = true;
      if (format) {
        supported = supported && isFormatSupported(gl, format);
        supported = supported && (!linearFiltering || isLinearFilteringSupported(gl, format));
      }
      return supported;
    }

    // target cannot be modified by bind:
    // textures are special because when you first bind them to a target,
    // they get special information. When you first bind a texture as a
    // GL_TEXTURE_2D, you are actually setting special state in the texture.
    // You are saying that this texture is a 2D texture.
    // And it will always be a 2D texture; this state cannot be changed ever.
    // If you have a texture that was first bound as a GL_TEXTURE_2D,
    // you must always bind it as a GL_TEXTURE_2D;
    // attempting to bind it as GL_TEXTURE_1D will give rise to an error
    // (while run-time).

  }]);

  function Texture(gl, opts) {
    _classCallCheck(this, Texture);

    var _opts$id = opts.id,
        id = _opts$id === undefined ? uid('texture') : _opts$id,
        handle = opts.handle,
        target = opts.target;

    var _this = _possibleConstructorReturn(this, (Texture.__proto__ || Object.getPrototypeOf(Texture)).call(this, gl, { id: id, handle: handle }));

    _this.target = target;
    _this.hasFloatTexture = gl.getExtension('OES_texture_float');
    _this.textureUnit = undefined;
    return _this;
  }

  _createClass(Texture, [{
    key: 'toString',
    value: function toString() {
      return 'Texture(' + this.id + ',' + this.width + 'x' + this.height + ')';
    }

    /* eslint-disable max-len, max-statements */

  }, {
    key: 'initialize',
    value: function initialize() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var data = opts.data;

      var _opts$pixels = opts.pixels,
          pixels = _opts$pixels === undefined ? null : _opts$pixels,
          _opts$format = opts.format,
          format = _opts$format === undefined ? GL.RGBA : _opts$format,
          _opts$type = opts.type,
          type = _opts$type === undefined ? GL.UNSIGNED_BYTE : _opts$type,
          _opts$border = opts.border,
          border = _opts$border === undefined ? 0 : _opts$border,
          _opts$recreate = opts.recreate,
          recreate = _opts$recreate === undefined ? false : _opts$recreate,
          _opts$parameters = opts.parameters,
          parameters = _opts$parameters === undefined ? {} : _opts$parameters,
          _opts$pixelStore = opts.pixelStore,
          pixelStore = _opts$pixelStore === undefined ? {} : _opts$pixelStore,
          _opts$unpackFlipY = opts.unpackFlipY,
          unpackFlipY = _opts$unpackFlipY === undefined ? true : _opts$unpackFlipY,
          generateMipmaps = opts.generateMipmaps;
      var _opts$mipmaps = opts.mipmaps,
          mipmaps = _opts$mipmaps === undefined ? true : _opts$mipmaps;


      if (generateMipmaps !== undefined) {
        log.deprecated('generateMipmaps', 'mipmaps');
        mipmaps = generateMipmaps;
      }

      // pixels variable is  for API compatibility purpose
      if (!data) {
        log.deprecated('data', 'pixels');
        data = pixels;
      }

      var width = opts.width,
          height = opts.height,
          dataFormat = opts.dataFormat;

      // Deduce width and height

      // Store opts for accessors
      var _deduceParameters2 = this._deduceParameters({
        format: format, type: type, dataFormat: dataFormat, compressed: false, data: data, width: width, height: height
      });

      width = _deduceParameters2.width;
      height = _deduceParameters2.height;
      dataFormat = _deduceParameters2.dataFormat;
      this.width = width;
      this.height = height;
      this.format = format;
      this.type = type;
      this.dataFormat = dataFormat;
      this.border = border;
      this.mipmaps = mipmaps;

      // Note: luma.gl defaults to GL.UNPACK_FLIP_Y_WEBGL = true;
      // TODO - compare v4 and v3
      var DEFAULT_TEXTURE_SETTINGS = _defineProperty({}, GL.UNPACK_FLIP_Y_WEBGL, unpackFlipY);
      var glSettings = Object.assign({}, DEFAULT_TEXTURE_SETTINGS, pixelStore);

      if (this._isNPOT()) {

        log.warn(0, 'texture: ' + this + ' is Non-Power-Of-Two, disabling mipmaping');
        mipmaps = false;

        this._updateForNPOT(parameters);
      }

      this.setImageData({ data: data, width: width, height: height, format: format, type: type, dataFormat: dataFormat, border: border, mipmaps: mipmaps, parameters: glSettings });

      if (mipmaps) {
        this.generateMipmap();
      }

      // Append any v3 style parameters
      var updatedParameters = this._applyV3Options(parameters, opts);

      // Set texture sampler parameters
      this.setParameters(updatedParameters);

      // TODO - Store data to enable auto recreate on context loss
      if (recreate) {
        this.data = data;
      }
    }

    // If size has changed, reinitializes with current format
    // note clears image and mipmaps

  }, {
    key: 'resize',
    value: function resize(_ref2) {
      var width = _ref2.width,
          height = _ref2.height;

      if (width !== this.width || height !== this.height) {
        return this.initialize({
          width: width,
          height: height,
          format: this.format,
          type: this.type,
          dataFormat: this.dataFormat,
          border: this.border,
          mipmaps: false
        });
      }
      return this;
    }

    // Call to regenerate mipmaps after modifying texture(s)

  }, {
    key: 'generateMipmap',
    value: function generateMipmap() {
      var _this2 = this;

      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.gl.bindTexture(this.target, this.handle);
      withParameters(this.gl, params, function () {
        _this2.gl.generateMipmap(_this2.target);
      });
      this.gl.bindTexture(this.target, null);
      return this;
    }

    /*
     * Allocates storage
     * @param {*} pixels -
     *  null - create empty texture of specified format
     *  Typed array - init from image data in typed array
     *  Buffer|WebGLBuffer - (WEBGL2) init from image data in WebGLBuffer
     *  HTMLImageElement|Image - Inits with content of image. Auto width/height
     *  HTMLCanvasElement - Inits with contents of canvas. Auto width/height
     *  HTMLVideoElement - Creates video texture. Auto width/height
     *
     * @param {GLint} width -
     * @param {GLint} height -
     * @param {GLint} mipMapLevel -
     * @param {GLenum} format - format of image data.
     * @param {GLenum} type
     *  - format of array (autodetect from type) or
     *  - (WEBGL2) format of buffer
     * @param {Number} offset - (WEBGL2) offset from start of buffer
     * @param {GLint} border - must be 0.
     * @parameters - temporary settings to be applied, can be used to supply pixel store settings.
     */
    /* eslint-disable max-len, max-statements, complexity */

  }, {
    key: 'setImageData',
    value: function setImageData(_ref3) {
      var _this3 = this;

      var _ref3$target = _ref3.target,
          target = _ref3$target === undefined ? this.target : _ref3$target,
          _ref3$pixels = _ref3.pixels,
          pixels = _ref3$pixels === undefined ? null : _ref3$pixels,
          _ref3$data = _ref3.data,
          data = _ref3$data === undefined ? null : _ref3$data,
          width = _ref3.width,
          height = _ref3.height,
          _ref3$level = _ref3.level,
          level = _ref3$level === undefined ? 0 : _ref3$level,
          _ref3$format = _ref3.format,
          format = _ref3$format === undefined ? GL.RGBA : _ref3$format,
          type = _ref3.type,
          dataFormat = _ref3.dataFormat,
          _ref3$offset = _ref3.offset,
          offset = _ref3$offset === undefined ? 0 : _ref3$offset,
          _ref3$border = _ref3.border,
          border = _ref3$border === undefined ? 0 : _ref3$border,
          _ref3$compressed = _ref3.compressed,
          compressed = _ref3$compressed === undefined ? false : _ref3$compressed,
          _ref3$parameters = _ref3.parameters,
          parameters = _ref3$parameters === undefined ? {} : _ref3$parameters;

      // pixels variable is  for API compatibility purpose
      if (!data) {
        data = pixels;
      }

      var _deduceParameters3 = this._deduceParameters({
        format: format, type: type, dataFormat: dataFormat, compressed: compressed, data: data, width: width, height: height });

      type = _deduceParameters3.type;
      dataFormat = _deduceParameters3.dataFormat;
      compressed = _deduceParameters3.compressed;
      width = _deduceParameters3.width;
      height = _deduceParameters3.height;
      var gl = this.gl;

      gl.bindTexture(this.target, this.handle);

      var dataType = null;

      var _getDataType2 = this._getDataType({ data: data, compressed: compressed });

      data = _getDataType2.data;
      dataType = _getDataType2.dataType;


      withParameters(this.gl, parameters, function () {
        switch (dataType) {
          case 'null':
            gl.texImage2D(target, level, format, width, height, border, dataFormat, type, data);
            break;
          case 'typed-array':
            // Looks like this assert is not necessary, as offset is ignored under WebGL1
            // assert((offset === 0 || isWebGL2(gl)), 'offset supported in WebGL2 only');
            gl.texImage2D(target, level, format, width, height, border, dataFormat, type, data, offset);
            break;
          case 'buffer':
            // WebGL2 enables creating textures directly from a WebGL buffer
            assert(isWebGL2(gl), ERR_WEBGL2);
            gl.bindBuffer(GL.PIXEL_UNPACK_BUFFER, data.handle || data);
            gl.texImage2D(target, level, format, width, height, border, format, type, offset);
            break;
          case 'browser-object':
            gl.texImage2D(target, level, format, format, type, data);
            break;
          case 'compressed':
            gl.compressedTexImage2D(_this3.target, level, format, width, height, border, data);
            break;
          default:
            assert(false, 'Unknown image data type');
        }
      });
    }
    /* eslint-enable max-len, max-statements, complexity */

    /**
     * Redefines an area of an existing texture
     * Note: does not allocate storage
     */
    /*
     * Redefines an area of an existing texture
     * @param {*} pixels, data -
     *  null - create empty texture of specified format
     *  Typed array - init from image data in typed array
     *  Buffer|WebGLBuffer - (WEBGL2) init from image data in WebGLBuffer
     *  HTMLImageElement|Image - Inits with content of image. Auto width/height
     *  HTMLCanvasElement - Inits with contents of canvas. Auto width/height
     *  HTMLVideoElement - Creates video texture. Auto width/height
     *
     * @param {GLint} x - xOffset from where texture to be updated
     * @param {GLint} y - yOffset from where texture to be updated
     * @param {GLint} width - width of the sub image to be updated
     * @param {GLint} height - height of the sub image to be updated
     * @param {GLint} level - mip level to be updated
     * @param {GLenum} format - internal format of image data.
     * @param {GLenum} type
     *  - format of array (autodetect from type) or
     *  - (WEBGL2) format of buffer or ArrayBufferView
     * @param {GLenum} dataFormat - format of image data.
     * @param {Number} offset - (WEBGL2) offset from start of buffer
     * @param {GLint} border - must be 0.
     * @parameters - temporary settings to be applied, can be used to supply pixel store settings.
     */

  }, {
    key: 'setSubImageData',
    value: function setSubImageData(_ref4) {
      var _this4 = this;

      var _ref4$target = _ref4.target,
          target = _ref4$target === undefined ? this.target : _ref4$target,
          _ref4$pixels = _ref4.pixels,
          pixels = _ref4$pixels === undefined ? null : _ref4$pixels,
          _ref4$data = _ref4.data,
          data = _ref4$data === undefined ? null : _ref4$data,
          _ref4$x = _ref4.x,
          x = _ref4$x === undefined ? 0 : _ref4$x,
          _ref4$y = _ref4.y,
          y = _ref4$y === undefined ? 0 : _ref4$y,
          width = _ref4.width,
          height = _ref4.height,
          _ref4$level = _ref4.level,
          level = _ref4$level === undefined ? 0 : _ref4$level,
          _ref4$format = _ref4.format,
          format = _ref4$format === undefined ? GL.RGBA : _ref4$format,
          type = _ref4.type,
          dataFormat = _ref4.dataFormat,
          _ref4$compressed = _ref4.compressed,
          compressed = _ref4$compressed === undefined ? false : _ref4$compressed,
          _ref4$offset = _ref4.offset,
          offset = _ref4$offset === undefined ? 0 : _ref4$offset,
          _ref4$border = _ref4.border,
          border = _ref4$border === undefined ? 0 : _ref4$border,
          _ref4$parameters = _ref4.parameters,
          parameters = _ref4$parameters === undefined ? {} : _ref4$parameters;

      // pixels variable is  for API compatibility purpose
      var _deduceParameters4 = this._deduceParameters({
        format: format, type: type, dataFormat: dataFormat, compressed: compressed, data: data, width: width, height: height });

      type = _deduceParameters4.type;
      dataFormat = _deduceParameters4.dataFormat;
      compressed = _deduceParameters4.compressed;
      width = _deduceParameters4.width;
      height = _deduceParameters4.height;
      if (!data) {
        data = pixels;
      }

      // Support ndarrays
      if (data && data.data) {
        var ndarray = data;
        data = ndarray.data;
        width = ndarray.shape[0];
        height = ndarray.shape[1];
      }

      // Support buffers
      if (data instanceof Buffer) {
        data = data.handle;
      }

      this.gl.bindTexture(this.target, this.handle);

      withParameters(this.gl, parameters, function () {
        // TODO - x,y parameters
        if (compressed) {
          _this4.gl.compressedTexSubImage2D(target, level, x, y, width, height, format, data);
        } else if (data === null) {
          _this4.gl.texSubImage2D(target, level, format, width, height, border, dataFormat, type, null);
        } else if (ArrayBuffer.isView(data)) {
          _this4.gl.texSubImage2D(target, level, x, y, width, height, format, type, data, offset);
        } else if (data instanceof WebGLBuffer) {
          // WebGL2 allows us to create texture directly from a WebGL buffer
          assert(isWebGL2(_this4.gl), ERR_WEBGL2);
          // This texImage2D signature uses currently bound GL_PIXEL_UNPACK_BUFFER
          _this4.gl.bindBuffer(GL.PIXEL_UNPACK_BUFFER, data);
          _this4.gl.texSubImage2D(target, level, format, width, height, border, format, type, offset);
          _this4.gl.bindBuffer(GL.GL_PIXEL_UNPACK_BUFFER, null);
        } else {
          // Assume data is a browser supported object (ImageData, Canvas, ...)
          _this4.gl.texSubImage2D(target, level, x, y, format, type, data);
        }
      });

      this.gl.bindTexture(this.target, null);
    }
    /* eslint-enable max-len, max-statements, complexity */

    /**
     * Defines a two-dimensional texture image or cube-map texture image with
     * pixels from the current framebuffer (rather than from client memory).
     * (gl.copyTexImage2D wrapper)
     *
     * Note that binding a texture into a Framebuffer's color buffer and
     * rendering can be faster.
     */

  }, {
    key: 'copyFramebuffer',
    value: function copyFramebuffer(_ref5) {
      var _ref5$target = _ref5.target,
          target = _ref5$target === undefined ? this.target : _ref5$target,
          framebuffer = _ref5.framebuffer,
          _ref5$offset = _ref5.offset,
          offset = _ref5$offset === undefined ? 0 : _ref5$offset,
          _ref5$x = _ref5.x,
          x = _ref5$x === undefined ? 0 : _ref5$x,
          _ref5$y = _ref5.y,
          y = _ref5$y === undefined ? 0 : _ref5$y,
          width = _ref5.width,
          height = _ref5.height,
          _ref5$level = _ref5.level,
          level = _ref5$level === undefined ? 0 : _ref5$level,
          _ref5$internalFormat = _ref5.internalFormat,
          internalFormat = _ref5$internalFormat === undefined ? GL.RGBA : _ref5$internalFormat,
          _ref5$border = _ref5.border,
          border = _ref5$border === undefined ? 0 : _ref5$border;

      if (framebuffer) {
        framebuffer.bind();
      }

      // target
      this.bind();
      this.gl.copyTexImage2D(this.target, level, internalFormat, x, y, width, height, border);
      this.unbind();

      if (framebuffer) {
        framebuffer.unbind();
      }
    }
  }, {
    key: 'getActiveUnit',
    value: function getActiveUnit() {
      return this.gl.getParameter(GL.ACTIVE_TEXTURE) - GL.TEXTURE0;
    }

    // target cannot be modified by bind:
    // textures are special because when you first bind them to a target,
    // they get special information. When you first bind a texture as a
    // GL_TEXTURE_2D, you are actually setting special state in the texture.
    // You are saying that this texture is a 2D texture.
    // And it will always be a 2D texture; this state cannot be changed ever.
    // If you have a texture that was first bound as a GL_TEXTURE_2D,
    // you must always bind it as a GL_TEXTURE_2D;
    // attempting to bind it as GL_TEXTURE_1D will give rise to an error
    // (while run-time).

  }, {
    key: 'bind',
    value: function bind() {
      var textureUnit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.textureUnit;

      if (textureUnit === undefined) {
        throw new Error('Texture.bind: must specify texture unit');
      }
      this.textureUnit = textureUnit;
      this.gl.activeTexture(GL.TEXTURE0 + textureUnit);
      this.gl.bindTexture(this.target, this.handle);
      return textureUnit;
    }
  }, {
    key: 'unbind',
    value: function unbind() {
      if (this.textureUnit === undefined) {
        throw new Error('Texture.unbind: texture unit not specified');
      }
      this.gl.activeTexture(GL.TEXTURE0 + this.textureUnit);
      this.gl.bindTexture(this.target, null);
      return this.textureUnit;
    }

    // PRIVATE METHODS

  }, {
    key: '_getDataType',
    value: function _getDataType(_ref6) {
      var data = _ref6.data,
          _ref6$compressed = _ref6.compressed,
          compressed = _ref6$compressed === undefined ? false : _ref6$compressed;

      if (compressed) {
        return { data: data, dataType: 'compressed' };
      }
      if (data === null) {
        return { data: data, dataType: 'null' };
      }
      if (ArrayBuffer.isView(data)) {
        return { data: data, dataType: 'typed-array' };
      }
      if (data instanceof Buffer) {
        return { data: data.handle, dataType: 'buffer' };
      }
      if (data instanceof WebGLBuffer) {
        return { data: data, dataType: 'buffer' };
      }
      // Assume data is a browser supported object (ImageData, Canvas, ...)
      return { data: data, dataType: 'browser-object' };
    }

    // Image 3D copies from Typed Array or WebGLBuffer

  }, {
    key: 'setImage3D',
    value: function setImage3D(_ref7) {
      var _ref7$level = _ref7.level,
          level = _ref7$level === undefined ? 0 : _ref7$level,
          _ref7$internalformat = _ref7.internalformat,
          internalformat = _ref7$internalformat === undefined ? GL.RGBA : _ref7$internalformat,
          width = _ref7.width,
          height = _ref7.height,
          _ref7$depth = _ref7.depth,
          depth = _ref7$depth === undefined ? 1 : _ref7$depth,
          _ref7$border = _ref7.border,
          border = _ref7$border === undefined ? 0 : _ref7$border,
          format = _ref7.format,
          _ref7$type = _ref7.type,
          type = _ref7$type === undefined ? GL.UNSIGNED_BYTE : _ref7$type,
          _ref7$offset = _ref7.offset,
          offset = _ref7$offset === undefined ? 0 : _ref7$offset,
          pixels = _ref7.pixels;

      if (ArrayBuffer.isView(pixels)) {
        this.gl.texImage3D(this.target, level, internalformat, width, height, depth, border, format, type, pixels);
        return this;
      }

      if (pixels instanceof Buffer) {
        this.gl.bindBuffer(GL.PIXEL_UNPACK_BUFFER, pixels.handle);
        this.gl.texImage3D(this.target, level, internalformat, width, height, depth, border, format, type, offset);
      }

      return this;
    }

    /* Copied from texture-2d.js
    // WebGL2
    setPixels(opts = {}) {
      const {
        buffer,
        width = null,
        height = null,
        mipmapLevel = 0,
        format = GL.RGBA,
        type = GL.UNSIGNED_BYTE,
        border = 0
      } = opts;
       const {gl} = this;
       // This signature of texImage2D uses currently bound GL_PIXEL_UNPACK_BUFFER
      gl.bindBuffer(GL.PIXEL_UNPACK_BUFFER, buffer.target);
      // And as always, we must also bind the texture itself
      this.bind();
       gl.texImage2D(gl.TEXTURE_2D,
        mipmapLevel, format, width, height, border, format, type, buffer.target);
       this.unbind();
      gl.bindBuffer(GL.GL_PIXEL_UNPACK_BUFFER, null);
      return this;
    }
     setImageDataFromCompressedBuffer(opts) {
      const {
        buffer,
        // offset = 0,
        width = null,
        height = null,
        mipmapLevel = 0,
        internalFormat = GL.RGBA,
        // format = GL.RGBA,
        // type = GL.UNSIGNED_BYTE,
        border = 0
      } = opts;
       const {gl} = this;
      gl.compressedTexImage2D(this.target,
        mipmapLevel, internalFormat, width, height, border, buffer);
      // gl.compressedTexSubImage2D(target,
      //   level, xoffset, yoffset, width, height, format, ArrayBufferView? pixels);
      return this;
    }
     copySubImage(opts) {
      const {
        // pixels,
        // offset = 0,
        // x,
        // y,
        // width,
        // height,
        // mipmapLevel = 0,
        // internalFormat = GL.RGBA,
        // type = GL.UNSIGNED_BYTE,
        // border = 0
      } = opts;
       // if (pixels instanceof ArrayBufferView) {
      //   gl.texSubImage2D(target, level, x, y, width, height, format, type, pixels);
      // }
      // gl.texSubImage2D(target, level, x, y, format, type, ? pixels);
      // gl.texSubImage2D(target, level, x, y, format, type, HTMLImageElement pixels);
      // gl.texSubImage2D(target, level, x, y, format, type, HTMLCanvasElement pixels);
      // gl.texSubImage2D(target, level, x, y, format, type, HTMLVideoElement pixels);
      // // Additional signature in a WebGL 2 context:
      // gl.texSubImage2D(target, level, x, y, format, type, GLintptr offset);
    }
    */

    // HELPER METHODS

  }, {
    key: '_deduceParameters',
    value: function _deduceParameters(opts) {
      var format = opts.format,
          data = opts.data;
      var width = opts.width,
          height = opts.height,
          dataFormat = opts.dataFormat,
          type = opts.type,
          compressed = opts.compressed;

      // Deduce format and type from format

      var textureFormat = TEXTURE_FORMATS[format];
      dataFormat = dataFormat || textureFormat && textureFormat.dataFormat;
      type = type || textureFormat && textureFormat.types[0];

      // Deduce compression from format
      compressed = compressed || textureFormat && textureFormat.compressed;

      var _deduceImageSize2 = this._deduceImageSize({ data: data, width: width, height: height });

      width = _deduceImageSize2.width;
      height = _deduceImageSize2.height;


      return { dataFormat: dataFormat, type: type, compressed: compressed, width: width, height: height, format: format, data: data };
    }

    // Convert and append any v3 style parameters

  }, {
    key: '_applyV3Options',
    value: function _applyV3Options(parameters, opts) {
      var v4Parameters = Object.assign({}, parameters);

      if ('magFilter' in opts) {
        v4Parameters[GL.TEXTURE_MAG_FILTER] = opts.magFilter;
        log.deprecated('magFilter', 'TEXTURE_MAG_FILTER');
      }
      if ('minFilter' in opts) {
        v4Parameters[GL.TEXTURE_MIN_FILTER] = opts.minFilter;
        log.deprecated('minFilter', 'TEXTURE_MIN_FILTER');
      }
      if ('wrapS' in opts) {
        v4Parameters[GL.TEXTURE_WRAP_S] = opts.wrapS;
        log.deprecated('wrapS', 'TEXTURE_WRAP_S');
      }
      if ('wrapT' in opts) {
        v4Parameters[GL.TEXTURE_WRAP_T] = opts.wrapT;
        log.deprecated('wrapT', 'TEXTURE_WRAP_T');
      }

      return v4Parameters;
    }

    /* global ImageData, HTMLImageElement, HTMLCanvasElement, HTMLVideoElement */

  }, {
    key: '_deduceImageSize',
    value: function _deduceImageSize(_ref8) {
      var data = _ref8.data,
          width = _ref8.width,
          height = _ref8.height;

      var size = void 0;

      if (typeof ImageData !== 'undefined' && data instanceof ImageData) {
        size = { width: data.width, height: data.height };
      } else if (typeof HTMLImageElement !== 'undefined' && data instanceof HTMLImageElement) {
        size = { width: data.naturalWidth, height: data.naturalHeight };
      } else if (typeof HTMLCanvasElement !== 'undefined' && data instanceof HTMLCanvasElement) {
        size = { width: data.width, height: data.height };
      } else if (typeof HTMLVideoElement !== 'undefined' && data instanceof HTMLVideoElement) {
        size = { width: data.videoWidth, height: data.videoHeight };
      } else if (!data) {
        size = { width: width >= 0 ? width : 1, height: height >= 0 ? height : 1 };
      } else {
        size = { width: width, height: height };
      }

      assert(size, 'Could not deduced texture size');
      assert(width === undefined || size.width === width, 'Deduced texture width does not match supplied width');
      assert(height === undefined || size.height === height, 'Deduced texture height does not match supplied height');

      return size;
    }

    // RESOURCE METHODS

  }, {
    key: '_createHandle',
    value: function _createHandle() {
      return this.gl.createTexture();
    }
  }, {
    key: '_deleteHandle',
    value: function _deleteHandle() {
      this.gl.deleteTexture(this.handle);
    }
  }, {
    key: '_getParameter',
    value: function _getParameter(pname) {
      switch (pname) {
        case GL.TEXTURE_WIDTH:
          return this.width;
        case GL.TEXTURE_HEIGHT:
          return this.height;
        default:
          this.gl.bindTexture(this.target, this.handle);
          var value = this.gl.getTexParameter(this.target, pname);
          this.gl.bindTexture(this.target, null);
          return value;
      }
    }
  }, {
    key: '_setParameter',
    value: function _setParameter(pname, param) {
      this.gl.bindTexture(this.target, this.handle);

      // NOTE: Apply NPOT workaround
      param = this._getNPOTParam(pname, param);

      // Apparently there are some integer/float conversion rules that made
      // the WebGL committe expose two parameter setting functions in JavaScript.
      // For now, pick the float version for parameters specified as GLfloat.
      switch (pname) {
        case GL.TEXTURE_MIN_LOD:
        case GL.TEXTURE_MAX_LOD:
          this.gl.texParameterf(this.handle, pname, param);
          break;

        case GL.TEXTURE_WIDTH:
        case GL.TEXTURE_HEIGHT:
          throw new Error('Cannot set emulated parameter');

        default:
          this.gl.texParameteri(this.target, pname, param);
          break;
      }

      this.gl.bindTexture(this.target, null);
      return this;
    }
  }, {
    key: '_isNPOT',
    value: function _isNPOT() {
      return !isWebGL2(this.gl) && (!isPowerOfTwo(this.width) || !isPowerOfTwo(this.height));
    }

    // Update default settings which are not supported by NPOT textures.

  }, {
    key: '_updateForNPOT',
    value: function _updateForNPOT(parameters) {
      if (parameters[this.gl.TEXTURE_MIN_FILTER] === undefined) {
        log.warn(0, 'texture: ' + this + ' is Non-Power-Of-Two, forcing TEXTURE_MIN_FILTER to LINEAR');
        parameters[this.gl.TEXTURE_MIN_FILTER] = this.gl.LINEAR;
      }
      if (parameters[this.gl.TEXTURE_WRAP_S] === undefined) {
        log.warn(0, 'texture: ' + this + ' is Non-Power-Of-Two, forcing TEXTURE_WRAP_S to CLAMP_TO_EDGE');
        parameters[this.gl.TEXTURE_WRAP_S] = this.gl.CLAMP_TO_EDGE;
      }
      if (parameters[this.gl.TEXTURE_WRAP_T] === undefined) {
        log.warn(0, 'texture: ' + this + ' is Non-Power-Of-Two, forcing TEXTURE_WRAP_T to CLAMP_TO_EDGE');
        parameters[this.gl.TEXTURE_WRAP_T] = this.gl.CLAMP_TO_EDGE;
      }
    }
  }, {
    key: '_getNPOTParam',
    value: function _getNPOTParam(pname, param) {
      if (this._isNPOT()) {
        switch (pname) {
          case GL.TEXTURE_MIN_FILTER:
            if (NPOT_MIN_FILTERS.indexOf(param) === -1) {
              log.warn(0, 'texture: ' + this + ' is Non-Power-Of-Two, forcing TEXTURE_MIN_FILTER to LINEAR');
              param = GL.LINEAR;
            }
            break;
          case GL.TEXTURE_WRAP_S:
          case GL.TEXTURE_WRAP_T:
            if (param !== GL.CLAMP_TO_EDGE) {
              log.warn(0, 'texture: ' + this + ' is Non-Power-Of-Two, ' + glKey(pname) + ' to CLAMP_TO_EDGE');
              param = GL.CLAMP_TO_EDGE;
            }
            break;
          default:
            break;
        }
      }
      return param;
    }
  }]);

  return Texture;
}(Resource);

export default Texture;
//# sourceMappingURL=texture.js.map