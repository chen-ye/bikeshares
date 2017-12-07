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
import { get, flatten, log } from '../../../lib/utils';
import { extractPolygons } from './geojson';
import { GL, Model, Geometry } from 'luma.gl';
import earcut from 'earcut';

import choroplethVertex from './choropleth-layer-vertex.glsl';
import choroplethFragment from './choropleth-layer-fragment.glsl';

var DEFAULT_COLOR = [0, 0, 255, 255];

var defaultProps = {
  getColor: function getColor(feature) {
    return get(feature, 'properties.color');
  },
  drawContour: false,
  strokeWidth: 1
};

var ChoroplethLayer = function (_Layer) {
  _inherits(ChoroplethLayer, _Layer);

  function ChoroplethLayer(props) {
    _classCallCheck(this, ChoroplethLayer);

    var _this = _possibleConstructorReturn(this, (ChoroplethLayer.__proto__ || Object.getPrototypeOf(ChoroplethLayer)).call(this, props));

    log.once('ChoroplethLayer is deprecated. Consider using GeoJsonLayer instead');
    return _this;
  }

  _createClass(ChoroplethLayer, [{
    key: 'getShaders',
    value: function getShaders() {
      return {
        vs: choroplethVertex,
        fs: choroplethFragment
      };
    }
  }, {
    key: 'initializeState',
    value: function initializeState() {
      var gl = this.context.gl;
      var attributeManager = this.state.attributeManager;

      attributeManager.add({
        // Primtive attributes
        indices: { size: 1, update: this.calculateIndices, isIndexed: true },
        positions: { size: 3, update: this.calculatePositions },
        colors: { size: 4, type: GL.UNSIGNED_BYTE, update: this.calculateColors },
        // Instanced attributes
        pickingColors: {
          size: 3,
          type: GL.UNSIGNED_BYTE,
          update: this.calculatePickingColors,
          noAlloc: true
        }
      });

      var IndexType = gl.getExtension('OES_element_index_uint') ? Uint32Array : Uint16Array;

      this.setState({
        model: this.getModel(gl),
        numInstances: 0,
        IndexType: IndexType
      });
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref) {
      var oldProps = _ref.oldProps,
          props = _ref.props,
          changeFlags = _ref.changeFlags;
      var attributeManager = this.state.attributeManager;

      if (changeFlags.dataChanged) {
        this.state.choropleths = extractPolygons(props.data);
        attributeManager.invalidateAll();
      }

      if (props.drawContour !== oldProps.drawContour) {
        this.state.model.geometry.drawMode = props.drawContour ? GL.LINES : GL.TRIANGLES;
        attributeManager.invalidateAll();
      }
    }
  }, {
    key: 'draw',
    value: function draw(_ref2) {
      var uniforms = _ref2.uniforms;
      var gl = this.context.gl;

      var lineWidth = this.screenToDevicePixels(this.props.strokeWidth);
      gl.lineWidth(lineWidth);
      this.state.model.render(uniforms);
      // Setting line width back to 1 is here to workaround a Google Chrome bug
      // gl.clear() and gl.isEnabled() will return GL_INVALID_VALUE even with
      // correct parameter
      // This is not happening on Safari and Firefox
      gl.lineWidth(1.0);
    }
  }, {
    key: 'getPickingInfo',
    value: function getPickingInfo(opts) {
      var info = _get(ChoroplethLayer.prototype.__proto__ || Object.getPrototypeOf(ChoroplethLayer.prototype), 'getPickingInfo', this).call(this, opts);
      var index = this.decodePickingColor(info.color);
      var feature = index >= 0 ? get(this.props.data, ['features', index]) : null;
      info.feature = feature;
      info.object = feature;
      return info;
    }
  }, {
    key: 'getModel',
    value: function getModel(gl) {
      return new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: this.props.drawContour ? GL.LINES : GL.TRIANGLES
        }),
        vertexCount: 0,
        isIndexed: true,
        shaderCache: this.context.shaderCache
      }));
    }
  }, {
    key: 'calculateIndices',
    value: function calculateIndices(attribute) {
      var _this2 = this;

      // adjust index offset for multiple choropleths
      var offsets = this.state.choropleths.reduce(function (acc, choropleth) {
        return [].concat(_toConsumableArray(acc), [acc[acc.length - 1] + choropleth.reduce(function (count, polygon) {
          return count + polygon.length;
        }, 0)]);
      }, [0]);
      var IndexType = this.state.IndexType;

      if (IndexType === Uint16Array && offsets[offsets.length - 1] > 65535) {
        throw new Error('Vertex count exceeds browser\'s limit');
      }

      var indices = this.state.choropleths.map(function (choropleth, choroplethIndex) {
        return _this2.props.drawContour ?
        // 1. get sequentially ordered indices of each choropleth contour
        // 2. offset them by the number of indices in previous choropleths
        calculateContourIndices(choropleth).map(function (index) {
          return index + offsets[choroplethIndex];
        }) :
        // 1. get triangulated indices for the internal areas
        // 2. offset them by the number of indices in previous choropleths
        calculateSurfaceIndices(choropleth).map(function (index) {
          return index + offsets[choroplethIndex];
        });
      });

      attribute.value = new IndexType(flatten(indices));
      attribute.target = GL.ELEMENT_ARRAY_BUFFER;
      this.state.model.setVertexCount(attribute.value.length / attribute.size);
    }
  }, {
    key: 'calculatePositions',
    value: function calculatePositions(attribute) {
      var vertices = flatten(this.state.choropleths);
      attribute.value = new Float32Array(vertices);
    }
  }, {
    key: 'calculateColors',
    value: function calculateColors(attribute) {
      var _props = this.props,
          data = _props.data,
          getColor = _props.getColor;

      var features = get(data, 'features');
      var colors = this.state.choropleths.map(function (choropleth, choroplethIndex) {
        var feature = get(features, choropleth.featureIndex);
        var color = getColor(feature) || DEFAULT_COLOR;
        // Ensure alpha is set
        if (isNaN(color[3])) {
          color[3] = DEFAULT_COLOR[3];
        }
        return choropleth.map(function (polygon) {
          return polygon.map(function (vertex) {
            return color;
          });
        });
      });

      attribute.value = new Uint8Array(flatten(colors));
    }

    // Override the default picking colors calculation

  }, {
    key: 'calculatePickingColors',
    value: function calculatePickingColors(attribute) {
      var _this3 = this;

      var colors = this.state.choropleths.map(function (choropleth, choroplethIndex) {
        var featureIndex = choropleth.featureIndex;

        var color = _this3.props.drawContour ? [0, 0, 0] : [(featureIndex + 1) % 256, Math.floor((featureIndex + 1) / 256) % 256, Math.floor((featureIndex + 1) / 256 / 256) % 256];
        return choropleth.map(function (polygon) {
          return polygon.map(function (vertex) {
            return color;
          });
        });
      });

      attribute.value = new Uint8Array(flatten(colors));
    }
  }]);

  return ChoroplethLayer;
}(Layer);

