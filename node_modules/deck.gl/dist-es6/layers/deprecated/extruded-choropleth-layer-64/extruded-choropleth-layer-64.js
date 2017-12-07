var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

import { Layer } from '../../../lib';
import { fp64ify } from '../../../lib/utils/fp64';
import { GL, Model, Geometry } from 'luma.gl';
import { flatten, log } from '../../../lib/utils';
import earcut from 'earcut';
import vec3_normalize from 'gl-vec3/normalize';

import extrudedChoroplethVertex from './extruded-choropleth-layer-vertex.glsl';
import extrudedChoroplethFragment from './extruded-choropleth-layer-fragment.glsl';

var DEFAULT_COLOR = [180, 180, 200, 255];
var DEFAULT_AMBIENT_COLOR = [255, 255, 255];
var DEFAULT_POINTLIGHT_AMBIENT_COEFFICIENT = 0.1;
var DEFAULT_POINTLIGHT_LOCATION = [40.4406, -79.9959, 100];
var DEFAULT_POINTLIGHT_COLOR = [255, 255, 255];
var DEFAULT_POINTLIGHT_ATTENUATION = 1.0;
var DEFAULT_MATERIAL_SPECULAR_COLOR = [255, 255, 255];
var DEFAULT_MATERIAL_SHININESS = 1;

var defaultProps = {
  opacity: 1,
  elevation: 1
};

