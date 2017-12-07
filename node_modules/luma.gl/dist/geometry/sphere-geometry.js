'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _geometry = require('./geometry');

var _geometry2 = _interopRequireDefault(_geometry);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SphereGeometry = /*#__PURE__*/function (_Geometry) {
  _inherits(SphereGeometry, _Geometry);

  function SphereGeometry() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, SphereGeometry);

    var _opts$nlat = opts.nlat,
        nlat = _opts$nlat === undefined ? 10 : _opts$nlat,
        _opts$nlong = opts.nlong,
        nlong = _opts$nlong === undefined ? 10 : _opts$nlong,
        _opts$radius = opts.radius,
        radius = _opts$radius === undefined ? 1 : _opts$radius,
        _opts$id = opts.id,
        id = _opts$id === undefined ? (0, _utils.uid)('sphere-geometry') : _opts$id;
    return _possibleConstructorReturn(this, (SphereGeometry.__proto__ || Object.getPrototypeOf(SphereGeometry)).call(this, Object.assign({}, opts, { id: id, attributes: getSphereAttributes(nlat, nlong, radius) })));
  }

  return SphereGeometry;
}(_geometry2.default);

// Primitives inspired by TDL http://code.google.com/p/webglsamples/,
// copyright 2011 Google Inc. new BSD License
// (http://www.opensource.org/licenses/bsd-license.php).
/* eslint-disable max-statements, complexity */


exports.default = SphereGeometry;
function getSphereAttributes(nlat, nlong, radius) {
  var startLat = 0;
  var endLat = Math.PI;
  var latRange = endLat - startLat;
  var startLong = 0;
  var endLong = 2 * Math.PI;
  var longRange = endLong - startLong;
  var numVertices = (nlat + 1) * (nlong + 1);

  if (typeof radius === 'number') {
    var value = radius;
    radius = function radius(n1, n2, n3, u, v) {
      return value;
    };
  }

  var positions = new Float32Array(numVertices * 3);
  var normals = new Float32Array(numVertices * 3);
  var texCoords = new Float32Array(numVertices * 2);
  var indices = new Uint16Array(nlat * nlong * 6);

  // Create positions, normals and texCoords
  for (var y = 0; y <= nlat; y++) {
    for (var x = 0; x <= nlong; x++) {

      var u = x / nlong;
      var v = y / nlat;

      var index = x + y * (nlong + 1);
      var i2 = index * 2;
      var i3 = index * 3;

      var theta = longRange * u;
      var phi = latRange * v;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);
      var ux = cosTheta * sinPhi;
      var uy = cosPhi;
      var uz = sinTheta * sinPhi;

      var r = radius(ux, uy, uz, u, v);

      positions[i3 + 0] = r * ux;
      positions[i3 + 1] = r * uy;
      positions[i3 + 2] = r * uz;

      normals[i3 + 0] = ux;
      normals[i3 + 1] = uy;
      normals[i3 + 2] = uz;

      texCoords[i2 + 0] = u;
      texCoords[i2 + 1] = v;
    }
  }

  // Create indices
  var numVertsAround = nlat + 1;
  for (var _x2 = 0; _x2 < nlat; _x2++) {
    for (var _y = 0; _y < nlong; _y++) {
      var _index = (_x2 * nlong + _y) * 6;

      indices[_index + 0] = _y * numVertsAround + _x2;
      indices[_index + 1] = _y * numVertsAround + _x2 + 1;
      indices[_index + 2] = (_y + 1) * numVertsAround + _x2;

      indices[_index + 3] = (_y + 1) * numVertsAround + _x2;
      indices[_index + 4] = _y * numVertsAround + _x2 + 1;
      indices[_index + 5] = (_y + 1) * numVertsAround + _x2 + 1;
    }
  }

  return {
    positions: positions,
    indices: indices,
    normals: normals,
    texCoords: texCoords
  };
}
//# sourceMappingURL=sphere-geometry.js.map