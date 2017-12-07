'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _geometry = require('../geometry');

var _core = require('../core');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TruncatedCone = /*#__PURE__*/function (_Model) {
  _inherits(TruncatedCone, _Model);

  function TruncatedCone(gl) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, TruncatedCone);

    return _possibleConstructorReturn(this, (TruncatedCone.__proto__ || Object.getPrototypeOf(TruncatedCone)).call(this, gl, Object.assign({}, opts, { geometry: new _geometry.TruncatedConeGeometry(opts) })));
  }

  return TruncatedCone;
}(_core.Model);

exports.default = TruncatedCone;
//# sourceMappingURL=truncated-cone.js.map