var ExtrudedChoroplethLayer64 = function (_Layer) {
  _inherits(ExtrudedChoroplethLayer64, _Layer);

  function ExtrudedChoroplethLayer64(props) {
    _classCallCheck(this, ExtrudedChoroplethLayer64);

    var _this = _possibleConstructorReturn(this, (ExtrudedChoroplethLayer64.__proto__ || Object.getPrototypeOf(ExtrudedChoroplethLayer64)).call(this, props));

    log.once('ExtrudedChoroplethLayer64 is deprecated. Consider using GeoJsonLayer instead');
    return _this;
  }

  _createClass(ExtrudedChoroplethLayer64, [{
    key: 'getShaders',
    value: function getShaders() {
      return {
        vs: extrudedChoroplethVertex,
        fs: extrudedChoroplethFragment,
        modules: ['project64']
      };
    }
  }, {
    key: 'initializeState',
    value: function initializeState() {
      var attributeManager = this.state.attributeManager;

      attributeManager.add({
        indices: { size: 1, isIndexed: true, update: this.calculateIndices },
        positions: { size: 4, update: this.calculatePositions },
        heights: { size: 2, update: this.calculateHeights },
        normals: { size: 3, update: this.calculateNormals },
        colors: { size: 4, update: this.calculateColors }
      });

      var gl = this.context.gl;

      this.setState({
        numInstances: 0,
        model: this.getModel(gl)
      });
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref) {
      var changeFlags = _ref.changeFlags;
      var attributeManager = this.state.attributeManager;

      if (changeFlags.dataChanged) {
        this.extractExtrudedChoropleth();
        attributeManager.invalidateAll();
      }

      var _props = this.props,
          elevation = _props.elevation,
          ambientColor = _props.ambientColor,
          pointLightColor = _props.pointLightColor,
          pointLightLocation = _props.pointLightLocation,
          pointLightAmbientCoefficient = _props.pointLightAmbientCoefficient,
          pointLightAttenuation = _props.pointLightAttenuation,
          materialSpecularColor = _props.materialSpecularColor,
          materialShininess = _props.materialShininess;


      this.setUniforms({
        elevation: Number.isFinite(elevation) ? elevation : 1,
        uAmbientColor: ambientColor || DEFAULT_AMBIENT_COLOR,
        uPointLightAmbientCoefficient: pointLightAmbientCoefficient || DEFAULT_POINTLIGHT_AMBIENT_COEFFICIENT,
        uPointLightLocation: pointLightLocation || DEFAULT_POINTLIGHT_LOCATION,
        uPointLightColor: pointLightColor || DEFAULT_POINTLIGHT_COLOR,
        uPointLightAttenuation: pointLightAttenuation || DEFAULT_POINTLIGHT_ATTENUATION,
        uMaterialSpecularColor: materialSpecularColor || DEFAULT_MATERIAL_SPECULAR_COLOR,
        uMaterialShininess: materialShininess || DEFAULT_MATERIAL_SHININESS
      });
    }
  }, {
    key: 'draw',
    value: function draw(_ref2) {
      var uniforms = _ref2.uniforms;

      this.state.model.render(uniforms);
    }
  }, {
    key: 'getPickingInfo',
    value: function getPickingInfo(opts) {
      var info = _get(ExtrudedChoroplethLayer64.prototype.__proto__ || Object.getPrototypeOf(ExtrudedChoroplethLayer64.prototype), 'getPickingInfo', this).call(this, opts);
      var index = this.decodePickingColor(info.color);
      var feature = index >= 0 ? this.props.data.features[index] : null;
      info.feature = feature;
      info.object = feature;
      return info;
    }
  }, {
    key: 'getModel',
    value: function getModel(gl) {
      // Make sure we have 32 bit support
      // TODO - this could be done automatically by luma in "draw"
      // when it detects 32 bit indices
      if (!gl.getExtension('OES_element_index_uint')) {
        throw new Error('Extruded choropleth layer needs 32 bit indices');
      }

      // Buildings are 3d so depth test should be enabled
      // TODO - it is a little heavy handed to have a layer set this
      // Alternatively, check depth test and warn if not set, or add a prop
      // setDepthTest that is on by default.
      gl.enable(GL.DEPTH_TEST);
      gl.depthFunc(GL.LEQUAL);

      return new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: this.props.drawWireframe ? GL.LINES : GL.TRIANGLES
        }),
        vertexCount: 0,
        isIndexed: true
      }));
    }

    // each top vertex is on 3 surfaces
    // each bottom vertex is on 2 surfaces

  }, {
    key: 'calculatePositions',
    value: function calculatePositions(attribute) {
      var _this2 = this;

      var positions = this.state.positions;

      if (!positions) {
        positions = flatten(this.state.groupedVertices.map(function (vertices) {
          var topVertices = Array.prototype.concat.apply([], vertices);
          var baseVertices = topVertices.map(function (v) {
            return [v[0], v[1], 0];
          });
          return _this2.props.drawWireframe ? [topVertices, baseVertices] : [topVertices, topVertices, topVertices, baseVertices, baseVertices];
        }));
      }

      attribute.value = new Float32Array(positions.length / 3 * 4);

      for (var i = 0; i < positions.length / 3; i++) {
        var _fp64ify = fp64ify(positions[i * 3 + 0]);

        var _fp64ify2 = _slicedToArray(_fp64ify, 2);

        attribute.value[i * 4 + 0] = _fp64ify2[0];
        attribute.value[i * 4 + 1] = _fp64ify2[1];

        var _fp64ify3 = fp64ify(positions[i * 3 + 1]);

        var _fp64ify4 = _slicedToArray(_fp64ify3, 2);

        attribute.value[i * 4 + 2] = _fp64ify4[0];
        attribute.value[i * 4 + 3] = _fp64ify4[1];
      }
    }
  }, {
    key: 'calculateHeights',
    value: function calculateHeights(attribute) {
      var _this3 = this;

      var positions = this.state.positions;

      if (!positions) {
        positions = flatten(this.state.groupedVertices.map(function (vertices) {
          var topVertices = Array.prototype.concat.apply([], vertices);
          var baseVertices = topVertices.map(function (v) {
            return [v[0], v[1], 0];
          });
          return _this3.props.drawWireframe ? [topVertices, baseVertices] : [topVertices, topVertices, topVertices, baseVertices, baseVertices];
        }));
      }

      attribute.value = new Float32Array(positions.length / 3 * 2);
      for (var i = 0; i < positions.length / 3; i++) {
        var _fp64ify5 = fp64ify(positions[i * 3 + 2] + 0.1);

        var _fp64ify6 = _slicedToArray(_fp64ify5, 2);

        attribute.value[i * 2 + 0] = _fp64ify6[0];
        attribute.value[i * 2 + 1] = _fp64ify6[1];
      }
    }
  }, {
    key: 'calculateNormals',
    value: function calculateNormals(attribute) {
      var _this4 = this;

      var up = [0, 1, 0];

      var normals = this.state.groupedVertices.map(function (vertices, buildingIndex) {
        var topNormals = new Array(countVertices(vertices)).fill(up);
        var sideNormals = vertices.map(function (polygon) {
          return _this4.calculateSideNormals(polygon);
        });
        var sideNormalsForward = sideNormals.map(function (n) {
          return n[0];
        });
        var sideNormalsBackward = sideNormals.map(function (n) {
          return n[1];
        });

        return _this4.props.drawWireframe ? [topNormals, topNormals] : [topNormals, sideNormalsForward, sideNormalsBackward, sideNormalsForward, sideNormalsBackward];
      });

      attribute.value = new Float32Array(flatten(normals));
    }
  }, {
    key: 'calculateSideNormals',
    value: function calculateSideNormals(vertices) {
      var numVertices = vertices.length;
      var normals = [];

      for (var i = 0; i < numVertices - 1; i++) {
        var n = getNormal(vertices[i], vertices[i + 1]);
        normals.push(n);
      }

      return [[].concat(normals, [normals[0]]), [normals[0]].concat(normals)];
    }
  }, {
    key: 'calculateIndices',
    value: function calculateIndices(attribute) {
      var _this5 = this;

      // adjust index offset for multiple buildings
      var multiplier = this.props.drawWireframe ? 2 : 5;
      var offsets = this.state.groupedVertices.reduce(function (acc, vertices) {
        return [].concat(_toConsumableArray(acc), [acc[acc.length - 1] + countVertices(vertices) * multiplier]);
      }, [0]);

      var indices = this.state.groupedVertices.map(function (vertices, buildingIndex) {
        return _this5.props.drawWireframe ?
        // 1. get sequentially ordered indices of each building wireframe
        // 2. offset them by the number of indices in previous buildings
        _this5.calculateContourIndices(vertices, offsets[buildingIndex]) :
        // 1. get triangulated indices for the internal areas
        // 2. offset them by the number of indices in previous buildings
        _this5.calculateSurfaceIndices(vertices, offsets[buildingIndex]);
      });

      attribute.value = new Uint32Array(flatten(indices));
      attribute.target = GL.ELEMENT_ARRAY_BUFFER;
      this.state.model.setVertexCount(attribute.value.length / attribute.size);
    }
  }, {
    key: 'calculateColors',
    value: function calculateColors(attribute) {
      var _this6 = this;

      var colors = this.state.groupedVertices.map(function (vertices, buildingIndex) {
        var color = _this6.props.color;

        var baseColor = color || DEFAULT_COLOR;
        var topColor = color || DEFAULT_COLOR;
        var numVertices = countVertices(vertices);

        var topColors = new Array(numVertices).fill(topColor);
        var baseColors = new Array(numVertices).fill(baseColor);
        return _this6.props.drawWireframe ? [topColors, baseColors] : [topColors, topColors, topColors, baseColors, baseColors];
      });
      attribute.value = new Float32Array(flatten(colors));
    }
  }, {
    key: 'extractExtrudedChoropleth',
    value: function extractExtrudedChoropleth() {
      var _this7 = this;

      var data = this.props.data;
      // Generate a flat list of buildings

      this.state.buildings = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = function _loop() {
          var _state$buildings;

          var building = _step.value;
          var properties = building.properties,
              geometry = building.geometry;
          var coordinates = geometry.coordinates,
              type = geometry.type;

          if (!properties.height) {
            properties.height = Math.random() * 1000;
          }
          switch (type) {
            case 'MultiPolygon':
              // Maps to multiple buildings
              var buildings = coordinates.map(function (coords) {
                return { coordinates: coords, properties: properties };
              });
              (_state$buildings = _this7.state.buildings).push.apply(_state$buildings, _toConsumableArray(buildings));
              break;
            case 'Polygon':
              // Maps to a single building
              _this7.state.buildings.push({ coordinates: coordinates, properties: properties });
              break;
            default:
            // We are ignoring Points for now
          }
        };

        for (var _iterator = data.features[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          _loop();
        }

        // Generate vertices for the building list
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

      this.state.groupedVertices = this.state.buildings.map(function (building) {
        return building.coordinates.map(function (polygon) {
          return polygon.map(function (coordinate) {
            return [coordinate[0], coordinate[1], building.properties.height || 10];
          });
        });
      });
    }
  }, {
    key: 'calculateContourIndices',
    value: function calculateContourIndices(vertices, offset) {
      var stride = countVertices(vertices);

      return vertices.map(function (polygon) {
        var indices = [offset];
        var numVertices = polygon.length;

        // building top
        // use vertex pairs for GL.LINES => [0, 1, 1, 2, 2, ..., n-1, n-1, 0]
        for (var i = 1; i < numVertices - 1; i++) {
          indices.push(i + offset, i + offset);
        }
        indices.push(offset);

        // building sides
        for (var _i = 0; _i < numVertices - 1; _i++) {
          indices.push(_i + offset, _i + stride + offset);
        }

        offset += numVertices;
        return indices;
      });
    }
  }, {
    key: 'calculateSurfaceIndices',
    value: function calculateSurfaceIndices(vertices, offset) {
      var stride = countVertices(vertices);
      var holes = null;
      var quad = [[0, 1], [0, 3], [1, 2], [1, 2], [0, 3], [1, 4]];

      if (vertices.length > 1) {
        holes = vertices.reduce(function (acc, polygon) {
          return [].concat(_toConsumableArray(acc), [acc[acc.length - 1] + polygon.length]);
        }, [0]).slice(1, vertices.length);
      }

      var topIndices = earcut(flatten(vertices), holes, 3).map(function (index) {
        return index + offset;
      });

      var sideIndices = vertices.map(function (polygon) {
        var numVertices = polygon.length;
        // building top
        var indices = [];

        // building sides
        for (var i = 0; i < numVertices - 1; i++) {
          indices.push.apply(indices, _toConsumableArray(drawRectangle(i)));
        }

        offset += numVertices;
        return indices;
      });

      return [topIndices, sideIndices];

      function drawRectangle(i) {
        return quad.map(function (v) {
          return i + v[0] + stride * v[1] + offset;
        });
      }
    }
  }]);

  return ExtrudedChoroplethLayer64;
}(Layer);

export default ExtrudedChoroplethLayer64;


ExtrudedChoroplethLayer64.layerName = 'ExtrudedChoroplethLayer64';
ExtrudedChoroplethLayer64.defaultProps = defaultProps;

/*
 * helpers
 */
