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
import { GL, Model, CubeGeometry } from 'luma.gl';
import { fp64ify, enable64bitSupport } from '../../../lib/utils/fp64';
import { COORDINATE_SYSTEM } from '../../../lib';

import vs from './grid-cell-layer-vertex.glsl';
import vs64 from './grid-cell-layer-vertex-64.glsl';
import fs from './grid-cell-layer-fragment.glsl';

var DEFAULT_COLOR = [255, 0, 255, 255];

var defaultProps = {
  cellSize: 1000,
  coverage: 1,
  elevationScale: 1,
  extruded: true,
  fp64: false,

  getPosition: function getPosition(x) {
    return x.position;
  },
  getElevation: function getElevation(x) {
    return x.elevation;
  },
  getColor: function getColor(x) {
    return x.color;
  },

  lightSettings: {
    lightsPosition: [-122.45, 37.65, 8000, -122.45, 37.20, 1000],
    ambientRatio: 0.4,
    diffuseRatio: 0.6,
    specularRatio: 0.8,
    lightsStrength: [1.0, 0.0, 0.8, 0.0],
    numberOfLights: 2
  }
};

var GridCellLayer = function (_Layer) {
  _inherits(GridCellLayer, _Layer);

  function GridCellLayer() {
    _classCallCheck(this, GridCellLayer);

    return _possibleConstructorReturn(this, (GridCellLayer.__proto__ || Object.getPrototypeOf(GridCellLayer)).apply(this, arguments));
  }

  _createClass(GridCellLayer, [{
    key: 'getShaders',

    /**
     * A generic GridLayer that takes latitude longitude delta of cells as a uniform
     * and the min lat lng of cells. grid can be 3d when pass in a height
     * and set enable3d to true
     *
     * @param {array} props.data -
     * @param {boolean} props.extruded - enable grid elevation
     * @param {number} props.cellSize - grid cell size in meters
     * @param {function} props.getPosition - position accessor, returned as [minLng, minLat]
     * @param {function} props.getElevation - elevation accessor
     * @param {function} props.getColor - color accessor, returned as [r, g, b, a]
     */

    value: function getShaders() {
      var shaderCache = this.context.shaderCache;

      return enable64bitSupport(this.props) ? { vs: vs64, fs: fs, modules: ['project64', 'lighting'], shaderCache: shaderCache } : { vs: vs, fs: fs, modules: ['lighting'], shaderCache: shaderCache }; // 'project' module added by default.
    }
  }, {
    key: 'initializeState',
    value: function initializeState() {
      var gl = this.context.gl;

      this.setState({ model: this._getModel(gl) });

      var attributeManager = this.state.attributeManager;
      /* eslint-disable max-len */

      attributeManager.addInstanced({
        instancePositions: { size: 4, accessor: ['getPosition', 'getElevation'], update: this.calculateInstancePositions },
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

      _get(GridCellLayer.prototype.__proto__ || Object.getPrototypeOf(GridCellLayer.prototype), 'updateState', this).call(this, { props: props, oldProps: oldProps, changeFlags: changeFlags });
      // Re-generate model if geometry changed
      if (props.fp64 !== oldProps.fp64) {
        var gl = this.context.gl;

        this.setState({ model: this._getModel(gl) });
      }
      this.updateAttribute({ props: props, oldProps: oldProps, changeFlags: changeFlags });
      this.updateUniforms();
    }
  }, {
    key: '_getModel',
    value: function _getModel(gl) {
      return new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new CubeGeometry(),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      }));
    }
  }, {
    key: 'updateUniforms',
    value: function updateUniforms() {
      var _props = this.props,
          opacity = _props.opacity,
          extruded = _props.extruded,
          elevationScale = _props.elevationScale,
          coverage = _props.coverage,
          lightSettings = _props.lightSettings;


      this.setUniforms(Object.assign({}, {
        extruded: extruded,
        elevationScale: elevationScale,
        opacity: opacity,
        coverage: coverage
      }, lightSettings));
    }
  }, {
    key: 'draw',
    value: function draw(_ref3) {
      var uniforms = _ref3.uniforms;
      var viewport = this.context.viewport;
      // TODO - this should be a standard uniform in project package

      var _viewport$getDistance = viewport.getDistanceScales(),
          pixelsPerMeter = _viewport$getDistance.pixelsPerMeter;

      // cellSize needs to be updated on every draw call
      // because it is based on viewport


      _get(GridCellLayer.prototype.__proto__ || Object.getPrototypeOf(GridCellLayer.prototype), 'draw', this).call(this, { uniforms: Object.assign({
          cellSize: this.props.cellSize * pixelsPerMeter[0]
        }, uniforms) });
    }
  }, {
    key: 'calculateInstancePositions',
    value: function calculateInstancePositions(attribute) {
      var _props2 = this.props,
          data = _props2.data,
          getPosition = _props2.getPosition,
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

          var position = getPosition(object);
          var elevation = getElevation(object) || 0;
          value[i + 0] = position[0];
          value[i + 1] = position[1];
          value[i + 2] = 0;
          value[i + 3] = elevation;
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

  return GridCellLayer;
}(Layer);

export default GridCellLayer;


GridCellLayer.layerName = 'GridCellLayer';
GridCellLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYXllcnMvY29yZS9ncmlkLWNlbGwtbGF5ZXIvZ3JpZC1jZWxsLWxheWVyLmpzIl0sIm5hbWVzIjpbIkxheWVyIiwiR0wiLCJNb2RlbCIsIkN1YmVHZW9tZXRyeSIsImZwNjRpZnkiLCJlbmFibGU2NGJpdFN1cHBvcnQiLCJDT09SRElOQVRFX1NZU1RFTSIsInZzIiwidnM2NCIsImZzIiwiREVGQVVMVF9DT0xPUiIsImRlZmF1bHRQcm9wcyIsImNlbGxTaXplIiwiY292ZXJhZ2UiLCJlbGV2YXRpb25TY2FsZSIsImV4dHJ1ZGVkIiwiZnA2NCIsImdldFBvc2l0aW9uIiwieCIsInBvc2l0aW9uIiwiZ2V0RWxldmF0aW9uIiwiZWxldmF0aW9uIiwiZ2V0Q29sb3IiLCJjb2xvciIsImxpZ2h0U2V0dGluZ3MiLCJsaWdodHNQb3NpdGlvbiIsImFtYmllbnRSYXRpbyIsImRpZmZ1c2VSYXRpbyIsInNwZWN1bGFyUmF0aW8iLCJsaWdodHNTdHJlbmd0aCIsIm51bWJlck9mTGlnaHRzIiwiR3JpZENlbGxMYXllciIsInNoYWRlckNhY2hlIiwiY29udGV4dCIsInByb3BzIiwibW9kdWxlcyIsImdsIiwic2V0U3RhdGUiLCJtb2RlbCIsIl9nZXRNb2RlbCIsImF0dHJpYnV0ZU1hbmFnZXIiLCJzdGF0ZSIsImFkZEluc3RhbmNlZCIsImluc3RhbmNlUG9zaXRpb25zIiwic2l6ZSIsImFjY2Vzc29yIiwidXBkYXRlIiwiY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnMiLCJpbnN0YW5jZUNvbG9ycyIsInR5cGUiLCJVTlNJR05FRF9CWVRFIiwiY2FsY3VsYXRlSW5zdGFuY2VDb2xvcnMiLCJvbGRQcm9wcyIsImNoYW5nZUZsYWdzIiwiaW52YWxpZGF0ZUFsbCIsInByb2plY3Rpb25Nb2RlIiwiTE5HTEFUIiwiaW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93IiwiY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93IiwicmVtb3ZlIiwidXBkYXRlQXR0cmlidXRlIiwidXBkYXRlVW5pZm9ybXMiLCJPYmplY3QiLCJhc3NpZ24iLCJnZXRTaGFkZXJzIiwiaWQiLCJnZW9tZXRyeSIsImlzSW5zdGFuY2VkIiwib3BhY2l0eSIsInNldFVuaWZvcm1zIiwidW5pZm9ybXMiLCJ2aWV3cG9ydCIsImdldERpc3RhbmNlU2NhbGVzIiwicGl4ZWxzUGVyTWV0ZXIiLCJhdHRyaWJ1dGUiLCJkYXRhIiwidmFsdWUiLCJpIiwib2JqZWN0IiwicG9pbnQiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsImxheWVyTmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVFBLEtBQVIsUUFBb0IsY0FBcEI7QUFDQSxTQUFRQyxFQUFSLEVBQVlDLEtBQVosRUFBbUJDLFlBQW5CLFFBQXNDLFNBQXRDO0FBQ0EsU0FBUUMsT0FBUixFQUFpQkMsa0JBQWpCLFFBQTBDLHlCQUExQztBQUNBLFNBQVFDLGlCQUFSLFFBQWdDLGNBQWhDOztBQUVBLE9BQU9DLEVBQVAsTUFBZSwrQkFBZjtBQUNBLE9BQU9DLElBQVAsTUFBaUIsa0NBQWpCO0FBQ0EsT0FBT0MsRUFBUCxNQUFlLGlDQUFmOztBQUVBLElBQU1DLGdCQUFnQixDQUFDLEdBQUQsRUFBTSxDQUFOLEVBQVMsR0FBVCxFQUFjLEdBQWQsQ0FBdEI7O0FBRUEsSUFBTUMsZUFBZTtBQUNuQkMsWUFBVSxJQURTO0FBRW5CQyxZQUFVLENBRlM7QUFHbkJDLGtCQUFnQixDQUhHO0FBSW5CQyxZQUFVLElBSlM7QUFLbkJDLFFBQU0sS0FMYTs7QUFPbkJDLGVBQWE7QUFBQSxXQUFLQyxFQUFFQyxRQUFQO0FBQUEsR0FQTTtBQVFuQkMsZ0JBQWM7QUFBQSxXQUFLRixFQUFFRyxTQUFQO0FBQUEsR0FSSztBQVNuQkMsWUFBVTtBQUFBLFdBQUtKLEVBQUVLLEtB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O0FBWGdDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFZbEM7Ozs7RUExSXdDNUMsSzs7ZUFBdEIrQixhOzs7QUE2SXJCQSxjQUFjbUQsU0FBZCxHQUEwQixlQUExQjtBQUNBbkQsY0FBY3BCLFlBQWQsR0FBNkJBLFlBQTdCIiwiZmlsZSI6ImdyaWQtY2VsbC1sYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge0xheWVyfSBmcm9tICcuLi8uLi8uLi9saWInO1xuaW1wb3J0IHtHTCwgTW9kZWwsIEN1YmVHZW9tZXRyeX0gZnJvbSAnbHVtYS5nbCc7XG5pbXBvcnQge2ZwNjRpZnksIGVuYWJsZTY0Yml0U3VwcG9ydH0gZnJvbSAnLi4vLi4vLi4vbGliL3V0aWxzL2ZwNjQnO1xuaW1wb3J0IHtDT09SRElOQVRFX1NZU1RFTX0gZnJvbSAnLi4vLi4vLi4vbGliJztcblxuaW1wb3J0IHZzIGZyb20gJy4vZ3JpZC1jZWxsLWxheWVyLXZlcnRleC5nbHNsJztcbmltcG9ydCB2czY0IGZyb20gJy4vZ3JpZC1jZWxsLWxheWVyLXZlcnRleC02NC5nbHNsJztcbmltcG9ydCBmcyBmcm9tICcuL2dyaWQtY2VsbC1sYXllci1mcmFnbWVudC5nbHNsJztcblxuY29uc3QgREVGQVVMVF9DT0xPUiA9IFsyNTUsIDAsIDI1NSwgMjU1XTtcblxuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICBjZWxsU2l6ZTogMTAwMCxcbiAgY292ZXJhZ2U6IDEsXG4gIGVsZXZhdGlvblNjYWxlOiAxLFxuICBleHRydWRlZDogdHJ1ZSxcbiAgZnA2NDogZmFsc2UsXG5cbiAgZ2V0UG9zaXRpb246IHggPT4geC5wb3NpdGlvbixcbiAgZ2V0RWxldmF0aW9uOiB4ID0+IHguZWxldmF0aW9uLFxuICBnZXRDb2xvcjogeCA9PiB4LmNvbG9yLFxuXG4gIGxpZ2h0U2V0dGluZ3M6IHtcbiAgICBsaWdodHNQb3NpdGlvbjogWy0xMjIuNDUsIDM3LjY1LCA4MDAwLCAtMTIyLjQ1LCAzNy4yMCwgMTAwMF0sXG4gICAgYW1iaWVudFJhdGlvOiAwLjQsXG4gICAgZGlmZnVzZVJhdGlvOiAwLjYsXG4gICAgc3BlY3VsYXJSYXRpbzogMC44LFxuICAgIGxpZ2h0c1N0cmVuZ3RoOiBbMS4wLCAwLjAsIDAuOCwgMC4wXSxcbiAgICBudW1iZXJPZkxpZ2h0czogMlxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmlkQ2VsbExheWVyIGV4dGVuZHMgTGF5ZXIge1xuICAvKipcbiAgICogQSBnZW5lcmljIEdyaWRMYXllciB0aGF0IHRha2VzIGxhdGl0dWRlIGxvbmdpdHVkZSBkZWx0YSBvZiBjZWxscyBhcyBhIHVuaWZvcm1cbiAgICogYW5kIHRoZSBtaW4gbGF0IGxuZyBvZiBjZWxscy4gZ3JpZCBjYW4gYmUgM2Qgd2hlbiBwYXNzIGluIGEgaGVpZ2h0XG4gICAqIGFuZCBzZXQgZW5hYmxlM2QgdG8gdHJ1ZVxuICAgKlxuICAgKiBAcGFyYW0ge2FycmF5fSBwcm9wcy5kYXRhIC1cbiAgICogQHBhcmFtIHtib29sZWFufSBwcm9wcy5leHRydWRlZCAtIGVuYWJsZSBncmlkIGVsZXZhdGlvblxuICAgKiBAcGFyYW0ge251bWJlcn0gcHJvcHMuY2VsbFNpemUgLSBncmlkIGNlbGwgc2l6ZSBpbiBtZXRlcnNcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gcHJvcHMuZ2V0UG9zaXRpb24gLSBwb3NpdGlvbiBhY2Nlc3NvciwgcmV0dXJuZWQgYXMgW21pbkxuZywgbWluTGF0XVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBwcm9wcy5nZXRFbGV2YXRpb24gLSBlbGV2YXRpb24gYWNjZXNzb3JcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gcHJvcHMuZ2V0Q29sb3IgLSBjb2xvciBhY2Nlc3NvciwgcmV0dXJuZWQgYXMgW3IsIGcsIGIsIGFdXG4gICAqL1xuXG4gIGdldFNoYWRlcnMoKSB7XG4gICAgY29uc3Qge3NoYWRlckNhY2hlfSA9IHRoaXMuY29udGV4dDtcbiAgICByZXR1cm4gZW5hYmxlNjRiaXRTdXBwb3J0KHRoaXMucHJvcHMpID9cbiAgICAgIHt2czogdnM2NCwgZnMsIG1vZHVsZXM6IFsncHJvamVjdDY0JywgJ2xpZ2h0aW5nJ10sIHNoYWRlckNhY2hlfSA6XG4gICAgICB7dnMsIGZzLCBtb2R1bGVzOiBbJ2xpZ2h0aW5nJ10sIHNoYWRlckNhY2hlfTsgIC8vICdwcm9qZWN0JyBtb2R1bGUgYWRkZWQgYnkgZGVmYXVsdC5cbiAgfVxuXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICBjb25zdCB7Z2x9ID0gdGhpcy5jb250ZXh0O1xuICAgIHRoaXMuc2V0U3RhdGUoe21vZGVsOiB0aGlzLl9nZXRNb2RlbChnbCl9KTtcblxuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKHtcbiAgICAgIGluc3RhbmNlUG9zaXRpb25zOiB7c2l6ZTogNCwgYWNjZXNzb3I6IFsnZ2V0UG9zaXRpb24nLCAnZ2V0RWxldmF0aW9uJ10sIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9uc30sXG4gICAgICBpbnN0YW5jZUNvbG9yczoge3NpemU6IDQsIHR5cGU6IEdMLlVOU0lHTkVEX0JZVEUsIGFjY2Vzc29yOiAnZ2V0Q29sb3InLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VDb2xvcnN9XG4gICAgfSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBtYXgtbGVuICovXG4gIH1cblxuICB1cGRhdGVBdHRyaWJ1dGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgaWYgKHByb3BzLmZwNjQgIT09IG9sZFByb3BzLmZwNjQpIHtcbiAgICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGVBbGwoKTtcblxuICAgICAgaWYgKHByb3BzLmZwNjQgJiYgcHJvcHMucHJvamVjdGlvbk1vZGUgPT09IENPT1JESU5BVEVfU1lTVEVNLkxOR0xBVCkge1xuICAgICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZEluc3RhbmNlZCh7XG4gICAgICAgICAgaW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93OiB7XG4gICAgICAgICAgICBzaXplOiAyLFxuICAgICAgICAgICAgYWNjZXNzb3I6ICdnZXRQb3NpdGlvbicsXG4gICAgICAgICAgICB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0dHJpYnV0ZU1hbmFnZXIucmVtb3ZlKFtcbiAgICAgICAgICAnaW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93J1xuICAgICAgICBdKTtcbiAgICAgIH1cblxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVN0YXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSkge1xuICAgIHN1cGVyLnVwZGF0ZVN0YXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSk7XG4gICAgLy8gUmUtZ2VuZXJhdGUgbW9kZWwgaWYgZ2VvbWV0cnkgY2hhbmdlZFxuICAgIGlmIChwcm9wcy5mcDY0ICE9PSBvbGRQcm9wcy5mcDY0KSB7XG4gICAgICBjb25zdCB7Z2x9ID0gdGhpcy5jb250ZXh0O1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7bW9kZWw6IHRoaXMuX2dldE1vZGVsKGdsKX0pO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUF0dHJpYnV0ZSh7cHJvcHMsIG9sZFByb3BzLCBjaGFuZ2VGbGFnc30pO1xuICAgIHRoaXMudXBkYXRlVW5pZm9ybXMoKTtcbiAgfVxuXG4gIF9nZXRNb2RlbChnbCkge1xuICAgIHJldHVybiBuZXcgTW9kZWwoZ2wsIE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U2hhZGVycygpLCB7XG4gICAgICBpZDogdGhpcy5wcm9wcy5pZCxcbiAgICAgIGdlb21ldHJ5OiBuZXcgQ3ViZUdlb21ldHJ5KCksXG4gICAgICBpc0luc3RhbmNlZDogdHJ1ZSxcbiAgICAgIHNoYWRlckNhY2hlOiB0aGlzLmNvbnRleHQuc2hhZGVyQ2FjaGVcbiAgICB9KSk7XG4gIH1cblxuICB1cGRhdGVVbmlmb3JtcygpIHtcbiAgICBjb25zdCB7b3BhY2l0eSwgZXh0cnVkZWQsIGVsZXZhdGlvblNjYWxlLCBjb3ZlcmFnZSwgbGlnaHRTZXR0aW5nc30gPSB0aGlzLnByb3BzO1xuXG4gICAgdGhpcy5zZXRVbmlmb3JtcyhPYmplY3QuYXNzaWduKHt9LCB7XG4gICAgICBleHRydWRlZCxcbiAgICAgIGVsZXZhdGlvblNjYWxlLFxuICAgICAgb3BhY2l0eSxcbiAgICAgIGNvdmVyYWdlXG4gICAgfSxcbiAgICBsaWdodFNldHRpbmdzKSk7XG4gIH1cblxuICBkcmF3KHt1bmlmb3Jtc30pIHtcbiAgICBjb25zdCB7dmlld3BvcnR9ID0gdGhpcy5jb250ZXh0O1xuICAgIC8vIFRPRE8gLSB0aGlzIHNob3VsZCBiZSBhIHN0YW5kYXJkIHVuaWZvcm0gaW4gcHJvamVjdCBwYWNrYWdlXG4gICAgY29uc3Qge3BpeGVsc1Blck1ldGVyfSA9IHZpZXdwb3J0LmdldERpc3RhbmNlU2NhbGVzKCk7XG5cbiAgICAvLyBjZWxsU2l6ZSBuZWVkcyB0byBiZSB1cGRhdGVkIG9uIGV2ZXJ5IGRyYXcgY2FsbFxuICAgIC8vIGJlY2F1c2UgaXQgaXMgYmFzZWQgb24gdmlld3BvcnRcbiAgICBzdXBlci5kcmF3KHt1bmlmb3JtczogT2JqZWN0LmFzc2lnbih7XG4gICAgICBjZWxsU2l6ZTogdGhpcy5wcm9wcy5jZWxsU2l6ZSAqIHBpeGVsc1Blck1ldGVyWzBdXG4gICAgfSwgdW5pZm9ybXMpfSk7XG4gIH1cblxuICBjYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9ucyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ2V0UG9zaXRpb24sIGdldEVsZXZhdGlvbn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gZ2V0UG9zaXRpb24ob2JqZWN0KTtcbiAgICAgIGNvbnN0IGVsZXZhdGlvbiA9IGdldEVsZXZhdGlvbihvYmplY3QpIHx8IDA7XG4gICAgICB2YWx1ZVtpICsgMF0gPSBwb3NpdGlvblswXTtcbiAgICAgIHZhbHVlW2kgKyAxXSA9IHBvc2l0aW9uWzFdO1xuICAgICAgdmFsdWVbaSArIDJdID0gMDtcbiAgICAgIHZhbHVlW2kgKyAzXSA9IGVsZXZhdGlvbjtcbiAgICAgIGkgKz0gc2l6ZTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9uczY0eHlMb3coYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldFBvc2l0aW9ufSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IGdldFBvc2l0aW9uKHBvaW50KTtcbiAgICAgIHZhbHVlW2krK10gPSBmcDY0aWZ5KHBvc2l0aW9uWzBdKVsxXTtcbiAgICAgIHZhbHVlW2krK10gPSBmcDY0aWZ5KHBvc2l0aW9uWzFdKVsxXTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVJbnN0YW5jZUNvbG9ycyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ2V0Q29sb3J9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IG9iamVjdCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCBjb2xvciA9IGdldENvbG9yKG9iamVjdCkgfHwgREVGQVVMVF9DT0xPUjtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IGNvbG9yWzBdO1xuICAgICAgdmFsdWVbaSArIDFdID0gY29sb3JbMV07XG4gICAgICB2YWx1ZVtpICsgMl0gPSBjb2xvclsyXTtcbiAgICAgIHZhbHVlW2kgKyAzXSA9IE51bWJlci5pc0Zpbml0ZShjb2xvclszXSkgPyBjb2xvclszXSA6IERFRkFVTFRfQ09MT1JbM107XG4gICAgICBpICs9IHNpemU7XG4gICAgfVxuICB9XG59XG5cbkdyaWRDZWxsTGF5ZXIubGF5ZXJOYW1lID0gJ0dyaWRDZWxsTGF5ZXInO1xuR3JpZENlbGxMYXllci5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG4iXX0=