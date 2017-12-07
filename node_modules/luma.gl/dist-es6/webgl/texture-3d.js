var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import GL from './api';
import { isWebGL2, assertWebGL2Context } from './context';
import { withParameters } from './context-state';
import Texture from '../webgl/texture';
import Buffer from './buffer';

var Texture3D = /*#__PURE__*/function (_Texture) {
  _inherits(Texture3D, _Texture);

  _createClass(Texture3D, null, [{
    key: 'isSupported',
    value: function isSupported(gl) {
      return isWebGL2(gl);
    }

    /**
     * @classdesc
     * 3D WebGL Texture
     * Note: Constructor will initialize your texture.
     *
     * @class
     * @param {WebGLRenderingContext} gl - gl context
     * @param {Image|ArrayBuffer|null} opts= - named options
     * @param {Image|ArrayBuffer|null} opts.data= - buffer
     * @param {GLint} width - width of texture
     * @param {GLint} height - height of texture
     */

  }]);

  function Texture3D(gl) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Texture3D);

    assertWebGL2Context(gl);

    var _this = _possibleConstructorReturn(this, (Texture3D.__proto__ || Object.getPrototypeOf(Texture3D)).call(this, gl, Object.assign({}, opts, { target: opts.target || GL.TEXTURE_3D })));

    _this.width = null;
    _this.height = null;
    _this.depth = null;
    Object.seal(_this);

    _this.setImageData(opts);
    if (opts.generateMipmap) {
      _this.generateMipmap();
    }
    return _this;
  }

  _createClass(Texture3D, [{
    key: 'initialize',
    value: function initialize() {
      var _this2 = this;

      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.opts = Object.assign({}, this.opts, opts);
      var _opts = this.opts,
          pixels = _opts.pixels,
          settings = _opts.settings;

      if (settings) {
        withParameters(settings, function () {
          if (pixels) {
            _this2.setImage3D(_this2.opts);
          }
        });
        this.setParameters(opts);
      }
    }

    // WebGL2

    // Image 3D copies from Typed Array or WebGLBuffer

  }, {
    key: 'setImage3D',
    value: function setImage3D(_ref) {
      var _ref$level = _ref.level,
          level = _ref$level === undefined ? 0 : _ref$level,
          _ref$internalformat = _ref.internalformat,
          internalformat = _ref$internalformat === undefined ? GL.RGBA : _ref$internalformat,
          width = _ref.width,
          height = _ref.height,
          _ref$depth = _ref.depth,
          depth = _ref$depth === undefined ? 1 : _ref$depth,
          _ref$border = _ref.border,
          border = _ref$border === undefined ? 0 : _ref$border,
          format = _ref.format,
          _ref$type = _ref.type,
          type = _ref$type === undefined ? GL.UNSIGNED_BYTE : _ref$type,
          _ref$offset = _ref.offset,
          offset = _ref$offset === undefined ? 0 : _ref$offset,
          pixels = _ref.pixels;

      if (ArrayBuffer.isView(pixels)) {
        this.gl.texImage3D(this.target, level, internalformat, width, height, depth, border, format, type, pixels);
        return;
      }
      if (pixels instanceof Buffer) {
        this.gl.bindBuffer(GL.PIXEL_UNPACK_BUFFER, pixels.handle);
        this.gl.texImage3D(this.target, level, internalformat, width, height, depth, border, format, type, offset);
        this.gl.bindBuffer(GL.PIXEL_UNPACK_BUFFER, pixels.handle);
      }
    }
  }]);

  return Texture3D;
}(Texture);

export default Texture3D;
//# sourceMappingURL=texture-3d.js.map