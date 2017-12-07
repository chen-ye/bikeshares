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
import { GL, Model, Geometry } from 'luma.gl';
import { fp64ify, enable64bitSupport } from '../../../lib/utils/fp64';
import { COORDINATE_SYSTEM } from '../../../lib';

import vs from './point-cloud-layer-vertex.glsl';
import vs64 from './point-cloud-layer-vertex-64.glsl';
import fs from './point-cloud-layer-fragment.glsl';

var DEFAULT_COLOR = [0, 0, 0, 255];

var defaultProps = {
  radiusPixels: 10, //  point radius in pixels
  fp64: false,

  getPosition: function getPosition(x) {
    return x.position;
  },
  getNormal: function getNormal(x) {
    return x.normal;
  },
  getColor: function getColor(x) {
    return x.color || DEFAULT_COLOR;
  },

  lightSettings: {
    lightsPosition: [0, 0, 5000, -1000, 1000, 8000, 5000, -5000, 1000],
    ambientRatio: 0.2,
    diffuseRatio: 0.6,
    specularRatio: 0.8,
    lightsStrength: [1.0, 0.0, 0.8, 0.0, 0.4, 0.0],
    numberOfLights: 3
  }
};

var PointCloudLayer = function (_Layer) {
  _inherits(PointCloudLayer, _Layer);

  function PointCloudLayer() {
    _classCallCheck(this, PointCloudLayer);

    return _possibleConstructorReturn(this, (PointCloudLayer.__proto__ || Object.getPrototypeOf(PointCloudLayer)).apply(this, arguments));
  }

  _createClass(PointCloudLayer, [{
    key: 'getShaders',
    value: function getShaders(id) {
      var shaderCache = this.context.shaderCache;

      return enable64bitSupport(this.props) ? { vs: vs64, fs: fs, modules: ['project64', 'lighting'], shaderCache: shaderCache } : { vs: vs, fs: fs, modules: ['lighting'], shaderCache: shaderCache }; // 'project' module added by default.
    }
  }, {
    key: 'initializeState',
    value: function initializeState() {
      var gl = this.context.gl;

      this.setState({ model: this._getModel(gl) });

      /* eslint-disable max-len */
      this.state.attributeManager.addInstanced({
        instancePositions: { size: 3, accessor: 'getPosition', update: this.calculateInstancePositions },
        instanceNormals: { size: 3, accessor: 'getNormal', defaultValue: 1, update: this.calculateInstanceNormals },
        instanceColors: { size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateInstanceColors }
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
              accessor: 'getPosition',
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

      _get(PointCloudLayer.prototype.__proto__ || Object.getPrototypeOf(PointCloudLayer.prototype), 'updateState', this).call(this, { props: props, oldProps: oldProps, changeFlags: changeFlags });
      if (props.fp64 !== oldProps.fp64) {
        var gl = this.context.gl;

        this.setState({ model: this._getModel(gl) });
      }
      this.updateAttribute({ props: props, oldProps: oldProps, changeFlags: changeFlags });
    }
  }, {
    key: 'draw',
    value: function draw(_ref3) {
      var uniforms = _ref3.uniforms;
      var _props = this.props,
          radiusPixels = _props.radiusPixels,
          lightSettings = _props.lightSettings;

      this.state.model.render(Object.assign({}, uniforms, {
        radiusPixels: radiusPixels
      }, lightSettings));
    }
  }, {
    key: '_getModel',
    value: function _getModel(gl) {
      // a triangle that minimally cover the unit circle
      var positions = [];
      for (var i = 0; i < 3; i++) {
        var angle = i / 3 * Math.PI * 2;
        positions.push(Math.cos(angle) * 2, Math.sin(angle) * 2, 0);
      }

      return new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLES,
          positions: new Float32Array(positions)
        }),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      }));
    }
  }, {
    key: 'calculateInstancePositions',
    value: function calculateInstancePositions(attribute) {
      var _props2 = this.props,
          data = _props2.data,
          getPosition = _props2.getPosition;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var point = _step.value;

          var position = getPosition(point);
          value[i++] = position[0];
          value[i++] = position[1];
          value[i++] = position[2] || 0;
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
          getPosition = _props3.getPosition;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var point = _step2.value;

          var position = getPosition(point);
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
    key: 'calculateInstanceNormals',
    value: function calculateInstanceNormals(attribute) {
      var _props4 = this.props,
          data = _props4.data,
          getNormal = _props4.getNormal;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var point = _step3.value;

          var normal = getNormal(point);
          value[i++] = normal[0];
          value[i++] = normal[1];
          value[i++] = normal[2];
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
  }, {
    key: 'calculateInstanceColors',
    value: function calculateInstanceColors(attribute) {
      var _props5 = this.props,
          data = _props5.data,
          getColor = _props5.getColor;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = data[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var point = _step4.value;

          var color = getColor(point);
          value[i++] = color[0];
          value[i++] = color[1];
          value[i++] = color[2];
          value[i++] = isNaN(color[3]) ? 255 : color[3];
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }]);

  return PointCloudLayer;
}(Layer);

export default PointCloudLayer;


PointCloudLayer.layerName = 'PointCloudLayer';
PointCloudLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYXllcnMvY29yZS9wb2ludC1jbG91ZC1sYXllci9wb2ludC1jbG91ZC1sYXllci5qcyJdLCJuYW1lcyI6WyJMYXllciIsIkdMIiwiTW9kZWwiLCJHZW9tZXRyeSIsImZwNjRpZnkiLCJlbmFibGU2NGJpdFN1cHBvcnQiLCJDT09SRElOQVRFX1NZU1RFTSIsInZzIiwidnM2NCIsImZzIiwiREVGQVVMVF9DT0xPUiIsImRlZmF1bHRQcm9wcyIsInJhZGl1c1BpeGVscyIsImZwNjQiLCJnZXRQb3NpdGlvbiIsIngiLCJwb3NpdGlvbiIsImdldE5vcm1hbCIsIm5vcm1hbCIsImdldENvbG9yIiwiY29sb3IiLCJsaWdodFNldHRpbmdzIiwibGlnaHRzUG9zaXRpb24iLCJhbWJpZW50UmF0aW8iLCJkaWZmdXNlUmF0aW8iLCJzcGVjdWxhclJhdGlvIiwibGlnaHRzU3RyZW5ndGgiLCJudW1iZXJPZkxpZ2h0cyIsIlBvaW50Q2xvdWRMYXllciIsImlkIiwic2hhZGVyQ2FjaGUiLCJjb250ZXh0IiwicHJvcHMiLCJtb2R1bGVzIiwiZ2wiLCJzZXRTdGF0ZSIsIm1vZGVsIiwiX2dldE1vZGVsIiwic3RhdGUiLCJhdHRyaWJ1dGVNYW5hZ2VyIiwiYWRkSW5zdGFuY2VkIiwiaW5zdGFuY2VQb3NpdGlvbnMiLCJzaXplIiwiYWNjZXNzb3IiLCJ1cGRhdGUiLCJjYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9ucyIsImluc3RhbmNlTm9ybWFscyIsImRlZmF1bHRWYWx1ZSIsImNhbGN1bGF0ZUluc3RhbmNlTm9ybWFscyIsImluc3RhbmNlQ29sb3JzIiwidHlwZSIsIlVOU0lHTkVEX0JZVEUiLCJjYWxjdWxhdGVJbnN0YW5jZUNvbG9ycyIsIm9sZFByb3BzIiwiY2hhbmdlRmxhZ3MiLCJpbnZhbGlkYXRlQWxsIiwicHJvamVjdGlvbk1vZGUiLCJMTkdMQVQiLCJpbnN0YW5jZVBvc2l0aW9uczY0eHlMb3ciLCJjYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9uczY0eHlMb3ciLCJyZW1vdmUiLCJ1cGRhdGVBdHRyaWJ1dGUiLCJ1bmlmb3JtcyIsInJlbmRlciIsIk9iamVjdCIsImFzc2lnbiIsInBvc2l0aW9ucyIsImkiLCJhbmdsZSIsIk1hdGgiLCJQSSIsInB1c2giLCJjb3MiLCJzaW4iLCJnZXRTaGFkZXJzIiwiZ2VvbWV0cnkiLCJkcmF3TW9kZSIsIlRSSUFOR0xFUyIsIkZsb2F0MzJBcnJheSIsImlzSW5zdGFuY2VkIiwiYXR0cmlidXRlIiwiZGF0YSIsInZhbHVlIiwicG9pbnQiLCJpc05hTiIsImxheWVyTmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVFBLEtBQVIsUUFBb0IsY0FBcEI7QUFDQSxTQUFRQyxFQUFSLEVBQVlDLEtBQVosRUFBbUJDLFFBQW5CLFFBQWtDLFNBQWxDO0FBQ0EsU0FBUUMsT0FBUixFQUFpQkMsa0JBQWpCLFFBQTBDLHlCQUExQztBQUNBLFNBQVFDLGlCQUFSLFFBQWdDLGNBQWhDOztBQUVBLE9BQU9DLEVBQVAsTUFBZSxpQ0FBZjtBQUNBLE9BQU9DLElBQVAsTUFBaUIsb0NBQWpCO0FBQ0EsT0FBT0MsRUFBUCxNQUFlLG1DQUFmOztBQUVBLElBQU1DLGdCQUFnQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLEdBQVYsQ0FBdEI7O0FBRUEsSUFBTUMsZUFBZTtBQUNuQkMsZ0JBQWMsRUFESyxFQUNBO0FBQ25CQyxRQUFNLEtBRmE7O0FBSW5CQyxlQUFhO0FBQUEsV0FBS0MsRUFBRUMsUUFBUDtBQUFBLEdBSk07QUFLbkJDLGFBQVc7QUFBQSxXQUFLRixFQUFFRyxNQUFQO0FBQUEsR0FMUTtBQU1uQkMsWUFBVTtBQUFBLFdBQUtKLEVBQUVLLEtBQUYsSUFBV1YsYUFBaEI7QUFBQSxHQU5TOztBQVFuQlcsaUJBQWU7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U2dFLEtBQVQsQ0FBZDtBQUNBRCxnQkFBTWYsR0FBTixJQUFhL0MsTUFBTSxDQUFOLENBQWI7QUFDQThELGdCQUFNZixHQUFOLElBQWEvQyxNQUFNLENBQU4sQ0FBYjtBQUNBOEQsZ0JBQU1mLEdBQU4sSUFBYS9DLE1BQU0sQ0FBTixDQUFiO0FBQ0E4RCxnQkFBTWYsR0FBTixJQUFhaUIsTUFBTWhFLE1BQU0sQ0FBTixDQUFOLElBQWtCLEdBQWxCLEdBQXdCQSxNQUFNLENBQU4sQ0FBckM7QUFDRDtBQVZnQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBV2xDOzs7O0VBaEkwQ3BCLEs7O2VBQXhCNEIsZTs7O0FBbUlyQkEsZ0JBQWdCeUQsU0FBaEIsR0FBNEIsaUJBQTVCO0FBQ0F6RCxnQkFBZ0JqQixZQUFoQixHQUErQkEsWUFBL0IiLCJmaWxlIjoicG9pbnQtY2xvdWQtbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtMYXllcn0gZnJvbSAnLi4vLi4vLi4vbGliJztcbmltcG9ydCB7R0wsIE1vZGVsLCBHZW9tZXRyeX0gZnJvbSAnbHVtYS5nbCc7XG5pbXBvcnQge2ZwNjRpZnksIGVuYWJsZTY0Yml0U3VwcG9ydH0gZnJvbSAnLi4vLi4vLi4vbGliL3V0aWxzL2ZwNjQnO1xuaW1wb3J0IHtDT09SRElOQVRFX1NZU1RFTX0gZnJvbSAnLi4vLi4vLi4vbGliJztcblxuaW1wb3J0IHZzIGZyb20gJy4vcG9pbnQtY2xvdWQtbGF5ZXItdmVydGV4Lmdsc2wnO1xuaW1wb3J0IHZzNjQgZnJvbSAnLi9wb2ludC1jbG91ZC1sYXllci12ZXJ0ZXgtNjQuZ2xzbCc7XG5pbXBvcnQgZnMgZnJvbSAnLi9wb2ludC1jbG91ZC1sYXllci1mcmFnbWVudC5nbHNsJztcblxuY29uc3QgREVGQVVMVF9DT0xPUiA9IFswLCAwLCAwLCAyNTVdO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIHJhZGl1c1BpeGVsczogMTAsICAvLyAgcG9pbnQgcmFkaXVzIGluIHBpeGVsc1xuICBmcDY0OiBmYWxzZSxcblxuICBnZXRQb3NpdGlvbjogeCA9PiB4LnBvc2l0aW9uLFxuICBnZXROb3JtYWw6IHggPT4geC5ub3JtYWwsXG4gIGdldENvbG9yOiB4ID0+IHguY29sb3IgfHwgREVGQVVMVF9DT0xPUixcblxuICBsaWdodFNldHRpbmdzOiB7XG4gICAgbGlnaHRzUG9zaXRpb246IFswLCAwLCA1MDAwLCAtMTAwMCwgMTAwMCwgODAwMCwgNTAwMCwgLTUwMDAsIDEwMDBdLFxuICAgIGFtYmllbnRSYXRpbzogMC4yLFxuICAgIGRpZmZ1c2VSYXRpbzogMC42LFxuICAgIHNwZWN1bGFyUmF0aW86IDAuOCxcbiAgICBsaWdodHNTdHJlbmd0aDogWzEuMCwgMC4wLCAwLjgsIDAuMCwgMC40LCAwLjBdLFxuICAgIG51bWJlck9mTGlnaHRzOiAzXG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBvaW50Q2xvdWRMYXllciBleHRlbmRzIExheWVyIHtcbiAgZ2V0U2hhZGVycyhpZCkge1xuICAgIGNvbnN0IHtzaGFkZXJDYWNoZX0gPSB0aGlzLmNvbnRleHQ7XG4gICAgcmV0dXJuIGVuYWJsZTY0Yml0U3VwcG9ydCh0aGlzLnByb3BzKSA/XG4gICAgICB7dnM6IHZzNjQsIGZzLCBtb2R1bGVzOiBbJ3Byb2plY3Q2NCcsICdsaWdodGluZyddLCBzaGFkZXJDYWNoZX0gOlxuICAgICAge3ZzLCBmcywgbW9kdWxlczogWydsaWdodGluZyddLCBzaGFkZXJDYWNoZX07IC8vICdwcm9qZWN0JyBtb2R1bGUgYWRkZWQgYnkgZGVmYXVsdC5cbiAgfVxuXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICBjb25zdCB7Z2x9ID0gdGhpcy5jb250ZXh0O1xuICAgIHRoaXMuc2V0U3RhdGUoe21vZGVsOiB0aGlzLl9nZXRNb2RlbChnbCl9KTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG1heC1sZW4gKi9cbiAgICB0aGlzLnN0YXRlLmF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKHtcbiAgICAgIGluc3RhbmNlUG9zaXRpb25zOiB7c2l6ZTogMywgYWNjZXNzb3I6ICdnZXRQb3NpdGlvbicsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9uc30sXG4gICAgICBpbnN0YW5jZU5vcm1hbHM6IHtzaXplOiAzLCBhY2Nlc3NvcjogJ2dldE5vcm1hbCcsIGRlZmF1bHRWYWx1ZTogMSwgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlTm9ybWFsc30sXG4gICAgICBpbnN0YW5jZUNvbG9yczoge3NpemU6IDQsIHR5cGU6IEdMLlVOU0lHTkVEX0JZVEUsIGFjY2Vzc29yOiAnZ2V0Q29sb3InLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VDb2xvcnN9XG4gICAgfSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBtYXgtbGVuICovXG4gIH1cblxuICB1cGRhdGVBdHRyaWJ1dGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgaWYgKHByb3BzLmZwNjQgIT09IG9sZFByb3BzLmZwNjQpIHtcbiAgICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGVBbGwoKTtcblxuICAgICAgaWYgKHByb3BzLmZwNjQgJiYgcHJvcHMucHJvamVjdGlvbk1vZGUgPT09IENPT1JESU5BVEVfU1lTVEVNLkxOR0xBVCkge1xuICAgICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZEluc3RhbmNlZCh7XG4gICAgICAgICAgaW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93OiB7XG4gICAgICAgICAgICBzaXplOiAyLFxuICAgICAgICAgICAgYWNjZXNzb3I6ICdnZXRQb3NpdGlvbicsXG4gICAgICAgICAgICB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0dHJpYnV0ZU1hbmFnZXIucmVtb3ZlKFtcbiAgICAgICAgICAnaW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93J1xuICAgICAgICBdKTtcbiAgICAgIH1cblxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVN0YXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSkge1xuICAgIHN1cGVyLnVwZGF0ZVN0YXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSk7XG4gICAgaWYgKHByb3BzLmZwNjQgIT09IG9sZFByb3BzLmZwNjQpIHtcbiAgICAgIGNvbnN0IHtnbH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgICB0aGlzLnNldFN0YXRlKHttb2RlbDogdGhpcy5fZ2V0TW9kZWwoZ2wpfSk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQXR0cmlidXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSk7XG4gIH1cblxuICBkcmF3KHt1bmlmb3Jtc30pIHtcbiAgICBjb25zdCB7cmFkaXVzUGl4ZWxzLCBsaWdodFNldHRpbmdzfSA9IHRoaXMucHJvcHM7XG4gICAgdGhpcy5zdGF0ZS5tb2RlbC5yZW5kZXIoT2JqZWN0LmFzc2lnbih7fSwgdW5pZm9ybXMsIHtcbiAgICAgIHJhZGl1c1BpeGVsc1xuICAgIH0sIGxpZ2h0U2V0dGluZ3MpKTtcbiAgfVxuXG4gIF9nZXRNb2RlbChnbCkge1xuICAgIC8vIGEgdHJpYW5nbGUgdGhhdCBtaW5pbWFsbHkgY292ZXIgdGhlIHVuaXQgY2lyY2xlXG4gICAgY29uc3QgcG9zaXRpb25zID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgIGNvbnN0IGFuZ2xlID0gaSAvIDMgKiBNYXRoLlBJICogMjtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKFxuICAgICAgICBNYXRoLmNvcyhhbmdsZSkgKiAyLFxuICAgICAgICBNYXRoLnNpbihhbmdsZSkgKiAyLFxuICAgICAgICAwXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgTW9kZWwoZ2wsIE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U2hhZGVycygpLCB7XG4gICAgICBpZDogdGhpcy5wcm9wcy5pZCxcbiAgICAgIGdlb21ldHJ5OiBuZXcgR2VvbWV0cnkoe1xuICAgICAgICBkcmF3TW9kZTogR0wuVFJJQU5HTEVTLFxuICAgICAgICBwb3NpdGlvbnM6IG5ldyBGbG9hdDMyQXJyYXkocG9zaXRpb25zKVxuICAgICAgfSksXG4gICAgICBpc0luc3RhbmNlZDogdHJ1ZSxcbiAgICAgIHNoYWRlckNhY2hlOiB0aGlzLmNvbnRleHQuc2hhZGVyQ2FjaGVcbiAgICB9KSk7XG4gIH1cblxuICBjYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9ucyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ2V0UG9zaXRpb259ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gZ2V0UG9zaXRpb24ocG9pbnQpO1xuICAgICAgdmFsdWVbaSsrXSA9IHBvc2l0aW9uWzBdO1xuICAgICAgdmFsdWVbaSsrXSA9IHBvc2l0aW9uWzFdO1xuICAgICAgdmFsdWVbaSsrXSA9IHBvc2l0aW9uWzJdIHx8IDA7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93KGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRQb3NpdGlvbn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgZGF0YSkge1xuICAgICAgY29uc3QgcG9zaXRpb24gPSBnZXRQb3NpdGlvbihwb2ludCk7XG4gICAgICB2YWx1ZVtpKytdID0gZnA2NGlmeShwb3NpdGlvblswXSlbMV07XG4gICAgICB2YWx1ZVtpKytdID0gZnA2NGlmeShwb3NpdGlvblsxXSlbMV07XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlSW5zdGFuY2VOb3JtYWxzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXROb3JtYWx9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IG5vcm1hbCA9IGdldE5vcm1hbChwb2ludCk7XG4gICAgICB2YWx1ZVtpKytdID0gbm9ybWFsWzBdO1xuICAgICAgdmFsdWVbaSsrXSA9IG5vcm1hbFsxXTtcbiAgICAgIHZhbHVlW2krK10gPSBub3JtYWxbMl07XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlSW5zdGFuY2VDb2xvcnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldENvbG9yfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCBjb2xvciA9IGdldENvbG9yKHBvaW50KTtcbiAgICAgIHZhbHVlW2krK10gPSBjb2xvclswXTtcbiAgICAgIHZhbHVlW2krK10gPSBjb2xvclsxXTtcbiAgICAgIHZhbHVlW2krK10gPSBjb2xvclsyXTtcbiAgICAgIHZhbHVlW2krK10gPSBpc05hTihjb2xvclszXSkgPyAyNTUgOiBjb2xvclszXTtcbiAgICB9XG4gIH1cbn1cblxuUG9pbnRDbG91ZExheWVyLmxheWVyTmFtZSA9ICdQb2ludENsb3VkTGF5ZXInO1xuUG9pbnRDbG91ZExheWVyLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbiJdfQ==