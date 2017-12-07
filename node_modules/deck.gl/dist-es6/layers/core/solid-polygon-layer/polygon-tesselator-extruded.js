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

import * as Polygon from './polygon';
import vec3_normalize from 'gl-vec3/normalize';
import { fp64ify } from '../../../lib/utils/fp64';
import { get, count } from '../../../lib/utils';
import earcut from 'earcut';
import flattenDeep from 'lodash.flattendeep';

function getPickingColor(index) {
  return [index + 1 & 255, index + 1 >> 8 & 255, index + 1 >> 8 >> 8 & 255];
}

function parseColor(color) {
  if (!Array.isArray(color)) {
    color = [get(color, 0), get(color, 1), get(color, 2), get(color, 3)];
  }
  color[3] = Number.isFinite(color[3]) ? color[3] : 255;
  return color;
}

var DEFAULT_COLOR = [0, 0, 0, 255]; // Black

export var PolygonTesselatorExtruded = function () {
  function PolygonTesselatorExtruded(_ref) {
    var polygons = _ref.polygons,
        _ref$getHeight = _ref.getHeight,
        getHeight = _ref$getHeight === undefined ? function (x) {
      return 1000;
    } : _ref$getHeight,
        _ref$getColor = _ref.getColor,
        getColor = _ref$getColor === undefined ? function (x) {
      return [0, 0, 0, 255];
    } : _ref$getColor,
        _ref$wireframe = _ref.wireframe,
        wireframe = _ref$wireframe === undefined ? false : _ref$wireframe,
        _ref$fp = _ref.fp64,
        fp64 = _ref$fp === undefined ? false : _ref$fp;

    _classCallCheck(this, PolygonTesselatorExtruded);

    this.fp64 = fp64;

    // Expensive operation, convert all polygons to arrays
    polygons = polygons.map(function (complexPolygon, polygonIndex) {
      var height = getHeight(polygonIndex) || 0;
      return Polygon.normalize(complexPolygon).map(function (polygon) {
        return polygon.map(function (coord) {
          return [get(coord, 0), get(coord, 1), height];
        });
      });
    });

    var groupedVertices = polygons;
    this.groupedVertices = polygons;
    this.wireframe = wireframe;

    this.attributes = {};

    var positionsJS = calculatePositionsJS({ groupedVertices: groupedVertices, wireframe: wireframe });
    Object.assign(this.attributes, {
      positions: calculatePositions(positionsJS, this.fp64),
      indices: calculateIndices({ groupedVertices: groupedVertices, wireframe: wireframe }),
      normals: calculateNormals({ groupedVertices: groupedVertices, wireframe: wireframe }),
      // colors: calculateColors({groupedVertices, wireframe, getColor}),
      pickingColors: calculatePickingColors({ groupedVertices: groupedVertices, wireframe: wireframe })
    });
  }

  _createClass(PolygonTesselatorExtruded, [{
    key: 'indices',
    value: function indices() {
      return this.attributes.indices;
    }
  }, {
    key: 'positions',
    value: function positions() {
      return this.attributes.positions;
    }
  }, {
    key: 'normals',
    value: function normals() {
      return this.attributes.normals;
    }
  }, {
    key: 'colors',
    value: function colors() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$getColor = _ref2.getColor,
          getColor = _ref2$getColor === undefined ? function (x) {
        return DEFAULT_COLOR;
      } : _ref2$getColor;

      var groupedVertices = this.groupedVertices,
          wireframe = this.wireframe;

      return calculateColors({ groupedVertices: groupedVertices, wireframe: wireframe, getColor: getColor });
    }
  }, {
    key: 'pickingColors',
    value: function pickingColors() {
      return this.attributes.pickingColors;
    }

    // updateTriggers: {
    //   positions: ['getHeight'],
    //   colors: ['getColors']
    //   pickingColors: 'none'
    // }

  }]);

  return PolygonTesselatorExtruded;
}();

function countVertices(vertices) {
  return vertices.reduce(function (vertexCount, polygon) {
    return vertexCount + count(polygon);
  }, 0);
}

function calculateIndices(_ref3) {
  var groupedVertices = _ref3.groupedVertices,
      _ref3$wireframe = _ref3.wireframe,
      wireframe = _ref3$wireframe === undefined ? false : _ref3$wireframe;

  // adjust index offset for multiple polygons
  var multiplier = wireframe ? 2 : 5;
  var offsets = groupedVertices.reduce(function (acc, vertices) {
    return acc.concat(acc[acc.length - 1] + countVertices(vertices) * multiplier);
  }, [0]);

  var indices = groupedVertices.map(function (vertices, polygonIndex) {
    return wireframe ?
    // 1. get sequentially ordered indices of each polygons wireframe
    // 2. offset them by the number of indices in previous polygons
    calculateContourIndices(vertices, offsets[polygonIndex]) :
    // 1. get triangulated indices for the internal areas
    // 2. offset them by the number of indices in previous polygons
    calculateSurfaceIndices(vertices, offsets[polygonIndex]);
  });

  return new Uint32Array(flattenDeep(indices));
}

