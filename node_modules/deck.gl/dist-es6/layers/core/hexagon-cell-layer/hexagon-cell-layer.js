var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

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
import { GL, Model, CylinderGeometry } from 'luma.gl';
import { log } from '../../../lib/utils';
import { fp64ify, enable64bitSupport } from '../../../lib/utils/fp64';
import { COORDINATE_SYSTEM } from '../../../lib';

import vs from './hexagon-cell-layer-vertex.glsl';
import vs64 from './hexagon-cell-layer-vertex-64.glsl';
import fs from './hexagon-cell-layer-fragment.glsl';

var DEFAULT_COLOR = [255, 0, 255, 255];

var defaultProps = {
  hexagonVertices: null,
  radius: null,
  angle: null,
  coverage: 1,
  elevationScale: 1,
  extruded: true,
  fp64: false,

  getCentroid: function getCentroid(x) {
    return x.centroid;
  },
  getColor: function getColor(x) {
    return x.color;
  },
  getElevation: function getElevation(x) {
    return x.elevation;
  },

  lightSettings: {
    lightsPosition: [-122.45, 37.75, 8000, -122.0, 38.00, 5000],
    ambientRatio: 0.4,
    diffuseRatio: 0.6,
    specularRatio: 0.8,
    lightsStrength: [1.2, 0.0, 0.8, 0.0],
    numberOfLights: 2
  }
};

var HexagonCellLayer = function (_Layer) {
  _inherits(HexagonCellLayer, _Layer);

  function HexagonCellLayer(props) {
    _classCallCheck(this, HexagonCellLayer);

    var missingProps = false;
    if (!props.hexagonVertices && (!props.radius || !Number.isFinite(props.angle))) {
      log.once(0, 'HexagonCellLayer: Either hexagonVertices or radius and angle are ' + 'needed to calculate primitive hexagon.');
      missingProps = true;
    } else if (props.hexagonVertices && (!Array.isArray(props.hexagonVertices) || props.hexagonVertices.length < 6)) {
      log.once(0, 'HexagonCellLayer: hexagonVertices needs to be an array of 6 points');

      missingProps = true;
    }

    if (missingProps) {
      log.once(0, 'Now using 1000 meter as default radius, 0 as default angle');
      props.radius = 1000;
      props.angle = 0;
    }

    return _possibleConstructorReturn(this, (HexagonCellLayer.__proto__ || Object.getPrototypeOf(HexagonCellLayer)).call(this, props));
  }

  _createClass(HexagonCellLayer, [{
    key: 'getShaders',
    value: function getShaders() {
      return enable64bitSupport(this.props) ? { vs: vs64, fs: fs, modules: ['project64', 'lighting'] } : { vs: vs, fs: fs, modules: ['lighting'] }; // 'project' module added by default.
    }

    /**
     * DeckGL calls initializeState when GL context is available
     * Essentially a deferred constructor
     */

  }, {
    key: 'initializeState',
    value: function initializeState() {
      var gl = this.context.gl;

      this.setState({ model: this._getModel(gl) });
      var attributeManager = this.state.attributeManager;
      /* eslint-disable max-len */

      attributeManager.addInstanced({
        instancePositions: { size: 3, accessor: ['getCentroid', 'getElevation'],
          update: this.calculateInstancePositions },
        instanceColors: { size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor',
          update: this.calculateInstanceColors }
      });
      /* eslint-enable max-len */
    }
  }, {
    key: 'updateAttribute',
    value: function updateAttribute(_ref) {
      var props = _ref.props,
          oldProps = _ref.oldProps,
          changeFlags = _ref.changeFlags;

      if (props.fp64 !== oldProps.fp64) {
        var attributeManager = this.state.attributeManager;

        attributeManager.invalidateAll();

        if (props.fp64 && props.projectionMode === COORDINATE_SYSTEM.LNGLAT) {
          attributeManager.addInstanced({
            instancePositions64xyLow: {
              size: 2,
              accessor: 'getCentroid',
              update: this.calculateInstancePositions64xyLow
            }
          });
        } else {
          attributeManager.remove(['instancePositions64xyLow']);
        }
      }
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref2) {
      var props = _ref2.props,
          oldProps = _ref2.oldProps,
          changeFlags = _ref2.changeFlags;

      _get(HexagonCellLayer.prototype.__proto__ || Object.getPrototypeOf(HexagonCellLayer.prototype), 'updateState', this).call(this, { props: props, oldProps: oldProps, changeFlags: changeFlags });
      if (props.fp64 !== oldProps.fp64) {
        var gl = this.context.gl;

        this.setState({ model: this._getModel(gl) });
      }
      this.updateAttribute({ props: props, oldProps: oldProps, changeFlags: changeFlags });

      this.updateUniforms();
    }
  }, {
    key: 'updateRadiusAngle',
    value: function updateRadiusAngle() {
      var angle = void 0;
      var radius = void 0;
      var hexagonVertices = this.props.hexagonVertices;


      if (Array.isArray(hexagonVertices) && hexagonVertices.length >= 6) {

        // calculate angle and vertices from hexagonVertices if provided
        var vertices = this.props.hexagonVertices;

        var vertex0 = vertices[0];
        var vertex3 = vertices[3];

        // transform to space coordinates
        var spaceCoord0 = this.projectFlat(vertex0);
        var spaceCoord3 = this.projectFlat(vertex3);

        // distance between two close centroids
        var dx = spaceCoord0[0] - spaceCoord3[0];
        var dy = spaceCoord0[1] - spaceCoord3[1];
        var dxy = Math.sqrt(dx * dx + dy * dy);

        // Calculate angle that the perpendicular hexagon vertex axis is tilted
        angle = Math.acos(dx / dxy) * -Math.sign(dy) + Math.PI / 2;
        radius = dxy / 2;
      } else if (this.props.radius && Number.isFinite(this.props.angle)) {

        // if no hexagonVertices provided, try use radius & angle
        var viewport = this.context.viewport;
        // TODO - this should be a standard uniform in project package

        var _viewport$getDistance = viewport.getDistanceScales(),
            pixelsPerMeter = _viewport$getDistance.pixelsPerMeter;

        angle = this.props.angle;
        radius = this.props.radius * pixelsPerMeter[0];
      }

      return { angle: angle, radius: radius };
    }
  }, {
    key: 'getCylinderGeometry',
    value: function getCylinderGeometry(radius) {
      return new CylinderGeometry({
        radius: radius,
        topRadius: radius,
        bottomRadius: radius,
        topCap: true,
        bottomCap: true,
        height: 1,
        nradial: 6,
        nvertical: 1
      });
    }
  }, {
    key: 'updateUniforms',
    value: function updateUniforms() {
      var _props = this.props,
          opacity = _props.opacity,
          elevationScale = _props.elevationScale,
          extruded = _props.extruded,
          coverage = _props.coverage,
          lightSettings = _props.lightSettings;


      this.setUniforms(Object.assign({}, {
        extruded: extruded,
        opacity: opacity,
        coverage: coverage,
        elevationScale: elevationScale
      }, lightSettings));
    }
  }, {
    key: '_getModel',
    value: function _getModel(gl) {
      return new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: this.getCylinderGeometry(1),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      }));
    }
  }, {
    key: 'draw',
    value: function draw(_ref3) {
      var uniforms = _ref3.uniforms;

      _get(HexagonCellLayer.prototype.__proto__ || Object.getPrototypeOf(HexagonCellLayer.prototype), 'draw', this).call(this, { uniforms: Object.assign(this.updateRadiusAngle(), uniforms) });
    }
  }, {
    key: 'calculateInstancePositions',
    value: function calculateInstancePositions(attribute) {
      var _props2 = this.props,
          data = _props2.data,
          getCentroid = _props2.getCentroid,
          getElevation = _props2.getElevation;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var object = _step.value;

          var _getCentroid = getCentroid(object),
              _getCentroid2 = _slicedToArray(_getCentroid, 2),
              lon = _getCentroid2[0],
              lat = _getCentroid2[1];

          var elevation = getElevation(object);
          value[i + 0] = lon;
          value[i + 1] = lat;
          value[i + 2] = elevation || 0;
          i += size;
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
    }
  }, {
    key: 'calculateInstancePositions64xyLow',
    value: function calculateInstancePositions64xyLow(attribute) {
      var _props3 = this.props,
          data = _props3.data,
          getCentroid = _props3.getCentroid;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var object = _step2.value;

          var position = getCentroid(object);
          value[i++] = fp64ify(position[0])[1];
          value[i++] = fp64ify(position[1])[1];
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
    }
  }, {
    key: 'calculateInstanceColors',
    value: function calculateInstanceColors(attribute) {
      var _props4 = this.props,
          data = _props4.data,
          getColor = _props4.getColor;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var object = _step3.value;

          var color = getColor(object) || DEFAULT_COLOR;

          value[i + 0] = color[0];
          value[i + 1] = color[1];
          value[i + 2] = color[2];
          value[i + 3] = Number.isFinite(color[3]) ? color[3] : DEFAULT_COLOR[3];
          i += size;
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }]);

  return HexagonCellLayer;
}(Layer);

