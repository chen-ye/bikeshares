function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import TruncatedConeGeometry from './truncated-cone-geometry';

var CylinderGeometry = /*#__PURE__*/function (_TruncatedConeGeometr) {
  _inherits(CylinderGeometry, _TruncatedConeGeometr);

  function CylinderGeometry() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, CylinderGeometry);

    var _opts$radius = opts.radius,
        radius = _opts$radius === undefined ? 1 : _opts$radius;
    return _possibleConstructorReturn(this, (CylinderGeometry.__proto__ || Object.getPrototypeOf(CylinderGeometry)).call(this, Object.assign({}, opts, {
      bottomRadius: radius,
      topRadius: radius
    })));
  }

  return CylinderGeometry;
}(TruncatedConeGeometry);

export default CylinderGeometry;
//# sourceMappingURL=cylinder-geometry.js.map