// Calculate a flat position array in JS - can be mapped to 32 or 64 bit typed arrays
// Remarks:
// * each top vertex is on 3 surfaces
// * each bottom vertex is on 2 surfaces
function calculatePositionsJS(_ref4) {
  var groupedVertices = _ref4.groupedVertices,
      _ref4$wireframe = _ref4.wireframe,
      wireframe = _ref4$wireframe === undefined ? false : _ref4$wireframe;

  var positions = groupedVertices.map(function (vertices) {
    var topVertices = Array.prototype.concat.apply([], vertices);
    var baseVertices = topVertices.map(function (v) {
      return [get(v, 0), get(v, 1), 0];
    });
    return wireframe ? [topVertices, baseVertices] : [topVertices, topVertices, topVertices, baseVertices, baseVertices];
  });

  return flattenDeep(positions);
}

function calculatePositions(positionsJS, fp64) {
  var positionLow = void 0;
  if (fp64) {
    // We only need x, y component
    positionLow = new Float32Array(positionsJS.length / 3 * 2);
    for (var i = 0; i < positionsJS.length / 3; i++) {
      positionLow[i * 2 + 0] = fp64ify(positionsJS[i * 3 + 0])[1];
      positionLow[i * 2 + 1] = fp64ify(positionsJS[i * 3 + 1])[1];
    }
  }
  return { positions: new Float32Array(positionsJS), positions64xyLow: positionLow };
}

function calculateNormals(_ref5) {
  var groupedVertices = _ref5.groupedVertices,
      wireframe = _ref5.wireframe;

  var up = [0, 1, 0];

  var normals = groupedVertices.map(function (vertices, polygonIndex) {
    var topNormals = new Array(countVertices(vertices)).fill(up);
    var sideNormals = vertices.map(function (polygon) {
      return calculateSideNormals(polygon);
    });
    var sideNormalsForward = sideNormals.map(function (n) {
      return n[0];
    });
    var sideNormalsBackward = sideNormals.map(function (n) {
      return n[1];
    });

    return wireframe ? [topNormals, topNormals] : [topNormals, sideNormalsForward, sideNormalsBackward, sideNormalsForward, sideNormalsBackward];
  });

  return new Float32Array(flattenDeep(normals));
}

