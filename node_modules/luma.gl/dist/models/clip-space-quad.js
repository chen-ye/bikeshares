'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _core = require('../core');

var _geometry = require('../geometry');

var _webgl = require('../webgl');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // ClipSpaceQuad


var CLIPSPACE_QUAD_VERTEX_SHADER = 'attribute vec2 aClipSpacePosition;\nattribute vec2 aTexCoord;\nattribute vec2 aCoordinate;\n\nvarying vec2 position;\nvarying vec2 coordinate;\nvarying vec2 uv;\n\nvoid main(void) {\n  gl_Position = vec4(aClipSpacePosition, 0., 1.);\n  position = aClipSpacePosition;\n  coordinate = aCoordinate;\n  uv = aTexCoord;\n}\n';

/* eslint-disable indent, no-multi-spaces */
var POSITIONS = [-1, -1, 1, -1, -1, 1, 1, 1];

var ClipSpaceQuad = /*#__PURE__*/function (_Model) {
  _inherits(ClipSpaceQuad, _Model);

  function ClipSpaceQuad(gl, opts) {
    _classCallCheck(this, ClipSpaceQuad);

    var TEX_COORDS = POSITIONS.map(function (coord) {
      return coord === -1 ? 0 : coord;
    });

    var _this = _possibleConstructorReturn(this, (ClipSpaceQuad.__proto__ || Object.getPrototypeOf(ClipSpaceQuad)).call(this, gl, Object.assign({}, opts, {
      vs: CLIPSPACE_QUAD_VERTEX_SHADER,
      geometry: new _geometry.Geometry({
        drawMode: _webgl.GL.TRIANGLE_STRIP,
        vertexCount: 4,
        attributes: {
          aClipSpacePosition: { size: 2, value: new Float32Array(POSITIONS) },
          aTexCoord: { size: 2, value: new Float32Array(TEX_COORDS) },
          aCoordinate: { size: 2, value: new Float32Array(TEX_COORDS) }
        }
      })
    })));

    _this.setVertexCount(4);
    return _this;
  }

  return ClipSpaceQuad;
}(_core.Model);

exports.default = ClipSpaceQuad;
//# sourceMappingURL=clip-space-quad.js.map