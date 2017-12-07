var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Handles tesselation of polygons with holes
// - 2D surfaces
// - 2D outlines
// - 3D surfaces (top and sides only)
// - 3D wireframes (not yet)
import * as Polygon from './polygon';
import earcut from 'earcut';
import { get, count, flattenVertices, fillArray } from '../../../lib/utils';
import { fp64ify } from '../../../lib/utils/fp64';

// Maybe deck.gl or luma.gl needs to export this
function getPickingColor(index) {
  return [(index + 1) % 256, Math.floor((index + 1) / 256) % 256, Math.floor((index + 1) / 256 / 256) % 256];
}

function parseColor(color) {
  if (!Array.isArray(color)) {
    color = [get(color, 0), get(color, 1), get(color, 2), get(color, 3)];
  }
  color[3] = Number.isFinite(color[3]) ? color[3] : 255;
  return color;
}

var DEFAULT_COLOR = [0, 0, 0, 255]; // Black

// This class is set up to allow querying one attribute at a time
// the way the AttributeManager expects it
export var PolygonTesselator = function () {
  function PolygonTesselator(_ref) {
    var polygons = _ref.polygons,
        _ref$fp = _ref.fp64,
        fp64 = _ref$fp === undefined ? false : _ref$fp;

    _classCallCheck(this, PolygonTesselator);

    // Normalize all polygons
    this.polygons = polygons.map(function (polygon) {
      return Polygon.normalize(polygon);
    });
    // Count all polygon vertices
    this.pointCount = getPointCount(this.polygons);
    this.fp64 = fp64;
  }

  _createClass(PolygonTesselator, [{
    key: 'indices',
    value: function indices() {
      var polygons = this.polygons,
          indexCount = this.indexCount;

      return calculateIndices({ polygons: polygons, indexCount: indexCount });
    }
  }, {
    key: 'positions',
    value: function positions() {
      var polygons = this.polygons,
          pointCount = this.pointCount;

      return calculatePositions({ polygons: polygons, pointCount: pointCount, fp64: this.fp64 });
    }
  }, {
    key: 'normals',
    value: function normals() {
      var polygons = this.polygons,
          pointCount = this.pointCount;

      return calculateNormals({ polygons: polygons, pointCount: pointCount });
    }
  }, {
    key: 'colors',
    value: function colors() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$getColor = _ref2.getColor,
          getColor = _ref2$getColor === undefined ? function (x) {
        return DEFAULT_COLOR;
      } : _ref2$getColor;

      var polygons = this.polygons,
          pointCount = this.pointCount;

      return calculateColors({ polygons: polygons, pointCount: pointCount, getColor: getColor });
    }
  }, {
    key: 'pickingColors',
    value: function pickingColors() {
      var polygons = this.polygons,
          pointCount = this.pointCount;

      return calculatePickingColors({ polygons: polygons, pointCount: pointCount });
    }

    // getAttribute({size, accessor}) {
    //   const {polygons, pointCount} = this;
    //   return calculateAttribute({polygons, pointCount, size, accessor});
    // }

  }]);

  return PolygonTesselator;
}();

// Count number of points in a list of complex polygons
function getPointCount(polygons) {
  return polygons.reduce(function (points, polygon) {
    return points + Polygon.getVertexCount(polygon);
  }, 0);
}

// COunt number of triangles in a list of complex polygons
function getTriangleCount(polygons) {
  return polygons.reduce(function (triangles, polygon) {
    return triangles + Polygon.getTriangleCount(polygon);
  }, 0);
}

// Returns the offsets of each complex polygon in the combined array of all polygons
function getPolygonOffsets(polygons) {
  var offsets = new Array(count(polygons) + 1);
  offsets[0] = 0;
  var offset = 0;
  polygons.forEach(function (polygon, i) {
    offset += Polygon.getVertexCount(polygon);
    offsets[i + 1] = offset;
  });
  return offsets;
}

// Returns the offset of each hole polygon in the flattened array for that polygon
function getHoleIndices(complexPolygon) {
  var holeIndices = null;
  if (count(complexPolygon) > 1) {
    var polygonStartIndex = 0;
    holeIndices = [];
    complexPolygon.forEach(function (polygon) {
      polygonStartIndex += count(polygon);
      holeIndices.push(polygonStartIndex);
    });
    // Last element points to end of the flat array, remove it
    holeIndices.pop();
  }
  return holeIndices;
}

function calculateIndices(_ref3) {
  var polygons = _ref3.polygons,
      _ref3$IndexType = _ref3.IndexType,
      IndexType = _ref3$IndexType === undefined ? Uint32Array : _ref3$IndexType;

  // Calculate length of index array (3 * number of triangles)
  var indexCount = 3 * getTriangleCount(polygons);
  var offsets = getPolygonOffsets(polygons);

  // Allocate the attribute
  // TODO it's not the index count but the vertex count that must be checked
  if (IndexType === Uint16Array && indexCount > 65535) {
    throw new Error('Vertex count exceeds browser\'s limit');
  }
  var attribute = new IndexType(indexCount);

  // 1. get triangulated indices for the internal areas
  // 2. offset them by the number of indices in previous polygons
  var i = 0;
  polygons.forEach(function (polygon, polygonIndex) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = calculateSurfaceIndices(polygon)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var index = _step.value;

        attribute[i++] = index + offsets[polygonIndex];
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
  });

  return attribute;
}

/*
 * Get vertex indices for drawing complexPolygon mesh
 * @private
 * @param {[Number,Number,Number][][]} complexPolygon
 * @returns {[Number]} indices
 */
function calculateSurfaceIndices(complexPolygon) {
  // Prepare an array of hole indices as expected by earcut
  var holeIndices = getHoleIndices(complexPolygon);
  // Flatten the polygon as expected by earcut
  var verts = flattenVertices2(complexPolygon);
  // Let earcut triangulate the polygon
  return earcut(verts, holeIndices, 3);
}

// TODO - refactor
function isContainer(value) {
  return Array.isArray(value) || ArrayBuffer.isView(value) || value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
}

// TODO - refactor, this file should not need a separate flatten func
// Flattens nested array of vertices, padding third coordinate as needed
export function flattenVertices2(nestedArray) {
  var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref4$result = _ref4.result,
      result = _ref4$result === undefined ? [] : _ref4$result,
      _ref4$dimensions = _ref4.dimensions,
      dimensions = _ref4$dimensions === undefined ? 3 : _ref4$dimensions;

  var index = -1;
  var vertexLength = 0;
  var length = count(nestedArray);
  while (++index < length) {
    var value = get(nestedArray, index);
    if (isContainer(value)) {
      flattenVertices(value, { result: result, dimensions: dimensions });
    } else {
      if (vertexLength < dimensions) {
        // eslint-disable-line
        result.push(value);
        vertexLength++;
      }
    }
  }
  // Add a third coordinate if needed
  if (vertexLength > 0 && vertexLength < dimensions) {
    result.push(0);
  }
  return result;
}