function calculateSideNormals(vertices) {
  var normals = [];

  var lastVertice = null;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = vertices[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var vertice = _step.value;

      if (lastVertice) {
        // vertex[i-1], vertex[i]
        var n = getNormal(lastVertice, vertice);
        normals.push(n);
      }
      lastVertice = vertice;
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

  return [[normals.concat(normals[0])], [[normals[0]].concat(normals)]];
}

function calculateColors(_ref6) {
  var groupedVertices = _ref6.groupedVertices,
      getColor = _ref6.getColor,
      _ref6$wireframe = _ref6.wireframe,
      wireframe = _ref6$wireframe === undefined ? false : _ref6$wireframe;

  var colors = groupedVertices.map(function (complexPolygon, polygonIndex) {
    var color = getColor(polygonIndex);
    color = parseColor(color);

    var numVertices = countVertices(complexPolygon);
    var topColors = new Array(numVertices).fill(color);
    var baseColors = new Array(numVertices).fill(color);
    return wireframe ? [topColors, baseColors] : [topColors, topColors, topColors, baseColors, baseColors];
  });
  return new Uint8ClampedArray(flattenDeep(colors));
}

function calculatePickingColors(_ref7) {
  var groupedVertices = _ref7.groupedVertices,
      _ref7$wireframe = _ref7.wireframe,
      wireframe = _ref7$wireframe === undefined ? false : _ref7$wireframe;

  var colors = groupedVertices.map(function (vertices, polygonIndex) {
    var numVertices = countVertices(vertices);
    var color = getPickingColor(polygonIndex);
    var topColors = new Array(numVertices).fill(color);
    var baseColors = new Array(numVertices).fill(color);
    return wireframe ? [topColors, baseColors] : [topColors, topColors, topColors, baseColors, baseColors];
  });
  return new Uint8ClampedArray(flattenDeep(colors));
}

function calculateContourIndices(vertices, offset) {
  var stride = countVertices(vertices);

  return vertices.map(function (polygon) {
    var indices = [offset];
    var numVertices = polygon.length;

    // polygon top
    // use vertex pairs for GL.LINES => [0, 1, 1, 2, 2, ..., n-1, n-1, 0]
    for (var i = 1; i < numVertices - 1; i++) {
      indices.push(i + offset, i + offset);
    }
    indices.push(offset);

    // polygon sides
    for (var _i = 0; _i < numVertices - 1; _i++) {
      indices.push(_i + offset, _i + stride + offset);
    }

    offset += numVertices;
    return indices;
  });
}

function calculateSurfaceIndices(vertices, offset) {
  var stride = countVertices(vertices);
  var quad = [[0, 1], [0, 3], [1, 2], [1, 2], [0, 3], [1, 4]];

  function drawRectangle(i) {
    return quad.map(function (v) {
      return i + v[0] + stride * v[1] + offset;
    });
  }

  var holes = null;

  if (vertices.length > 1) {
    holes = vertices.reduce(function (acc, polygon) {
      return acc.concat(acc[acc.length - 1] + polygon.length);
    }, [0]).slice(1, vertices.length);
  }

  var topIndices = earcut(flattenDeep(vertices), holes, 3).map(function (index) {
    return index + offset;
  });

  var sideIndices = vertices.map(function (polygon) {
    var numVertices = polygon.length;
    // polygon top
    var indices = [];

    // polygon sides
    for (var i = 0; i < numVertices - 1; i++) {
      indices = indices.concat(drawRectangle(i));
    }

    offset += numVertices;
    return indices;
  });

  return [topIndices, sideIndices];
}

// helpers

// get normal vector of line segment
function getNormal(p1, p2) {
  var p1x = get(p1, 0);
  var p1y = get(p1, 1);
  var p2x = get(p2, 0);
  var p2y = get(p2, 1);

  if (p1x === p2x && p1y === p2y) {
    return [1, 0, 0];
  }

  var degrees2radians = Math.PI / 180;
  var lon1 = degrees2radians * p1x;
  var lon2 = degrees2radians * p2x;
  var lat1 = degrees2radians * p1y;
  var lat2 = degrees2radians * p2y;
  var a = Math.sin(lon2 - lon1) * Math.cos(lat2);
  var b = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  return vec3_normalize([], [b, 0, -a]);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYXllcnMvY29yZS9zb2xpZC1wb2x5Z29uLWxheWVyL3BvbHlnb24tdGVzc2VsYXRvci1leHRydWRlZC5qcyJdLCJuYW1lcyI6WyJQb2x5Z29uIiwidmVjM19ub3JtYWxpemUiLCJmcDY0aWZ5IiwiZ2V0IiwiY291bnQiLCJlYXJjdXQiLCJmbGF0dGVuRGVlcCIsImdldFBpY2tpbmdDb2xvciIsImluZGV4IiwicGFyc2VDb2xvciIsImNvbG9yIiwiQXJyYXkiLCJpc0FycmF5IiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJERUZBVUxUX0NPTE9SIiwiUG9seWdvblRlc3NlbGF0b3JFeHRydWRlZCIsInBvbHlnb25zIiwiZ2V0SGVpZ2h0IiwiZ2V0Q29sb3IiLCJ3aXJlZnJhbWUiLCJmcDY0IiwibWFwIiwiY29tcGxleFBvbHlnb24iLCJwb2x5Z29uSW5kZXgiLCJoZWlnaHQiLCJub3JtYWxpemUiLCJwb2x5Z29uIiwiY29vcmQiLCJncm91cGVkVmVydGljZXMiLCJhdHRyaWJ1dGVzIiwicG9zaXRpb25zSlMiLCJjYWxjdWxhdGVQb3NpdGlvbnNKUyIsIk9iamVjdCIsImFzc2lnbiIsInBvc2l0aW9ucyIsImNhbGN1bGF0ZVBvc2l0aW9ucyIsImluZGljZXMiLCJjYWxjdWxhdGVJbmRpY2VzIiwibm9ybWFscyIsImNhbGN1bGF0ZU5vcm1hbHMiLCJwaWNraW5nQ29sb3JzIiwiY2FsY3VsYXRlUGlja2luZ0NvbG9ycyIsImNhbGN1bGF0ZUNvbG9ycyIsImNvdW50VmVydGljZXMiLCJ2ZXJ0aWNlcyIsInJlZHVjZSIsInZlcnRleENvdW50IiwibXVsdGlwbGllciIsIm9mZnNldHMiLCJhY2MiLCJjb25jYXQiLCJsZW5ndGgiLCJjYWxjdWxhdGVDb250b3VySW5kaWNlcyIsImNhbGN1bGF0ZVN1cmZhY2VJbmRpY2VzIiwiVWludDMyQXJyYXkiLCJ0b3BWZXJ0aWNlcyIsInByb3RvdHlwZSIsImFwcGx5IiwiYmFzZVZlcnRpY2VzIiwidiIsInBvc2l0aW9uTG93IiwiRmxvYXQzMkFycmF5IiwiaSIsInBvc2l0aW9uczY0eHlMb3ciLCJ1cCIsInRvcE5vcm1hbHMiLCJmaWxsIiwic2lkZU5vcm1hbHMiLCJjYWxjdWxhdGVTaWRlTm9ybWFscyIsInNpZGVOb3JtYWxzRm9yd2FyZCIsIm4iLCJzaWRlTm9ybWFsc0JhY2t3YXJkIiwibGFzdFZlcnRpY2UiLCJ2ZXJ0aWNlIiwiZ2V0Tm9ybWFsIiwicHVzaCIsImNvbG9ycyIsIm51bVZlcnRpY2VzIiwidG9wQ29sb3JzIiwiYmFzZUNvbG9ycyIsIlVpbnQ4Q2xhbXBlZEFycmF5Iiwib2Zmc2V0Iiwic3RyaWRlIiwicXVhZCIsImRyYXdSZWN0YW5nbGUiLCJob2xlcyIsInNsaWNlIiwidG9wSW5kaWNlcyIsInNpZGVJbmRpY2VzIiwicDEiLCJwMiIsInAxeCIsInAxeSIsInAyeCIsInAyeSIsImRlZ3JlZXMycmFkaWFucyIsIk1hdGgiLCJQSSIsImxvbjEiLCJsb24yIiwibGF0MSIsImxhdDIiLCJhIiwic2luIiwiY29zIiwiYiJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU8sS0FBS0EsT0FBWixNQUF5QixXQUF6QjtBQUNBLE9BQU9DLGNBQVAsTUFBMkIsbUJBQTNCO0FBQ0EsU0FBUUMsT0FBUixRQUFzQix5QkFBdEI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLEtBQWIsUUFBeUIsb0JBQXpCO0FBQ0EsT0FBT0MsTUFBUCxNQUFtQixRQUFuQjtBQUNBLE9BQU9DLFdBQVAsTUFBd0Isb0JBQXhCOztBQUVBLFNBQVNDLGVBQVQsQ0FBeUJDLEtBQXpCLEVBQWdDO0FBQzlCLFNBQU8sQ0FDSkEsUUFBUSxDQUFULEdBQWMsR0FEVCxFQUVIQSxRQUFRLENBQVQsSUFBZSxDQUFoQixHQUFxQixHQUZoQixFQUdGQSxRQUFRLENBQVQsSUFB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R0FBTCxDQUFTSCxJQUFULENBQWpCLEdBQWtDTCxLQUFLUSxHQUFMLENBQVNMLE9BQU9ELElBQWhCLENBRHBDO0FBRUEsU0FBT2xHLGVBQWUsRUFBZixFQUFtQixDQUFDeUcsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFDSCxDQUFSLENBQW5CLENBQVA7QUFDRCIsImZpbGUiOiJwb2x5Z29uLXRlc3NlbGF0b3ItZXh0cnVkZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0ICogYXMgUG9seWdvbiBmcm9tICcuL3BvbHlnb24nO1xuaW1wb3J0IHZlYzNfbm9ybWFsaXplIGZyb20gJ2dsLXZlYzMvbm9ybWFsaXplJztcbmltcG9ydCB7ZnA2NGlmeX0gZnJvbSAnLi4vLi4vLi4vbGliL3V0aWxzL2ZwNjQnO1xuaW1wb3J0IHtnZXQsIGNvdW50fSBmcm9tICcuLi8uLi8uLi9saWIvdXRpbHMnO1xuaW1wb3J0IGVhcmN1dCBmcm9tICdlYXJjdXQnO1xuaW1wb3J0IGZsYXR0ZW5EZWVwIGZyb20gJ2xvZGFzaC5mbGF0dGVuZGVlcCc7XG5cbmZ1bmN0aW9uIGdldFBpY2tpbmdDb2xvcihpbmRleCkge1xuICByZXR1cm4gW1xuICAgIChpbmRleCArIDEpICYgMjU1LFxuICAgICgoaW5kZXggKyAxKSA+PiA4KSAmIDI1NSxcbiAgICAoKChpbmRleCArIDEpID4+IDgpID4+IDgpICYgMjU1XG4gIF07XG59XG5cbmZ1bmN0aW9uIHBhcnNlQ29sb3IoY29sb3IpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KGNvbG9yKSkge1xuICAgIGNvbG9yID0gW2dldChjb2xvciwgMCksIGdldChjb2xvciwgMSksIGdldChjb2xvciwgMiksIGdldChjb2xvciwgMyldO1xuICB9XG4gIGNvbG9yWzNdID0gTnVtYmVyLmlzRmluaXRlKGNvbG9yWzNdKSA/IGNvbG9yWzNdIDogMjU1O1xuICByZXR1cm4gY29sb3I7XG59XG5cbmNvbnN0IERFRkFVTFRfQ09MT1IgPSBbMCwgMCwgMCwgMjU1XTsgLy8gQmxhY2tcblxuZXhwb3J0IGNsYXNzIFBvbHlnb25UZXNzZWxhdG9yRXh0cnVkZWQge1xuXG4gIGNvbnN0cnVjdG9yKHtcbiAgICBwb2x5Z29ucyxcbiAgICBnZXRIZWlnaHQgPSB4ID0+IDEwMDAsXG4gICAgZ2V0Q29sb3IgPSB4ID0+IFswLCAwLCAwLCAyNTVdLFxuICAgIHdpcmVmcmFtZSA9IGZhbHNlLFxuICAgIGZwNjQgPSBmYWxzZVxuICB9KSB7XG4gICAgdGhpcy5mcDY0ID0gZnA2NDtcblxuICAgIC8vIEV4cGVuc2l2ZSBvcGVyYXRpb24sIGNvbnZlcnQgYWxsIHBvbHlnb25zIHRvIGFycmF5c1xuICAgIHBvbHlnb25zID0gcG9seWdvbnMubWFwKChjb21wbGV4UG9seWdvbiwgcG9seWdvbkluZGV4KSA9PiB7XG4gICAgICBjb25zdCBoZWlnaHQgPSBnZXRIZWlnaHQocG9seWdvbkluZGV4KSB8fCAwO1xuICAgICAgcmV0dXJuIFBvbHlnb24ubm9ybWFsaXplKGNvbXBsZXhQb2x5Z29uKS5tYXAoXG4gICAgICAgIHBvbHlnb24gPT4gcG9seWdvbi5tYXAoY29vcmQgPT4gW2dldChjb29yZCwgMCksIGdldChjb29yZCwgMSksIGhlaWdodF0pXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZ3JvdXBlZFZlcnRpY2VzID0gcG9seWdvbnM7XG4gICAgdGhpcy5ncm91cGVkVmVydGljZXMgPSBwb2x5Z29ucztcbiAgICB0aGlzLndpcmVmcmFtZSA9IHdpcmVmcmFtZTtcblxuICAgIHRoaXMuYXR0cmlidXRlcyA9IHt9O1xuXG4gICAgY29uc3QgcG9zaXRpb25zSlMgPSBjYWxjdWxhdGVQb3NpdGlvbnNKUyh7Z3JvdXBlZFZlcnRpY2VzLCB3aXJlZnJhbWV9KTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuYXR0cmlidXRlcywge1xuICAgICAgcG9zaXRpb25zOiBjYWxjdWxhdGVQb3NpdGlvbnMocG9zaXRpb25zSlMsIHRoaXMuZnA2NCksXG4gICAgICBpbmRpY2VzOiBjYWxjdWxhdGVJbmRpY2VzKHtncm91cGVkVmVydGljZXMsIHdpcmVmcmFtZX0pLFxuICAgICAgbm9ybWFsczogY2FsY3VsYXRlTm9ybWFscyh7Z3JvdXBlZFZlcnRpY2VzLCB3aXJlZnJhbWV9KSxcbiAgICAgIC8vIGNvbG9yczogY2FsY3VsYXRlQ29sb3JzKHtncm91cGVkVmVydGljZXMsIHdpcmVmcmFtZSwgZ2V0Q29sb3J9KSxcbiAgICAgIHBpY2tpbmdDb2xvcnM6IGNhbGN1bGF0ZVBpY2tpbmdDb2xvcnMoe2dyb3VwZWRWZXJ0aWNlcywgd2lyZWZyYW1lfSlcbiAgICB9KTtcbiAgfVxuXG4gIGluZGljZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlcy5pbmRpY2VzO1xuICB9XG5cbiAgcG9zaXRpb25zKCkge1xuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZXMucG9zaXRpb25zO1xuICB9XG5cbiAgbm9ybWFscygpIHtcbiAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVzLm5vcm1hbHM7XG4gIH1cblxuICBjb2xvcnMoe2dldENvbG9yID0geCA9PiBERUZBVUxUX0NPTE9SfSA9IHt9KSB7XG4gICAgY29uc3Qge2dyb3VwZWRWZXJ0aWNlcywgd2lyZWZyYW1lfSA9IHRoaXM7XG4gICAgcmV0dXJuIGNhbGN1bGF0ZUNvbG9ycyh7Z3JvdXBlZFZlcnRpY2VzLCB3aXJlZnJhbWUsIGdldENvbG9yfSk7XG4gIH1cblxuICBwaWNraW5nQ29sb3JzKCkge1xuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZXMucGlja2luZ0NvbG9ycztcbiAgfVxuXG4gIC8vIHVwZGF0ZVRyaWdnZXJzOiB7XG4gIC8vICAgcG9zaXRpb25zOiBbJ2dldEhlaWdodCddLFxuICAvLyAgIGNvbG9yczogWydnZXRDb2xvcnMnXVxuICAvLyAgIHBpY2tpbmdDb2xvcnM6ICdub25lJ1xuICAvLyB9XG59XG5cbmZ1bmN0aW9uIGNvdW50VmVydGljZXModmVydGljZXMpIHtcbiAgcmV0dXJuIHZlcnRpY2VzLnJlZHVjZSgodmVydGV4Q291bnQsIHBvbHlnb24pID0+IHZlcnRleENvdW50ICsgY291bnQocG9seWdvbiksIDApO1xufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVJbmRpY2VzKHtncm91cGVkVmVydGljZXMsIHdpcmVmcmFtZSA9IGZhbHNlfSkge1xuICAvLyBhZGp1c3QgaW5kZXggb2Zmc2V0IGZvciBtdWx0aXBsZSBwb2x5Z29uc1xuICBjb25zdCBtdWx0aXBsaWVyID0gd2lyZWZyYW1lID8gMiA6IDU7XG4gIGNvbnN0IG9mZnNldHMgPSBncm91cGVkVmVydGljZXMucmVkdWNlKFxuICAgIChhY2MsIHZlcnRpY2VzKSA9PlxuICAgICAgYWNjLmNvbmNhdChhY2NbYWNjLmxlbmd0aCAtIDFdICsgY291bnRWZXJ0aWNlcyh2ZXJ0aWNlcykgKiBtdWx0aXBsaWVyKSxcbiAgICBbMF1cbiAgKTtcblxuICBjb25zdCBpbmRpY2VzID0gZ3JvdXBlZFZlcnRpY2VzLm1hcCgodmVydGljZXMsIHBvbHlnb25JbmRleCkgPT5cbiAgICB3aXJlZnJhbWUgP1xuICAgICAgLy8gMS4gZ2V0IHNlcXVlbnRpYWxseSBvcmRlcmVkIGluZGljZXMgb2YgZWFjaCBwb2x5Z29ucyB3aXJlZnJhbWVcbiAgICAgIC8vIDIuIG9mZnNldCB0aGVtIGJ5IHRoZSBudW1iZXIgb2YgaW5kaWNlcyBpbiBwcmV2aW91cyBwb2x5Z29uc1xuICAgICAgY2FsY3VsYXRlQ29udG91ckluZGljZXModmVydGljZXMsIG9mZnNldHNbcG9seWdvbkluZGV4XSkgOlxuICAgICAgLy8gMS4gZ2V0IHRyaWFuZ3VsYXRlZCBpbmRpY2VzIGZvciB0aGUgaW50ZXJuYWwgYXJlYXNcbiAgICAgIC8vIDIuIG9mZnNldCB0aGVtIGJ5IHRoZSBudW1iZXIgb2YgaW5kaWNlcyBpbiBwcmV2aW91cyBwb2x5Z29uc1xuICAgICAgY2FsY3VsYXRlU3VyZmFjZUluZGljZXModmVydGljZXMsIG9mZnNldHNbcG9seWdvbkluZGV4XSlcbiAgKTtcblxuICByZXR1cm4gbmV3IFVpbnQzMkFycmF5KGZsYXR0ZW5EZWVwKGluZGljZXMpKTtcbn1cblxuLy8gQ2FsY3VsYXRlIGEgZmxhdCBwb3NpdGlvbiBhcnJheSBpbiBKUyAtIGNhbiBiZSBtYXBwZWQgdG8gMzIgb3IgNjQgYml0IHR5cGVkIGFycmF5c1xuLy8gUmVtYXJrczpcbi8vICogZWFjaCB0b3AgdmVydGV4IGlzIG9uIDMgc3VyZmFjZXNcbi8vICogZWFjaCBib3R0b20gdmVydGV4IGlzIG9uIDIgc3VyZmFjZXNcbmZ1bmN0aW9uIGNhbGN1bGF0ZVBvc2l0aW9uc0pTKHtncm91cGVkVmVydGljZXMsIHdpcmVmcmFtZSA9IGZhbHNlfSkge1xuICBjb25zdCBwb3NpdGlvbnMgPSBncm91cGVkVmVydGljZXMubWFwKFxuICAgIHZlcnRpY2VzID0+IHtcbiAgICAgIGNvbnN0IHRvcFZlcnRpY2VzID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgdmVydGljZXMpO1xuICAgICAgY29uc3QgYmFzZVZlcnRpY2VzID0gdG9wVmVydGljZXMubWFwKHYgPT4gW2dldCh2LCAwKSwgZ2V0KHYsIDEpLCAwXSk7XG4gICAgICByZXR1cm4gd2lyZWZyYW1lID8gW3RvcFZlcnRpY2VzLCBiYXNlVmVydGljZXNdIDpcbiAgICAgICAgW3RvcFZlcnRpY2VzLCB0b3BWZXJ0aWNlcywgdG9wVmVydGljZXMsIGJhc2VWZXJ0aWNlcywgYmFzZVZlcnRpY2VzXTtcbiAgICB9XG4gICk7XG5cbiAgcmV0dXJuIGZsYXR0ZW5EZWVwKHBvc2l0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZVBvc2l0aW9ucyhwb3NpdGlvbnNKUywgZnA2NCkge1xuICBsZXQgcG9zaXRpb25Mb3c7XG4gIGlmIChmcDY0KSB7XG4gICAgLy8gV2Ugb25seSBuZWVkIHgsIHkgY29tcG9uZW50XG4gICAgcG9zaXRpb25Mb3cgPSBuZXcgRmxvYXQzMkFycmF5KHBvc2l0aW9uc0pTLmxlbmd0aCAvIDMgKiAyKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvc2l0aW9uc0pTLmxlbmd0aCAvIDM7IGkrKykge1xuICAgICAgcG9zaXRpb25Mb3dbaSAqIDIgKyAwXSA9IGZwNjRpZnkocG9zaXRpb25zSlNbaSAqIDMgKyAwXSlbMV07XG4gICAgICBwb3NpdGlvbkxvd1tpICogMiArIDFdID0gZnA2NGlmeShwb3NpdGlvbnNKU1tpICogMyArIDFdKVsxXTtcbiAgICB9XG5cbiAgfVxuICByZXR1cm4ge3Bvc2l0aW9uczogbmV3IEZsb2F0MzJBcnJheShwb3NpdGlvbnNKUyksIHBvc2l0aW9uczY0eHlMb3c6IHBvc2l0aW9uTG93fTtcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlTm9ybWFscyh7Z3JvdXBlZFZlcnRpY2VzLCB3aXJlZnJhbWV9KSB7XG4gIGNvbnN0IHVwID0gWzAsIDEsIDBdO1xuXG4gIGNvbnN0IG5vcm1hbHMgPSBncm91cGVkVmVydGljZXMubWFwKCh2ZXJ0aWNlcywgcG9seWdvbkluZGV4KSA9PiB7XG4gICAgY29uc3QgdG9wTm9ybWFscyA9IG5ldyBBcnJheShjb3VudFZlcnRpY2VzKHZlcnRpY2VzKSkuZmlsbCh1cCk7XG4gICAgY29uc3Qgc2lkZU5vcm1hbHMgPSB2ZXJ0aWNlcy5tYXAocG9seWdvbiA9PiBjYWxjdWxhdGVTaWRlTm9ybWFscyhwb2x5Z29uKSk7XG4gICAgY29uc3Qgc2lkZU5vcm1hbHNGb3J3YXJkID0gc2lkZU5vcm1hbHMubWFwKG4gPT4gblswXSk7XG4gICAgY29uc3Qgc2lkZU5vcm1hbHNCYWNrd2FyZCA9IHNpZGVOb3JtYWxzLm1hcChuID0+IG5bMV0pO1xuXG4gICAgcmV0dXJuIHdpcmVmcmFtZSA/XG4gICAgW3RvcE5vcm1hbHMsIHRvcE5vcm1hbHNdIDpcbiAgICBbdG9wTm9ybWFscywgc2lkZU5vcm1hbHNGb3J3YXJkLCBzaWRlTm9ybWFsc0JhY2t3YXJkLCBzaWRlTm9ybWFsc0ZvcndhcmQsIHNpZGVOb3JtYWxzQmFja3dhcmRdO1xuICB9KTtcblxuICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShmbGF0dGVuRGVlcChub3JtYWxzKSk7XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZVNpZGVOb3JtYWxzKHZlcnRpY2VzKSB7XG4gIGNvbnN0IG5vcm1hbHMgPSBbXTtcblxuICBsZXQgbGFzdFZlcnRpY2UgPSBudWxsO1xuICBmb3IgKGNvbnN0IHZlcnRpY2Ugb2YgdmVydGljZXMpIHtcbiAgICBpZiAobGFzdFZlcnRpY2UpIHtcbiAgICAgIC8vIHZlcnRleFtpLTFdLCB2ZXJ0ZXhbaV1cbiAgICAgIGNvbnN0IG4gPSBnZXROb3JtYWwobGFzdFZlcnRpY2UsIHZlcnRpY2UpO1xuICAgICAgbm9ybWFscy5wdXNoKG4pO1xuICAgIH1cbiAgICBsYXN0VmVydGljZSA9IHZlcnRpY2U7XG4gIH1cblxuICByZXR1cm4gW1tub3JtYWxzLmNvbmNhdChub3JtYWxzWzBdKV0sIFtbbm9ybWFsc1swXV0uY29uY2F0KG5vcm1hbHMpXV07XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUNvbG9ycyh7Z3JvdXBlZFZlcnRpY2VzLCBnZXRDb2xvciwgd2lyZWZyYW1lID0gZmFsc2V9KSB7XG4gIGNvbnN0IGNvbG9ycyA9IGdyb3VwZWRWZXJ0aWNlcy5tYXAoKGNvbXBsZXhQb2x5Z29uLCBwb2x5Z29uSW5kZXgpID0+IHtcbiAgICBsZXQgY29sb3IgPSBnZXRDb2xvcihwb2x5Z29uSW5kZXgpO1xuICAgIGNvbG9yID0gcGFyc2VDb2xvcihjb2xvcik7XG5cbiAgICBjb25zdCBudW1WZXJ0aWNlcyA9IGNvdW50VmVydGljZXMoY29tcGxleFBvbHlnb24pO1xuICAgIGNvbnN0IHRvcENvbG9ycyA9IG5ldyBBcnJheShudW1WZXJ0aWNlcykuZmlsbChjb2xvcik7XG4gICAgY29uc3QgYmFzZUNvbG9ycyA9IG5ldyBBcnJheShudW1WZXJ0aWNlcykuZmlsbChjb2xvcik7XG4gICAgcmV0dXJuIHdpcmVmcmFtZSA/XG4gICAgICBbdG9wQ29sb3JzLCBiYXNlQ29sb3JzXSA6XG4gICAgICBbdG9wQ29sb3JzLCB0b3BDb2xvcnMsIHRvcENvbG9ycywgYmFzZUNvbG9ycywgYmFzZUNvbG9yc107XG4gIH0pO1xuICByZXR1cm4gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KGZsYXR0ZW5EZWVwKGNvbG9ycykpO1xufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVQaWNraW5nQ29sb3JzKHtncm91cGVkVmVydGljZXMsIHdpcmVmcmFtZSA9IGZhbHNlfSkge1xuICBjb25zdCBjb2xvcnMgPSBncm91cGVkVmVydGljZXMubWFwKCh2ZXJ0aWNlcywgcG9seWdvbkluZGV4KSA9PiB7XG4gICAgY29uc3QgbnVtVmVydGljZXMgPSBjb3VudFZlcnRpY2VzKHZlcnRpY2VzKTtcbiAgICBjb25zdCBjb2xvciA9IGdldFBpY2tpbmdDb2xvcihwb2x5Z29uSW5kZXgpO1xuICAgIGNvbnN0IHRvcENvbG9ycyA9IG5ldyBBcnJheShudW1WZXJ0aWNlcykuZmlsbChjb2xvcik7XG4gICAgY29uc3QgYmFzZUNvbG9ycyA9IG5ldyBBcnJheShudW1WZXJ0aWNlcykuZmlsbChjb2xvcik7XG4gICAgcmV0dXJuIHdpcmVmcmFtZSA/XG4gICAgICBbdG9wQ29sb3JzLCBiYXNlQ29sb3JzXSA6XG4gICAgICBbdG9wQ29sb3JzLCB0b3BDb2xvcnMsIHRvcENvbG9ycywgYmFzZUNvbG9ycywgYmFzZUNvbG9yc107XG4gIH0pO1xuICByZXR1cm4gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KGZsYXR0ZW5EZWVwKGNvbG9ycykpO1xufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVDb250b3VySW5kaWNlcyh2ZXJ0aWNlcywgb2Zmc2V0KSB7XG4gIGNvbnN0IHN0cmlkZSA9IGNvdW50VmVydGljZXModmVydGljZXMpO1xuXG4gIHJldHVybiB2ZXJ0aWNlcy5tYXAocG9seWdvbiA9PiB7XG4gICAgY29uc3QgaW5kaWNlcyA9IFtvZmZzZXRdO1xuICAgIGNvbnN0IG51bVZlcnRpY2VzID0gcG9seWdvbi5sZW5ndGg7XG5cbiAgICAvLyBwb2x5Z29uIHRvcFxuICAgIC8vIHVzZSB2ZXJ0ZXggcGFpcnMgZm9yIEdMLkxJTkVTID0+IFswLCAxLCAxLCAyLCAyLCAuLi4sIG4tMSwgbi0xLCAwXVxuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbnVtVmVydGljZXMgLSAxOyBpKyspIHtcbiAgICAgIGluZGljZXMucHVzaChpICsgb2Zmc2V0LCBpICsgb2Zmc2V0KTtcbiAgICB9XG4gICAgaW5kaWNlcy5wdXNoKG9mZnNldCk7XG5cbiAgICAvLyBwb2x5Z29uIHNpZGVzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1WZXJ0aWNlcyAtIDE7IGkrKykge1xuICAgICAgaW5kaWNlcy5wdXNoKGkgKyBvZmZzZXQsIGkgKyBzdHJpZGUgKyBvZmZzZXQpO1xuICAgIH1cblxuICAgIG9mZnNldCArPSBudW1WZXJ0aWNlcztcbiAgICByZXR1cm4gaW5kaWNlcztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZVN1cmZhY2VJbmRpY2VzKHZlcnRpY2VzLCBvZmZzZXQpIHtcbiAgY29uc3Qgc3RyaWRlID0gY291bnRWZXJ0aWNlcyh2ZXJ0aWNlcyk7XG4gIGNvbnN0IHF1YWQgPSBbXG4gICAgWzAsIDFdLCBbMCwgM10sIFsxLCAyXSxcbiAgICBbMSwgMl0sIFswLCAzXSwgWzEsIDRdXG4gIF07XG5cbiAgZnVuY3Rpb24gZHJhd1JlY3RhbmdsZShpKSB7XG4gICAgcmV0dXJuIHF1YWQubWFwKHYgPT4gaSArIHZbMF0gKyBzdHJpZGUgKiB2WzFdICsgb2Zmc2V0KTtcbiAgfVxuXG4gIGxldCBob2xlcyA9IG51bGw7XG5cbiAgaWYgKHZlcnRpY2VzLmxlbmd0aCA+IDEpIHtcbiAgICBob2xlcyA9IHZlcnRpY2VzLnJlZHVjZShcbiAgICAgIChhY2MsIHBvbHlnb24pID0+IGFjYy5jb25jYXQoYWNjW2FjYy5sZW5ndGggLSAxXSArIHBvbHlnb24ubGVuZ3RoKSxcbiAgICAgIFswXVxuICAgICkuc2xpY2UoMSwgdmVydGljZXMubGVuZ3RoKTtcbiAgfVxuXG4gIGNvbnN0IHRvcEluZGljZXMgPSBlYXJjdXQoZmxhdHRlbkRlZXAodmVydGljZXMpLCBob2xlcywgMykubWFwKGluZGV4ID0+IGluZGV4ICsgb2Zmc2V0KTtcblxuICBjb25zdCBzaWRlSW5kaWNlcyA9IHZlcnRpY2VzLm1hcChwb2x5Z29uID0+IHtcbiAgICBjb25zdCBudW1WZXJ0aWNlcyA9IHBvbHlnb24ubGVuZ3RoO1xuICAgIC8vIHBvbHlnb24gdG9wXG4gICAgbGV0IGluZGljZXMgPSBbXTtcblxuICAgIC8vIHBvbHlnb24gc2lkZXNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bVZlcnRpY2VzIC0gMTsgaSsrKSB7XG4gICAgICBpbmRpY2VzID0gaW5kaWNlcy5jb25jYXQoZHJhd1JlY3RhbmdsZShpKSk7XG4gICAgfVxuXG4gICAgb2Zmc2V0ICs9IG51bVZlcnRpY2VzO1xuICAgIHJldHVybiBpbmRpY2VzO1xuICB9KTtcblxuICByZXR1cm4gW3RvcEluZGljZXMsIHNpZGVJbmRpY2VzXTtcbn1cblxuLy8gaGVscGVyc1xuXG4vLyBnZXQgbm9ybWFsIHZlY3RvciBvZiBsaW5lIHNlZ21lbnRcbmZ1bmN0aW9uIGdldE5vcm1hbChwMSwgcDIpIHtcbiAgY29uc3QgcDF4ID0gZ2V0KHAxLCAwKTtcbiAgY29uc3QgcDF5ID0gZ2V0KHAxLCAxKTtcbiAgY29uc3QgcDJ4ID0gZ2V0KHAyLCAwKTtcbiAgY29uc3QgcDJ5ID0gZ2V0KHAyLCAxKTtcblxuICBpZiAocDF4ID09PSBwMnggJiYgcDF5ID09PSBwMnkpIHtcbiAgICByZXR1cm4gWzEsIDAsIDBdO1xuICB9XG5cbiAgY29uc3QgZGVncmVlczJyYWRpYW5zID0gTWF0aC5QSSAvIDE4MDtcbiAgY29uc3QgbG9uMSA9IGRlZ3JlZXMycmFkaWFucyAqIHAxeDtcbiAgY29uc3QgbG9uMiA9IGRlZ3JlZXMycmFkaWFucyAqIHAyeDtcbiAgY29uc3QgbGF0MSA9IGRlZ3JlZXMycmFkaWFucyAqIHAxeTtcbiAgY29uc3QgbGF0MiA9IGRlZ3JlZXMycmFkaWFucyAqIHAyeTtcbiAgY29uc3QgYSA9IE1hdGguc2luKGxvbjIgLSBsb24xKSAqIE1hdGguY29zKGxhdDIpO1xuICBjb25zdCBiID0gTWF0aC5jb3MobGF0MSkgKiBNYXRoLnNpbihsYXQyKSAtXG4gICAgTWF0aC5zaW4obGF0MSkgKiBNYXRoLmNvcyhsYXQyKSAqIE1hdGguY29zKGxvbjIgLSBsb24xKTtcbiAgcmV0dXJuIHZlYzNfbm9ybWFsaXplKFtdLCBbYiwgMCwgLWFdKTtcbn1cbiJdfQ==