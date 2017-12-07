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
import { COORDINATE_SYSTEM } from '../../../lib';
import { get } from '../../../lib/utils';
import { fp64ify, enable64bitSupport } from '../../../lib/utils/fp64';
import { GL, Model, Geometry } from 'luma.gl';

import vs from './scatterplot-layer-vertex.glsl';
import vs64 from './scatterplot-layer-vertex-64.glsl';
import fs from './scatterplot-layer-fragment.glsl';

var DEFAULT_COLOR = [0, 0, 0, 255];

var defaultProps = {
  radiusScale: 1,
  radiusMinPixels: 0, //  min point radius in pixels
  radiusMaxPixels: Number.MAX_SAFE_INTEGER, // max point radius in pixels
  strokeWidth: 1,
  outline: false,
  fp64: false,

  getPosition: function getPosition(x) {
    return x.position;
  },
  getRadius: function getRadius(x) {
    return x.radius || 1;
  },
  getColor: function getColor(x) {
    return x.color || DEFAULT_COLOR;
  }
};

var ScatterplotLayer = function (_Layer) {
  _inherits(ScatterplotLayer, _Layer);

  function ScatterplotLayer() {
    _classCallCheck(this, ScatterplotLayer);

    return _possibleConstructorReturn(this, (ScatterplotLayer.__proto__ || Object.getPrototypeOf(ScatterplotLayer)).apply(this, arguments));
  }

  _createClass(ScatterplotLayer, [{
    key: 'getShaders',
    value: function getShaders(id) {
      var shaderCache = this.context.shaderCache;

      return enable64bitSupport(this.props) ? { vs: vs64, fs: fs, modules: ['project64'], shaderCache: shaderCache } : { vs: vs, fs: fs, shaderCache: shaderCache }; // 'project' module added by default.
    }
  }, {
    key: 'initializeState',
    value: function initializeState() {
      var gl = this.context.gl;

      this.setState({ model: this._getModel(gl) });

      /* eslint-disable max-len */
      /* deprecated props check */
      this._checkRemovedProp('radius', 'radiusScale');
      this._checkRemovedProp('drawOutline', 'outline');

      this.state.attributeManager.addInstanced({
        instancePositions: { size: 3, accessor: 'getPosition', update: this.calculateInstancePositions },
        instanceRadius: { size: 1, accessor: 'getRadius', defaultValue: 1, update: this.calculateInstanceRadius },
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

      _get(ScatterplotLayer.prototype.__proto__ || Object.getPrototypeOf(ScatterplotLayer.prototype), 'updateState', this).call(this, { props: props, oldProps: oldProps, changeFlags: changeFlags });
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
          radiusScale = _props.radiusScale,
          radiusMinPixels = _props.radiusMinPixels,
          radiusMaxPixels = _props.radiusMaxPixels,
          outline = _props.outline,
          strokeWidth = _props.strokeWidth;

      this.state.model.render(Object.assign({}, uniforms, {
        outline: outline ? 1 : 0,
        strokeWidth: strokeWidth,
        radiusScale: radiusScale,
        radiusMinPixels: radiusMinPixels,
        radiusMaxPixels: radiusMaxPixels
      }));
    }
  }, {
    key: '_getModel',
    value: function _getModel(gl) {
      // a square that minimally cover the unit circle
      var positions = [-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0];

      return new Model(gl, Object.assign(this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_FAN,
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
          value[i++] = get(position, 0);
          value[i++] = get(position, 1);
          value[i++] = get(position, 2) || 0;
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
          value[i++] = fp64ify(get(position, 0))[1];
          value[i++] = fp64ify(get(position, 1))[1];
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
    key: 'calculateInstanceRadius',
    value: function calculateInstanceRadius(attribute) {
      var _props4 = this.props,
          data = _props4.data,
          getRadius = _props4.getRadius;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var point = _step3.value;

          var radius = getRadius(point);
          value[i++] = isNaN(radius) ? 1 : radius;
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

          var color = getColor(point) || DEFAULT_COLOR;
          value[i++] = get(color, 0);
          value[i++] = get(color, 1);
          value[i++] = get(color, 2);
          value[i++] = isNaN(get(color, 3)) ? 255 : get(color, 3);
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

  return ScatterplotLayer;
}(Layer);

export default ScatterplotLayer;


ScatterplotLayer.layerName = 'ScatterplotLayer';
ScatterplotLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYXllcnMvY29yZS9zY2F0dGVycGxvdC1sYXllci9zY2F0dGVycGxvdC1sYXllci5qcyJdLCJuYW1lcyI6WyJMYXllciIsIkNPT1JESU5BVEVfU1lTVEVNIiwiZ2V0IiwiZnA2NGlmeSIsImVuYWJsZTY0Yml0U3VwcG9ydCIsIkdMIiwiTW9kZWwiLCJHZW9tZXRyeSIsInZzIiwidnM2NCIsImZzIiwiREVGQVVMVF9DT0xPUiIsImRlZmF1bHRQcm9wcyIsInJhZGl1c1NjYWxlIiwicmFkaXVzTWluUGl4ZWxzIiwicmFkaXVzTWF4UGl4ZWxzIiwiTnVtYmVyIiwiTUFYX1NBRkVfSU5URUdFUiIsInN0cm9rZVdpZHRoIiwib3V0bGluZSIsImZwNjQiLCJnZXRQb3NpdGlvbiIsIngiLCJwb3NpdGlvbiIsImdldFJhZGl1cyIsInJhZGl1cyIsImdldENvbG9yIiwiY29sb3IiLCJTY2F0dGVycGxvdExheWVyIiwiaWQiLCJzaGFkZXJDYWNoZSIsImNvbnRleHQiLCJwcm9wcyIsIm1vZHVsZXMiLCJnbCIsInNldFN0YXRlIiwibW9kZWwiLCJfZ2V0TW9kZWwiLCJfY2hlY2tSZW1vdmVkUHJvcCIsInN0YXRlIiwiYXR0cmlidXRlTWFuYWdlciIsImFkZEluc3RhbmNlZCIsImluc3RhbmNlUG9zaXRpb25zIiwic2l6ZSIsImFjY2Vzc29yIiwidXBkYXRlIiwiY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnMiLCJpbnN0YW5jZVJhZGl1cyIsImRlZmF1bHRWYWx1ZSIsImNhbGN1bGF0ZUluc3RhbmNlUmFkaXVzIiwiaW5zdGFuY2VDb2xvcnMiLCJ0eXBlIiwiVU5TSUdORURfQllURSIsImNhbGN1bGF0ZUluc3RhbmNlQ29sb3JzIiwib2xkUHJvcHMiLCJjaGFuZ2VGbGFncyIsImludmFsaWRhdGVBbGwiLCJwcm9qZWN0aW9uTW9kZSIsIkxOR0xBVCIsImluc3RhbmNlUG9zaXRpb25zNjR4eUxvdyIsImNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zNjR4eUxvdyIsInJlbW92ZSIsInVwZGF0ZUF0dHJpYnV0ZSIsInVuaWZvcm1zIiwicmVuZGVyIiwiT2JqZWN0IiwiYXNzaWduIiwicG9zaXRpb25zIiwiZ2V0U2hhZGVycyIsImdlb21ldHJ5IiwiZHJhd01vZGUiLCJUUklBTkdMRV9GQU4iLCJGbG9hdDMyQXJyYXkiLCJpc0luc3RhbmNlZCIsImF0dHJpYnV0ZSIsImRhdGEiLCJ2YWx1ZSIsImkiLCJwb2ludCIsImlzTmFOIiwibGF5ZXJOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUUEsS0FBUixRQUFvQixjQUFwQjtBQUNBLFNBQVFDLGlCQUFSLFFBQWdDLGNBQWhDO0FBQ0EsU0FBUUMsR0FBUixRQUFrQixvQkFBbEI7QUFDQSxTQUFRQyxPQUFSLEVBQWlCQyxrQkFBakIsUUFBMEMseUJBQTFDO0FBQ0EsU0FBUUMsRUFBUixFQUFZQyxLQUFaLEVBQW1CQyxRQUFuQixRQUFrQyxTQUFsQzs7QUFFQSxPQUFPQyxFQUFQLE1BQWUsaUNBQWY7QUFDQSxPQUFPQyxJQUFQLE1BQWlCLG9DQUFqQjtBQUNBLE9BQU9DLEVBQVAsTUFBZSxtQ0FBZjs7QUFFQSxJQUFNQyxnQkFBZ0IsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxHQUFWLENBQXRCOztBQUVBLElBQU1DLGVBQWU7QUFDbkJDLGVBQWEsQ0FETTtBQUVuQkMsbUJBQWlCLENBRkUsRUFFQztBQUNwQkMsbUJBQWlCQyxPQUFPQyxnQkFITCxFQUd1QjtBQUMxQ0MsZUFBYSxDQUpNO0FBS25CQyxXQUFTLEtBTFU7QUFNbkJDLFFBQU0sS0FOYTs7QUFRbkJDLGVBQWE7QUFBQSxXQUFLQyxFQUFFQyxRQUFQO0FBQUEsR0FSTTtBQVNuQkMsYUFBVztBQUFBLFdBQUtGLEVBQUVHLE1BQUYsSUFBWSxDQUFqQjtBQUFBLEdBVFE7QUFVbkJDLFlBQVU7QUFBQSxXQUFLSixFQUFFSyxLQUFGLElBQVdoQixhQUFoQjtBQUFBO0FBVlMsQ0FBckI7O0lBYXFCaUIsZ0I7Ozs7Ozs7Ozs7OytCQUNSQyxFLEVBQUk7QUFBQSxVQUNOQyxXQURNLEdBQ1MsS0FBS0MsT0FEZCxDQUNORCxXQURNOztBQUViLGFBQU8xQixtQkFBbUIsS0FBSzRCLEtBQXhCLElBQ0wsRUFBQ3hCLElBQUlDLElBQUwsRUFBV0MsTUFBWCxFQUFldUIsU0FBUyxDQUFDLFdBQUQsQ0FBeEIsRUFBdUNILHdCQUF2QyxFQURLLEdBRUwsRUFBQ3RCLE1BQUQsRUFBS0UsTUFBTCxFQUFTb0Isd0JBQVQsRUFGRixDQUZhLENBSVk7QUFDMUI7OztzQ0FFaUI7QUFBQSxVQUNUSSxFQURTLEdBQ0gsS0FBS0gsT0FERixDQUNURyxFQURTOztBQUVoQixXQUFLQyxRQUFMLENBQWMsRUFBQ0MsT0FBTyxLQUFLQyxTQUFMLENBQWVILEVBQWYsQ0FBUixFQUFkOztBQUVBO0FBQ0E7QUFDQSxXQUFLSSxpQkFBTCxDQUF1QixRQUF2QixFQUFpQyxhQUFqQztBQUNBLFdBQUtBLGlCQUFMLENBQXVCLGFBQXZCLEVBQXNDLFNBQXRDOztBQUVBLFdBQUtDLEtBQUwsQ0FBV0MsZ0JBQVgsQ0FBNEJDLFlBQTVCLENBQXlDO0FBQ3ZDQywyQkFBbUIsRUFBQ0MsTUFBTSxDQUFQLEVBQVVDLFVBQVUsYUFBcEIsRUFBbUNDLFFBQVEsS0FBS0MsMEJBQWhELEVBRG9CO0FBRXZDQyx3QkFBZ0IsRUFBQ0osTUFBTSxDQUFQLEVBQVVDLFVBQVUsV0FBcEIsRUFBaUNJLGNBQWMsQ0FBL0MsRUFBa0RILFFBQVEsS0FBS0ksdUJBQS9ELEVBRnVCO0FBR3ZDQyx3QkFBZ0IsRUFBQ1AsTUFBTSxDQUFQLEVBQVVRLE1BQU05QyxHQUFHK0MsYUFBbkIsRUFBa0NSLFVBQVUsVUFBNUMsRUFBd0RDLFFBQVEsS0FBS1EsdUJBQXJFO0FBSHVCLE9BQXpDO0FBS0E7QUFDRDs7OzBDQUUrQztBQUFBLFVBQS9CckIsS0FBK0IsUUFBL0JBLEtBQStCO0FBQUEsVUFBeEJzQixRQUF3QixRQUF4QkEsUUFBd0I7QUFBQSxVQUFkQyxXQUFjLFFBQWRBLFdBQWM7O0FBQzlDLFVBQUl2QixNQUFNWixJQUFOLEtBQWVrQyxTQUFTbEMsSUFBNUIsRUFBa0M7QUFBQSxZQUN6Qm9CLGdCQUR5QixHQUNMLEtBQUtELEtBREEsQ0FDekJDLGdCQUR5Qjs7QUFFaENBLHlCQUFpQmdCLGFBQWpCOztBQUVBLFlBQUl4QixNQUFNWixJQUFOLElBQWNZLE1BQU15QixjQUFOLEtBQXlCeEQsa0JBQWtCeUQsTUFBN0QsRUFBcUU7QUFDbkVsQiwyQkFBaUJDLFlBQWpCLENBQThCO0FBQzVCa0Isc0NBQTBCO0FBQ3hCaEIsb0JBQU0sQ0FEa0I7QUFFeEJDLHdCQUFVLGFBRmM7QUFHeEJDLHNCQUFRLEtBQUtlO0FBSFc7QUFERSxXQUE5QjtBQU9ELFNBUkQsTUFRTztBQUNMcEIsMkJBQWlCcUIsTUFBakIsQ0FBd0IsQ0FDdEIsMEJBRHNCLENBQXhCO0FBR0Q7QUFFRjtBQUNGOzs7dUNBRTJDO0FBQUEsVUFBL0I3QixLQUErQixTQUEvQkEsS0FBK0I7QUFBQSxVQUF4QnNCLFFBQXdCLFNBQXhCQSxRQUF3QjtBQUFBLFVBQWRDLFdBQWMsU0FBZEEsV0FBYzs7QUFDMUMsc0lBQWtCLEVBQUN2QixZQUFELEVBQVFzQixrQkFBUixFQUFrQkMsd0JBQWxCLEVBQWxCO0FBQ0EsVUFBSXZCLE1BQU1aLElBQU4sS0FBZWtDLFNBQVNsQyxJQUE1QixFQUFrQztBQUFBLFlBQ3pCYyxFQUR5QixHQUNuQixLQUFLSCxPQURjLENBQ3pCRyxFQUR5Qjs7QUFFaEMsYUFBS0MsUUFBTCxDQUFjLEVBQUNDLE9BQU8sS0FBS0MsU0FBTCxDQUFlSCxFQUFmLENBQVIsRUFBZDtBQUNEO0FBQ0QsV0FBSzRCLGVBQUwsQ0FBcUIsRUFBQzlCLFlBQUQsRUFBUXNCLGtCQUFSLEVBQWtCQyx3QkFBbEIsRUFBckI7QUFDRDs7O2dDQUVnQjtBQUFBLFVBQVhRLFFBQVcsU0FBWEEsUUFBVztBQUFBLG1CQUMrRCxLQUFLL0IsS0FEcEU7QUFBQSxVQUNSbkIsV0FEUSxVQUNSQSxXQURRO0FBQUEsVUFDS0MsZUFETCxVQUNLQSxlQURMO0FBQUEsVUFDc0JDLGVBRHRCLFVBQ3NCQSxlQUR0QjtBQUFBLFVBQ3VDSSxPQUR2QyxVQUN1Q0EsT0FEdkM7QUFBQSxVQUNnREQsV0FEaEQsVUFDZ0RBLFdBRGhEOztBQUVmLFdBQUtxQixLQUFMLENBQVdILEtBQVgsQ0FBaUI0QixNQUFqQixDQUF3QkMsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0JILFFBQWxCLEVBQTRCO0FBQ2xENUMsaUJBQVNBLFVBQVUsQ0FBVixHQUFjLENBRDJCO0FBRWxERCxnQ0FGa0Q7QUFHbERMLGdDQUhrRDtBQUlsREMsd0NBSmtEO0FBS2xEQztBQUxrRCxPQUE1QixDQUF4QjtBQU9EOzs7OEJBRVNtQixFLEVBQUk7QUFDWjtBQUNBLFVBQU1pQyxZQUFZLENBQUMsQ0FBQyxDQUFGLEVBQUssQ0FBQyxDQUFOLEVBQVMsQ0FBVCxFQUFZLENBQUMsQ0FBYixFQUFnQixDQUFoQixFQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUF5QixDQUF6QixFQUE0QixDQUE1QixFQUErQixDQUEvQixFQUFrQyxDQUFDLENBQW5DLEVBQXNDLENBQXRDLENBQWxCOztBQUVBLGFBQU8sSUFBSTdELEtBQUosQ0FBVTRCLEVBQVYsRUFBYytCLE9BQU9DLE1BQVAsQ0FBYyxLQUFLRSxVQUFMLEVBQWQsRUFBaUM7QUFDcER2QyxZQUFJLEtBQUtHLEtBQUwsQ0FBV0gsRUFEcUM7QUFFcER3QyxrQkFBVSxJQUFJOUQsUUFBSixDQUFhO0FBQ3JCK0Qsb0JBQVVqRSxHQUFHa0UsWUFEUTtBQUVyQkoscUJBQVcsSUFBSUssWUFBSixDQUFpQkwsU0FBakI7QUFGVSxTQUFiLENBRjBDO0FBTXBETSxxQkFBYSxJQU51QztBQU9wRDNDLHFCQUFhLEtBQUtDLE9BQUwsQ0FBYUQ7QUFQMEIsT0FBakMsQ0FBZCxDQUFQO0FBU0Q7OzsrQ0FFMEI0QyxTLEVBQVc7QUFBQSxvQkFDUixLQUFLMUMsS0FERztBQUFBLFVBQzdCMkMsSUFENkIsV0FDN0JBLElBRDZCO0FBQUEsVUFDdkJ0RCxXQUR1QixXQUN2QkEsV0FEdUI7QUFBQSxVQUU3QnVELEtBRjZCLEdBRXBCRixTQUZvQixDQUU3QkUsS0FGNkI7O0FBR3BDLFVBQUlDLElBQUksQ0FBUjtBQUhvQztBQUFBO0FBQUE7O0FBQUE7QUFJcEMsNkJBQW9CRixJQUFwQiw4SEFBMEI7QUFBQSxjQUFmRyxLQUFlOztBQUN4QixjQUFNdkQsV0FBV0YsWUFBWXlELEtBQVosQ0FBakI7QUFDQUYsZ0JBQU1DLEdBQU4sSUFBYTNFLElBQUlxQixRQUFKLEVBQWMsQ0FBZCxDQUFiO0FBQ0FxRCxnQkFBTUMsR0FBTixJQUFhM0UsSUFBSXFCLFFBQUosRUFBYyxDQUFkLENBQWI7QUFDQXFELGdCQUFNQyxHQUFOLElBQWEzRSxJQUFJcUIsUUFBSixFQUFjLENBQWQsS0FBb0IsQ0FBakM7QUFDRDtBQVRtQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBVXJDOzs7c0RBRWlDbUQsUyxFQUFXO0FBQUEsb0JBQ2YsS0FBSzFDLEtBRFU7QUFBQSxVQUNwQzJDLElBRG9DLFdBQ3BDQSxJQURvQztBQUFBLFVBQzlCdEQsV0FEOEIsV0FDOUJBLFdBRDhCO0FBQUEsVUFFcEN1RCxLQUZvQyxHQUUzQkYsU0FGMkIsQ0FFcENFLEtBRm9DOztBQUczQyxVQUFJQyxJQUFJLENBQVI7QUFIMkM7QUFBQTtBQUFBOztBQUFBO0FBSTNDLDhCQUFvQkYsSUFBcEIsbUlBQTBCO0FBQUEsY0FBZkcsS0FBZTs7QUFDeEIsY0FBTXZELFdBQVdGLFlBQVl5RCxLQUFaLENBQWpCO0FBQ0FGLGdCQUFNQyxHQUFOLElBQWExRSxRQUFRRCxJQUFJcUIsUUFBSixFQUFjLENBQWQsQ0FBUixFQUEwQixDQUExQixDQUFiO0FBQ0FxRCxnQkFBTUMsR0FBTixJQUFhMUUsUUFBUUQsSUFBSXFCLFFBQUosRUFBYyxDQUFkLENBQVIsRUFBMEIsQ0FBMUIsQ0FBYjtBQUNEO0FBUjBDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFTNUM7Ozs0Q0FFdUJtRCxTLEVBQVc7QUFBQSxvQkFDUCxLQUFLMUMsS0FERTtBQUFBLFVBQzFCMkMsSUFEMEIsV0FDMUJBLElBRDBCO0FBQUEsVUFDcEJuRCxTQURvQixXQUNwQkEsU0FEb0I7QUFBQSxVQUUxQm9ELEtBRjBCLEdBRWpCRixTQUZpQixDQUUxQkUsS0FGMEI7O0FBR2pDLFVBQUlDLElBQUksQ0FBUjtBQUhpQztBQUFBO0FBQUE7O0FBQUE7QUFJakMsOEJBQW9CRixJQUFwQixtSUFBMEI7QUFBQSxjQUFmRyxLQUFlOztBQUN4QixjQUFNckQsU0FBU0QsVUFBVXNELEtBQVYsQ0FBZjtBQUNBRixnQkFBTUMsR0FBTixJQUFhRSxNQUFNdEQsTUFBTixJQUFnQixDQUFoQixHQUFvQkEsTUFBakM7QUFDRDtBQVBnQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBUWxDOzs7NENBRXVCaUQsUyxFQUFXO0FBQUEsb0JBQ1IsS0FBSzFDLEtBREc7QUFBQSxVQUMxQjJDLElBRDBCLFdBQzFCQSxJQUQwQjtBQUFBLFVBQ3BCakQsUUFEb0IsV0FDcEJBLFFBRG9CO0FBQUEsVUFFMUJrRCxLQUYwQixHQUVqQkYsU0FGaUIsQ0FFMUJFLEtBRjBCOztBQUdqQyxVQUFJQyxJQUFJLENBQVI7QUFIaUM7QUFBQTtBQUFBOztBQUFBO0FBSWpDLDhCQUFvQkYsSUFBcEIsbUlBQTBCO0FBQUEsY0FBZkcsS0FBZTs7QUFDeEIsY0FBTW5ELFFBQVFELFNBQVNvRCxLQUFULEtBQW1CbkUsYUFBakM7QUFDQWlFLGdCQUFNQyxHQUFOLElBQWEzRSxJQUFJeUIsS0FBSixFQUFXLENBQVgsQ0FBYjtBQUNBaUQsZ0JBQU1DLEdBQU4sSUFBYTNFLElBQUl5QixLQUFKLEVBQVcsQ0FBWCxDQUFiO0FBQ0FpRCxnQkFBTUMsR0FBTixJQUFhM0UsSUFBSXlCLEtBQUosRUFBVyxDQUFYLENBQWI7QUFDQWlELGdCQUFNQyxHQUFOLElBQWFFLE1BQU03RSxJQUFJeUIsS0FBSixFQUFXLENBQVgsQ0FBTixJQUF1QixHQUF2QixHQUE2QnpCLElBQUl5QixLQUFKLEVBQVcsQ0FBWCxDQUExQztBQUNEO0FBVmdDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFXbEM7Ozs7RUE5SDJDM0IsSzs7ZUFBekI0QixnQjs7O0FBaUlyQkEsaUJBQWlCb0QsU0FBakIsR0FBNkIsa0JBQTdCO0FBQ0FwRCxpQkFBaUJoQixZQUFqQixHQUFnQ0EsWUFBaEMiLCJmaWxlIjoic2NhdHRlcnBsb3QtbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtMYXllcn0gZnJvbSAnLi4vLi4vLi4vbGliJztcbmltcG9ydCB7Q09PUkRJTkFURV9TWVNURU19IGZyb20gJy4uLy4uLy4uL2xpYic7XG5pbXBvcnQge2dldH0gZnJvbSAnLi4vLi4vLi4vbGliL3V0aWxzJztcbmltcG9ydCB7ZnA2NGlmeSwgZW5hYmxlNjRiaXRTdXBwb3J0fSBmcm9tICcuLi8uLi8uLi9saWIvdXRpbHMvZnA2NCc7XG5pbXBvcnQge0dMLCBNb2RlbCwgR2VvbWV0cnl9IGZyb20gJ2x1bWEuZ2wnO1xuXG5pbXBvcnQgdnMgZnJvbSAnLi9zY2F0dGVycGxvdC1sYXllci12ZXJ0ZXguZ2xzbCc7XG5pbXBvcnQgdnM2NCBmcm9tICcuL3NjYXR0ZXJwbG90LWxheWVyLXZlcnRleC02NC5nbHNsJztcbmltcG9ydCBmcyBmcm9tICcuL3NjYXR0ZXJwbG90LWxheWVyLWZyYWdtZW50Lmdsc2wnO1xuXG5jb25zdCBERUZBVUxUX0NPTE9SID0gWzAsIDAsIDAsIDI1NV07XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgcmFkaXVzU2NhbGU6IDEsXG4gIHJhZGl1c01pblBpeGVsczogMCwgLy8gIG1pbiBwb2ludCByYWRpdXMgaW4gcGl4ZWxzXG4gIHJhZGl1c01heFBpeGVsczogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsIC8vIG1heCBwb2ludCByYWRpdXMgaW4gcGl4ZWxzXG4gIHN0cm9rZVdpZHRoOiAxLFxuICBvdXRsaW5lOiBmYWxzZSxcbiAgZnA2NDogZmFsc2UsXG5cbiAgZ2V0UG9zaXRpb246IHggPT4geC5wb3NpdGlvbixcbiAgZ2V0UmFkaXVzOiB4ID0+IHgucmFkaXVzIHx8IDEsXG4gIGdldENvbG9yOiB4ID0+IHguY29sb3IgfHwgREVGQVVMVF9DT0xPUlxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NhdHRlcnBsb3RMYXllciBleHRlbmRzIExheWVyIHtcbiAgZ2V0U2hhZGVycyhpZCkge1xuICAgIGNvbnN0IHtzaGFkZXJDYWNoZX0gPSB0aGlzLmNvbnRleHQ7XG4gICAgcmV0dXJuIGVuYWJsZTY0Yml0U3VwcG9ydCh0aGlzLnByb3BzKSA/XG4gICAgICB7dnM6IHZzNjQsIGZzLCBtb2R1bGVzOiBbJ3Byb2plY3Q2NCddLCBzaGFkZXJDYWNoZX0gOlxuICAgICAge3ZzLCBmcywgc2hhZGVyQ2FjaGV9OyAvLyAncHJvamVjdCcgbW9kdWxlIGFkZGVkIGJ5IGRlZmF1bHQuXG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgY29uc3Qge2dsfSA9IHRoaXMuY29udGV4dDtcbiAgICB0aGlzLnNldFN0YXRlKHttb2RlbDogdGhpcy5fZ2V0TW9kZWwoZ2wpfSk7XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXG4gICAgLyogZGVwcmVjYXRlZCBwcm9wcyBjaGVjayAqL1xuICAgIHRoaXMuX2NoZWNrUmVtb3ZlZFByb3AoJ3JhZGl1cycsICdyYWRpdXNTY2FsZScpO1xuICAgIHRoaXMuX2NoZWNrUmVtb3ZlZFByb3AoJ2RyYXdPdXRsaW5lJywgJ291dGxpbmUnKTtcblxuICAgIHRoaXMuc3RhdGUuYXR0cmlidXRlTWFuYWdlci5hZGRJbnN0YW5jZWQoe1xuICAgICAgaW5zdGFuY2VQb3NpdGlvbnM6IHtzaXplOiAzLCBhY2Nlc3NvcjogJ2dldFBvc2l0aW9uJywgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zfSxcbiAgICAgIGluc3RhbmNlUmFkaXVzOiB7c2l6ZTogMSwgYWNjZXNzb3I6ICdnZXRSYWRpdXMnLCBkZWZhdWx0VmFsdWU6IDEsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZVJhZGl1c30sXG4gICAgICBpbnN0YW5jZUNvbG9yczoge3NpemU6IDQsIHR5cGU6IEdMLlVOU0lHTkVEX0JZVEUsIGFjY2Vzc29yOiAnZ2V0Q29sb3InLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VDb2xvcnN9XG4gICAgfSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBtYXgtbGVuICovXG4gIH1cblxuICB1cGRhdGVBdHRyaWJ1dGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgaWYgKHByb3BzLmZwNjQgIT09IG9sZFByb3BzLmZwNjQpIHtcbiAgICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGVBbGwoKTtcblxuICAgICAgaWYgKHByb3BzLmZwNjQgJiYgcHJvcHMucHJvamVjdGlvbk1vZGUgPT09IENPT1JESU5BVEVfU1lTVEVNLkxOR0xBVCkge1xuICAgICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZEluc3RhbmNlZCh7XG4gICAgICAgICAgaW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93OiB7XG4gICAgICAgICAgICBzaXplOiAyLFxuICAgICAgICAgICAgYWNjZXNzb3I6ICdnZXRQb3NpdGlvbicsXG4gICAgICAgICAgICB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0dHJpYnV0ZU1hbmFnZXIucmVtb3ZlKFtcbiAgICAgICAgICAnaW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93J1xuICAgICAgICBdKTtcbiAgICAgIH1cblxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVN0YXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSkge1xuICAgIHN1cGVyLnVwZGF0ZVN0YXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSk7XG4gICAgaWYgKHByb3BzLmZwNjQgIT09IG9sZFByb3BzLmZwNjQpIHtcbiAgICAgIGNvbnN0IHtnbH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgICB0aGlzLnNldFN0YXRlKHttb2RlbDogdGhpcy5fZ2V0TW9kZWwoZ2wpfSk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQXR0cmlidXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSk7XG4gIH1cblxuICBkcmF3KHt1bmlmb3Jtc30pIHtcbiAgICBjb25zdCB7cmFkaXVzU2NhbGUsIHJhZGl1c01pblBpeGVscywgcmFkaXVzTWF4UGl4ZWxzLCBvdXRsaW5lLCBzdHJva2VXaWR0aH0gPSB0aGlzLnByb3BzO1xuICAgIHRoaXMuc3RhdGUubW9kZWwucmVuZGVyKE9iamVjdC5hc3NpZ24oe30sIHVuaWZvcm1zLCB7XG4gICAgICBvdXRsaW5lOiBvdXRsaW5lID8gMSA6IDAsXG4gICAgICBzdHJva2VXaWR0aCxcbiAgICAgIHJhZGl1c1NjYWxlLFxuICAgICAgcmFkaXVzTWluUGl4ZWxzLFxuICAgICAgcmFkaXVzTWF4UGl4ZWxzXG4gICAgfSkpO1xuICB9XG5cbiAgX2dldE1vZGVsKGdsKSB7XG4gICAgLy8gYSBzcXVhcmUgdGhhdCBtaW5pbWFsbHkgY292ZXIgdGhlIHVuaXQgY2lyY2xlXG4gICAgY29uc3QgcG9zaXRpb25zID0gWy0xLCAtMSwgMCwgLTEsIDEsIDAsIDEsIDEsIDAsIDEsIC0xLCAwXTtcblxuICAgIHJldHVybiBuZXcgTW9kZWwoZ2wsIE9iamVjdC5hc3NpZ24odGhpcy5nZXRTaGFkZXJzKCksIHtcbiAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxuICAgICAgZ2VvbWV0cnk6IG5ldyBHZW9tZXRyeSh7XG4gICAgICAgIGRyYXdNb2RlOiBHTC5UUklBTkdMRV9GQU4sXG4gICAgICAgIHBvc2l0aW9uczogbmV3IEZsb2F0MzJBcnJheShwb3NpdGlvbnMpXG4gICAgICB9KSxcbiAgICAgIGlzSW5zdGFuY2VkOiB0cnVlLFxuICAgICAgc2hhZGVyQ2FjaGU6IHRoaXMuY29udGV4dC5zaGFkZXJDYWNoZVxuICAgIH0pKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRQb3NpdGlvbn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgZGF0YSkge1xuICAgICAgY29uc3QgcG9zaXRpb24gPSBnZXRQb3NpdGlvbihwb2ludCk7XG4gICAgICB2YWx1ZVtpKytdID0gZ2V0KHBvc2l0aW9uLCAwKTtcbiAgICAgIHZhbHVlW2krK10gPSBnZXQocG9zaXRpb24sIDEpO1xuICAgICAgdmFsdWVbaSsrXSA9IGdldChwb3NpdGlvbiwgMikgfHwgMDtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9uczY0eHlMb3coYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldFBvc2l0aW9ufSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IGdldFBvc2l0aW9uKHBvaW50KTtcbiAgICAgIHZhbHVlW2krK10gPSBmcDY0aWZ5KGdldChwb3NpdGlvbiwgMCkpWzFdO1xuICAgICAgdmFsdWVbaSsrXSA9IGZwNjRpZnkoZ2V0KHBvc2l0aW9uLCAxKSlbMV07XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlSW5zdGFuY2VSYWRpdXMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldFJhZGl1c30gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgZGF0YSkge1xuICAgICAgY29uc3QgcmFkaXVzID0gZ2V0UmFkaXVzKHBvaW50KTtcbiAgICAgIHZhbHVlW2krK10gPSBpc05hTihyYWRpdXMpID8gMSA6IHJhZGl1cztcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVJbnN0YW5jZUNvbG9ycyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ2V0Q29sb3J9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IGNvbG9yID0gZ2V0Q29sb3IocG9pbnQpIHx8IERFRkFVTFRfQ09MT1I7XG4gICAgICB2YWx1ZVtpKytdID0gZ2V0KGNvbG9yLCAwKTtcbiAgICAgIHZhbHVlW2krK10gPSBnZXQoY29sb3IsIDEpO1xuICAgICAgdmFsdWVbaSsrXSA9IGdldChjb2xvciwgMik7XG4gICAgICB2YWx1ZVtpKytdID0gaXNOYU4oZ2V0KGNvbG9yLCAzKSkgPyAyNTUgOiBnZXQoY29sb3IsIDMpO1xuICAgIH1cbiAgfVxufVxuXG5TY2F0dGVycGxvdExheWVyLmxheWVyTmFtZSA9ICdTY2F0dGVycGxvdExheWVyJztcblNjYXR0ZXJwbG90TGF5ZXIuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19