function calculatePositions(_ref5) {
  var polygons = _ref5.polygons,
      pointCount = _ref5.pointCount,
      fp64 = _ref5.fp64;

  // Flatten out all the vertices of all the sub subPolygons
  var attribute = new Float32Array(pointCount * 3);
  var attributeLow = void 0;
  if (fp64) {
    // We only need x, y component
    attributeLow = new Float32Array(pointCount * 2);
  }
  var i = 0;
  var j = 0;
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = polygons[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var polygon = _step2.value;

      Polygon.forEachVertex(polygon, function (vertex) {
        // eslint-disable-line
        var x = get(vertex, 0);
        var y = get(vertex, 1);
        var z = get(vertex, 2) || 0;
        attribute[i++] = x;
        attribute[i++] = y;
        attribute[i++] = z;
        if (fp64) {
          attributeLow[j++] = fp64ify(x)[1];
          attributeLow[j++] = fp64ify(y)[1];
        }
      });
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

  return { positions: attribute, positions64xyLow: attributeLow };
}

function calculateNormals(_ref6) {
  var polygons = _ref6.polygons,
      pointCount = _ref6.pointCount;

  // TODO - use generic vertex attribute?
  var attribute = new Float32Array(pointCount * 3);
  fillArray({ target: attribute, source: [0, 1, 0], start: 0, pointCount: pointCount });
  return attribute;
}

function calculateColors(_ref7) {
  var polygons = _ref7.polygons,
      pointCount = _ref7.pointCount,
      getColor = _ref7.getColor;

  var attribute = new Uint8ClampedArray(pointCount * 4);
  var i = 0;
  polygons.forEach(function (complexPolygon, polygonIndex) {
    // Calculate polygon color
    var color = getColor(polygonIndex);
    color = parseColor(color);

    var vertexCount = Polygon.getVertexCount(complexPolygon);
    fillArray({ target: attribute, source: color, start: i, count: vertexCount });
    i += color.length * vertexCount;
  });
  return attribute;
}

function calculatePickingColors(_ref8) {
  var polygons = _ref8.polygons,
      pointCount = _ref8.pointCount;

  var attribute = new Uint8ClampedArray(pointCount * 3);
  var i = 0;
  polygons.forEach(function (complexPolygon, polygonIndex) {
    var color = getPickingColor(polygonIndex);
    var vertexCount = Polygon.getVertexCount(complexPolygon);
    fillArray({ target: attribute, source: color, start: i, count: vertexCount });
    i += color.length * vertexCount;
  });
  return attribute;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYXllcnMvY29yZS9zb2xpZC1wb2x5Z29uLWxheWVyL3BvbHlnb24tdGVzc2VsYXRvci5qcyJdLCJuYW1lcyI6WyJQb2x5Z29uIiwiZWFyY3V0IiwiZ2V0IiwiY291bnQiLCJmbGF0dGVuVmVydGljZXMiLCJmaWxsQXJyYXkiLCJmcDY0aWZ5IiwiZ2V0UGlja2luZ0NvbG9yIiwiaW5kZXgiLCJNYXRoIiwiZmxvb3IiLCJwYXJzZUNvbG9yIiwiY29sb3IiLCJBcnJheSIsImlzQXJyYXkiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsIkRFRkFVTFRfQ09MT1IiLCJQb2x5Z29uVGVzc2VsYXRvciIsInBvbHlnb25zIiwiZnA2NCIsIm1hcCIsIm5vcm1hbGl6ZSIsInBvbHlnb24iLCJwb2ludENvdW50IiwiZ2V0UG9pbnRDb3VudCIsImluZGV4Q291bnQiLCJjYWxjdWxhdGVJbmRpY2VzIiwiY2FsY3VsYXRlUG9zaXRpb25zIiwiY2FsY3VsYXRlTm9ybWFscyIsImdldENvbG9yIiwiY2FsY3VsYXRlQ29sb3JzIiwiY2FsY3VsYXRlUGlja2luZ0NvbG9ycyIsInJlZHVjZSIsInBvaW50cyIsImdldFZlcnRleENvdW50IiwiZ2V0VHJpYW5nbGVDb3VudCIsInRyaWFuZ2xlcyIsImdldFBvbHlnb25PZmZzZXRzIiwib2Zmc2V0cyIsIm9mZnNldCIsImZvckVhY2giLCJpIiwiZ2V0SG9sZUluZGljZXMiLCJjb21wbGV4UG9seWdvbiIsImhvbGVJbmRpY2VzIiwicG9seWdvblN0YXJ0SW5kZXgiLCJwdXNoIiwicG9wIiwiSW5kZXhUeXBlIiwiVWludDMyQXJyYXkiLCJVaW50MTZBcnJheSIsIkVycm9yIiwiYXR0cmlidXRlIiwicG9seWdvbkluZGV4IiwiY2FsY3VsYXRlU3VyZmFjZUluZGljZXMiLCJ2ZXJ0cyIsImZsYXR0ZW5WZXJ0aWNlczIiLCJpc0NvbnRhaW5lciIsInZhbHVlIiwiQXJyYXlCdWZmZXIiLCJpc1ZpZXciLCJuZXN0ZWRBcnJheSIsInJlc3VsdCIsImRpbWVuc2lvbnMiLCJ2ZXJ0ZXhMZW5ndGgiLCJsZW5ndGgiLCJGbG9hdDMyQXJyYXkiLCJhdHRyaWJ1dGVMb3ciLCJqIiwiZm9yRWFjaFZlcnRleCIsIngiLCJ2ZXJ0ZXgiLCJ5IiwieiIsInBvc2l0aW9ucyIsInBvc2l0aW9uczY0eHlMb3ciLCJ0YXJnZXQiLCJzb3VyY2UiLCJzdGFydCIsIlVpbnQ4Q2xhbXBlZEFycmF5IiwidmVydGV4Q291bnQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLEtBQUtBLE9BQVosTUFBeUIsV0FBekI7QUFDQSxPQUFPQyxNQUFQLE1BQW1CLFFBQW5CO0FBQ0EsU0FBUUMsR0FBUixFQUFhQyxLQUFiLEVBQW9CQyxlQUFwQixFQUFxQ0MsU0FBckMsUUFBcUQsb0JBQXJEO0FBQ0EsU0FBUUMsT0FBUixRQUFzQix5QkFBdEI7O0FBRUE7QUFDQSxTQUFTQyxlQUFULENBQXlCQyxLQUF6QixFQUFnQztBQUM5QixTQUFPLENBQ0wsQ0FBQ0EsUUFBUSxDQUFULElBQWMsR0FEVCxFQUVMQyxLQUFLQyxLQUFMLENBQVcsQ0FBQ0YsUUFBUSxDQUFULElBQWMsR0FBekIsSUFBZ0MsR0FGM0IsRUFHTEMsS0FBS0MsS0FBTCxDQUFXLENBQUNGLFFBQVEsQ0FBVCxJQUFjLEdBQWQsR0FBb0IsR0FBL0IsSUFBc0MsR0FIakMsQ0FBUDtBQUtEOztBQUVELFNBQVNHLFVBQVQsQ0FBb0JDLEtBQXBCLEVBQTJCO0FBQ3pCLE1BQUksQ0FBQ0MsTUFBTUMsT0FBTixDQUFjRixLQUFkLENBQUwsRUFBMkI7QUFDekJBLFlBQVEsQ0FBQ1YsSUFBSVUsS0FBSixFQUFXLENBQVgsQ0FBRCxFQUFnQlYsSUFBSVUsS0FBSixFQUFXLENBQVgsQ0FBaEIsRUFB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QyxjQUFVLEVBQUN3RSxRQUFReEIsU0FBVCxFQUFvQnlCLFFBQVFsRSxLQUE1QixFQUFtQ21FLE9BQU9yQyxDQUExQyxFQUE2Q3ZDLE9BQU84RSxXQUFwRCxFQUFWO0FBQ0F2QyxTQUFLOUIsTUFBTXNELE1BQU4sR0FBZWUsV0FBcEI7QUFDRCxHQUxEO0FBTUEsU0FBTzVCLFNBQVA7QUFDRCIsImZpbGUiOiJwb2x5Z29uLXRlc3NlbGF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLy8gSGFuZGxlcyB0ZXNzZWxhdGlvbiBvZiBwb2x5Z29ucyB3aXRoIGhvbGVzXG4vLyAtIDJEIHN1cmZhY2VzXG4vLyAtIDJEIG91dGxpbmVzXG4vLyAtIDNEIHN1cmZhY2VzICh0b3AgYW5kIHNpZGVzIG9ubHkpXG4vLyAtIDNEIHdpcmVmcmFtZXMgKG5vdCB5ZXQpXG5pbXBvcnQgKiBhcyBQb2x5Z29uIGZyb20gJy4vcG9seWdvbic7XG5pbXBvcnQgZWFyY3V0IGZyb20gJ2VhcmN1dCc7XG5pbXBvcnQge2dldCwgY291bnQsIGZsYXR0ZW5WZXJ0aWNlcywgZmlsbEFycmF5fSBmcm9tICcuLi8uLi8uLi9saWIvdXRpbHMnO1xuaW1wb3J0IHtmcDY0aWZ5fSBmcm9tICcuLi8uLi8uLi9saWIvdXRpbHMvZnA2NCc7XG5cbi8vIE1heWJlIGRlY2suZ2wgb3IgbHVtYS5nbCBuZWVkcyB0byBleHBvcnQgdGhpc1xuZnVuY3Rpb24gZ2V0UGlja2luZ0NvbG9yKGluZGV4KSB7XG4gIHJldHVybiBbXG4gICAgKGluZGV4ICsgMSkgJSAyNTYsXG4gICAgTWF0aC5mbG9vcigoaW5kZXggKyAxKSAvIDI1NikgJSAyNTYsXG4gICAgTWF0aC5mbG9vcigoaW5kZXggKyAxKSAvIDI1NiAvIDI1NikgJSAyNTZcbiAgXTtcbn1cblxuZnVuY3Rpb24gcGFyc2VDb2xvcihjb2xvcikge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoY29sb3IpKSB7XG4gICAgY29sb3IgPSBbZ2V0KGNvbG9yLCAwKSwgZ2V0KGNvbG9yLCAxKSwgZ2V0KGNvbG9yLCAyKSwgZ2V0KGNvbG9yLCAzKV07XG4gIH1cbiAgY29sb3JbM10gPSBOdW1iZXIuaXNGaW5pdGUoY29sb3JbM10pID8gY29sb3JbM10gOiAyNTU7XG4gIHJldHVybiBjb2xvcjtcbn1cblxuY29uc3QgREVGQVVMVF9DT0xPUiA9IFswLCAwLCAwLCAyNTVdOyAvLyBCbGFja1xuXG4vLyBUaGlzIGNsYXNzIGlzIHNldCB1cCB0byBhbGxvdyBxdWVyeWluZyBvbmUgYXR0cmlidXRlIGF0IGEgdGltZVxuLy8gdGhlIHdheSB0aGUgQXR0cmlidXRlTWFuYWdlciBleHBlY3RzIGl0XG5leHBvcnQgY2xhc3MgUG9seWdvblRlc3NlbGF0b3Ige1xuICBjb25zdHJ1Y3Rvcih7cG9seWdvbnMsIGZwNjQgPSBmYWxzZX0pIHtcbiAgICAvLyBOb3JtYWxpemUgYWxsIHBvbHlnb25zXG4gICAgdGhpcy5wb2x5Z29ucyA9IHBvbHlnb25zLm1hcChwb2x5Z29uID0+IFBvbHlnb24ubm9ybWFsaXplKHBvbHlnb24pKTtcbiAgICAvLyBDb3VudCBhbGwgcG9seWdvbiB2ZXJ0aWNlc1xuICAgIHRoaXMucG9pbnRDb3VudCA9IGdldFBvaW50Q291bnQodGhpcy5wb2x5Z29ucyk7XG4gICAgdGhpcy5mcDY0ID0gZnA2NDtcbiAgfVxuXG4gIGluZGljZXMoKSB7XG4gICAgY29uc3Qge3BvbHlnb25zLCBpbmRleENvdW50fSA9IHRoaXM7XG4gICAgcmV0dXJuIGNhbGN1bGF0ZUluZGljZXMoe3BvbHlnb25zLCBpbmRleENvdW50fSk7XG4gIH1cblxuICBwb3NpdGlvbnMoKSB7XG4gICAgY29uc3Qge3BvbHlnb25zLCBwb2ludENvdW50fSA9IHRoaXM7XG4gICAgcmV0dXJuIGNhbGN1bGF0ZVBvc2l0aW9ucyh7cG9seWdvbnMsIHBvaW50Q291bnQsIGZwNjQ6IHRoaXMuZnA2NH0pO1xuICB9XG5cbiAgbm9ybWFscygpIHtcbiAgICBjb25zdCB7cG9seWdvbnMsIHBvaW50Q291bnR9ID0gdGhpcztcbiAgICByZXR1cm4gY2FsY3VsYXRlTm9ybWFscyh7cG9seWdvbnMsIHBvaW50Q291bnR9KTtcbiAgfVxuXG4gIGNvbG9ycyh7Z2V0Q29sb3IgPSB4ID0+IERFRkFVTFRfQ09MT1J9ID0ge30pIHtcbiAgICBjb25zdCB7cG9seWdvbnMsIHBvaW50Q291bnR9ID0gdGhpcztcbiAgICByZXR1cm4gY2FsY3VsYXRlQ29sb3JzKHtwb2x5Z29ucywgcG9pbnRDb3VudCwgZ2V0Q29sb3J9KTtcbiAgfVxuXG4gIHBpY2tpbmdDb2xvcnMoKSB7XG4gICAgY29uc3Qge3BvbHlnb25zLCBwb2ludENvdW50fSA9IHRoaXM7XG4gICAgcmV0dXJuIGNhbGN1bGF0ZVBpY2tpbmdDb2xvcnMoe3BvbHlnb25zLCBwb2ludENvdW50fSk7XG4gIH1cblxuICAvLyBnZXRBdHRyaWJ1dGUoe3NpemUsIGFjY2Vzc29yfSkge1xuICAvLyAgIGNvbnN0IHtwb2x5Z29ucywgcG9pbnRDb3VudH0gPSB0aGlzO1xuICAvLyAgIHJldHVybiBjYWxjdWxhdGVBdHRyaWJ1dGUoe3BvbHlnb25zLCBwb2ludENvdW50LCBzaXplLCBhY2Nlc3Nvcn0pO1xuICAvLyB9XG59XG5cbi8vIENvdW50IG51bWJlciBvZiBwb2ludHMgaW4gYSBsaXN0IG9mIGNvbXBsZXggcG9seWdvbnNcbmZ1bmN0aW9uIGdldFBvaW50Q291bnQocG9seWdvbnMpIHtcbiAgcmV0dXJuIHBvbHlnb25zLnJlZHVjZSgocG9pbnRzLCBwb2x5Z29uKSA9PiBwb2ludHMgKyBQb2x5Z29uLmdldFZlcnRleENvdW50KHBvbHlnb24pLCAwKTtcbn1cblxuLy8gQ091bnQgbnVtYmVyIG9mIHRyaWFuZ2xlcyBpbiBhIGxpc3Qgb2YgY29tcGxleCBwb2x5Z29uc1xuZnVuY3Rpb24gZ2V0VHJpYW5nbGVDb3VudChwb2x5Z29ucykge1xuICByZXR1cm4gcG9seWdvbnMucmVkdWNlKCh0cmlhbmdsZXMsIHBvbHlnb24pID0+IHRyaWFuZ2xlcyArIFBvbHlnb24uZ2V0VHJpYW5nbGVDb3VudChwb2x5Z29uKSwgMCk7XG59XG5cbi8vIFJldHVybnMgdGhlIG9mZnNldHMgb2YgZWFjaCBjb21wbGV4IHBvbHlnb24gaW4gdGhlIGNvbWJpbmVkIGFycmF5IG9mIGFsbCBwb2x5Z29uc1xuZnVuY3Rpb24gZ2V0UG9seWdvbk9mZnNldHMocG9seWdvbnMpIHtcbiAgY29uc3Qgb2Zmc2V0cyA9IG5ldyBBcnJheShjb3VudChwb2x5Z29ucykgKyAxKTtcbiAgb2Zmc2V0c1swXSA9IDA7XG4gIGxldCBvZmZzZXQgPSAwO1xuICBwb2x5Z29ucy5mb3JFYWNoKChwb2x5Z29uLCBpKSA9PiB7XG4gICAgb2Zmc2V0ICs9IFBvbHlnb24uZ2V0VmVydGV4Q291bnQocG9seWdvbik7XG4gICAgb2Zmc2V0c1tpICsgMV0gPSBvZmZzZXQ7XG4gIH0pO1xuICByZXR1cm4gb2Zmc2V0cztcbn1cblxuLy8gUmV0dXJucyB0aGUgb2Zmc2V0IG9mIGVhY2ggaG9sZSBwb2x5Z29uIGluIHRoZSBmbGF0dGVuZWQgYXJyYXkgZm9yIHRoYXQgcG9seWdvblxuZnVuY3Rpb24gZ2V0SG9sZUluZGljZXMoY29tcGxleFBvbHlnb24pIHtcbiAgbGV0IGhvbGVJbmRpY2VzID0gbnVsbDtcbiAgaWYgKGNvdW50KGNvbXBsZXhQb2x5Z29uKSA+IDEpIHtcbiAgICBsZXQgcG9seWdvblN0YXJ0SW5kZXggPSAwO1xuICAgIGhvbGVJbmRpY2VzID0gW107XG4gICAgY29tcGxleFBvbHlnb24uZm9yRWFjaChwb2x5Z29uID0+IHtcbiAgICAgIHBvbHlnb25TdGFydEluZGV4ICs9IGNvdW50KHBvbHlnb24pO1xuICAgICAgaG9sZUluZGljZXMucHVzaChwb2x5Z29uU3RhcnRJbmRleCk7XG4gICAgfSk7XG4gICAgLy8gTGFzdCBlbGVtZW50IHBvaW50cyB0byBlbmQgb2YgdGhlIGZsYXQgYXJyYXksIHJlbW92ZSBpdFxuICAgIGhvbGVJbmRpY2VzLnBvcCgpO1xuICB9XG4gIHJldHVybiBob2xlSW5kaWNlcztcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlSW5kaWNlcyh7cG9seWdvbnMsIEluZGV4VHlwZSA9IFVpbnQzMkFycmF5fSkge1xuICAvLyBDYWxjdWxhdGUgbGVuZ3RoIG9mIGluZGV4IGFycmF5ICgzICogbnVtYmVyIG9mIHRyaWFuZ2xlcylcbiAgY29uc3QgaW5kZXhDb3VudCA9IDMgKiBnZXRUcmlhbmdsZUNvdW50KHBvbHlnb25zKTtcbiAgY29uc3Qgb2Zmc2V0cyA9IGdldFBvbHlnb25PZmZzZXRzKHBvbHlnb25zKTtcblxuICAvLyBBbGxvY2F0ZSB0aGUgYXR0cmlidXRlXG4gIC8vIFRPRE8gaXQncyBub3QgdGhlIGluZGV4IGNvdW50IGJ1dCB0aGUgdmVydGV4IGNvdW50IHRoYXQgbXVzdCBiZSBjaGVja2VkXG4gIGlmIChJbmRleFR5cGUgPT09IFVpbnQxNkFycmF5ICYmIGluZGV4Q291bnQgPiA2NTUzNSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVmVydGV4IGNvdW50IGV4Y2VlZHMgYnJvd3NlclxcJ3MgbGltaXQnKTtcbiAgfVxuICBjb25zdCBhdHRyaWJ1dGUgPSBuZXcgSW5kZXhUeXBlKGluZGV4Q291bnQpO1xuXG4gIC8vIDEuIGdldCB0cmlhbmd1bGF0ZWQgaW5kaWNlcyBmb3IgdGhlIGludGVybmFsIGFyZWFzXG4gIC8vIDIuIG9mZnNldCB0aGVtIGJ5IHRoZSBudW1iZXIgb2YgaW5kaWNlcyBpbiBwcmV2aW91cyBwb2x5Z29uc1xuICBsZXQgaSA9IDA7XG4gIHBvbHlnb25zLmZvckVhY2goKHBvbHlnb24sIHBvbHlnb25JbmRleCkgPT4ge1xuICAgIGZvciAoY29uc3QgaW5kZXggb2YgY2FsY3VsYXRlU3VyZmFjZUluZGljZXMocG9seWdvbikpIHtcbiAgICAgIGF0dHJpYnV0ZVtpKytdID0gaW5kZXggKyBvZmZzZXRzW3BvbHlnb25JbmRleF07XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gYXR0cmlidXRlO1xufVxuXG4vKlxuICogR2V0IHZlcnRleCBpbmRpY2VzIGZvciBkcmF3aW5nIGNvbXBsZXhQb2x5Z29uIG1lc2hcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge1tOdW1iZXIsTnVtYmVyLE51bWJlcl1bXVtdfSBjb21wbGV4UG9seWdvblxuICogQHJldHVybnMge1tOdW1iZXJdfSBpbmRpY2VzXG4gKi9cbmZ1bmN0aW9uIGNhbGN1bGF0ZVN1cmZhY2VJbmRpY2VzKGNvbXBsZXhQb2x5Z29uKSB7XG4gIC8vIFByZXBhcmUgYW4gYXJyYXkgb2YgaG9sZSBpbmRpY2VzIGFzIGV4cGVjdGVkIGJ5IGVhcmN1dFxuICBjb25zdCBob2xlSW5kaWNlcyA9IGdldEhvbGVJbmRpY2VzKGNvbXBsZXhQb2x5Z29uKTtcbiAgLy8gRmxhdHRlbiB0aGUgcG9seWdvbiBhcyBleHBlY3RlZCBieSBlYXJjdXRcbiAgY29uc3QgdmVydHMgPSBmbGF0dGVuVmVydGljZXMyKGNvbXBsZXhQb2x5Z29uKTtcbiAgLy8gTGV0IGVhcmN1dCB0cmlhbmd1bGF0ZSB0aGUgcG9seWdvblxuICByZXR1cm4gZWFyY3V0KHZlcnRzLCBob2xlSW5kaWNlcywgMyk7XG59XG5cbi8vIFRPRE8gLSByZWZhY3RvclxuZnVuY3Rpb24gaXNDb250YWluZXIodmFsdWUpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpIHx8IEFycmF5QnVmZmVyLmlzVmlldyh2YWx1ZSkgfHxcbiAgICB2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnO1xufVxuXG4vLyBUT0RPIC0gcmVmYWN0b3IsIHRoaXMgZmlsZSBzaG91bGQgbm90IG5lZWQgYSBzZXBhcmF0ZSBmbGF0dGVuIGZ1bmNcbi8vIEZsYXR0ZW5zIG5lc3RlZCBhcnJheSBvZiB2ZXJ0aWNlcywgcGFkZGluZyB0aGlyZCBjb29yZGluYXRlIGFzIG5lZWRlZFxuZXhwb3J0IGZ1bmN0aW9uIGZsYXR0ZW5WZXJ0aWNlczIobmVzdGVkQXJyYXksIHtyZXN1bHQgPSBbXSwgZGltZW5zaW9ucyA9IDN9ID0ge30pIHtcbiAgbGV0IGluZGV4ID0gLTE7XG4gIGxldCB2ZXJ0ZXhMZW5ndGggPSAwO1xuICBjb25zdCBsZW5ndGggPSBjb3VudChuZXN0ZWRBcnJheSk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgY29uc3QgdmFsdWUgPSBnZXQobmVzdGVkQXJyYXksIGluZGV4KTtcbiAgICBpZiAoaXNDb250YWluZXIodmFsdWUpKSB7XG4gICAgICBmbGF0dGVuVmVydGljZXModmFsdWUsIHtyZXN1bHQsIGRpbWVuc2lvbnN9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHZlcnRleExlbmd0aCA8IGRpbWVuc2lvbnMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIHZlcnRleExlbmd0aCsrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBBZGQgYSB0aGlyZCBjb29yZGluYXRlIGlmIG5lZWRlZFxuICBpZiAodmVydGV4TGVuZ3RoID4gMCAmJiB2ZXJ0ZXhMZW5ndGggPCBkaW1lbnNpb25zKSB7XG4gICAgcmVzdWx0LnB1c2goMCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlUG9zaXRpb25zKHtwb2x5Z29ucywgcG9pbnRDb3VudCwgZnA2NH0pIHtcbiAgLy8gRmxhdHRlbiBvdXQgYWxsIHRoZSB2ZXJ0aWNlcyBvZiBhbGwgdGhlIHN1YiBzdWJQb2x5Z29uc1xuICBjb25zdCBhdHRyaWJ1dGUgPSBuZXcgRmxvYXQzMkFycmF5KHBvaW50Q291bnQgKiAzKTtcbiAgbGV0IGF0dHJpYnV0ZUxvdztcbiAgaWYgKGZwNjQpIHtcbiAgICAvLyBXZSBvbmx5IG5lZWQgeCwgeSBjb21wb25lbnRcbiAgICBhdHRyaWJ1dGVMb3cgPSBuZXcgRmxvYXQzMkFycmF5KHBvaW50Q291bnQgKiAyKTtcbiAgfVxuICBsZXQgaSA9IDA7XG4gIGxldCBqID0gMDtcbiAgZm9yIChjb25zdCBwb2x5Z29uIG9mIHBvbHlnb25zKSB7XG4gICAgUG9seWdvbi5mb3JFYWNoVmVydGV4KHBvbHlnb24sIHZlcnRleCA9PiB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgIGNvbnN0IHggPSBnZXQodmVydGV4LCAwKTtcbiAgICAgIGNvbnN0IHkgPSBnZXQodmVydGV4LCAxKTtcbiAgICAgIGNvbnN0IHogPSBnZXQodmVydGV4LCAyKSB8fCAwO1xuICAgICAgYXR0cmlidXRlW2krK10gPSB4O1xuICAgICAgYXR0cmlidXRlW2krK10gPSB5O1xuICAgICAgYXR0cmlidXRlW2krK10gPSB6O1xuICAgICAgaWYgKGZwNjQpIHtcbiAgICAgICAgYXR0cmlidXRlTG93W2orK10gPSBmcDY0aWZ5KHgpWzFdO1xuICAgICAgICBhdHRyaWJ1dGVMb3dbaisrXSA9IGZwNjRpZnkoeSlbMV07XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHtwb3NpdGlvbnM6IGF0dHJpYnV0ZSwgcG9zaXRpb25zNjR4eUxvdzogYXR0cmlidXRlTG93fTtcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlTm9ybWFscyh7cG9seWdvbnMsIHBvaW50Q291bnR9KSB7XG4gIC8vIFRPRE8gLSB1c2UgZ2VuZXJpYyB2ZXJ0ZXggYXR0cmlidXRlP1xuICBjb25zdCBhdHRyaWJ1dGUgPSBuZXcgRmxvYXQzMkFycmF5KHBvaW50Q291bnQgKiAzKTtcbiAgZmlsbEFycmF5KHt0YXJnZXQ6IGF0dHJpYnV0ZSwgc291cmNlOiBbMCwgMSwgMF0sIHN0YXJ0OiAwLCBwb2ludENvdW50fSk7XG4gIHJldHVybiBhdHRyaWJ1dGU7XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUNvbG9ycyh7cG9seWdvbnMsIHBvaW50Q291bnQsIGdldENvbG9yfSkge1xuICBjb25zdCBhdHRyaWJ1dGUgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkocG9pbnRDb3VudCAqIDQpO1xuICBsZXQgaSA9IDA7XG4gIHBvbHlnb25zLmZvckVhY2goKGNvbXBsZXhQb2x5Z29uLCBwb2x5Z29uSW5kZXgpID0+IHtcbiAgICAvLyBDYWxjdWxhdGUgcG9seWdvbiBjb2xvclxuICAgIGxldCBjb2xvciA9IGdldENvbG9yKHBvbHlnb25JbmRleCk7XG4gICAgY29sb3IgPSBwYXJzZUNvbG9yKGNvbG9yKTtcblxuICAgIGNvbnN0IHZlcnRleENvdW50ID0gUG9seWdvbi5nZXRWZXJ0ZXhDb3VudChjb21wbGV4UG9seWdvbik7XG4gICAgZmlsbEFycmF5KHt0YXJnZXQ6IGF0dHJpYnV0ZSwgc291cmNlOiBjb2xvciwgc3RhcnQ6IGksIGNvdW50OiB2ZXJ0ZXhDb3VudH0pO1xuICAgIGkgKz0gY29sb3IubGVuZ3RoICogdmVydGV4Q291bnQ7XG4gIH0pO1xuICByZXR1cm4gYXR0cmlidXRlO1xufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVQaWNraW5nQ29sb3JzKHtwb2x5Z29ucywgcG9pbnRDb3VudH0pIHtcbiAgY29uc3QgYXR0cmlidXRlID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KHBvaW50Q291bnQgKiAzKTtcbiAgbGV0IGkgPSAwO1xuICBwb2x5Z29ucy5mb3JFYWNoKChjb21wbGV4UG9seWdvbiwgcG9seWdvbkluZGV4KSA9PiB7XG4gICAgY29uc3QgY29sb3IgPSBnZXRQaWNraW5nQ29sb3IocG9seWdvbkluZGV4KTtcbiAgICBjb25zdCB2ZXJ0ZXhDb3VudCA9IFBvbHlnb24uZ2V0VmVydGV4Q291bnQoY29tcGxleFBvbHlnb24pO1xuICAgIGZpbGxBcnJheSh7dGFyZ2V0OiBhdHRyaWJ1dGUsIHNvdXJjZTogY29sb3IsIHN0YXJ0OiBpLCBjb3VudDogdmVydGV4Q291bnR9KTtcbiAgICBpICs9IGNvbG9yLmxlbmd0aCAqIHZlcnRleENvdW50O1xuICB9KTtcbiAgcmV0dXJuIGF0dHJpYnV0ZTtcbn1cbiJdfQ==