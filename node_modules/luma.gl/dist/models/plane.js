'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _geometry = require('../geometry');

var _model = require('../core/model');

var _model2 = _interopRequireDefault(_model);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plane = /*#__PURE__*/function (_Model) {
  _inherits(Plane, _Model);

  function Plane(gl) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Plane);

    var _opts$id = opts.id,
        id = _opts$id === undefined ? (0, _utils.uid)('plane') : _opts$id;
    return _possibleConstructorReturn(this, (Plane.__proto__ || Object.getPrototypeOf(Plane)).call(this, gl, Object.assign({}, opts, { id: id, geometry: new _geometry.PlaneGeometry(opts) })));
  }

  return Plane;
}(_model2.default);

exports.default = Plane;
//# sourceMappingURL=plane.js.map