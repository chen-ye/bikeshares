var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { GL } from './gl-constants';
import Texture from './texture';
// import {withParameters} from './context';
import assert from 'assert';

var FACES = [GL.TEXTURE_CUBE_MAP_POSITIVE_X, GL.TEXTURE_CUBE_MAP_NEGATIVE_X, GL.TEXTURE_CUBE_MAP_POSITIVE_Y, GL.TEXTURE_CUBE_MAP_NEGATIVE_Y, GL.TEXTURE_CUBE_MAP_POSITIVE_Z, GL.TEXTURE_CUBE_MAP_NEGATIVE_Z];

var TextureCube = /*#__PURE__*/function (_Texture) {
  _inherits(TextureCube, _Texture);

  function TextureCube(gl) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, TextureCube);

    var _this = _possibleConstructorReturn(this, (TextureCube.__proto__ || Object.getPrototypeOf(TextureCube)).call(this, gl, Object.assign({}, opts, { target: GL.TEXTURE_CUBE_MAP })));

    _this.initialize(opts);
    Object.seal(_this);
    return _this;
  }

  /* eslint-disable max-len, max-statements */


  _createClass(TextureCube, [{
    key: 'initialize',
    value: function initialize() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _opts$format = opts.format,
          format = _opts$format === undefined ? GL.RGBA : _opts$format,
          _opts$mipmaps = opts.mipmaps,
          mipmaps = _opts$mipmaps === undefined ? true : _opts$mipmaps;
      var _opts$width = opts.width,
          width = _opts$width === undefined ? 1 : _opts$width,
          _opts$height = opts.height,
          height = _opts$height === undefined ? 1 : _opts$height,
          _opts$type = opts.type,
          type = _opts$type === undefined ? GL.UNSIGNED_BYTE : _opts$type,
          dataFormat = opts.dataFormat;

      // Deduce width and height based on one of the faces

      var _deduceParameters = this._deduceParameters({ format: format, type: type, dataFormat: dataFormat });

      type = _deduceParameters.type;
      dataFormat = _deduceParameters.dataFormat;

      // Enforce cube
      var _deduceImageSize = this._deduceImageSize({
        data: opts[GL.TEXTURE_CUBE_MAP_POSITIVE_X], width: width, height: height
      });

      width = _deduceImageSize.width;
      height = _deduceImageSize.height;
      assert(width === height);

      // Temporarily apply any pixel store paramaters and build textures
      // withParameters(this.gl, opts, () => {
      //   for (const face of CUBE_MAP_FACES) {
      //     this.setImageData({
      //       target: face,
      //       data: opts[face],
      //       width, height, format, type, dataFormat, border, mipmaps
      //     });
      //   }
      // });

      this.setCubeMapImageData(opts);

      // Called here so that GL.
      // TODO - should genMipmap() be called on the cubemap or on the faces?
      if (mipmaps) {
        this.generateMipmap(opts);
      }

      // Store opts for accessors
      this.opts = opts;
    }
  }, {
    key: 'subImage',
    value: function subImage(_ref) {
      var face = _ref.face,
          data = _ref.data,
          _ref$x = _ref.x,
          x = _ref$x === undefined ? 0 : _ref$x,
          _ref$y = _ref.y,
          y = _ref$y === undefined ? 0 : _ref$y,
          _ref$mipmapLevel = _ref.mipmapLevel,
          mipmapLevel = _ref$mipmapLevel === undefined ? 0 : _ref$mipmapLevel;

      return this._subImage({ target: face, data: data, x: x, y: y, mipmapLevel: mipmapLevel });
    }

    /* eslint-disable max-statements, max-len */

  }, {
    key: 'setCubeMapImageData',
    value: function setCubeMapImageData(_ref2) {
      var width = _ref2.width,
          height = _ref2.height,
          pixels = _ref2.pixels,
          data = _ref2.data,
          _ref2$border = _ref2.border,
          border = _ref2$border === undefined ? 0 : _ref2$border,
          _ref2$format = _ref2.format,
          format = _ref2$format === undefined ? GL.RGBA : _ref2$format,
          _ref2$type = _ref2.type,
          type = _ref2$type === undefined ? GL.UNSIGNED_BYTE : _ref2$type,
          _ref2$generateMipmap = _ref2.generateMipmap,
          generateMipmap = _ref2$generateMipmap === undefined ? false : _ref2$generateMipmap;
      var gl = this.gl;

      pixels = pixels || data;
      this.bind();
      if (this.width || this.height) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = FACES[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var face = _step.value;

            gl.texImage2D(face, 0, format, width, height, border, format, type, pixels[face]);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      } else {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = FACES[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _face = _step2.value;

            gl.texImage2D(_face, 0, format, format, type, pixels[_face]);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    }
  }, {
    key: 'bind',
    value: function bind() {
      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          index = _ref3.index;

      if (index !== undefined) {
        this.gl.activeTexture(GL.TEXTURE0 + index);
      }
      this.gl.bindTexture(GL.TEXTURE_CUBE_MAP, this.handle);
      return index;
    }
  }, {
    key: 'unbind',
    value: function unbind() {
      this.gl.bindTexture(GL.TEXTURE_CUBE_MAP, null);
      return this;
    }
  }]);

  return TextureCube;
}(Texture);

export default TextureCube;


TextureCube.FACES = FACES;
//# sourceMappingURL=texture-cube.js.map