export default ChoroplethLayer;


ChoroplethLayer.layerName = 'ChoroplethLayer';
ChoroplethLayer.defaultProps = defaultProps;

/*
 * get vertex indices for drawing choropleth contour
 * @param {[Number,Number,Number][][]} choropleth
 * @returns {[Number]} indices
 */
function calculateContourIndices(choropleth) {
  var offset = 0;

  return choropleth.reduce(function (acc, polygon) {
    var numVertices = polygon.length;

    // use vertex pairs for gl.LINES => [0, 1, 1, 2, 2, ..., n-2, n-2, n-1]
    var indices = [].concat(_toConsumableArray(acc), [offset]);
    for (var i = 1; i < numVertices - 1; i++) {
      indices.push(i + offset, i + offset);
    }
    indices.push(offset + numVertices - 1);

    offset += numVertices;
    return indices;
  }, []);
}

/*
 * get vertex indices for drawing choropleth mesh
 * @param {[Number,Number,Number][][]} choropleth
 * @returns {[Number]} indices
 */
function calculateSurfaceIndices(choropleth) {
  var holes = null;

  if (choropleth.length > 1) {
    holes = choropleth.reduce(function (acc, polygon) {
      return [].concat(_toConsumableArray(acc), [acc[acc.length - 1] + polygon.length]);
    }, [0]).slice(1, choropleth.length);
  }

  return earcut(flatten(choropleth), holes, 3);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYXllcnMvZGVwcmVjYXRlZC9jaG9yb3BsZXRoLWxheWVyL2Nob3JvcGxldGgtbGF5ZXIuanMiXSwibmFtZXMiOlsiTGF5ZXIiLCJnZXQiLCJmbGF0dGVuIiwibG9nIiwiZXh0cmFjdFBvbHlnb25zIiwiR0wiLCJNb2RlbCIsIkdlb21ldHJ5IiwiZWFyY3V0IiwiY2hvcm9wbGV0aFZlcnRleCIsImNob3JvcGxldGhGcmFnbWVudCIsIkRFRkFVTFRfQ09MT1IiLCJkZWZhdWx0UHJvcHMiLCJnZXRDb2xvciIsImZlYXR1cmUiLCJkcmF3Q29udG91ciIsInN0cm9rZVdpZHRoIiwiQ2hvcm9wbGV0aExheWVyIiwicHJvcHMiLCJvbmNlIiwidnMiLCJmcyIsImdsIiwiY29udGV4dCIsImF0dHJpYnV0ZU1hbmFnZXIiLCJzdGF0ZSIsImFkZCIsImluZGljZXMiLCJzaXplIiwidXBkYXRlIiwiY2FsY3VsYXRlSW5kaWNlcyIsImlzSW5kZXhlZCIsInBvc2l0aW9ucyIsImNhbGN1bGF0ZVBvc2l0aW9ucyIsImNvbG9ycyIsInR5cGUiLCJVTlNJR05FRF9CWVRFIiwiY2FsY3VsYXRlQ29sb3JzIiwicGlja2luZ0NvbG9ycyIsImNhbGN1bGF0ZVBpY2tpbmdDb2xvcnMiLCJub0FsbG9jIiwiSW5kZXhUeXBlIiwiZ2V0RXh0ZW5zaW9uIiwiVWludDMyQXJyYXkiLCJVaW50MTZBcnJheSIsInNldFN0YXRlIiwibW9kZWwiLCJnZXRNb2RlbCIsIm51bUluc3RhbmNlcyIsIm9sZFByb3BzIiwiY2hhbmdlRmxhZ3MiLCJkYXRhQ2hhbmdlZCIsImNob3JvcGxldGhzIiwiZGF0YSIsImludmFsaWRhdGVBbGwiLCJnZW9tZXRyeSIsImRyYXdNb2RlIiwiTElORVMiLCJUUklBTkdMRVMiLCJ1bmlmb3JtcyIsImxpbmVXaWR0aCIsInNjcmVlblRvRGV2aWNlUGl4ZWxzIiwicmVuZGVyIiwib3B0cyIsImluZm8iLCJpbmRleCIsImRlY29kZVBpY2tpbmdDb2xvciIsImNvbG9yIiwib2JqZWN0IiwiT2JqZWN0IiwiYXNzaWduIiwiZ2V0U2hhZGVycyIsImlkIiwidmVydGV4Q291bnQiLCJzaGFkZXJDYWNoZSIsImF0dHJpYnV0ZSIsIm9mZnNldHMiLCJyZWR1Y2UiLCJhY2MiLCJjaG9yb3BsZXRoIiwibGVuZ3RoIiwiY291bnQiLCJwb2x5Z29uIiwiRXJyb3IiLCJtYXAiLCJjaG9yb3BsZXRoSW5kZXgiLCJjYWxjdWxhdGVDb250b3VySW5kaWNlcyIsImNhbGN1bGF0ZVN1cmZhY2VJbmRpY2VzIiwidmFsdWUiLCJ0YXJnZXQiLCJFTEVNRU5UX0FSUkFZX0JVRkZFUiIsInNldFZlcnRleENvdW50IiwidmVydGljZXMiLCJGbG9hdDMyQXJyYXkiLCJmZWF0dXJlcyIsImZlYXR1cmVJbmRleCIsImlzTmFOIiwiVWludDhBcnJheSIsIk1hdGgiLCJmbG9vciIsImxheWVyTmFtZSIsIm9mZnNldCIsIm51bVZlcnRpY2VzIiwiaSIsInB1c2giLCJob2xlcyIsInNsaWNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFRQSxLQUFSLFFBQW9CLGNBQXBCO0FBQ0EsU0FBUUMsR0FBUixFQUFhQyxPQUFiLEVBQXNCQyxHQUF0QixRQUFnQyxvQkFBaEM7QUFDQSxTQUFRQyxlQUFSLFFBQThCLFdBQTlCO0FBQ0EsU0FBUUMsRUFBUixFQUFZQyxLQUFaLEVBQW1CQyxRQUFuQixRQUFrQyxTQUFsQztBQUNBLE9BQU9DLE1BQVAsTUFBbUIsUUFBbkI7O0FBRUEsT0FBT0MsZ0JBQVAsTUFBNkIsZ0NBQTdCO0FBQ0EsT0FBT0Msa0JBQVAsTUFBK0Isa0NBQS9COztBQUVBLElBQU1DLGdCQUFnQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sR0FBUCxFQUFZLEdBQVosQ0FBdEI7O0FBRUEsSUFB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LFdBQVdGLE1BQVgsQ0FDTixVQUFDQyxHQUFELEVBQU1JLE9BQU47QUFBQSwwQ0FBc0JKLEdBQXRCLElBQTJCQSxJQUFJQSxJQUFJRSxNQUFKLEdBQWEsQ0FBakIsSUFBc0JFLFFBQVFGLE1BQXpEO0FBQUEsS0FETSxFQUVOLENBQUMsQ0FBRCxDQUZNLEVBR04wQixLQUhNLENBR0EsQ0FIQSxFQUdHM0IsV0FBV0MsTUFIZCxDQUFSO0FBSUQ7O0FBRUQsU0FBT3hFLE9BQU9OLFFBQVE2RSxVQUFSLENBQVAsRUFBNEIwQixLQUE1QixFQUFtQyxDQUFuQyxDQUFQO0FBQ0QiLCJmaWxlIjoiY2hvcm9wbGV0aC1sYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge0xheWVyfSBmcm9tICcuLi8uLi8uLi9saWInO1xuaW1wb3J0IHtnZXQsIGZsYXR0ZW4sIGxvZ30gZnJvbSAnLi4vLi4vLi4vbGliL3V0aWxzJztcbmltcG9ydCB7ZXh0cmFjdFBvbHlnb25zfSBmcm9tICcuL2dlb2pzb24nO1xuaW1wb3J0IHtHTCwgTW9kZWwsIEdlb21ldHJ5fSBmcm9tICdsdW1hLmdsJztcbmltcG9ydCBlYXJjdXQgZnJvbSAnZWFyY3V0JztcblxuaW1wb3J0IGNob3JvcGxldGhWZXJ0ZXggZnJvbSAnLi9jaG9yb3BsZXRoLWxheWVyLXZlcnRleC5nbHNsJztcbmltcG9ydCBjaG9yb3BsZXRoRnJhZ21lbnQgZnJvbSAnLi9jaG9yb3BsZXRoLWxheWVyLWZyYWdtZW50Lmdsc2wnO1xuXG5jb25zdCBERUZBVUxUX0NPTE9SID0gWzAsIDAsIDI1NSwgMjU1XTtcblxuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICBnZXRDb2xvcjogZmVhdHVyZSA9PiBnZXQoZmVhdHVyZSwgJ3Byb3BlcnRpZXMuY29sb3InKSxcbiAgZHJhd0NvbnRvdXI6IGZhbHNlLFxuICBzdHJva2VXaWR0aDogMVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hvcm9wbGV0aExheWVyIGV4dGVuZHMgTGF5ZXIge1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIGxvZy5vbmNlKCdDaG9yb3BsZXRoTGF5ZXIgaXMgZGVwcmVjYXRlZC4gQ29uc2lkZXIgdXNpbmcgR2VvSnNvbkxheWVyIGluc3RlYWQnKTtcbiAgfVxuXG4gIGdldFNoYWRlcnMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZzOiBjaG9yb3BsZXRoVmVydGV4LFxuICAgICAgZnM6IGNob3JvcGxldGhGcmFnbWVudFxuICAgIH07XG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgY29uc3Qge2dsfSA9IHRoaXMuY29udGV4dDtcblxuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgYXR0cmlidXRlTWFuYWdlci5hZGQoe1xuICAgICAgLy8gUHJpbXRpdmUgYXR0cmlidXRlc1xuICAgICAgaW5kaWNlczoge3NpemU6IDEsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbmRpY2VzLCBpc0luZGV4ZWQ6IHRydWV9LFxuICAgICAgcG9zaXRpb25zOiB7c2l6ZTogMywgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZVBvc2l0aW9uc30sXG4gICAgICBjb2xvcnM6IHtzaXplOiA0LCB0eXBlOiBHTC5VTlNJR05FRF9CWVRFLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlQ29sb3JzfSxcbiAgICAgIC8vIEluc3RhbmNlZCBhdHRyaWJ1dGVzXG4gICAgICBwaWNraW5nQ29sb3JzOiB7XG4gICAgICAgIHNpemU6IDMsXG4gICAgICAgIHR5cGU6IEdMLlVOU0lHTkVEX0JZVEUsXG4gICAgICAgIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVQaWNraW5nQ29sb3JzLFxuICAgICAgICBub0FsbG9jOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBJbmRleFR5cGUgPSBnbC5nZXRFeHRlbnNpb24oJ09FU19lbGVtZW50X2luZGV4X3VpbnQnKSA/IFVpbnQzMkFycmF5IDogVWludDE2QXJyYXk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG1vZGVsOiB0aGlzLmdldE1vZGVsKGdsKSxcbiAgICAgIG51bUluc3RhbmNlczogMCxcbiAgICAgIEluZGV4VHlwZVxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlU3RhdGUoe29sZFByb3BzLCBwcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAoY2hhbmdlRmxhZ3MuZGF0YUNoYW5nZWQpIHtcbiAgICAgIHRoaXMuc3RhdGUuY2hvcm9wbGV0aHMgPSBleHRyYWN0UG9seWdvbnMocHJvcHMuZGF0YSk7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGVBbGwoKTtcbiAgICB9XG5cbiAgICBpZiAocHJvcHMuZHJhd0NvbnRvdXIgIT09IG9sZFByb3BzLmRyYXdDb250b3VyKSB7XG4gICAgICB0aGlzLnN0YXRlLm1vZGVsLmdlb21ldHJ5LmRyYXdNb2RlID0gcHJvcHMuZHJhd0NvbnRvdXIgPyBHTC5MSU5FUyA6IEdMLlRSSUFOR0xFUztcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuaW52YWxpZGF0ZUFsbCgpO1xuICAgIH1cblxuICB9XG5cbiAgZHJhdyh7dW5pZm9ybXN9KSB7XG4gICAgY29uc3Qge2dsfSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCBsaW5lV2lkdGggPSB0aGlzLnNjcmVlblRvRGV2aWNlUGl4ZWxzKHRoaXMucHJvcHMuc3Ryb2tlV2lkdGgpO1xuICAgIGdsLmxpbmVXaWR0aChsaW5lV2lkdGgpO1xuICAgIHRoaXMuc3RhdGUubW9kZWwucmVuZGVyKHVuaWZvcm1zKTtcbiAgICAvLyBTZXR0aW5nIGxpbmUgd2lkdGggYmFjayB0byAxIGlzIGhlcmUgdG8gd29ya2Fyb3VuZCBhIEdvb2dsZSBDaHJvbWUgYnVnXG4gICAgLy8gZ2wuY2xlYXIoKSBhbmQgZ2wuaXNFbmFibGVkKCkgd2lsbCByZXR1cm4gR0xfSU5WQUxJRF9WQUxVRSBldmVuIHdpdGhcbiAgICAvLyBjb3JyZWN0IHBhcmFtZXRlclxuICAgIC8vIFRoaXMgaXMgbm90IGhhcHBlbmluZyBvbiBTYWZhcmkgYW5kIEZpcmVmb3hcbiAgICBnbC5saW5lV2lkdGgoMS4wKTtcbiAgfVxuXG4gIGdldFBpY2tpbmdJbmZvKG9wdHMpIHtcbiAgICBjb25zdCBpbmZvID0gc3VwZXIuZ2V0UGlja2luZ0luZm8ob3B0cyk7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmRlY29kZVBpY2tpbmdDb2xvcihpbmZvLmNvbG9yKTtcbiAgICBjb25zdCBmZWF0dXJlID0gaW5kZXggPj0gMCA/IGdldCh0aGlzLnByb3BzLmRhdGEsIFsnZmVhdHVyZXMnLCBpbmRleF0pIDogbnVsbDtcbiAgICBpbmZvLmZlYXR1cmUgPSBmZWF0dXJlO1xuICAgIGluZm8ub2JqZWN0ID0gZmVhdHVyZTtcbiAgICByZXR1cm4gaW5mbztcbiAgfVxuXG4gIGdldE1vZGVsKGdsKSB7XG4gICAgcmV0dXJuIG5ldyBNb2RlbChnbCwgT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTaGFkZXJzKCksIHtcbiAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxuICAgICAgZ2VvbWV0cnk6IG5ldyBHZW9tZXRyeSh7XG4gICAgICAgIGRyYXdNb2RlOiB0aGlzLnByb3BzLmRyYXdDb250b3VyID8gR0wuTElORVMgOiBHTC5UUklBTkdMRVNcbiAgICAgIH0pLFxuICAgICAgdmVydGV4Q291bnQ6IDAsXG4gICAgICBpc0luZGV4ZWQ6IHRydWUsXG4gICAgICBzaGFkZXJDYWNoZTogdGhpcy5jb250ZXh0LnNoYWRlckNhY2hlXG4gICAgfSkpO1xuICB9XG5cbiAgY2FsY3VsYXRlSW5kaWNlcyhhdHRyaWJ1dGUpIHtcbiAgICAvLyBhZGp1c3QgaW5kZXggb2Zmc2V0IGZvciBtdWx0aXBsZSBjaG9yb3BsZXRoc1xuICAgIGNvbnN0IG9mZnNldHMgPSB0aGlzLnN0YXRlLmNob3JvcGxldGhzLnJlZHVjZShcbiAgICAgIChhY2MsIGNob3JvcGxldGgpID0+IFsuLi5hY2MsIGFjY1thY2MubGVuZ3RoIC0gMV0gK1xuICAgICAgICBjaG9yb3BsZXRoLnJlZHVjZSgoY291bnQsIHBvbHlnb24pID0+IGNvdW50ICsgcG9seWdvbi5sZW5ndGgsIDApXSxcbiAgICAgIFswXVxuICAgICk7XG4gICAgY29uc3Qge0luZGV4VHlwZX0gPSB0aGlzLnN0YXRlO1xuICAgIGlmIChJbmRleFR5cGUgPT09IFVpbnQxNkFycmF5ICYmIG9mZnNldHNbb2Zmc2V0cy5sZW5ndGggLSAxXSA+IDY1NTM1KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZlcnRleCBjb3VudCBleGNlZWRzIGJyb3dzZXJcXCdzIGxpbWl0Jyk7XG4gICAgfVxuXG4gICAgY29uc3QgaW5kaWNlcyA9IHRoaXMuc3RhdGUuY2hvcm9wbGV0aHMubWFwKFxuICAgICAgKGNob3JvcGxldGgsIGNob3JvcGxldGhJbmRleCkgPT4gdGhpcy5wcm9wcy5kcmF3Q29udG91ciA/XG4gICAgICAgIC8vIDEuIGdldCBzZXF1ZW50aWFsbHkgb3JkZXJlZCBpbmRpY2VzIG9mIGVhY2ggY2hvcm9wbGV0aCBjb250b3VyXG4gICAgICAgIC8vIDIuIG9mZnNldCB0aGVtIGJ5IHRoZSBudW1iZXIgb2YgaW5kaWNlcyBpbiBwcmV2aW91cyBjaG9yb3BsZXRoc1xuICAgICAgICBjYWxjdWxhdGVDb250b3VySW5kaWNlcyhjaG9yb3BsZXRoKS5tYXAoaW5kZXggPT4gaW5kZXggKyBvZmZzZXRzW2Nob3JvcGxldGhJbmRleF0pIDpcbiAgICAgICAgLy8gMS4gZ2V0IHRyaWFuZ3VsYXRlZCBpbmRpY2VzIGZvciB0aGUgaW50ZXJuYWwgYXJlYXNcbiAgICAgICAgLy8gMi4gb2Zmc2V0IHRoZW0gYnkgdGhlIG51bWJlciBvZiBpbmRpY2VzIGluIHByZXZpb3VzIGNob3JvcGxldGhzXG4gICAgICAgIGNhbGN1bGF0ZVN1cmZhY2VJbmRpY2VzKGNob3JvcGxldGgpLm1hcChpbmRleCA9PiBpbmRleCArIG9mZnNldHNbY2hvcm9wbGV0aEluZGV4XSlcbiAgICApO1xuXG4gICAgYXR0cmlidXRlLnZhbHVlID0gbmV3IEluZGV4VHlwZShmbGF0dGVuKGluZGljZXMpKTtcbiAgICBhdHRyaWJ1dGUudGFyZ2V0ID0gR0wuRUxFTUVOVF9BUlJBWV9CVUZGRVI7XG4gICAgdGhpcy5zdGF0ZS5tb2RlbC5zZXRWZXJ0ZXhDb3VudChhdHRyaWJ1dGUudmFsdWUubGVuZ3RoIC8gYXR0cmlidXRlLnNpemUpO1xuICB9XG5cbiAgY2FsY3VsYXRlUG9zaXRpb25zKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHZlcnRpY2VzID0gZmxhdHRlbih0aGlzLnN0YXRlLmNob3JvcGxldGhzKTtcbiAgICBhdHRyaWJ1dGUudmFsdWUgPSBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUNvbG9ycyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ2V0Q29sb3J9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBmZWF0dXJlcyA9IGdldChkYXRhLCAnZmVhdHVyZXMnKTtcbiAgICBjb25zdCBjb2xvcnMgPSB0aGlzLnN0YXRlLmNob3JvcGxldGhzLm1hcChcbiAgICAgIChjaG9yb3BsZXRoLCBjaG9yb3BsZXRoSW5kZXgpID0+IHtcbiAgICAgICAgY29uc3QgZmVhdHVyZSA9IGdldChmZWF0dXJlcywgY2hvcm9wbGV0aC5mZWF0dXJlSW5kZXgpO1xuICAgICAgICBjb25zdCBjb2xvciA9IGdldENvbG9yKGZlYXR1cmUpIHx8IERFRkFVTFRfQ09MT1I7XG4gICAgICAgIC8vIEVuc3VyZSBhbHBoYSBpcyBzZXRcbiAgICAgICAgaWYgKGlzTmFOKGNvbG9yWzNdKSkge1xuICAgICAgICAgIGNvbG9yWzNdID0gREVGQVVMVF9DT0xPUlszXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2hvcm9wbGV0aC5tYXAocG9seWdvbiA9PiBwb2x5Z29uLm1hcCh2ZXJ0ZXggPT4gY29sb3IpKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgYXR0cmlidXRlLnZhbHVlID0gbmV3IFVpbnQ4QXJyYXkoZmxhdHRlbihjb2xvcnMpKTtcbiAgfVxuXG4gIC8vIE92ZXJyaWRlIHRoZSBkZWZhdWx0IHBpY2tpbmcgY29sb3JzIGNhbGN1bGF0aW9uXG4gIGNhbGN1bGF0ZVBpY2tpbmdDb2xvcnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3QgY29sb3JzID0gdGhpcy5zdGF0ZS5jaG9yb3BsZXRocy5tYXAoXG4gICAgICAoY2hvcm9wbGV0aCwgY2hvcm9wbGV0aEluZGV4KSA9PiB7XG4gICAgICAgIGNvbnN0IHtmZWF0dXJlSW5kZXh9ID0gY2hvcm9wbGV0aDtcbiAgICAgICAgY29uc3QgY29sb3IgPSB0aGlzLnByb3BzLmRyYXdDb250b3VyID8gWzAsIDAsIDBdIDogW1xuICAgICAgICAgIChmZWF0dXJlSW5kZXggKyAxKSAlIDI1NixcbiAgICAgICAgICBNYXRoLmZsb29yKChmZWF0dXJlSW5kZXggKyAxKSAvIDI1NikgJSAyNTYsXG4gICAgICAgICAgTWF0aC5mbG9vcigoZmVhdHVyZUluZGV4ICsgMSkgLyAyNTYgLyAyNTYpICUgMjU2XG4gICAgICAgIF07XG4gICAgICAgIHJldHVybiBjaG9yb3BsZXRoLm1hcChwb2x5Z29uID0+IHBvbHlnb24ubWFwKHZlcnRleCA9PiBjb2xvcikpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICBhdHRyaWJ1dGUudmFsdWUgPSBuZXcgVWludDhBcnJheShmbGF0dGVuKGNvbG9ycykpO1xuICB9XG59XG5cbkNob3JvcGxldGhMYXllci5sYXllck5hbWUgPSAnQ2hvcm9wbGV0aExheWVyJztcbkNob3JvcGxldGhMYXllci5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG5cbi8qXG4gKiBnZXQgdmVydGV4IGluZGljZXMgZm9yIGRyYXdpbmcgY2hvcm9wbGV0aCBjb250b3VyXG4gKiBAcGFyYW0ge1tOdW1iZXIsTnVtYmVyLE51bWJlcl1bXVtdfSBjaG9yb3BsZXRoXG4gKiBAcmV0dXJucyB7W051bWJlcl19IGluZGljZXNcbiAqL1xuZnVuY3Rpb24gY2FsY3VsYXRlQ29udG91ckluZGljZXMoY2hvcm9wbGV0aCkge1xuICBsZXQgb2Zmc2V0ID0gMDtcblxuICByZXR1cm4gY2hvcm9wbGV0aC5yZWR1Y2UoKGFjYywgcG9seWdvbikgPT4ge1xuICAgIGNvbnN0IG51bVZlcnRpY2VzID0gcG9seWdvbi5sZW5ndGg7XG5cbiAgICAvLyB1c2UgdmVydGV4IHBhaXJzIGZvciBnbC5MSU5FUyA9PiBbMCwgMSwgMSwgMiwgMiwgLi4uLCBuLTIsIG4tMiwgbi0xXVxuICAgIGNvbnN0IGluZGljZXMgPSBbLi4uYWNjLCBvZmZzZXRdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbnVtVmVydGljZXMgLSAxOyBpKyspIHtcbiAgICAgIGluZGljZXMucHVzaChpICsgb2Zmc2V0LCBpICsgb2Zmc2V0KTtcbiAgICB9XG4gICAgaW5kaWNlcy5wdXNoKG9mZnNldCArIG51bVZlcnRpY2VzIC0gMSk7XG5cbiAgICBvZmZzZXQgKz0gbnVtVmVydGljZXM7XG4gICAgcmV0dXJuIGluZGljZXM7XG4gIH0sIFtdKTtcbn1cblxuLypcbiAqIGdldCB2ZXJ0ZXggaW5kaWNlcyBmb3IgZHJhd2luZyBjaG9yb3BsZXRoIG1lc2hcbiAqIEBwYXJhbSB7W051bWJlcixOdW1iZXIsTnVtYmVyXVtdW119IGNob3JvcGxldGhcbiAqIEByZXR1cm5zIHtbTnVtYmVyXX0gaW5kaWNlc1xuICovXG5mdW5jdGlvbiBjYWxjdWxhdGVTdXJmYWNlSW5kaWNlcyhjaG9yb3BsZXRoKSB7XG4gIGxldCBob2xlcyA9IG51bGw7XG5cbiAgaWYgKGNob3JvcGxldGgubGVuZ3RoID4gMSkge1xuICAgIGhvbGVzID0gY2hvcm9wbGV0aC5yZWR1Y2UoXG4gICAgICAoYWNjLCBwb2x5Z29uKSA9PiBbLi4uYWNjLCBhY2NbYWNjLmxlbmd0aCAtIDFdICsgcG9seWdvbi5sZW5ndGhdLFxuICAgICAgWzBdXG4gICAgKS5zbGljZSgxLCBjaG9yb3BsZXRoLmxlbmd0aCk7XG4gIH1cblxuICByZXR1cm4gZWFyY3V0KGZsYXR0ZW4oY2hvcm9wbGV0aCksIGhvbGVzLCAzKTtcbn1cbiJdfQ==