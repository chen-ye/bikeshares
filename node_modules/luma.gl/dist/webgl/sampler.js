'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _context = require('./context');

var _resource = require('./resource');

var _resource2 = _interopRequireDefault(_resource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint-disable no-inline-comments */


var Sampler = /*#__PURE__*/function (_Resource) {
  _inherits(Sampler, _Resource);

  _createClass(Sampler, null, [{
    key: 'isSupported',
    value: function isSupported(gl) {
      return (0, _context.isWebGL2)(gl);
    }
  }, {
    key: 'isHandle',
    value: function isHandle(handle) {
      return this.gl.isSampler(this.handle);
    }
  }]);

  function Sampler(gl, opts) {
    _classCallCheck(this, Sampler);

    (0, _context.assertWebGL2Context)(gl);

    var _this = _possibleConstructorReturn(this, (Sampler.__proto__ || Object.getPrototypeOf(Sampler)).call(this, gl, opts));

    Object.seal(_this);
    return _this;
  }

  /**
   * Bind to the same texture unit as a texture to control sampling for that texture
   * @param {GLuint} unit - texture unit index
   * @return {Sampler} - returns self to enable chaining
   */


  _createClass(Sampler, [{
    key: 'bind',
    value: function bind(unit) {
      this.gl.bindSampler(unit, this.handle);
      return this;
    }

    /**
     * Bind to the same texture unit as a texture to control sampling for that texture
     * @param {GLuint} unit - texture unit index
     * @return {Sampler} - returns self to enable chaining
     */

  }, {
    key: 'unbind',
    value: function unbind(unit) {
      this.gl.bindSampler(unit, null);
      return this;
    }

    // RESOURCE METHODS

  }, {
    key: '_createHandle',
    value: function _createHandle() {
      return this.gl.createSampler();
    }
  }, {
    key: '_deleteHandle',
    value: function _deleteHandle() {
      this.gl.deleteSampler(this.handle);
    }
  }, {
    key: '_getParameter',
    value: function _getParameter(pname) {
      var value = this.gl.getSamplerParameter(this.handle, pname);
      return value;
    }
  }, {
    key: '_setParameter',
    value: function _setParameter(pname, param) {
      // Apparently there are some conversion integer/float rules that made
      // the WebGL committe expose two parameter setting functions in JavaScript.
      // For now, pick the float version for parameters specified as GLfloat.
      switch (pname) {
        case _api2.default.TEXTURE_MIN_LOD:
        case _api2.default.TEXTURE_MAX_LOD:
          this.gl.samplerParameterf(this.handle, pname, param);
          break;
        default:
          this.gl.samplerParameteri(this.handle, pname, param);
          break;
      }
      return this;
    }
  }]);

  return Sampler;
}(_resource2.default);

exports.default = Sampler;
//# sourceMappingURL=sampler.js.map