var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { uid } from '../utils';
import { log } from '../utils';
import assert from 'assert';

// Rendering primitives - specify how to extract primitives from vertices.
// NOTE: These are numerically identical to the corresponding WebGL/OpenGL constants
export var DRAW_MODE = {
  POINTS: 0x0000, // draw single points.
  LINES: 0x0001, // draw lines. Each vertex connects to the one after it.
  LINE_LOOP: 0x0002, // draw lines. Each set of two vertices is treated as a separate line segment.
  LINE_STRIP: 0x0003, // draw a connected group of line segments from the first vertex to the last
  TRIANGLES: 0x0004, // draw triangles. Each set of three vertices creates a separate triangle.
  TRIANGLE_STRIP: 0x0005, // draw a connected group of triangles.
  TRIANGLE_FAN: 0x0006 // draw a connected group of triangles.
  // Each vertex connects to the previous and the first vertex in the fan.
};

// Helper function to handle string draw modes - when using this library without WebGL constants
export function getDrawMode(drawMode) {
  var mode = typeof drawMode === 'string' ? DRAW_MODE[drawMode] || DRAW_MODE.TRIANGLES : drawMode;
  assert(mode >= 0 && mode <= DRAW_MODE.TRIANGLE_FAN, 'Illegal drawMode');
  return mode;
}

var Geometry = /*#__PURE__*/function () {
  function Geometry() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Geometry);

    var id = opts.id,
        _opts$drawMode = opts.drawMode,
        drawMode = _opts$drawMode === undefined ? DRAW_MODE.TRIANGLES : _opts$drawMode,
        _opts$vertexCount = opts.vertexCount,
        vertexCount = _opts$vertexCount === undefined ? undefined : _opts$vertexCount,
        attributes = opts.attributes;


    this.id = id || uid(this.constructor.name);
    this.drawMode = getDrawMode(drawMode);
    this.vertexCount = vertexCount;
    this.attributes = {};
    this.needsRedraw = true;
    this.userData = {};
    Object.seal(this);

    if (attributes) {
      this.setAttributes(attributes);
    } else {
      log.deprecated('inline attributes', 'attributes parameter');
      // TODO this is deprecated
      delete opts.id;
      delete opts.drawMode;
      delete opts.vertexCount;
      delete opts.attributes;
      this.setAttributes(opts);
    }
  }

  _createClass(Geometry, [{
    key: 'setNeedsRedraw',
    value: function setNeedsRedraw() {
      var redraw = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this.needsRedraw = redraw;
      return this;
    }
  }, {
    key: 'getNeedsRedraw',
    value: function getNeedsRedraw() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$clearRedrawFlags = _ref.clearRedrawFlags,
          clearRedrawFlags = _ref$clearRedrawFlags === undefined ? false : _ref$clearRedrawFlags;

      var redraw = false;
      redraw = redraw || this.needsRedraw;
      this.needsRedraw = this.needsRedraw && !clearRedrawFlags;
      return redraw;
    }
  }, {
    key: 'setVertexCount',
    value: function setVertexCount(vertexCount) {
      this.vertexCount = vertexCount;
    }
  }, {
    key: 'getVertexCount',
    value: function getVertexCount() {
      if (this.vertexCount !== undefined) {
        return this.vertexCount;
      } else if (this.attributes.indices) {
        return this.attributes.indices.value.length;
      } else if (this.attributes.vertices) {
        return this.attributes.vertices.value.length / 3;
      } else if (this.attributes.positions) {
        return this.attributes.positions.value.length / 3;
      }
      return false;
    }
  }, {
    key: 'hasAttribute',
    value: function hasAttribute(attributeName) {
      return Boolean(this.attributes[attributeName]);
    }
  }, {
    key: 'getAttribute',
    value: function getAttribute(attributeName) {
      var attribute = this.attributes[attributeName];
      assert(attribute);
      return attribute.value;
    }
  }, {
    key: 'getArray',
    value: function getArray(attributeName) {
      var attribute = this.attributes[attributeName];
      assert(attribute);
      return attribute.value;
    }
  }, {
    key: 'getAttributes',
    value: function getAttributes() {
      return this.attributes;
    }

    // Attribute
    // value: typed array
    // type: indices, vertices, uvs
    // size: elements per vertex
    // target: WebGL buffer type (string or constant)

  }, {
    key: 'setAttributes',
    value: function setAttributes(attributes) {
      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];

        // Wrap "unwrapped" arrays and try to autodetect their type
        attribute = ArrayBuffer.isView(attribute) ? { value: attribute } : attribute;

        assert(ArrayBuffer.isView(attribute.value), this._print(attributeName) + ': must be typed array or object with value as typed array');

        this._autoDetectAttribute(attributeName, attribute);

        this.attributes[attributeName] = Object.assign({}, attribute, {
          instanced: attribute.instanced || 0
        });
      }
      this.setNeedsRedraw();
      return this;
    }

    // Check for well known attribute names
    /* eslint-disable default-case, complexity */

  }, {
    key: '_autoDetectAttribute',
    value: function _autoDetectAttribute(attributeName, attribute) {
      var category = void 0;
      switch (attributeName) {
        case 'indices':
          category = category || 'indices';
          break;
        case 'texCoords':
        case 'texCoord1':
        case 'texCoord2':
        case 'texCoord3':
          category = 'uvs';
          break;
        case 'vertices':
        case 'positions':
        case 'normals':
        case 'pickingColors':
          category = 'vectors';
          break;
      }

      // Check for categorys
      switch (category) {
        case 'vectors':
          attribute.size = attribute.size || 3;
          break;
        case 'uvs':
          attribute.size = attribute.size || 2;
          break;
        case 'indices':
          attribute.size = attribute.size || 1;
          attribute.isIndexed = attribute.isIndexed || true;
          assert(attribute.value instanceof Uint16Array || attribute.value instanceof Uint32Array, 'attribute array for "indices" must be of integer type');
          break;
      }

      assert(attribute.size, 'attribute ' + attributeName + ' needs size');
    }
    /* eslint-enable default-case, complexity */

  }, {
    key: '_print',
    value: function _print(attributeName) {
      return 'Geometry ' + this.id + ' attribute ' + attributeName;
    }
  }]);

  return Geometry;
}();

export default Geometry;
//# sourceMappingURL=geometry.js.map