function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import TruncatedConeGeometry from './truncated-cone-geometry';

var ConeGeometry = /*#__PURE__*/function (_TruncatedConeGeometr) {
  _inherits(ConeGeometry, _TruncatedConeGeometr);

  function ConeGeometry() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ConeGeometry);

    var _opts$radius = opts.radius,
        radius = _opts$radius === undefined ? 1 : _opts$radius,
        _opts$cap = opts.cap,
        cap = _opts$cap === undefined ? true : _opts$cap;
    return _possibleConstructorReturn(this, (ConeGeometry.__proto__ || Object.getPrototypeOf(ConeGeometry)).call(this, Object.assign({}, opts, {
      topRadius: 0,
      topCap: Boolean(cap),
      bottomCap: Boolean(cap),
      bottomRadius: radius
    })));
  }

  return ConeGeometry;
}(TruncatedConeGeometry);

export default ConeGeometry;
//# sourceMappingURL=cone-geometry.js.map