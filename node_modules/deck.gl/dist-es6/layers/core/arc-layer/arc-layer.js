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

import vs from './arc-layer-vertex.glsl';
import vs64 from './arc-layer-vertex-64.glsl';
import fs from './arc-layer-fragment.glsl';

var DEFAULT_COLOR = [0, 0, 0, 255];

var defaultProps = {
  strokeWidth: 1,
  fp64: false,

  getSourcePosition: function getSourcePosition(x) {
    return x.sourcePosition;
  },
  getTargetPosition: function getTargetPosition(x) {
    return x.targetPosition;
  },
  getSourceColor: function getSourceColor(x) {
    return x.color || DEFAULT_COLOR;
  },
  getTargetColor: function getTargetColor(x) {
    return x.color || DEFAULT_COLOR;
  }
};

var ArcLayer = function (_Layer) {
  _inherits(ArcLayer, _Layer);

  function ArcLayer() {
    _classCallCheck(this, ArcLayer);

    return _possibleConstructorReturn(this, (ArcLayer.__proto__ || Object.getPrototypeOf(ArcLayer)).apply(this, arguments));
  }

  _createClass(ArcLayer, [{
    key: 'getShaders',
    value: function getShaders() {
      return enable64bitSupport(this.props) ? { vs: vs64, fs: fs, modules: ['project64'] } : { vs: vs, fs: fs }; // 'project' module added by default.
    }
  }, {
    key: 'initializeState',
    value: function initializeState() {
      var gl = this.context.gl;

      this.setState({ model: this._getModel(gl) });

      var attributeManager = this.state.attributeManager;

      /* eslint-disable max-len */

      attributeManager.addInstanced({
        instancePositions: { size: 4, accessor: ['getSourcePosition', 'getTargetPosition'], update: this.calculateInstancePositions },
        instanceSourceColors: { size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getSourceColor', update: this.calculateInstanceSourceColors },
        instanceTargetColors: { size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getTargetColor', update: this.calculateInstanceTargetColors }
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
            instancePositions64Low: {
              size: 4,
              accessor: ['getSourcePosition', 'getTargetPosition'],
              update: this.calculateInstancePositions64Low
            }
          });
        } else {
          attributeManager.remove(['instancePositions64Low']);
        }
      }
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref2) {
      var props = _ref2.props,
          oldProps = _ref2.oldProps,
          changeFlags = _ref2.changeFlags;

      _get(ArcLayer.prototype.__proto__ || Object.getPrototypeOf(ArcLayer.prototype), 'updateState', this).call(this, { props: props, oldProps: oldProps, changeFlags: changeFlags });
      // Re-generate model if geometry changed
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
      var strokeWidth = this.props.strokeWidth;


      this.state.model.render(Object.assign({}, uniforms, {
        strokeWidth: strokeWidth
      }));
    }
  }, {
    key: '_getModel',
    value: function _getModel(gl) {
      var positions = [];
      var NUM_SEGMENTS = 50;
      /*
       *  (0, -1)-------------_(1, -1)
       *       |          _,-"  |
       *       o      _,-"      o
       *       |  _,-"          |
       *   (0, 1)"-------------(1, 1)
       */
      for (var i = 0; i < NUM_SEGMENTS; i++) {
        positions = positions.concat([i, -1, 0, i, 1, 0]);
      }

      var model = new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_STRIP,
          positions: new Float32Array(positions)
        }),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      }));

      model.setUniforms({ numSegments: NUM_SEGMENTS });

      return model;
    }
  }, {
    key: 'calculateInstancePositions',
    value: function calculateInstancePositions(attribute) {
      var _props = this.props,
          data = _props.data,
          getSourcePosition = _props.getSourcePosition,
          getTargetPosition = _props.getTargetPosition;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var object = _step.value;

          var sourcePosition = getSourcePosition(object);
          var targetPosition = getTargetPosition(object);
          value[i + 0] = sourcePosition[0];
          value[i + 1] = sourcePosition[1];
          value[i + 2] = targetPosition[0];
          value[i + 3] = targetPosition[1];
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
    key: 'calculateInstancePositions64Low',
    value: function calculateInstancePositions64Low(attribute) {
      var _props2 = this.props,
          data = _props2.data,
          getSourcePosition = _props2.getSourcePosition,
          getTargetPosition = _props2.getTargetPosition;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var object = _step2.value;

          var sourcePosition = getSourcePosition(object);
          var targetPosition = getTargetPosition(object);
          value[i + 0] = fp64ify(sourcePosition[0])[1];
          value[i + 1] = fp64ify(sourcePosition[1])[1];
          value[i + 2] = fp64ify(targetPosition[0])[1];
          value[i + 3] = fp64ify(targetPosition[1])[1];
          i += size;
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
    key: 'calculateInstanceSourceColors',
    value: function calculateInstanceSourceColors(attribute) {
      var _props3 = this.props,
          data = _props3.data,
          getSourceColor = _props3.getSourceColor;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var object = _step3.value;

          var color = getSourceColor(object);
          value[i + 0] = color[0];
          value[i + 1] = color[1];
          value[i + 2] = color[2];
          value[i + 3] = isNaN(color[3]) ? 255 : color[3];
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
  }, {
    key: 'calculateInstanceTargetColors',
    value: function calculateInstanceTargetColors(attribute) {
      var _props4 = this.props,
          data = _props4.data,
          getTargetColor = _props4.getTargetColor;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = data[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var object = _step4.value;

          var color = getTargetColor(object);
          value[i + 0] = color[0];
          value[i + 1] = color[1];
          value[i + 2] = color[2];
          value[i + 3] = isNaN(color[3]) ? 255 : color[3];
          i += size;
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

  return ArcLayer;
}(Layer);

export default ArcLayer;


ArcLayer.layerName = 'ArcLayer';
ArcLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYXllcnMvY29yZS9hcmMtbGF5ZXIvYXJjLWxheWVyLmpzIl0sIm5hbWVzIjpbIkxheWVyIiwiR0wiLCJNb2RlbCIsIkdlb21ldHJ5IiwiZnA2NGlmeSIsImVuYWJsZTY0Yml0U3VwcG9ydCIsIkNPT1JESU5BVEVfU1lTVEVNIiwidnMiLCJ2czY0IiwiZnMiLCJERUZBVUxUX0NPTE9SIiwiZGVmYXVsdFByb3BzIiwic3Ryb2tlV2lkdGgiLCJmcDY0IiwiZ2V0U291cmNlUG9zaXRpb24iLCJ4Iiwic291cmNlUG9zaXRpb24iLCJnZXRUYXJnZXRQb3NpdGlvbiIsInRhcmdldFBvc2l0aW9uIiwiZ2V0U291cmNlQ29sb3IiLCJjb2xvciIsImdldFRhcmdldENvbG9yIiwiQXJjTGF5ZXIiLCJwcm9wcyIsIm1vZHVsZXMiLCJnbCIsImNvbnRleHQiLCJzZXRTdGF0ZSIsIm1vZGVsIiwiX2dldE1vZGVsIiwiYXR0cmlidXRlTWFuYWdlciIsInN0YXRlIiwiYWRkSW5zdGFuY2VkIiwiaW5zdGFuY2VQb3NpdGlvbnMiLCJzaXplIiwiYWNjZXNzb3IiLCJ1cGRhdGUiLCJjYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9ucyIsImluc3RhbmNlU291cmNlQ29sb3JzIiwidHlwZSIsIlVOU0lHTkVEX0JZVEUiLCJjYWxjdWxhdGVJbnN0YW5jZVNvdXJjZUNvbG9ycyIsImluc3RhbmNlVGFyZ2V0Q29sb3JzIiwiY2FsY3VsYXRlSW5zdGFuY2VUYXJnZXRDb2xvcnMiLCJvbGRQcm9wcyIsImNoYW5nZUZsYWdzIiwiaW52YWxpZGF0ZUFsbCIsInByb2plY3Rpb25Nb2RlIiwiTE5HTEFUIiwiaW5zdGFuY2VQb3NpdGlvbnM2NExvdyIsImNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zNjRMb3ciLCJyZW1vdmUiLCJ1cGRhdGVBdHRyaWJ1dGUiLCJ1bmlmb3JtcyIsInJlbmRlciIsIk9iamVjdCIsImFzc2lnbiIsInBvc2l0aW9ucyIsIk5VTV9TRUdNRU5UUyIsImkiLCJjb25jYXQiLCJnZXRTaGFkZXJzIiwiaWQiLCJnZW9tZXRyeSIsImRyYXdNb2RlIiwiVFJJQU5HTEVfU1RSSVAiLCJGbG9hdDMyQXJyYXkiLCJpc0luc3RhbmNlZCIsInNoYWRlckNhY2hlIiwic2V0VW5pZm9ybXMiLCJudW1TZWdtZW50cyIsImF0dHJpYnV0ZSIsImRhdGEiLCJ2YWx1ZSIsIm9iamVjdCIsImlzTmFOIiwibGF5ZXJOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUUEsS0FBUixRQUFvQixjQUFwQjtBQUNBLFNBQVFDLEVBQVIsRUFBWUMsS0FBWixFQUFtQkMsUUFBbkIsUUFBa0MsU0FBbEM7QUFDQSxTQUFRQyxPQUFSLEVBQWlCQyxrQkFBakIsUUFBMEMseUJBQTFDO0FBQ0EsU0FBUUMsaUJBQVIsUUFBZ0MsY0FBaEM7O0FBRUEsT0FBT0MsRUFBUCxNQUFlLHlCQUFmO0FBQ0EsT0FBT0MsSUFBUCxNQUFpQiw0QkFBakI7QUFDQSxPQUFPQyxFQUFQLE1BQWUsMkJBQWY7O0FBRUEsSUFBTUMsZ0JBQWdCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsR0FBVixDQUF0Qjs7QUFFQSxJQUFNQyxlQUFlO0FBQ25CQyxlQUFhLENBRE07QUFFbkJDLFFBQU0sS0FGYTs7QUFJbkJDLHFCQUFtQjtBQUFBLFdBQUtDLEVBQUVDLGNBQVA7QUFBQSxHQUpBO0FBS25CQyxxQkFBbUI7QUFBQSxXQUFLRixFQUFFRyxjQUFQO0FBQUEsR0FMQTtBQU1uQkMsa0JBQWdCO0FBQUEsV0FBS0osRUFBRUssS0FBRixJQUFXVixhQUFoQjtBQUFBLEdBTkc7QUFPbkJXLGtCQUFnQjtBQUFBLFdBQUtOLEVBQUVLLEtBQUYsSUFBV1YsYUFBaEI7QUFBQTtBQVBHLENBQXJCOztJQVVxQlksUTs7Ozs7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QUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBWXhDOzs7a0RBRTZCcUMsUyxFQUFXO0FBQUEsb0JBQ1IsS0FBS2hELEtBREc7QUFBQSxVQUNoQ2lELElBRGdDLFdBQ2hDQSxJQURnQztBQUFBLFVBQzFCbkQsY0FEMEIsV0FDMUJBLGNBRDBCO0FBQUEsVUFFaENvRCxLQUZnQyxHQUVqQkYsU0FGaUIsQ0FFaENFLEtBRmdDO0FBQUEsVUFFekJ2QyxJQUZ5QixHQUVqQnFDLFNBRmlCLENBRXpCckMsSUFGeUI7O0FBR3ZDLFVBQUl5QixJQUFJLENBQVI7QUFIdUM7QUFBQTtBQUFBOztBQUFBO0FBSXZDLDhCQUFxQmEsSUFBckIsbUlBQTJCO0FBQUEsY0FBaEJFLE1BQWdCOztBQUN6QixjQUFNdEQsUUFBUUMsZUFBZXFELE1BQWYsQ0FBZDtBQUNBRCxnQkFBTWQsSUFBSSxDQUFWLElBQWV2QyxNQUFNLENBQU4sQ0FBZjtBQUNBcUQsZ0JBQU1kLElBQUksQ0FBVixJQUFldkMsTUFBTSxDQUFOLENBQWY7QUFDQXFELGdCQUFNZCxJQUFJLENBQVYsSUFBZXZDLE1BQU0sQ0FBTixDQUFmO0FBQ0FxRCxnQkFBTWQsSUFBSSxDQUFWLElBQWVnQixNQUFNdkQsTUFBTSxDQUFOLENBQU4sSUFBa0IsR0FBbEIsR0FBd0JBLE1BQU0sQ0FBTixDQUF2QztBQUNBdUMsZUFBS3pCLElBQUw7QUFDRDtBQVhzQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBWXhDOzs7O0VBbkptQ2xDLEs7O2VBQWpCc0IsUTs7O0FBc0pyQkEsU0FBU3NELFNBQVQsR0FBcUIsVUFBckI7QUFDQXRELFNBQVNYLFlBQVQsR0FBd0JBLFlBQXhCIiwiZmlsZSI6ImFyYy1sYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge0xheWVyfSBmcm9tICcuLi8uLi8uLi9saWInO1xuaW1wb3J0IHtHTCwgTW9kZWwsIEdlb21ldHJ5fSBmcm9tICdsdW1hLmdsJztcbmltcG9ydCB7ZnA2NGlmeSwgZW5hYmxlNjRiaXRTdXBwb3J0fSBmcm9tICcuLi8uLi8uLi9saWIvdXRpbHMvZnA2NCc7XG5pbXBvcnQge0NPT1JESU5BVEVfU1lTVEVNfSBmcm9tICcuLi8uLi8uLi9saWInO1xuXG5pbXBvcnQgdnMgZnJvbSAnLi9hcmMtbGF5ZXItdmVydGV4Lmdsc2wnO1xuaW1wb3J0IHZzNjQgZnJvbSAnLi9hcmMtbGF5ZXItdmVydGV4LTY0Lmdsc2wnO1xuaW1wb3J0IGZzIGZyb20gJy4vYXJjLWxheWVyLWZyYWdtZW50Lmdsc2wnO1xuXG5jb25zdCBERUZBVUxUX0NPTE9SID0gWzAsIDAsIDAsIDI1NV07XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgc3Ryb2tlV2lkdGg6IDEsXG4gIGZwNjQ6IGZhbHNlLFxuXG4gIGdldFNvdXJjZVBvc2l0aW9uOiB4ID0+IHguc291cmNlUG9zaXRpb24sXG4gIGdldFRhcmdldFBvc2l0aW9uOiB4ID0+IHgudGFyZ2V0UG9zaXRpb24sXG4gIGdldFNvdXJjZUNvbG9yOiB4ID0+IHguY29sb3IgfHwgREVGQVVMVF9DT0xPUixcbiAgZ2V0VGFyZ2V0Q29sb3I6IHggPT4geC5jb2xvciB8fCBERUZBVUxUX0NPTE9SXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcmNMYXllciBleHRlbmRzIExheWVyIHtcbiAgZ2V0U2hhZGVycygpIHtcbiAgICByZXR1cm4gZW5hYmxlNjRiaXRTdXBwb3J0KHRoaXMucHJvcHMpID9cbiAgICAgIHt2czogdnM2NCwgZnMsIG1vZHVsZXM6IFsncHJvamVjdDY0J119IDpcbiAgICAgIHt2cywgZnN9OyAvLyAncHJvamVjdCcgbW9kdWxlIGFkZGVkIGJ5IGRlZmF1bHQuXG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgY29uc3Qge2dsfSA9IHRoaXMuY29udGV4dDtcbiAgICB0aGlzLnNldFN0YXRlKHttb2RlbDogdGhpcy5fZ2V0TW9kZWwoZ2wpfSk7XG5cbiAgICBjb25zdCB7YXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKHtcbiAgICAgIGluc3RhbmNlUG9zaXRpb25zOiB7c2l6ZTogNCwgYWNjZXNzb3I6IFsnZ2V0U291cmNlUG9zaXRpb24nLCAnZ2V0VGFyZ2V0UG9zaXRpb24nXSwgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zfSxcbiAgICAgIGluc3RhbmNlU291cmNlQ29sb3JzOiB7c2l6ZTogNCwgdHlwZTogR0wuVU5TSUdORURfQllURSwgYWNjZXNzb3I6ICdnZXRTb3VyY2VDb2xvcicsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZVNvdXJjZUNvbG9yc30sXG4gICAgICBpbnN0YW5jZVRhcmdldENvbG9yczoge3NpemU6IDQsIHR5cGU6IEdMLlVOU0lHTkVEX0JZVEUsIGFjY2Vzc29yOiAnZ2V0VGFyZ2V0Q29sb3InLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VUYXJnZXRDb2xvcnN9XG4gICAgfSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBtYXgtbGVuICovXG4gIH1cblxuICB1cGRhdGVBdHRyaWJ1dGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgaWYgKHByb3BzLmZwNjQgIT09IG9sZFByb3BzLmZwNjQpIHtcbiAgICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGVBbGwoKTtcblxuICAgICAgaWYgKHByb3BzLmZwNjQgJiYgcHJvcHMucHJvamVjdGlvbk1vZGUgPT09IENPT1JESU5BVEVfU1lTVEVNLkxOR0xBVCkge1xuICAgICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZEluc3RhbmNlZCh7XG4gICAgICAgICAgaW5zdGFuY2VQb3NpdGlvbnM2NExvdzoge1xuICAgICAgICAgICAgc2l6ZTogNCxcbiAgICAgICAgICAgIGFjY2Vzc29yOiBbJ2dldFNvdXJjZVBvc2l0aW9uJywgJ2dldFRhcmdldFBvc2l0aW9uJ10sXG4gICAgICAgICAgICB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnM2NExvd1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdHRyaWJ1dGVNYW5hZ2VyLnJlbW92ZShbXG4gICAgICAgICAgJ2luc3RhbmNlUG9zaXRpb25zNjRMb3cnXG4gICAgICAgIF0pO1xuICAgICAgfVxuXG4gICAgfVxuICB9XG5cbiAgdXBkYXRlU3RhdGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgc3VwZXIudXBkYXRlU3RhdGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KTtcbiAgICAvLyBSZS1nZW5lcmF0ZSBtb2RlbCBpZiBnZW9tZXRyeSBjaGFuZ2VkXG4gICAgaWYgKHByb3BzLmZwNjQgIT09IG9sZFByb3BzLmZwNjQpIHtcbiAgICAgIGNvbnN0IHtnbH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgICB0aGlzLnNldFN0YXRlKHttb2RlbDogdGhpcy5fZ2V0TW9kZWwoZ2wpfSk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQXR0cmlidXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSk7XG4gIH1cblxuICBkcmF3KHt1bmlmb3Jtc30pIHtcbiAgICBjb25zdCB7c3Ryb2tlV2lkdGh9ID0gdGhpcy5wcm9wcztcblxuICAgIHRoaXMuc3RhdGUubW9kZWwucmVuZGVyKE9iamVjdC5hc3NpZ24oe30sIHVuaWZvcm1zLCB7XG4gICAgICBzdHJva2VXaWR0aFxuICAgIH0pKTtcbiAgfVxuXG4gIF9nZXRNb2RlbChnbCkge1xuICAgIGxldCBwb3NpdGlvbnMgPSBbXTtcbiAgICBjb25zdCBOVU1fU0VHTUVOVFMgPSA1MDtcbiAgICAvKlxuICAgICAqICAoMCwgLTEpLS0tLS0tLS0tLS0tLV8oMSwgLTEpXG4gICAgICogICAgICAgfCAgICAgICAgICBfLC1cIiAgfFxuICAgICAqICAgICAgIG8gICAgICBfLC1cIiAgICAgIG9cbiAgICAgKiAgICAgICB8ICBfLC1cIiAgICAgICAgICB8XG4gICAgICogICAoMCwgMSlcIi0tLS0tLS0tLS0tLS0oMSwgMSlcbiAgICAgKi9cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE5VTV9TRUdNRU5UUzsgaSsrKSB7XG4gICAgICBwb3NpdGlvbnMgPSBwb3NpdGlvbnMuY29uY2F0KFtpLCAtMSwgMCwgaSwgMSwgMF0pO1xuICAgIH1cblxuICAgIGNvbnN0IG1vZGVsID0gbmV3IE1vZGVsKGdsLCBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFNoYWRlcnMoKSwge1xuICAgICAgaWQ6IHRoaXMucHJvcHMuaWQsXG4gICAgICBnZW9tZXRyeTogbmV3IEdlb21ldHJ5KHtcbiAgICAgICAgZHJhd01vZGU6IEdMLlRSSUFOR0xFX1NUUklQLFxuICAgICAgICBwb3NpdGlvbnM6IG5ldyBGbG9hdDMyQXJyYXkocG9zaXRpb25zKVxuICAgICAgfSksXG4gICAgICBpc0luc3RhbmNlZDogdHJ1ZSxcbiAgICAgIHNoYWRlckNhY2hlOiB0aGlzLmNvbnRleHQuc2hhZGVyQ2FjaGVcbiAgICB9KSk7XG5cbiAgICBtb2RlbC5zZXRVbmlmb3Jtcyh7bnVtU2VnbWVudHM6IE5VTV9TRUdNRU5UU30pO1xuXG4gICAgcmV0dXJuIG1vZGVsO1xuICB9XG5cbiAgY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldFNvdXJjZVBvc2l0aW9uLCBnZXRUYXJnZXRQb3NpdGlvbn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IHNvdXJjZVBvc2l0aW9uID0gZ2V0U291cmNlUG9zaXRpb24ob2JqZWN0KTtcbiAgICAgIGNvbnN0IHRhcmdldFBvc2l0aW9uID0gZ2V0VGFyZ2V0UG9zaXRpb24ob2JqZWN0KTtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IHNvdXJjZVBvc2l0aW9uWzBdO1xuICAgICAgdmFsdWVbaSArIDFdID0gc291cmNlUG9zaXRpb25bMV07XG4gICAgICB2YWx1ZVtpICsgMl0gPSB0YXJnZXRQb3NpdGlvblswXTtcbiAgICAgIHZhbHVlW2kgKyAzXSA9IHRhcmdldFBvc2l0aW9uWzFdO1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zNjRMb3coYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldFNvdXJjZVBvc2l0aW9uLCBnZXRUYXJnZXRQb3NpdGlvbn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IHNvdXJjZVBvc2l0aW9uID0gZ2V0U291cmNlUG9zaXRpb24ob2JqZWN0KTtcbiAgICAgIGNvbnN0IHRhcmdldFBvc2l0aW9uID0gZ2V0VGFyZ2V0UG9zaXRpb24ob2JqZWN0KTtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IGZwNjRpZnkoc291cmNlUG9zaXRpb25bMF0pWzFdO1xuICAgICAgdmFsdWVbaSArIDFdID0gZnA2NGlmeShzb3VyY2VQb3NpdGlvblsxXSlbMV07XG4gICAgICB2YWx1ZVtpICsgMl0gPSBmcDY0aWZ5KHRhcmdldFBvc2l0aW9uWzBdKVsxXTtcbiAgICAgIHZhbHVlW2kgKyAzXSA9IGZwNjRpZnkodGFyZ2V0UG9zaXRpb25bMV0pWzFdO1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlU291cmNlQ29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRTb3VyY2VDb2xvcn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IGNvbG9yID0gZ2V0U291cmNlQ29sb3Iob2JqZWN0KTtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IGNvbG9yWzBdO1xuICAgICAgdmFsdWVbaSArIDFdID0gY29sb3JbMV07XG4gICAgICB2YWx1ZVtpICsgMl0gPSBjb2xvclsyXTtcbiAgICAgIHZhbHVlW2kgKyAzXSA9IGlzTmFOKGNvbG9yWzNdKSA/IDI1NSA6IGNvbG9yWzNdO1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlVGFyZ2V0Q29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRUYXJnZXRDb2xvcn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IGNvbG9yID0gZ2V0VGFyZ2V0Q29sb3Iob2JqZWN0KTtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IGNvbG9yWzBdO1xuICAgICAgdmFsdWVbaSArIDFdID0gY29sb3JbMV07XG4gICAgICB2YWx1ZVtpICsgMl0gPSBjb2xvclsyXTtcbiAgICAgIHZhbHVlW2kgKyAzXSA9IGlzTmFOKGNvbG9yWzNdKSA/IDI1NSA6IGNvbG9yWzNdO1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxufVxuXG5BcmNMYXllci5sYXllck5hbWUgPSAnQXJjTGF5ZXInO1xuQXJjTGF5ZXIuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19