export default HexagonCellLayer;


HexagonCellLayer.layerName = 'HexagonCellLayer';
HexagonCellLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYXllcnMvY29yZS9oZXhhZ29uLWNlbGwtbGF5ZXIvaGV4YWdvbi1jZWxsLWxheWVyLmpzIl0sIm5hbWVzIjpbIkxheWVyIiwiR0wiLCJNb2RlbCIsIkN5bGluZGVyR2VvbWV0cnkiLCJsb2ciLCJmcDY0aWZ5IiwiZW5hYmxlNjRiaXRTdXBwb3J0IiwiQ09PUkRJTkFURV9TWVNURU0iLCJ2cyIsInZzNjQiLCJmcyIsIkRFRkFVTFRfQ09MT1IiLCJkZWZhdWx0UHJvcHMiLCJoZXhhZ29uVmVydGljZXMiLCJyYWRpdXMiLCJhbmdsZSIsImNvdmVyYWdlIiwiZWxldmF0aW9uU2NhbGUiLCJleHRydWRlZCIsImZwNjQiLCJnZXRDZW50cm9pZCIsIngiLCJjZW50cm9pZCIsImdldENvbG9yIiwiY29sb3IiLCJnZXRFbGV2YXRpb24iLCJlbGV2YXRpb24iLCJsaWdodFNldHRpbmdzIiwibGlnaHRzUG9zaXRpb24iLCJhbWJpZW50UmF0aW8iLCJkaWZmdXNlUmF0aW8iLCJzcGVjdWxhclJhdGlvIiwibGlnaHRzU3RyZW5ndGgiLCJudW1iZXJPZkxpZ2h0cyIsIkhleGFnb25DZWxsTGF5ZXIiLCJwcm9wcyIsIm1pc3NpbmdQcm9wcyIsIk51bWJlciIsImlzRmluaXRlIiwib25jZSIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsIm1vZHVsZXMiLCJnbCIsImNvbnRleHQiLCJzZXRTdGF0ZSIsIm1vZGVsIiwiX2dldE1vZGVsIiwiYXR0cmlidXRlTWFuYWdlciIsInN0YXRlIiwiYWRkSW5zdGFuY2VkIiwiaW5zdGFuY2VQb3NpdGlvbnMiLCJzaXplIiwiYWNjZXNzb3IiLCJ1cGRhdGUiLCJjYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9ucyIsImluc3RhbmNlQ29sb3JzIiwidHlwZSIsIlVOU0lHTkVEX0JZVEUiLCJjYWxjdWxhdGVJbnN0YW5jZUNvbG9ycyIsIm9sZFByb3BzIiwiY2hhbmdlRmxhZ3MiLCJpbnZhbGlkYXRlQWxsIiwicHJvamVjdGlvbk1vZGUiLCJMTkdMQVQiLCJpbnN0YW5jZVBvc2l0aW9uczY0eHlMb3ciLCJjYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9uczY0eHlMb3ciLCJyZW1vdmUiLCJ1cGRhdGVBdHRyaWJ1dGUiLCJ1cGRhdGVVbmlmb3JtcyIsInZlcnRpY2VzIiwidmVydGV4MCIsInZlcnRleDMiLCJzcGFjZUNvb3JkMCIsInByb2plY3RGbGF0Iiwic3BhY2VDb29yZDMiLCJkeCIsImR5IiwiZHh5IiwiTWF0aCIsInNxcnQiLCJhY29zIiwic2lnbiIsIlBJIiwidmlld3BvcnQiLCJnZXREaXN0YW5jZVNjYWxlcyIsInBpeGVsc1Blck1ldGVyIiwidG9wUmFkaXVzIiwiYm90dG9tUmFkaXVzIiwidG9wQ2FwIiwiYm90dG9tQ2FwIiwiaGVpZ2h0IiwibnJhZGlhbCIsIm52ZXJ0aWNhbCIsIm9wYWNpdHkiLCJzZXRVbmlmb3JtcyIsIk9iamVjdCIsImFzc2lnbiIsImdldFNoYWRlcnMiLCJpZCIsImdlb21ldHJ5IiwiZ2V0Q3lsaW5kZXJHZW9tZXRyeSIsImlzSW5zdGFuY2VkIiwic2hhZGVyQ2FjaGUiLCJ1bmlmb3JtcyIsInVwZGF0ZVJhZGl1c0FuZ2xlIiwiYXR0cmlidXRlIiwiZGF0YSIsInZhbHVlIiwiaSIsIm9iamVjdCIsImxvbiIsImxhdCIsInBvc2l0aW9uIiwibGF5ZXJOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFRQSxLQUFSLFFBQW9CLGNBQXBCO0FBQ0EsU0FBUUMsRUFBUixFQUFZQyxLQUFaLEVBQW1CQyxnQkFBbkIsUUFBMEMsU0FBMUM7QUFDQSxTQUFRQyxHQUFSLFFBQWtCLG9CQUFsQjtBQUNBLFNBQVFDLE9BQVIsRUFBaUJDLGtCQUFqQixRQUEwQyx5QkFBMUM7QUFDQSxTQUFRQyxpQkFBUixRQUFn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QU0sQ0FBTixDQUFmO0FBQ0FxRixnQkFBTUMsSUFBSSxDQUFWLElBQWV0RixNQUFNLENBQU4sQ0FBZjtBQUNBcUYsZ0JBQU1DLElBQUksQ0FBVixJQUFldEYsTUFBTSxDQUFOLENBQWY7QUFDQXFGLGdCQUFNQyxJQUFJLENBQVYsSUFBZXpFLE9BQU9DLFFBQVAsQ0FBZ0JkLE1BQU0sQ0FBTixDQUFoQixJQUE0QkEsTUFBTSxDQUFOLENBQTVCLEdBQXVDYixjQUFjLENBQWQsQ0FBdEQ7QUFDQW1HLGVBQUt6RCxJQUFMO0FBQ0Q7QUFaZ0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWFsQzs7OztFQXRNMkNyRCxLOztlQUF6QmtDLGdCOzs7QUF5TXJCQSxpQkFBaUJpRixTQUFqQixHQUE2QixrQkFBN0I7QUFDQWpGLGlCQUFpQnRCLFlBQWpCLEdBQWdDQSxZQUFoQyIsImZpbGUiOiJoZXhhZ29uLWNlbGwtbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtMYXllcn0gZnJvbSAnLi4vLi4vLi4vbGliJztcbmltcG9ydCB7R0wsIE1vZGVsLCBDeWxpbmRlckdlb21ldHJ5fSBmcm9tICdsdW1hLmdsJztcbmltcG9ydCB7bG9nfSBmcm9tICcuLi8uLi8uLi9saWIvdXRpbHMnO1xuaW1wb3J0IHtmcDY0aWZ5LCBlbmFibGU2NGJpdFN1cHBvcnR9IGZyb20gJy4uLy4uLy4uL2xpYi91dGlscy9mcDY0JztcbmltcG9ydCB7Q09PUkRJTkFURV9TWVNURU19IGZyb20gJy4uLy4uLy4uL2xpYic7XG5cbmltcG9ydCB2cyBmcm9tICcuL2hleGFnb24tY2VsbC1sYXllci12ZXJ0ZXguZ2xzbCc7XG5pbXBvcnQgdnM2NCBmcm9tICcuL2hleGFnb24tY2VsbC1sYXllci12ZXJ0ZXgtNjQuZ2xzbCc7XG5pbXBvcnQgZnMgZnJvbSAnLi9oZXhhZ29uLWNlbGwtbGF5ZXItZnJhZ21lbnQuZ2xzbCc7XG5cbmNvbnN0IERFRkFVTFRfQ09MT1IgPSBbMjU1LCAwLCAyNTUsIDI1NV07XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgaGV4YWdvblZlcnRpY2VzOiBudWxsLFxuICByYWRpdXM6IG51bGwsXG4gIGFuZ2xlOiBudWxsLFxuICBjb3ZlcmFnZTogMSxcbiAgZWxldmF0aW9uU2NhbGU6IDEsXG4gIGV4dHJ1ZGVkOiB0cnVlLFxuICBmcDY0OiBmYWxzZSxcblxuICBnZXRDZW50cm9pZDogeCA9PiB4LmNlbnRyb2lkLFxuICBnZXRDb2xvcjogeCA9PiB4LmNvbG9yLFxuICBnZXRFbGV2YXRpb246IHggPT4geC5lbGV2YXRpb24sXG5cbiAgbGlnaHRTZXR0aW5nczoge1xuICAgIGxpZ2h0c1Bvc2l0aW9uOiBbLTEyMi40NSwgMzcuNzUsIDgwMDAsIC0xMjIuMCwgMzguMDAsIDUwMDBdLFxuICAgIGFtYmllbnRSYXRpbzogMC40LFxuICAgIGRpZmZ1c2VSYXRpbzogMC42LFxuICAgIHNwZWN1bGFyUmF0aW86IDAuOCxcbiAgICBsaWdodHNTdHJlbmd0aDogWzEuMiwgMC4wLCAwLjgsIDAuMF0sXG4gICAgbnVtYmVyT2ZMaWdodHM6IDJcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGV4YWdvbkNlbGxMYXllciBleHRlbmRzIExheWVyIHtcblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIGxldCBtaXNzaW5nUHJvcHMgPSBmYWxzZTtcbiAgICBpZiAoIXByb3BzLmhleGFnb25WZXJ0aWNlcyAmJiAoIXByb3BzLnJhZGl1cyB8fCAhTnVtYmVyLmlzRmluaXRlKHByb3BzLmFuZ2xlKSkpIHtcbiAgICAgIGxvZy5vbmNlKDAsICdIZXhhZ29uQ2VsbExheWVyOiBFaXRoZXIgaGV4YWdvblZlcnRpY2VzIG9yIHJhZGl1cyBhbmQgYW5nbGUgYXJlICcgK1xuICAgICAgICAnbmVlZGVkIHRvIGNhbGN1bGF0ZSBwcmltaXRpdmUgaGV4YWdvbi4nKTtcbiAgICAgIG1pc3NpbmdQcm9wcyA9IHRydWU7XG5cbiAgICB9IGVsc2UgaWYgKHByb3BzLmhleGFnb25WZXJ0aWNlcyAmJiAoIUFycmF5LmlzQXJyYXkocHJvcHMuaGV4YWdvblZlcnRpY2VzKSB8fFxuICAgICAgcHJvcHMuaGV4YWdvblZlcnRpY2VzLmxlbmd0aCA8IDYpKSB7XG4gICAgICBsb2cub25jZSgwLCAnSGV4YWdvbkNlbGxMYXllcjogaGV4YWdvblZlcnRpY2VzIG5lZWRzIHRvIGJlIGFuIGFycmF5IG9mIDYgcG9pbnRzJyk7XG5cbiAgICAgIG1pc3NpbmdQcm9wcyA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG1pc3NpbmdQcm9wcykge1xuICAgICAgbG9nLm9uY2UoMCwgJ05vdyB1c2luZyAxMDAwIG1ldGVyIGFzIGRlZmF1bHQgcmFkaXVzLCAwIGFzIGRlZmF1bHQgYW5nbGUnKTtcbiAgICAgIHByb3BzLnJhZGl1cyA9IDEwMDA7XG4gICAgICBwcm9wcy5hbmdsZSA9IDA7XG4gICAgfVxuXG4gICAgc3VwZXIocHJvcHMpO1xuICB9XG5cbiAgZ2V0U2hhZGVycygpIHtcbiAgICByZXR1cm4gZW5hYmxlNjRiaXRTdXBwb3J0KHRoaXMucHJvcHMpID9cbiAgICAgIHt2czogdnM2NCwgZnMsIG1vZHVsZXM6IFsncHJvamVjdDY0JywgJ2xpZ2h0aW5nJ119IDpcbiAgICAgIHt2cywgZnMsIG1vZHVsZXM6IFsnbGlnaHRpbmcnXX07IC8vICdwcm9qZWN0JyBtb2R1bGUgYWRkZWQgYnkgZGVmYXVsdC5cbiAgfVxuXG4gIC8qKlxuICAgKiBEZWNrR0wgY2FsbHMgaW5pdGlhbGl6ZVN0YXRlIHdoZW4gR0wgY29udGV4dCBpcyBhdmFpbGFibGVcbiAgICogRXNzZW50aWFsbHkgYSBkZWZlcnJlZCBjb25zdHJ1Y3RvclxuICAgKi9cbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIGNvbnN0IHtnbH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgdGhpcy5zZXRTdGF0ZSh7bW9kZWw6IHRoaXMuX2dldE1vZGVsKGdsKX0pO1xuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKHtcbiAgICAgIGluc3RhbmNlUG9zaXRpb25zOiB7c2l6ZTogMywgYWNjZXNzb3I6IFsnZ2V0Q2VudHJvaWQnLCAnZ2V0RWxldmF0aW9uJ10sXG4gICAgICAgIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9uc30sXG4gICAgICBpbnN0YW5jZUNvbG9yczoge3NpemU6IDQsIHR5cGU6IEdMLlVOU0lHTkVEX0JZVEUsIGFjY2Vzc29yOiAnZ2V0Q29sb3InLFxuICAgICAgICB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VDb2xvcnN9XG4gICAgfSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBtYXgtbGVuICovXG4gIH1cblxuICB1cGRhdGVBdHRyaWJ1dGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgaWYgKHByb3BzLmZwNjQgIT09IG9sZFByb3BzLmZwNjQpIHtcbiAgICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGVBbGwoKTtcblxuICAgICAgaWYgKHByb3BzLmZwNjQgJiYgcHJvcHMucHJvamVjdGlvbk1vZGUgPT09IENPT1JESU5BVEVfU1lTVEVNLkxOR0xBVCkge1xuICAgICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZEluc3RhbmNlZCh7XG4gICAgICAgICAgaW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93OiB7XG4gICAgICAgICAgICBzaXplOiAyLFxuICAgICAgICAgICAgYWNjZXNzb3I6ICdnZXRDZW50cm9pZCcsXG4gICAgICAgICAgICB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0dHJpYnV0ZU1hbmFnZXIucmVtb3ZlKFtcbiAgICAgICAgICAnaW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93J1xuICAgICAgICBdKTtcbiAgICAgIH1cblxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVN0YXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSkge1xuICAgIHN1cGVyLnVwZGF0ZVN0YXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSk7XG4gICAgaWYgKHByb3BzLmZwNjQgIT09IG9sZFByb3BzLmZwNjQpIHtcbiAgICAgIGNvbnN0IHtnbH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgICB0aGlzLnNldFN0YXRlKHttb2RlbDogdGhpcy5fZ2V0TW9kZWwoZ2wpfSk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQXR0cmlidXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSk7XG5cbiAgICB0aGlzLnVwZGF0ZVVuaWZvcm1zKCk7XG4gIH1cblxuICB1cGRhdGVSYWRpdXNBbmdsZSgpIHtcbiAgICBsZXQgYW5nbGU7XG4gICAgbGV0IHJhZGl1cztcbiAgICBjb25zdCB7aGV4YWdvblZlcnRpY2VzfSA9IHRoaXMucHJvcHM7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShoZXhhZ29uVmVydGljZXMpICYmIGhleGFnb25WZXJ0aWNlcy5sZW5ndGggPj0gNikge1xuXG4gICAgICAvLyBjYWxjdWxhdGUgYW5nbGUgYW5kIHZlcnRpY2VzIGZyb20gaGV4YWdvblZlcnRpY2VzIGlmIHByb3ZpZGVkXG4gICAgICBjb25zdCB2ZXJ0aWNlcyA9IHRoaXMucHJvcHMuaGV4YWdvblZlcnRpY2VzO1xuXG4gICAgICBjb25zdCB2ZXJ0ZXgwID0gdmVydGljZXNbMF07XG4gICAgICBjb25zdCB2ZXJ0ZXgzID0gdmVydGljZXNbM107XG5cbiAgICAgIC8vIHRyYW5zZm9ybSB0byBzcGFjZSBjb29yZGluYXRlc1xuICAgICAgY29uc3Qgc3BhY2VDb29yZDAgPSB0aGlzLnByb2plY3RGbGF0KHZlcnRleDApO1xuICAgICAgY29uc3Qgc3BhY2VDb29yZDMgPSB0aGlzLnByb2plY3RGbGF0KHZlcnRleDMpO1xuXG4gICAgICAvLyBkaXN0YW5jZSBiZXR3ZWVuIHR3byBjbG9zZSBjZW50cm9pZHNcbiAgICAgIGNvbnN0IGR4ID0gc3BhY2VDb29yZDBbMF0gLSBzcGFjZUNvb3JkM1swXTtcbiAgICAgIGNvbnN0IGR5ID0gc3BhY2VDb29yZDBbMV0gLSBzcGFjZUNvb3JkM1sxXTtcbiAgICAgIGNvbnN0IGR4eSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG5cbiAgICAgIC8vIENhbGN1bGF0ZSBhbmdsZSB0aGF0IHRoZSBwZXJwZW5kaWN1bGFyIGhleGFnb24gdmVydGV4IGF4aXMgaXMgdGlsdGVkXG4gICAgICBhbmdsZSA9IE1hdGguYWNvcyhkeCAvIGR4eSkgKiAtTWF0aC5zaWduKGR5KSArIE1hdGguUEkgLyAyO1xuICAgICAgcmFkaXVzID0gZHh5IC8gMjtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5yYWRpdXMgJiYgTnVtYmVyLmlzRmluaXRlKHRoaXMucHJvcHMuYW5nbGUpKSB7XG5cbiAgICAgIC8vIGlmIG5vIGhleGFnb25WZXJ0aWNlcyBwcm92aWRlZCwgdHJ5IHVzZSByYWRpdXMgJiBhbmdsZVxuICAgICAgY29uc3Qge3ZpZXdwb3J0fSA9IHRoaXMuY29udGV4dDtcbiAgICAgIC8vIFRPRE8gLSB0aGlzIHNob3VsZCBiZSBhIHN0YW5kYXJkIHVuaWZvcm0gaW4gcHJvamVjdCBwYWNrYWdlXG4gICAgICBjb25zdCB7cGl4ZWxzUGVyTWV0ZXJ9ID0gdmlld3BvcnQuZ2V0RGlzdGFuY2VTY2FsZXMoKTtcblxuICAgICAgYW5nbGUgPSB0aGlzLnByb3BzLmFuZ2xlO1xuICAgICAgcmFkaXVzID0gdGhpcy5wcm9wcy5yYWRpdXMgKiBwaXhlbHNQZXJNZXRlclswXTtcbiAgICB9XG5cbiAgICByZXR1cm4ge2FuZ2xlLCByYWRpdXN9O1xuICB9XG5cbiAgZ2V0Q3lsaW5kZXJHZW9tZXRyeShyYWRpdXMpIHtcbiAgICByZXR1cm4gbmV3IEN5bGluZGVyR2VvbWV0cnkoe1xuICAgICAgcmFkaXVzLFxuICAgICAgdG9wUmFkaXVzOiByYWRpdXMsXG4gICAgICBib3R0b21SYWRpdXM6IHJhZGl1cyxcbiAgICAgIHRvcENhcDogdHJ1ZSxcbiAgICAgIGJvdHRvbUNhcDogdHJ1ZSxcbiAgICAgIGhlaWdodDogMSxcbiAgICAgIG5yYWRpYWw6IDYsXG4gICAgICBudmVydGljYWw6IDFcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVVuaWZvcm1zKCkge1xuICAgIGNvbnN0IHtvcGFjaXR5LCBlbGV2YXRpb25TY2FsZSwgZXh0cnVkZWQsIGNvdmVyYWdlLCBsaWdodFNldHRpbmdzfSA9IHRoaXMucHJvcHM7XG5cbiAgICB0aGlzLnNldFVuaWZvcm1zKE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgIGV4dHJ1ZGVkLFxuICAgICAgb3BhY2l0eSxcbiAgICAgIGNvdmVyYWdlLFxuICAgICAgZWxldmF0aW9uU2NhbGVcbiAgICB9LFxuICAgIGxpZ2h0U2V0dGluZ3MpKTtcbiAgfVxuXG4gIF9nZXRNb2RlbChnbCkge1xuICAgIHJldHVybiBuZXcgTW9kZWwoZ2wsIE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U2hhZGVycygpLCB7XG4gICAgICBpZDogdGhpcy5wcm9wcy5pZCxcbiAgICAgIGdlb21ldHJ5OiB0aGlzLmdldEN5bGluZGVyR2VvbWV0cnkoMSksXG4gICAgICBpc0luc3RhbmNlZDogdHJ1ZSxcbiAgICAgIHNoYWRlckNhY2hlOiB0aGlzLmNvbnRleHQuc2hhZGVyQ2FjaGVcbiAgICB9KSk7XG4gIH1cblxuICBkcmF3KHt1bmlmb3Jtc30pIHtcbiAgICBzdXBlci5kcmF3KHt1bmlmb3JtczogT2JqZWN0LmFzc2lnbih0aGlzLnVwZGF0ZVJhZGl1c0FuZ2xlKCksIHVuaWZvcm1zKX0pO1xuICB9XG5cbiAgY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldENlbnRyb2lkLCBnZXRFbGV2YXRpb259ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IG9iamVjdCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCBbbG9uLCBsYXRdID0gZ2V0Q2VudHJvaWQob2JqZWN0KTtcbiAgICAgIGNvbnN0IGVsZXZhdGlvbiA9IGdldEVsZXZhdGlvbihvYmplY3QpO1xuICAgICAgdmFsdWVbaSArIDBdID0gbG9uO1xuICAgICAgdmFsdWVbaSArIDFdID0gbGF0O1xuICAgICAgdmFsdWVbaSArIDJdID0gZWxldmF0aW9uIHx8IDA7XG4gICAgICBpICs9IHNpemU7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93KGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRDZW50cm9pZH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gZ2V0Q2VudHJvaWQob2JqZWN0KTtcbiAgICAgIHZhbHVlW2krK10gPSBmcDY0aWZ5KHBvc2l0aW9uWzBdKVsxXTtcbiAgICAgIHZhbHVlW2krK10gPSBmcDY0aWZ5KHBvc2l0aW9uWzFdKVsxXTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVJbnN0YW5jZUNvbG9ycyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ2V0Q29sb3J9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IG9iamVjdCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCBjb2xvciA9IGdldENvbG9yKG9iamVjdCkgfHwgREVGQVVMVF9DT0xPUjtcblxuICAgICAgdmFsdWVbaSArIDBdID0gY29sb3JbMF07XG4gICAgICB2YWx1ZVtpICsgMV0gPSBjb2xvclsxXTtcbiAgICAgIHZhbHVlW2kgKyAyXSA9IGNvbG9yWzJdO1xuICAgICAgdmFsdWVbaSArIDNdID0gTnVtYmVyLmlzRmluaXRlKGNvbG9yWzNdKSA/IGNvbG9yWzNdIDogREVGQVVMVF9DT0xPUlszXTtcbiAgICAgIGkgKz0gc2l6ZTtcbiAgICB9XG4gIH1cbn1cblxuSGV4YWdvbkNlbGxMYXllci5sYXllck5hbWUgPSAnSGV4YWdvbkNlbGxMYXllcic7XG5IZXhhZ29uQ2VsbExheWVyLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbiJdfQ==