function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import Geometry from './geometry';
import { uid } from '../utils';

var PlaneGeometry = /*#__PURE__*/function (_Geometry) {
  _inherits(PlaneGeometry, _Geometry);

  // Primitives inspired by TDL http://code.google.com/p/webglsamples/,
  // copyright 2011 Google Inc. new BSD License
  // (http://www.opensource.org/licenses/bsd-license.php).
  /* eslint-disable max-statements, complexity */
  /* eslint-disable complexity, max-statements */
  function PlaneGeometry() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, PlaneGeometry);

    var _opts$type = opts.type,
        type = _opts$type === undefined ? 'x,y' : _opts$type,
        _opts$offset = opts.offset,
        offset = _opts$offset === undefined ? 0 : _opts$offset,
        _opts$flipCull = opts.flipCull,
        flipCull = _opts$flipCull === undefined ? false : _opts$flipCull,
        _opts$unpack = opts.unpack,
        unpack = _opts$unpack === undefined ? false : _opts$unpack,
        _opts$id = opts.id,
        id = _opts$id === undefined ? uid('plane-geometry') : _opts$id;


    var coords = type.split(',');
    // width, height
    var c1len = opts[coords[0] + 'len'];
    var c2len = opts[coords[1] + 'len'];
    // subdivisionsWidth, subdivisionsDepth
    var subdivisions1 = opts['n' + coords[0]] || 1;
    var subdivisions2 = opts['n' + coords[1]] || 1;
    var numVertices = (subdivisions1 + 1) * (subdivisions2 + 1);

    var positions = new Float32Array(numVertices * 3);
    var normals = new Float32Array(numVertices * 3);
    var texCoords = new Float32Array(numVertices * 2);

    if (flipCull) {
      c1len = -c1len;
    }

    var i2 = 0;
    var i3 = 0;
    for (var z = 0; z <= subdivisions2; z++) {
      for (var x = 0; x <= subdivisions1; x++) {
        var u = x / subdivisions1;
        var v = z / subdivisions2;
        texCoords[i2 + 0] = flipCull ? 1 - u : u;
        texCoords[i2 + 1] = v;

        switch (type) {
          case 'x,y':
            positions[i3 + 0] = c1len * u - c1len * 0.5;
            positions[i3 + 1] = c2len * v - c2len * 0.5;
            positions[i3 + 2] = offset;

            normals[i3 + 0] = 0;
            normals[i3 + 1] = 0;
            normals[i3 + 2] = flipCull ? 1 : -1;
            break;

          case 'x,z':
            positions[i3 + 0] = c1len * u - c1len * 0.5;
            positions[i3 + 1] = offset;
            positions[i3 + 2] = c2len * v - c2len * 0.5;

            normals[i3 + 0] = 0;
            normals[i3 + 1] = flipCull ? 1 : -1;
            normals[i3 + 2] = 0;
            break;

          case 'y,z':
            positions[i3 + 0] = offset;
            positions[i3 + 1] = c1len * u - c1len * 0.5;
            positions[i3 + 2] = c2len * v - c2len * 0.5;

            normals[i3 + 0] = flipCull ? 1 : -1;
            normals[i3 + 1] = 0;
            normals[i3 + 2] = 0;
            break;

          default:
            break;
        }

        i2 += 2;
        i3 += 3;
      }
    }

    var numVertsAcross = subdivisions1 + 1;
    var indices = new Uint16Array(subdivisions1 * subdivisions2 * 6);

    for (var _z = 0; _z < subdivisions2; _z++) {
      for (var _x2 = 0; _x2 < subdivisions1; _x2++) {
        var index = (_z * subdivisions1 + _x2) * 6;
        // Make triangle 1 of quad.
        indices[index + 0] = (_z + 0) * numVertsAcross + _x2;
        indices[index + 1] = (_z + 1) * numVertsAcross + _x2;
        indices[index + 2] = (_z + 0) * numVertsAcross + _x2 + 1;

        // Make triangle 2 of quad.
        indices[index + 3] = (_z + 1) * numVertsAcross + _x2;
        indices[index + 4] = (_z + 1) * numVertsAcross + _x2 + 1;
        indices[index + 5] = (_z + 0) * numVertsAcross + _x2 + 1;
      }
    }

    // Optionally, unpack indexed geometry
    if (unpack) {
      var positions2 = new Float32Array(indices.length * 3);
      var normals2 = new Float32Array(indices.length * 3);
      var texCoords2 = new Float32Array(indices.length * 2);

      for (var _x3 = 0; _x3 < indices.length; ++_x3) {
        var _index = indices[_x3];
        positions2[_x3 * 3 + 0] = positions[_index * 3 + 0];
        positions2[_x3 * 3 + 1] = positions[_index * 3 + 1];
        positions2[_x3 * 3 + 2] = positions[_index * 3 + 2];
        normals2[_x3 * 3 + 0] = normals[_index * 3 + 0];
        normals2[_x3 * 3 + 1] = normals[_index * 3 + 1];
        normals2[_x3 * 3 + 2] = normals[_index * 3 + 2];
        texCoords2[_x3 * 2 + 0] = texCoords[_index * 2 + 0];
        texCoords2[_x3 * 2 + 1] = texCoords[_index * 2 + 1];
      }

      positions = positions2;
      normals = normals2;
      texCoords = texCoords2;
      indices = undefined;
    }

    var attributes = {
      positions: positions,
      normals: normals,
      texCoords: texCoords
    };

    if (indices) {
      attributes.indices = indices;
    }

    return _possibleConstructorReturn(this, (PlaneGeometry.__proto__ || Object.getPrototypeOf(PlaneGeometry)).call(this, Object.assign({}, opts, { attributes: attributes, id: id })));
  }

  return PlaneGeometry;
}(Geometry);

export default PlaneGeometry;
//# sourceMappingURL=plane-geometry.js.map