// get normal vector of line segment
function getNormal(p1, p2) {
  if (p1[0] === p2[0] && p1[1] === p2[1]) {
    return [1, 0, 0];
  }

  var degrees2radians = Math.PI / 180;

  var lon1 = degrees2radians * p1[0];
  var lon2 = degrees2radians * p2[0];
  var lat1 = degrees2radians * p1[1];
  var lat2 = degrees2radians * p2[1];

  var a = Math.sin(lon2 - lon1) * Math.cos(lat2);
  var b = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

  return vec3_normalize([], [b, 0, -a]);
}

// count number of vertices in geojson polygon
function countVertices(vertices) {
  return vertices.reduce(function (count, polygon) {
    return count + polygon.length;
  }, 0);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYXllcnMvZGVwcmVjYXRlZC9leHRydWRlZC1jaG9yb3BsZXRoLWxheWVyLTY0L2V4dHJ1ZGVkLWNob3JvcGxldGgtbGF5ZXItNjQuanMiXSwibmFtZXMiOlsiTGF5ZXIiLCJmcDY0aWZ5IiwiR0wiLCJNb2RlbCIsIkdlb21ldHJ5IiwiZmxhdHRlbiIsImxvZyIsImVhcmN1dCIsInZlYzNfbm9ybWFsaXplIiwiZXh0cnVkZWRDaG9yb3BsZXRoVmVydGV4IiwiZXh0cnVkZWRDaG9yb3BsZXRoRnJhZ21lbnQiLCJERUZBVUxUX0NPTE9SIiwiREVGQVVMVF9BTUJJRU5UX0NPTE9SIiwiREVGQVVMVF9QT0lOVExJR0hUX0FNQklFTlRfQ09FRkZJQ0lFTlQiLCJERUZBVUxUX1BPSU5UTElHSFRfTE9DQVRJT04iLCJERUZBVUxUX1BPSU5UTElHSFRfQ09MT1IiLCJERUZBVUxUX1BPSU5UTElHSFRfQVRURU5VQVRJT04iLCJERUZBVUxUX01BVEVSSUFMX1NQRUNVTEFSX0NPTE9SIiwiREVGQVVMVF9NQVRFUklBTF9TSElOSU5FU1MiLCJkZWZhdWx0UHJvcHMiLCJvcGFjaXR5IiwiZWxldmF0aW9uIiwiRXh0cnVkZWRDaG9yb3BsZXRoTGF5ZXI2NCIsInByb3BzIiwib25jZSIsInZzIiwiZnMiLCJtb2R1bGVzIiwiYXR0cmlidXRlTWFuYWdlciIsInN0YXRlIiwiYWRkIiwiaW5kaWNlcyIsInNpemUiLCJpc0luZGV4ZWQiLCJ1cGRhdGUiLCJjYWxjdWxhdGVJbmRpY2VzIiwicG9zaXRpb25zIiwiY2FsY3VsYXRlUG9zaXRpb25zIiwiaGVpZ2h0cyIsImNhbGN1bGF0ZUhlaWdodHMiLCJub3JtYWxzIiwiY2FsY3VsYXRlTm9ybWFscyIsImNvbG9ycyIsImNhbGN1bGF0ZUNvbG9ycyIsImdsIiwiY29udGV4dCIsInNldFN0YXRlIiwibnVtSW5zdGFuY2VzIiwibW9kZWwiLCJnZXRNb2RlbCIsImNoYW5nZUZsYWdzIiwiZGF0YUNoYW5nZWQiLCJleHRyYWN0RXh0cnVkZWRDaG9yb3BsZXRoIiwiaW52YWxpZGF0ZUFsbCIsImFtYmllbnRDb2xvciIsInBvaW50TGlnaHRDb2xvciIsInBvaW50TGlnaHRMb2NhdGlvbiIsInBvaW50TGlnaHRBbWJpZW50Q29lZmZpY2llbnQiLCJwb2ludExpZ2h0QXR0ZW51YXRpb24iLCJtYXRlcmlhbFNwZWN1bGFyQ29sb3IiLCJtYXRlcmlhbFNoaW5pbmVzcyIsInNldFVuaWZvcm1zIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJ1QW1iaWVudENvbG9yIiwidVBvaW50TGlnaHRBbWJpZW50Q29lZmZpY2llbnQiLCJ1UG9pbnRMaWdodExvY2F0aW9uIiwidVBvaW50TGlnaHRDb2xvciIsInVQb2ludExpZ2h0QXR0ZW51YXRpb24iLCJ1TWF0ZXJpYWxTcGVjdWxhckNvbG9yIiwidU1hdGVyaWFsU2hpbmluZXNzIiwidW5pZm9ybXMiLCJyZW5kZXIiLCJvcHRzIiwiaW5mbyIsImluZGV4IiwiZGVjb2RlUGlja2luZ0NvbG9yIiwiY29sb3IiLCJmZWF0dXJlIiwiZGF0YSIsImZlYXR1cmVzIiwib2JqZWN0IiwiZ2V0RXh0ZW5zaW9uIiwiRXJyb3IiLCJlbmFibGUiLCJERVBUSF9URVNUIiwiZGVwdGhGdW5jIiwiTEVRVUFMIiwiT2JqZWN0IiwiYXNzaWduIiwiZ2V0U2hhZGVycyIsImlkIiwiZ2VvbWV0cnkiLCJkcmF3TW9kZSIsImRyYXdXaXJlZnJhbWUiLCJMSU5FUyIsIlRSSUFOR0xFUyIsInZlcnRleENvdW50IiwiYXR0cmlidXRlIiwiZ3JvdXBlZFZlcnRpY2VzIiwibWFwIiwidG9wVmVydGljZXMiLCJBcnJheSIsInByb3RvdHlwZSIsImNvbmNhdCIsImFwcGx5IiwidmVydGljZXMiLCJiYXNlVmVydGljZXMiLCJ2IiwidmFsdWUiLCJGbG9hdDMyQXJyYXkiLCJsZW5ndGgiLCJpIiwidXAiLCJidWlsZGluZ0luZGV4IiwidG9wTm9ybWFscyIsImNvdW50VmVydGljZXMiLCJmaWxsIiwic2lkZU5vcm1hbHMiLCJjYWxjdWxhdGVTaWRlTm9ybWFscyIsInBvbHlnb24iLCJzaWRlTm9ybWFsc0ZvcndhcmQiLCJuIiwic2lkZU5vcm1hbHNCYWNrd2FyZCIsIm51bVZlcnRpY2VzIiwiZ2V0Tm9ybWFsIiwicHVzaCIsIm11bHRpcGxpZXIiLCJvZmZzZXRzIiwicmVkdWNlIiwiYWNjIiwiY2FsY3VsYXRlQ29udG91ckluZGljZXMiLCJjYWxjdWxhdGVTdXJmYWNlSW5kaWNlcyIsIlVpbnQzMkFycmF5IiwidGFyZ2V0IiwiRUxFTUVOVF9BUlJBWV9CVUZGRVIiLCJzZXRWZXJ0ZXhDb3VudCIsImJhc2VDb2xvciIsInRvcENvbG9yIiwidG9wQ29sb3JzIiwiYmFzZUNvbG9ycyIsImJ1aWxkaW5ncyIsImJ1aWxkaW5nIiwicHJvcGVydGllcyIsImNvb3JkaW5hdGVzIiwidHlwZSIsImhlaWdodCIsIk1hdGgiLCJyYW5kb20iLCJjb29yZHMiLCJjb29yZGluYXRlIiwib2Zmc2V0Iiwic3RyaWRlIiwiaG9sZXMiLCJxdWFkIiwic2xpY2UiLCJ0b3BJbmRpY2VzIiwic2lkZUluZGljZXMiLCJkcmF3UmVjdGFuZ2xlIiwibGF5ZXJOYW1lIiwicDEiLCJwMiIsImRlZ3JlZXMycmFkaWFucyIsIlBJIiwibG9uMSIsImxvbjIiLCJsYXQxIiwibGF0MiIsImEiLCJzaW4iLCJjb3MiLCJiIiwiY291bnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUUEsS0FBUixRQUFvQixjQUFwQjtBQUNBLFNBQVFDLE9BQVIsUUFBc0IseUJBQXRCO0FBQ0EsU0FBUUMsRUFBUixFQUFZQyxLQUFaLEVBQW1CQyxRQUFuQixRQUFrQyxTQUFsQztBQUNBLFNBQVFDLE9BQVIsRUFBaUJDLEdBQWpCLFFBQTJCLG9CQUEzQjtBQUNBLE9BQU9DLE1BQVAsTUFBbUIsUUFB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R0FBTCxDQUFTSixPQUFPRCxJQUFoQixJQUF3QmpCLEtBQUt1QixHQUFMLENBQVNILElBQVQsQ0FBbEM7QUFDQSxNQUFNSSxJQUFJeEIsS0FBS3VCLEdBQUwsQ0FBU0osSUFBVCxJQUFpQm5CLEtBQUtzQixHQUFMLENBQVNGLElBQVQsQ0FBakIsR0FDUHBCLEtBQUtzQixHQUFMLENBQVNILElBQVQsSUFBaUJuQixLQUFLdUIsR0FBTCxDQUFTSCxJQUFULENBQWpCLEdBQWtDcEIsS0FBS3VCLEdBQUwsQ0FBU0wsT0FBT0QsSUFBaEIsQ0FEckM7O0FBR0EsU0FBTzVKLGVBQWUsRUFBZixFQUFtQixDQUFDbUssQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFDSCxDQUFSLENBQW5CLENBQVA7QUFDRDs7QUFFRDtBQUNBLFNBQVNwRCxhQUFULENBQXVCVixRQUF2QixFQUFpQztBQUMvQixTQUFPQSxTQUFTdUIsTUFBVCxDQUFnQixVQUFDMkMsS0FBRCxFQUFRcEQsT0FBUjtBQUFBLFdBQW9Cb0QsUUFBUXBELFFBQVFULE1BQXBDO0FBQUEsR0FBaEIsRUFBNEQsQ0FBNUQsQ0FBUDtBQUNEIiwiZmlsZSI6ImV4dHJ1ZGVkLWNob3JvcGxldGgtbGF5ZXItNjQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtMYXllcn0gZnJvbSAnLi4vLi4vLi4vbGliJztcbmltcG9ydCB7ZnA2NGlmeX0gZnJvbSAnLi4vLi4vLi4vbGliL3V0aWxzL2ZwNjQnO1xuaW1wb3J0IHtHTCwgTW9kZWwsIEdlb21ldHJ5fSBmcm9tICdsdW1hLmdsJztcbmltcG9ydCB7ZmxhdHRlbiwgbG9nfSBmcm9tICcuLi8uLi8uLi9saWIvdXRpbHMnO1xuaW1wb3J0IGVhcmN1dCBmcm9tICdlYXJjdXQnO1xuaW1wb3J0IHZlYzNfbm9ybWFsaXplIGZyb20gJ2dsLXZlYzMvbm9ybWFsaXplJztcblxuaW1wb3J0IGV4dHJ1ZGVkQ2hvcm9wbGV0aFZlcnRleCBmcm9tICcuL2V4dHJ1ZGVkLWNob3JvcGxldGgtbGF5ZXItdmVydGV4Lmdsc2wnO1xuaW1wb3J0IGV4dHJ1ZGVkQ2hvcm9wbGV0aEZyYWdtZW50IGZyb20gJy4vZXh0cnVkZWQtY2hvcm9wbGV0aC1sYXllci1mcmFnbWVudC5nbHNsJztcblxuY29uc3QgREVGQVVMVF9DT0xPUiA9IFsxODAsIDE4MCwgMjAwLCAyNTVdO1xuY29uc3QgREVGQVVMVF9BTUJJRU5UX0NPTE9SID0gWzI1NSwgMjU1LCAyNTVdO1xuY29uc3QgREVGQVVMVF9QT0lOVExJR0hUX0FNQklFTlRfQ09FRkZJQ0lFTlQgPSAwLjE7XG5jb25zdCBERUZBVUxUX1BPSU5UTElHSFRfTE9DQVRJT04gPSBbNDAuNDQwNiwgLTc5Ljk5NTksIDEwMF07XG5jb25zdCBERUZBVUxUX1BPSU5UTElHSFRfQ09MT1IgPSBbMjU1LCAyNTUsIDI1NV07XG5jb25zdCBERUZBVUxUX1BPSU5UTElHSFRfQVRURU5VQVRJT04gPSAxLjA7XG5jb25zdCBERUZBVUxUX01BVEVSSUFMX1NQRUNVTEFSX0NPTE9SID0gWzI1NSwgMjU1LCAyNTVdO1xuY29uc3QgREVGQVVMVF9NQVRFUklBTF9TSElOSU5FU1MgPSAxO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIG9wYWNpdHk6IDEsXG4gIGVsZXZhdGlvbjogMVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXh0cnVkZWRDaG9yb3BsZXRoTGF5ZXI2NCBleHRlbmRzIExheWVyIHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgbG9nLm9uY2UoJ0V4dHJ1ZGVkQ2hvcm9wbGV0aExheWVyNjQgaXMgZGVwcmVjYXRlZC4gQ29uc2lkZXIgdXNpbmcgR2VvSnNvbkxheWVyIGluc3RlYWQnKTtcbiAgfVxuXG4gIGdldFNoYWRlcnMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZzOiBleHRydWRlZENob3JvcGxldGhWZXJ0ZXgsXG4gICAgICBmczogZXh0cnVkZWRDaG9yb3BsZXRoRnJhZ21lbnQsXG4gICAgICBtb2R1bGVzOiBbJ3Byb2plY3Q2NCddXG4gICAgfTtcbiAgfVxuXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICBjb25zdCB7YXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkKHtcbiAgICAgIGluZGljZXM6IHtzaXplOiAxLCBpc0luZGV4ZWQ6IHRydWUsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbmRpY2VzfSxcbiAgICAgIHBvc2l0aW9uczoge3NpemU6IDQsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVQb3NpdGlvbnN9LFxuICAgICAgaGVpZ2h0czoge3NpemU6IDIsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVIZWlnaHRzfSxcbiAgICAgIG5vcm1hbHM6IHtzaXplOiAzLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlTm9ybWFsc30sXG4gICAgICBjb2xvcnM6IHtzaXplOiA0LCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlQ29sb3JzfVxuICAgIH0pO1xuXG4gICAgY29uc3Qge2dsfSA9IHRoaXMuY29udGV4dDtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG51bUluc3RhbmNlczogMCxcbiAgICAgIG1vZGVsOiB0aGlzLmdldE1vZGVsKGdsKVxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlU3RhdGUoe2NoYW5nZUZsYWdzfSkge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKGNoYW5nZUZsYWdzLmRhdGFDaGFuZ2VkKSB7XG4gICAgICB0aGlzLmV4dHJhY3RFeHRydWRlZENob3JvcGxldGgoKTtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuaW52YWxpZGF0ZUFsbCgpO1xuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIGVsZXZhdGlvbixcbiAgICAgIGFtYmllbnRDb2xvciwgcG9pbnRMaWdodENvbG9yLFxuICAgICAgcG9pbnRMaWdodExvY2F0aW9uLCBwb2ludExpZ2h0QW1iaWVudENvZWZmaWNpZW50LFxuICAgICAgcG9pbnRMaWdodEF0dGVudWF0aW9uLCBtYXRlcmlhbFNwZWN1bGFyQ29sb3IsIG1hdGVyaWFsU2hpbmluZXNzXG4gICAgfSA9IHRoaXMucHJvcHM7XG5cbiAgICB0aGlzLnNldFVuaWZvcm1zKHtcbiAgICAgIGVsZXZhdGlvbjogTnVtYmVyLmlzRmluaXRlKGVsZXZhdGlvbikgPyBlbGV2YXRpb24gOiAxLFxuICAgICAgdUFtYmllbnRDb2xvcjogYW1iaWVudENvbG9yIHx8IERFRkFVTFRfQU1CSUVOVF9DT0xPUixcbiAgICAgIHVQb2ludExpZ2h0QW1iaWVudENvZWZmaWNpZW50OlxuICAgICAgICBwb2ludExpZ2h0QW1iaWVudENvZWZmaWNpZW50IHx8IERFRkFVTFRfUE9JTlRMSUdIVF9BTUJJRU5UX0NPRUZGSUNJRU5ULFxuICAgICAgdVBvaW50TGlnaHRMb2NhdGlvbjogcG9pbnRMaWdodExvY2F0aW9uIHx8IERFRkFVTFRfUE9JTlRMSUdIVF9MT0NBVElPTixcbiAgICAgIHVQb2ludExpZ2h0Q29sb3I6IHBvaW50TGlnaHRDb2xvciB8fCBERUZBVUxUX1BPSU5UTElHSFRfQ09MT1IsXG4gICAgICB1UG9pbnRMaWdodEF0dGVudWF0aW9uOiBwb2ludExpZ2h0QXR0ZW51YXRpb24gfHwgREVGQVVMVF9QT0lOVExJR0hUX0FUVEVOVUFUSU9OLFxuICAgICAgdU1hdGVyaWFsU3BlY3VsYXJDb2xvcjogbWF0ZXJpYWxTcGVjdWxhckNvbG9yIHx8IERFRkFVTFRfTUFURVJJQUxfU1BFQ1VMQVJfQ09MT1IsXG4gICAgICB1TWF0ZXJpYWxTaGluaW5lc3M6IG1hdGVyaWFsU2hpbmluZXNzIHx8IERFRkFVTFRfTUFURVJJQUxfU0hJTklORVNTXG4gICAgfSk7XG4gIH1cblxuICBkcmF3KHt1bmlmb3Jtc30pIHtcbiAgICB0aGlzLnN0YXRlLm1vZGVsLnJlbmRlcih1bmlmb3Jtcyk7XG4gIH1cblxuICBnZXRQaWNraW5nSW5mbyhvcHRzKSB7XG4gICAgY29uc3QgaW5mbyA9IHN1cGVyLmdldFBpY2tpbmdJbmZvKG9wdHMpO1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5kZWNvZGVQaWNraW5nQ29sb3IoaW5mby5jb2xvcik7XG4gICAgY29uc3QgZmVhdHVyZSA9IGluZGV4ID49IDAgPyB0aGlzLnByb3BzLmRhdGEuZmVhdHVyZXNbaW5kZXhdIDogbnVsbDtcbiAgICBpbmZvLmZlYXR1cmUgPSBmZWF0dXJlO1xuICAgIGluZm8ub2JqZWN0ID0gZmVhdHVyZTtcbiAgICByZXR1cm4gaW5mbztcbiAgfVxuXG4gIGdldE1vZGVsKGdsKSB7XG4gICAgLy8gTWFrZSBzdXJlIHdlIGhhdmUgMzIgYml0IHN1cHBvcnRcbiAgICAvLyBUT0RPIC0gdGhpcyBjb3VsZCBiZSBkb25lIGF1dG9tYXRpY2FsbHkgYnkgbHVtYSBpbiBcImRyYXdcIlxuICAgIC8vIHdoZW4gaXQgZGV0ZWN0cyAzMiBiaXQgaW5kaWNlc1xuICAgIGlmICghZ2wuZ2V0RXh0ZW5zaW9uKCdPRVNfZWxlbWVudF9pbmRleF91aW50JykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXh0cnVkZWQgY2hvcm9wbGV0aCBsYXllciBuZWVkcyAzMiBiaXQgaW5kaWNlcycpO1xuICAgIH1cblxuICAgIC8vIEJ1aWxkaW5ncyBhcmUgM2Qgc28gZGVwdGggdGVzdCBzaG91bGQgYmUgZW5hYmxlZFxuICAgIC8vIFRPRE8gLSBpdCBpcyBhIGxpdHRsZSBoZWF2eSBoYW5kZWQgdG8gaGF2ZSBhIGxheWVyIHNldCB0aGlzXG4gICAgLy8gQWx0ZXJuYXRpdmVseSwgY2hlY2sgZGVwdGggdGVzdCBhbmQgd2FybiBpZiBub3Qgc2V0LCBvciBhZGQgYSBwcm9wXG4gICAgLy8gc2V0RGVwdGhUZXN0IHRoYXQgaXMgb24gYnkgZGVmYXVsdC5cbiAgICBnbC5lbmFibGUoR0wuREVQVEhfVEVTVCk7XG4gICAgZ2wuZGVwdGhGdW5jKEdMLkxFUVVBTCk7XG5cbiAgICByZXR1cm4gbmV3IE1vZGVsKGdsLCBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFNoYWRlcnMoKSwge1xuICAgICAgaWQ6IHRoaXMucHJvcHMuaWQsXG4gICAgICBnZW9tZXRyeTogbmV3IEdlb21ldHJ5KHtcbiAgICAgICAgZHJhd01vZGU6IHRoaXMucHJvcHMuZHJhd1dpcmVmcmFtZSA/IEdMLkxJTkVTIDogR0wuVFJJQU5HTEVTXG4gICAgICB9KSxcbiAgICAgIHZlcnRleENvdW50OiAwLFxuICAgICAgaXNJbmRleGVkOiB0cnVlXG4gICAgfSkpO1xuICB9XG5cbiAgLy8gZWFjaCB0b3AgdmVydGV4IGlzIG9uIDMgc3VyZmFjZXNcbiAgLy8gZWFjaCBib3R0b20gdmVydGV4IGlzIG9uIDIgc3VyZmFjZXNcbiAgY2FsY3VsYXRlUG9zaXRpb25zKGF0dHJpYnV0ZSkge1xuICAgIGxldCB7cG9zaXRpb25zfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKCFwb3NpdGlvbnMpIHtcbiAgICAgIHBvc2l0aW9ucyA9IGZsYXR0ZW4odGhpcy5zdGF0ZS5ncm91cGVkVmVydGljZXMubWFwKFxuICAgICAgICB2ZXJ0aWNlcyA9PiB7XG4gICAgICAgICAgY29uc3QgdG9wVmVydGljZXMgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCB2ZXJ0aWNlcyk7XG4gICAgICAgICAgY29uc3QgYmFzZVZlcnRpY2VzID0gdG9wVmVydGljZXMubWFwKHYgPT4gW3ZbMF0sIHZbMV0sIDBdKTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5kcmF3V2lyZWZyYW1lID8gW3RvcFZlcnRpY2VzLCBiYXNlVmVydGljZXNdIDpcbiAgICAgICAgICAgIFt0b3BWZXJ0aWNlcywgdG9wVmVydGljZXMsIHRvcFZlcnRpY2VzLCBiYXNlVmVydGljZXMsIGJhc2VWZXJ0aWNlc107XG4gICAgICAgIH1cbiAgICAgICkpO1xuICAgIH1cblxuICAgIGF0dHJpYnV0ZS52YWx1ZSA9IG5ldyBGbG9hdDMyQXJyYXkocG9zaXRpb25zLmxlbmd0aCAvIDMgKiA0KTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9zaXRpb25zLmxlbmd0aCAvIDM7IGkrKykge1xuICAgICAgW2F0dHJpYnV0ZS52YWx1ZVtpICogNCArIDBdLCBhdHRyaWJ1dGUudmFsdWVbaSAqIDQgKyAxXV0gPSBmcDY0aWZ5KHBvc2l0aW9uc1tpICogMyArIDBdKTtcbiAgICAgIFthdHRyaWJ1dGUudmFsdWVbaSAqIDQgKyAyXSwgYXR0cmlidXRlLnZhbHVlW2kgKiA0ICsgM11dID0gZnA2NGlmeShwb3NpdGlvbnNbaSAqIDMgKyAxXSk7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlSGVpZ2h0cyhhdHRyaWJ1dGUpIHtcbiAgICBsZXQge3Bvc2l0aW9uc30gPSB0aGlzLnN0YXRlO1xuICAgIGlmICghcG9zaXRpb25zKSB7XG4gICAgICBwb3NpdGlvbnMgPSBmbGF0dGVuKHRoaXMuc3RhdGUuZ3JvdXBlZFZlcnRpY2VzLm1hcChcbiAgICAgICAgdmVydGljZXMgPT4ge1xuICAgICAgICAgIGNvbnN0IHRvcFZlcnRpY2VzID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgdmVydGljZXMpO1xuICAgICAgICAgIGNvbnN0IGJhc2VWZXJ0aWNlcyA9IHRvcFZlcnRpY2VzLm1hcCh2ID0+IFt2WzBdLCB2WzFdLCAwXSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuZHJhd1dpcmVmcmFtZSA/IFt0b3BWZXJ0aWNlcywgYmFzZVZlcnRpY2VzXSA6XG4gICAgICAgICAgICBbdG9wVmVydGljZXMsIHRvcFZlcnRpY2VzLCB0b3BWZXJ0aWNlcywgYmFzZVZlcnRpY2VzLCBiYXNlVmVydGljZXNdO1xuICAgICAgICB9XG4gICAgICApKTtcbiAgICB9XG5cbiAgICBhdHRyaWJ1dGUudmFsdWUgPSBuZXcgRmxvYXQzMkFycmF5KHBvc2l0aW9ucy5sZW5ndGggLyAzICogMik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3NpdGlvbnMubGVuZ3RoIC8gMzsgaSsrKSB7XG4gICAgICBbYXR0cmlidXRlLnZhbHVlW2kgKiAyICsgMF0sIGF0dHJpYnV0ZS52YWx1ZVtpICogMiArIDFdXSA9XG4gICAgICAgZnA2NGlmeShwb3NpdGlvbnNbaSAqIDMgKyAyXSArIDAuMSk7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlTm9ybWFscyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB1cCA9IFswLCAxLCAwXTtcblxuICAgIGNvbnN0IG5vcm1hbHMgPSB0aGlzLnN0YXRlLmdyb3VwZWRWZXJ0aWNlcy5tYXAoXG4gICAgICAodmVydGljZXMsIGJ1aWxkaW5nSW5kZXgpID0+IHtcbiAgICAgICAgY29uc3QgdG9wTm9ybWFscyA9IG5ldyBBcnJheShjb3VudFZlcnRpY2VzKHZlcnRpY2VzKSkuZmlsbCh1cCk7XG4gICAgICAgIGNvbnN0IHNpZGVOb3JtYWxzID0gdmVydGljZXMubWFwKHBvbHlnb24gPT5cbiAgICAgICAgICB0aGlzLmNhbGN1bGF0ZVNpZGVOb3JtYWxzKHBvbHlnb24pKTtcbiAgICAgICAgY29uc3Qgc2lkZU5vcm1hbHNGb3J3YXJkID0gc2lkZU5vcm1hbHMubWFwKG4gPT4gblswXSk7XG4gICAgICAgIGNvbnN0IHNpZGVOb3JtYWxzQmFja3dhcmQgPSBzaWRlTm9ybWFscy5tYXAobiA9PiBuWzFdKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5kcmF3V2lyZWZyYW1lID8gW3RvcE5vcm1hbHMsIHRvcE5vcm1hbHNdIDpcbiAgICAgICAgW3RvcE5vcm1hbHMsIHNpZGVOb3JtYWxzRm9yd2FyZCwgc2lkZU5vcm1hbHNCYWNrd2FyZCxcbiAgICAgICAgICBzaWRlTm9ybWFsc0ZvcndhcmQsIHNpZGVOb3JtYWxzQmFja3dhcmRdO1xuICAgICAgfVxuICAgICk7XG5cbiAgICBhdHRyaWJ1dGUudmFsdWUgPSBuZXcgRmxvYXQzMkFycmF5KGZsYXR0ZW4obm9ybWFscykpO1xuICB9XG5cbiAgY2FsY3VsYXRlU2lkZU5vcm1hbHModmVydGljZXMpIHtcbiAgICBjb25zdCBudW1WZXJ0aWNlcyA9IHZlcnRpY2VzLmxlbmd0aDtcbiAgICBjb25zdCBub3JtYWxzID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bVZlcnRpY2VzIC0gMTsgaSsrKSB7XG4gICAgICBjb25zdCBuID0gZ2V0Tm9ybWFsKHZlcnRpY2VzW2ldLCB2ZXJ0aWNlc1tpICsgMV0pO1xuICAgICAgbm9ybWFscy5wdXNoKG4pO1xuICAgIH1cblxuICAgIHJldHVybiBbXG4gICAgICBbLi4ubm9ybWFscywgbm9ybWFsc1swXV0sXG4gICAgICBbbm9ybWFsc1swXSwgLi4ubm9ybWFsc11cbiAgICBdO1xuICB9XG5cbiAgY2FsY3VsYXRlSW5kaWNlcyhhdHRyaWJ1dGUpIHtcbiAgICAvLyBhZGp1c3QgaW5kZXggb2Zmc2V0IGZvciBtdWx0aXBsZSBidWlsZGluZ3NcbiAgICBjb25zdCBtdWx0aXBsaWVyID0gdGhpcy5wcm9wcy5kcmF3V2lyZWZyYW1lID8gMiA6IDU7XG4gICAgY29uc3Qgb2Zmc2V0cyA9IHRoaXMuc3RhdGUuZ3JvdXBlZFZlcnRpY2VzLnJlZHVjZShcbiAgICAgIChhY2MsIHZlcnRpY2VzKSA9PlxuICAgICAgICBbLi4uYWNjLCBhY2NbYWNjLmxlbmd0aCAtIDFdICsgY291bnRWZXJ0aWNlcyh2ZXJ0aWNlcykgKiBtdWx0aXBsaWVyXSxcbiAgICAgIFswXVxuICAgICk7XG5cbiAgICBjb25zdCBpbmRpY2VzID0gdGhpcy5zdGF0ZS5ncm91cGVkVmVydGljZXMubWFwKFxuICAgICAgKHZlcnRpY2VzLCBidWlsZGluZ0luZGV4KSA9PiB0aGlzLnByb3BzLmRyYXdXaXJlZnJhbWUgP1xuICAgICAgICAvLyAxLiBnZXQgc2VxdWVudGlhbGx5IG9yZGVyZWQgaW5kaWNlcyBvZiBlYWNoIGJ1aWxkaW5nIHdpcmVmcmFtZVxuICAgICAgICAvLyAyLiBvZmZzZXQgdGhlbSBieSB0aGUgbnVtYmVyIG9mIGluZGljZXMgaW4gcHJldmlvdXMgYnVpbGRpbmdzXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQ29udG91ckluZGljZXModmVydGljZXMsIG9mZnNldHNbYnVpbGRpbmdJbmRleF0pIDpcbiAgICAgICAgLy8gMS4gZ2V0IHRyaWFuZ3VsYXRlZCBpbmRpY2VzIGZvciB0aGUgaW50ZXJuYWwgYXJlYXNcbiAgICAgICAgLy8gMi4gb2Zmc2V0IHRoZW0gYnkgdGhlIG51bWJlciBvZiBpbmRpY2VzIGluIHByZXZpb3VzIGJ1aWxkaW5nc1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZVN1cmZhY2VJbmRpY2VzKHZlcnRpY2VzLCBvZmZzZXRzW2J1aWxkaW5nSW5kZXhdKVxuICAgICk7XG5cbiAgICBhdHRyaWJ1dGUudmFsdWUgPSBuZXcgVWludDMyQXJyYXkoZmxhdHRlbihpbmRpY2VzKSk7XG4gICAgYXR0cmlidXRlLnRhcmdldCA9IEdMLkVMRU1FTlRfQVJSQVlfQlVGRkVSO1xuICAgIHRoaXMuc3RhdGUubW9kZWwuc2V0VmVydGV4Q291bnQoYXR0cmlidXRlLnZhbHVlLmxlbmd0aCAvIGF0dHJpYnV0ZS5zaXplKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUNvbG9ycyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCBjb2xvcnMgPSB0aGlzLnN0YXRlLmdyb3VwZWRWZXJ0aWNlcy5tYXAoXG4gICAgICAodmVydGljZXMsIGJ1aWxkaW5nSW5kZXgpID0+IHtcbiAgICAgICAgY29uc3Qge2NvbG9yfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IGJhc2VDb2xvciA9IGNvbG9yIHx8IERFRkFVTFRfQ09MT1I7XG4gICAgICAgIGNvbnN0IHRvcENvbG9yID0gY29sb3IgfHwgREVGQVVMVF9DT0xPUjtcbiAgICAgICAgY29uc3QgbnVtVmVydGljZXMgPSBjb3VudFZlcnRpY2VzKHZlcnRpY2VzKTtcblxuICAgICAgICBjb25zdCB0b3BDb2xvcnMgPSBuZXcgQXJyYXkobnVtVmVydGljZXMpLmZpbGwodG9wQ29sb3IpO1xuICAgICAgICBjb25zdCBiYXNlQ29sb3JzID0gbmV3IEFycmF5KG51bVZlcnRpY2VzKS5maWxsKGJhc2VDb2xvcik7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLmRyYXdXaXJlZnJhbWUgPyBbdG9wQ29sb3JzLCBiYXNlQ29sb3JzXSA6XG4gICAgICAgICAgW3RvcENvbG9ycywgdG9wQ29sb3JzLCB0b3BDb2xvcnMsIGJhc2VDb2xvcnMsIGJhc2VDb2xvcnNdO1xuICAgICAgfVxuICAgICk7XG4gICAgYXR0cmlidXRlLnZhbHVlID0gbmV3IEZsb2F0MzJBcnJheShmbGF0dGVuKGNvbG9ycykpO1xuICB9XG5cbiAgZXh0cmFjdEV4dHJ1ZGVkQ2hvcm9wbGV0aCgpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIC8vIEdlbmVyYXRlIGEgZmxhdCBsaXN0IG9mIGJ1aWxkaW5nc1xuICAgIHRoaXMuc3RhdGUuYnVpbGRpbmdzID0gW107XG4gICAgZm9yIChjb25zdCBidWlsZGluZyBvZiBkYXRhLmZlYXR1cmVzKSB7XG4gICAgICBjb25zdCB7cHJvcGVydGllcywgZ2VvbWV0cnl9ID0gYnVpbGRpbmc7XG4gICAgICBjb25zdCB7Y29vcmRpbmF0ZXMsIHR5cGV9ID0gZ2VvbWV0cnk7XG4gICAgICBpZiAoIXByb3BlcnRpZXMuaGVpZ2h0KSB7XG4gICAgICAgIHByb3BlcnRpZXMuaGVpZ2h0ID0gTWF0aC5yYW5kb20oKSAqIDEwMDA7XG4gICAgICB9XG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgJ011bHRpUG9seWdvbic6XG4gICAgICAgIC8vIE1hcHMgdG8gbXVsdGlwbGUgYnVpbGRpbmdzXG4gICAgICAgIGNvbnN0IGJ1aWxkaW5ncyA9IGNvb3JkaW5hdGVzLm1hcChcbiAgICAgICAgICBjb29yZHMgPT4gKHtjb29yZGluYXRlczogY29vcmRzLCBwcm9wZXJ0aWVzfSlcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5zdGF0ZS5idWlsZGluZ3MucHVzaCguLi5idWlsZGluZ3MpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ1BvbHlnb24nOlxuICAgICAgICAvLyBNYXBzIHRvIGEgc2luZ2xlIGJ1aWxkaW5nXG4gICAgICAgIHRoaXMuc3RhdGUuYnVpbGRpbmdzLnB1c2goe2Nvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gV2UgYXJlIGlnbm9yaW5nIFBvaW50cyBmb3Igbm93XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gR2VuZXJhdGUgdmVydGljZXMgZm9yIHRoZSBidWlsZGluZyBsaXN0XG4gICAgdGhpcy5zdGF0ZS5ncm91cGVkVmVydGljZXMgPSB0aGlzLnN0YXRlLmJ1aWxkaW5ncy5tYXAoXG4gICAgICBidWlsZGluZyA9PiBidWlsZGluZy5jb29yZGluYXRlcy5tYXAoXG4gICAgICAgIHBvbHlnb24gPT4gcG9seWdvbi5tYXAoXG4gICAgICAgICAgY29vcmRpbmF0ZSA9PiBbXG4gICAgICAgICAgICBjb29yZGluYXRlWzBdLFxuICAgICAgICAgICAgY29vcmRpbmF0ZVsxXSxcbiAgICAgICAgICAgIGJ1aWxkaW5nLnByb3BlcnRpZXMuaGVpZ2h0IHx8IDEwXG4gICAgICAgICAgXVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUNvbnRvdXJJbmRpY2VzKHZlcnRpY2VzLCBvZmZzZXQpIHtcbiAgICBjb25zdCBzdHJpZGUgPSBjb3VudFZlcnRpY2VzKHZlcnRpY2VzKTtcblxuICAgIHJldHVybiB2ZXJ0aWNlcy5tYXAocG9seWdvbiA9PiB7XG4gICAgICBjb25zdCBpbmRpY2VzID0gW29mZnNldF07XG4gICAgICBjb25zdCBudW1WZXJ0aWNlcyA9IHBvbHlnb24ubGVuZ3RoO1xuXG4gICAgICAvLyBidWlsZGluZyB0b3BcbiAgICAgIC8vIHVzZSB2ZXJ0ZXggcGFpcnMgZm9yIEdMLkxJTkVTID0+IFswLCAxLCAxLCAyLCAyLCAuLi4sIG4tMSwgbi0xLCAwXVxuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBudW1WZXJ0aWNlcyAtIDE7IGkrKykge1xuICAgICAgICBpbmRpY2VzLnB1c2goaSArIG9mZnNldCwgaSArIG9mZnNldCk7XG4gICAgICB9XG4gICAgICBpbmRpY2VzLnB1c2gob2Zmc2V0KTtcblxuICAgICAgLy8gYnVpbGRpbmcgc2lkZXNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtVmVydGljZXMgLSAxOyBpKyspIHtcbiAgICAgICAgaW5kaWNlcy5wdXNoKGkgKyBvZmZzZXQsIGkgKyBzdHJpZGUgKyBvZmZzZXQpO1xuICAgICAgfVxuXG4gICAgICBvZmZzZXQgKz0gbnVtVmVydGljZXM7XG4gICAgICByZXR1cm4gaW5kaWNlcztcbiAgICB9KTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVN1cmZhY2VJbmRpY2VzKHZlcnRpY2VzLCBvZmZzZXQpIHtcbiAgICBjb25zdCBzdHJpZGUgPSBjb3VudFZlcnRpY2VzKHZlcnRpY2VzKTtcbiAgICBsZXQgaG9sZXMgPSBudWxsO1xuICAgIGNvbnN0IHF1YWQgPSBbXG4gICAgICBbMCwgMV0sIFswLCAzXSwgWzEsIDJdLFxuICAgICAgWzEsIDJdLCBbMCwgM10sIFsxLCA0XVxuICAgIF07XG5cbiAgICBpZiAodmVydGljZXMubGVuZ3RoID4gMSkge1xuICAgICAgaG9sZXMgPSB2ZXJ0aWNlcy5yZWR1Y2UoXG4gICAgICAgIChhY2MsIHBvbHlnb24pID0+IFsuLi5hY2MsIGFjY1thY2MubGVuZ3RoIC0gMV0gKyBwb2x5Z29uLmxlbmd0aF0sXG4gICAgICAgIFswXVxuICAgICAgKS5zbGljZSgxLCB2ZXJ0aWNlcy5sZW5ndGgpO1xuICAgIH1cblxuICAgIGNvbnN0IHRvcEluZGljZXMgPSBlYXJjdXQoZmxhdHRlbih2ZXJ0aWNlcyksIGhvbGVzLCAzKVxuICAgICAgLm1hcChpbmRleCA9PiBpbmRleCArIG9mZnNldCk7XG5cbiAgICBjb25zdCBzaWRlSW5kaWNlcyA9IHZlcnRpY2VzLm1hcChwb2x5Z29uID0+IHtcbiAgICAgIGNvbnN0IG51bVZlcnRpY2VzID0gcG9seWdvbi5sZW5ndGg7XG4gICAgICAvLyBidWlsZGluZyB0b3BcbiAgICAgIGNvbnN0IGluZGljZXMgPSBbXTtcblxuICAgICAgLy8gYnVpbGRpbmcgc2lkZXNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtVmVydGljZXMgLSAxOyBpKyspIHtcbiAgICAgICAgaW5kaWNlcy5wdXNoKC4uLmRyYXdSZWN0YW5nbGUoaSkpO1xuICAgICAgfVxuXG4gICAgICBvZmZzZXQgKz0gbnVtVmVydGljZXM7XG4gICAgICByZXR1cm4gaW5kaWNlcztcbiAgICB9KTtcblxuICAgIHJldHVybiBbdG9wSW5kaWNlcywgc2lkZUluZGljZXNdO1xuXG4gICAgZnVuY3Rpb24gZHJhd1JlY3RhbmdsZShpKSB7XG4gICAgICByZXR1cm4gcXVhZC5tYXAodiA9PiBpICsgdlswXSArIHN0cmlkZSAqIHZbMV0gKyBvZmZzZXQpO1xuICAgIH1cbiAgfVxufVxuXG5FeHRydWRlZENob3JvcGxldGhMYXllcjY0LmxheWVyTmFtZSA9ICdFeHRydWRlZENob3JvcGxldGhMYXllcjY0JztcbkV4dHJ1ZGVkQ2hvcm9wbGV0aExheWVyNjQuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuXG4vKlxuICogaGVscGVyc1xuICovXG4vLyBnZXQgbm9ybWFsIHZlY3RvciBvZiBsaW5lIHNlZ21lbnRcbmZ1bmN0aW9uIGdldE5vcm1hbChwMSwgcDIpIHtcbiAgaWYgKHAxWzBdID09PSBwMlswXSAmJiBwMVsxXSA9PT0gcDJbMV0pIHtcbiAgICByZXR1cm4gWzEsIDAsIDBdO1xuICB9XG5cbiAgY29uc3QgZGVncmVlczJyYWRpYW5zID0gTWF0aC5QSSAvIDE4MDtcblxuICBjb25zdCBsb24xID0gZGVncmVlczJyYWRpYW5zICogcDFbMF07XG4gIGNvbnN0IGxvbjIgPSBkZWdyZWVzMnJhZGlhbnMgKiBwMlswXTtcbiAgY29uc3QgbGF0MSA9IGRlZ3JlZXMycmFkaWFucyAqIHAxWzFdO1xuICBjb25zdCBsYXQyID0gZGVncmVlczJyYWRpYW5zICogcDJbMV07XG5cbiAgY29uc3QgYSA9IE1hdGguc2luKGxvbjIgLSBsb24xKSAqIE1hdGguY29zKGxhdDIpO1xuICBjb25zdCBiID0gTWF0aC5jb3MobGF0MSkgKiBNYXRoLnNpbihsYXQyKSAtXG4gICAgIE1hdGguc2luKGxhdDEpICogTWF0aC5jb3MobGF0MikgKiBNYXRoLmNvcyhsb24yIC0gbG9uMSk7XG5cbiAgcmV0dXJuIHZlYzNfbm9ybWFsaXplKFtdLCBbYiwgMCwgLWFdKTtcbn1cblxuLy8gY291bnQgbnVtYmVyIG9mIHZlcnRpY2VzIGluIGdlb2pzb24gcG9seWdvblxuZnVuY3Rpb24gY291bnRWZXJ0aWNlcyh2ZXJ0aWNlcykge1xuICByZXR1cm4gdmVydGljZXMucmVkdWNlKChjb3VudCwgcG9seWdvbikgPT4gY291bnQgKyBwb2x5Z29uLmxlbmd0aCwgMCk7XG59XG4iXX0=