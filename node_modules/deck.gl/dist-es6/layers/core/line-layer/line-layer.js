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

import vs from './line-layer-vertex.glsl';
import vs64 from './line-layer-vertex-64.glsl';
import fs from './line-layer-fragment.glsl';

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
  getColor: function getColor(x) {
    return x.color || DEFAULT_COLOR;
  }
};

var LineLayer = function (_Layer) {
  _inherits(LineLayer, _Layer);

  function LineLayer() {
    _classCallCheck(this, LineLayer);

    return _possibleConstructorReturn(this, (LineLayer.__proto__ || Object.getPrototypeOf(LineLayer)).apply(this, arguments));
  }

  _createClass(LineLayer, [{
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
        instanceSourcePositions: { size: 3, accessor: 'getSourcePosition', update: this.calculateInstanceSourcePositions },
        instanceTargetPositions: { size: 3, accessor: 'getTargetPosition', update: this.calculateInstanceTargetPositions },
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
            instanceSourceTargetPositions64xyLow: {
              size: 4,
              accessor: ['getSourcePosition', 'getTargetPosition'],
              update: this.calculateInstanceSourceTargetPositions64xyLow
            }
          });
        } else {
          attributeManager.remove(['instanceSourceTargetPositions64xyLow']);
        }
      }
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref2) {
      var props = _ref2.props,
          oldProps = _ref2.oldProps,
          changeFlags = _ref2.changeFlags;

      _get(LineLayer.prototype.__proto__ || Object.getPrototypeOf(LineLayer.prototype), 'updateState', this).call(this, { props: props, oldProps: oldProps, changeFlags: changeFlags });

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
      /*
       *  (0, -1)-------------_(1, -1)
       *       |          _,-"  |
       *       o      _,-"      o
       *       |  _,-"          |
       *   (0, 1)"-------------(1, 1)
       */
      var positions = [0, -1, 0, 0, 1, 0, 1, -1, 0, 1, 1, 0];

      return new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_STRIP,
          positions: new Float32Array(positions)
        }),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      }));
    }
  }, {
    key: 'calculateInstanceSourcePositions',
    value: function calculateInstanceSourcePositions(attribute) {
      var _props = this.props,
          data = _props.data,
          getSourcePosition = _props.getSourcePosition;
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
          value[i + 0] = sourcePosition[0];
          value[i + 1] = sourcePosition[1];
          value[i + 2] = isNaN(sourcePosition[2]) ? 0 : sourcePosition[2];
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
    key: 'calculateInstanceTargetPositions',
    value: function calculateInstanceTargetPositions(attribute) {
      var _props2 = this.props,
          data = _props2.data,
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

          var targetPosition = getTargetPosition(object);
          value[i + 0] = targetPosition[0];
          value[i + 1] = targetPosition[1];
          value[i + 2] = isNaN(targetPosition[2]) ? 0 : targetPosition[2];
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
    key: 'calculateInstanceSourceTargetPositions64xyLow',
    value: function calculateInstanceSourceTargetPositions64xyLow(attribute) {
      var _props3 = this.props,
          data = _props3.data,
          getSourcePosition = _props3.getSourcePosition,
          getTargetPosition = _props3.getTargetPosition;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var object = _step3.value;

          var sourcePosition = getSourcePosition(object);
          var targetPosition = getTargetPosition(object);
          value[i + 0] = fp64ify(sourcePosition[0])[1];
          value[i + 1] = fp64ify(sourcePosition[1])[1];
          value[i + 2] = fp64ify(targetPosition[0])[1];
          value[i + 3] = fp64ify(targetPosition[1])[1];
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
    key: 'calculateInstanceColors',
    value: function calculateInstanceColors(attribute) {
      var _props4 = this.props,
          data = _props4.data,
          getColor = _props4.getColor;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = data[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var object = _step4.value;

          var color = getColor(object);
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

  return LineLayer;
}(Layer);

export default LineLayer;


LineLayer.layerName = 'LineLayer';
LineLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYXllcnMvY29yZS9saW5lLWxheWVyL2xpbmUtbGF5ZXIuanMiXSwibmFtZXMiOlsiTGF5ZXIiLCJHTCIsIk1vZGVsIiwiR2VvbWV0cnkiLCJmcDY0aWZ5IiwiZW5hYmxlNjRiaXRTdXBwb3J0IiwiQ09PUkRJTkFURV9TWVNURU0iLCJ2cyIsInZzNjQiLCJmcyIsIkRFRkFVTFRfQ09MT1IiLCJkZWZhdWx0UHJvcHMiLCJzdHJva2VXaWR0aCIsImZwNjQiLCJnZXRTb3VyY2VQb3NpdGlvbiIsIngiLCJzb3VyY2VQb3NpdGlvbiIsImdldFRhcmdldFBvc2l0aW9uIiwidGFyZ2V0UG9zaXRpb24iLCJnZXRDb2xvciIsImNvbG9yIiwiTGluZUxheWVyIiwicHJvcHMiLCJtb2R1bGVzIiwiZ2wiLCJjb250ZXh0Iiwic2V0U3RhdGUiLCJtb2RlbCIsIl9nZXRNb2RlbCIsImF0dHJpYnV0ZU1hbmFnZXIiLCJzdGF0ZSIsImFkZEluc3RhbmNlZCIsImluc3RhbmNlU291cmNlUG9zaXRpb25zIiwic2l6ZSIsImFjY2Vzc29yIiwidXBkYXRlIiwiY2FsY3VsYXRlSW5zdGFuY2VTb3VyY2VQb3NpdGlvbnMiLCJpbnN0YW5jZVRhcmdldFBvc2l0aW9ucyIsImNhbGN1bGF0ZUluc3RhbmNlVGFyZ2V0UG9zaXRpb25zIiwiaW5zdGFuY2VDb2xvcnMiLCJ0eXBlIiwiVU5TSUdORURfQllURSIsImNhbGN1bGF0ZUluc3RhbmNlQ29sb3JzIiwib2xkUHJvcHMiLCJjaGFuZ2VGbGFncyIsImludmFsaWRhdGVBbGwiLCJwcm9qZWN0aW9uTW9kZSIsIkxOR0xBVCIsImluc3RhbmNlU291cmNlVGFyZ2V0UG9zaXRpb25zNjR4eUxvdyIsImNhbGN1bGF0ZUluc3RhbmNlU291cmNlVGFyZ2V0UG9zaXRpb25zNjR4eUxvdyIsInJlbW92ZSIsInVwZGF0ZUF0dHJpYnV0ZSIsInVuaWZvcm1zIiwicmVuZGVyIiwiT2JqZWN0IiwiYXNzaWduIiwicG9zaXRpb25zIiwiZ2V0U2hhZGVycyIsImlkIiwiZ2VvbWV0cnkiLCJkcmF3TW9kZSIsIlRSSUFOR0xFX1NUUklQIiwiRmxvYXQzMkFycmF5IiwiaXNJbnN0YW5jZWQiLCJzaGFkZXJDYWNoZSIsImF0dHJpYnV0ZSIsImRhdGEiLCJ2YWx1ZSIsImkiLCJvYmplY3QiLCJpc05hTiIsImxheWVyTmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVFBLEtBQVIsUUFBb0IsY0FBcEI7QUFDQSxTQUFRQyxFQUFSLEVBQVlDLEtBQVosRUFBbUJDLFFBQW5CLFFBQWtDLFNBQWxDO0FBQ0EsU0FBUUMsT0FBUixFQUFpQkMsa0JBQWpCLFFBQTBDLHlCQUExQztBQUNBLFNBQVFDLGlCQUFSLFFBQWdDLGNBQWhDOztBQUVBLE9BQU9DLEVBQVAsTUFBZSwwQkFBZjtBQUNBLE9BQU9DLElBQVAsTUFBaUIsNkJBQWpCO0FBQ0EsT0FBT0MsRUFBUCxNQUFlLDRCQUFmOztBQUVBLElBQU1DLGdCQUFnQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLEdBQVYsQ0FBdEI7O0FBRUEsSUFBTUMsZUFBZTtBQUNuQkMsZUFBYSxDQURNO0FBRW5CQyxRQUFNLEtBRmE7O0FBSW5CQyxxQkFBbUI7QUFBQSxXQUFLQyxFQUFFQyxjQUFQO0FBQUEsR0FKQTtBQUtuQkMscUJBQW1CO0FBQUEsV0FBS0YsRUFBRUcsY0FBUDtBQUFBLEdBTEE7QUFNbkJDLFlBQVU7QUFBQSxXQUFLSixFQUFFSyxLQUFGLElBQVdWLGFBQWhCO0FBQUE7QUFOUyxDQUFyQjs7SUFTcUJXLFM7Ozs7Ozs7Ozs7O2lDQUNOO0FBQ1gsYUFBT2hCLG1CQUFtQixLQUFLaUIsS0FBeEIsSUFDTCxFQUFDZixJQUFJQyxJQUFMLEVBQVdDLE1BQVgsRUFBZWMsU0FBUyxDQUFDLFdBQUQs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TUMsSUFBSSxDQUFWLElBQWVoRCxNQUFNLENBQU4sQ0FBZjtBQUNBK0MsZ0JBQU1DLElBQUksQ0FBVixJQUFlaEQsTUFBTSxDQUFOLENBQWY7QUFDQStDLGdCQUFNQyxJQUFJLENBQVYsSUFBZWhELE1BQU0sQ0FBTixDQUFmO0FBQ0ErQyxnQkFBTUMsSUFBSSxDQUFWLElBQWVFLE1BQU1sRCxNQUFNLENBQU4sQ0FBTixJQUFrQixHQUFsQixHQUF3QkEsTUFBTSxDQUFOLENBQXZDO0FBQ0FnRCxlQUFLbkMsSUFBTDtBQUNEO0FBWGdDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFZbEM7Ozs7RUF2SW9DakMsSzs7ZUFBbEJxQixTOzs7QUEwSXJCQSxVQUFVa0QsU0FBVixHQUFzQixXQUF0QjtBQUNBbEQsVUFBVVYsWUFBVixHQUF5QkEsWUFBekIiLCJmaWxlIjoibGluZS1sYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge0xheWVyfSBmcm9tICcuLi8uLi8uLi9saWInO1xuaW1wb3J0IHtHTCwgTW9kZWwsIEdlb21ldHJ5fSBmcm9tICdsdW1hLmdsJztcbmltcG9ydCB7ZnA2NGlmeSwgZW5hYmxlNjRiaXRTdXBwb3J0fSBmcm9tICcuLi8uLi8uLi9saWIvdXRpbHMvZnA2NCc7XG5pbXBvcnQge0NPT1JESU5BVEVfU1lTVEVNfSBmcm9tICcuLi8uLi8uLi9saWInO1xuXG5pbXBvcnQgdnMgZnJvbSAnLi9saW5lLWxheWVyLXZlcnRleC5nbHNsJztcbmltcG9ydCB2czY0IGZyb20gJy4vbGluZS1sYXllci12ZXJ0ZXgtNjQuZ2xzbCc7XG5pbXBvcnQgZnMgZnJvbSAnLi9saW5lLWxheWVyLWZyYWdtZW50Lmdsc2wnO1xuXG5jb25zdCBERUZBVUxUX0NPTE9SID0gWzAsIDAsIDAsIDI1NV07XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgc3Ryb2tlV2lkdGg6IDEsXG4gIGZwNjQ6IGZhbHNlLFxuXG4gIGdldFNvdXJjZVBvc2l0aW9uOiB4ID0+IHguc291cmNlUG9zaXRpb24sXG4gIGdldFRhcmdldFBvc2l0aW9uOiB4ID0+IHgudGFyZ2V0UG9zaXRpb24sXG4gIGdldENvbG9yOiB4ID0+IHguY29sb3IgfHwgREVGQVVMVF9DT0xPUlxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGluZUxheWVyIGV4dGVuZHMgTGF5ZXIge1xuICBnZXRTaGFkZXJzKCkge1xuICAgIHJldHVybiBlbmFibGU2NGJpdFN1cHBvcnQodGhpcy5wcm9wcykgP1xuICAgICAge3ZzOiB2czY0LCBmcywgbW9kdWxlczogWydwcm9qZWN0NjQnXX0gOlxuICAgICAge3ZzLCBmc307IC8vICdwcm9qZWN0JyBtb2R1bGUgYWRkZWQgYnkgZGVmYXVsdC5cbiAgfVxuXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICBjb25zdCB7Z2x9ID0gdGhpcy5jb250ZXh0O1xuICAgIHRoaXMuc2V0U3RhdGUoe21vZGVsOiB0aGlzLl9nZXRNb2RlbChnbCl9KTtcblxuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXG4gICAgYXR0cmlidXRlTWFuYWdlci5hZGRJbnN0YW5jZWQoe1xuICAgICAgaW5zdGFuY2VTb3VyY2VQb3NpdGlvbnM6IHtzaXplOiAzLCBhY2Nlc3NvcjogJ2dldFNvdXJjZVBvc2l0aW9uJywgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlU291cmNlUG9zaXRpb25zfSxcbiAgICAgIGluc3RhbmNlVGFyZ2V0UG9zaXRpb25zOiB7c2l6ZTogMywgYWNjZXNzb3I6ICdnZXRUYXJnZXRQb3NpdGlvbicsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZVRhcmdldFBvc2l0aW9uc30sXG4gICAgICBpbnN0YW5jZUNvbG9yczoge3NpemU6IDQsIHR5cGU6IEdMLlVOU0lHTkVEX0JZVEUsIGFjY2Vzc29yOiAnZ2V0Q29sb3InLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VDb2xvcnN9XG4gICAgfSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBtYXgtbGVuICovXG4gIH1cblxuICB1cGRhdGVBdHRyaWJ1dGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgaWYgKHByb3BzLmZwNjQgIT09IG9sZFByb3BzLmZwNjQpIHtcbiAgICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGVBbGwoKTtcblxuICAgICAgaWYgKHByb3BzLmZwNjQgJiYgcHJvcHMucHJvamVjdGlvbk1vZGUgPT09IENPT1JESU5BVEVfU1lTVEVNLkxOR0xBVCkge1xuICAgICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZEluc3RhbmNlZCh7XG4gICAgICAgICAgaW5zdGFuY2VTb3VyY2VUYXJnZXRQb3NpdGlvbnM2NHh5TG93OiB7XG4gICAgICAgICAgICBzaXplOiA0LFxuICAgICAgICAgICAgYWNjZXNzb3I6IFsnZ2V0U291cmNlUG9zaXRpb24nLCAnZ2V0VGFyZ2V0UG9zaXRpb24nXSxcbiAgICAgICAgICAgIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZVNvdXJjZVRhcmdldFBvc2l0aW9uczY0eHlMb3dcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXR0cmlidXRlTWFuYWdlci5yZW1vdmUoW1xuICAgICAgICAgICdpbnN0YW5jZVNvdXJjZVRhcmdldFBvc2l0aW9uczY0eHlMb3cnXG4gICAgICAgIF0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVN0YXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSkge1xuICAgIHN1cGVyLnVwZGF0ZVN0YXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSk7XG5cbiAgICBpZiAocHJvcHMuZnA2NCAhPT0gb2xkUHJvcHMuZnA2NCkge1xuICAgICAgY29uc3Qge2dsfSA9IHRoaXMuY29udGV4dDtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe21vZGVsOiB0aGlzLl9nZXRNb2RlbChnbCl9KTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVBdHRyaWJ1dGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KTtcbiAgfVxuXG4gIGRyYXcoe3VuaWZvcm1zfSkge1xuICAgIGNvbnN0IHtzdHJva2VXaWR0aH0gPSB0aGlzLnByb3BzO1xuXG4gICAgdGhpcy5zdGF0ZS5tb2RlbC5yZW5kZXIoT2JqZWN0LmFzc2lnbih7fSwgdW5pZm9ybXMsIHtcbiAgICAgIHN0cm9rZVdpZHRoXG4gICAgfSkpO1xuICB9XG5cbiAgX2dldE1vZGVsKGdsKSB7XG4gICAgLypcbiAgICAgKiAgKDAsIC0xKS0tLS0tLS0tLS0tLS1fKDEsIC0xKVxuICAgICAqICAgICAgIHwgICAgICAgICAgXywtXCIgIHxcbiAgICAgKiAgICAgICBvICAgICAgXywtXCIgICAgICBvXG4gICAgICogICAgICAgfCAgXywtXCIgICAgICAgICAgfFxuICAgICAqICAgKDAsIDEpXCItLS0tLS0tLS0tLS0tKDEsIDEpXG4gICAgICovXG4gICAgY29uc3QgcG9zaXRpb25zID0gWzAsIC0xLCAwLCAwLCAxLCAwLCAxLCAtMSwgMCwgMSwgMSwgMF07XG5cbiAgICByZXR1cm4gbmV3IE1vZGVsKGdsLCBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFNoYWRlcnMoKSwge1xuICAgICAgaWQ6IHRoaXMucHJvcHMuaWQsXG4gICAgICBnZW9tZXRyeTogbmV3IEdlb21ldHJ5KHtcbiAgICAgICAgZHJhd01vZGU6IEdMLlRSSUFOR0xFX1NUUklQLFxuICAgICAgICBwb3NpdGlvbnM6IG5ldyBGbG9hdDMyQXJyYXkocG9zaXRpb25zKVxuICAgICAgfSksXG4gICAgICBpc0luc3RhbmNlZDogdHJ1ZSxcbiAgICAgIHNoYWRlckNhY2hlOiB0aGlzLmNvbnRleHQuc2hhZGVyQ2FjaGVcbiAgICB9KSk7XG4gIH1cblxuICBjYWxjdWxhdGVJbnN0YW5jZVNvdXJjZVBvc2l0aW9ucyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ2V0U291cmNlUG9zaXRpb259ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IG9iamVjdCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCBzb3VyY2VQb3NpdGlvbiA9IGdldFNvdXJjZVBvc2l0aW9uKG9iamVjdCk7XG4gICAgICB2YWx1ZVtpICsgMF0gPSBzb3VyY2VQb3NpdGlvblswXTtcbiAgICAgIHZhbHVlW2kgKyAxXSA9IHNvdXJjZVBvc2l0aW9uWzFdO1xuICAgICAgdmFsdWVbaSArIDJdID0gaXNOYU4oc291cmNlUG9zaXRpb25bMl0pID8gMCA6IHNvdXJjZVBvc2l0aW9uWzJdO1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlVGFyZ2V0UG9zaXRpb25zKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRUYXJnZXRQb3NpdGlvbn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IHRhcmdldFBvc2l0aW9uID0gZ2V0VGFyZ2V0UG9zaXRpb24ob2JqZWN0KTtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IHRhcmdldFBvc2l0aW9uWzBdO1xuICAgICAgdmFsdWVbaSArIDFdID0gdGFyZ2V0UG9zaXRpb25bMV07XG4gICAgICB2YWx1ZVtpICsgMl0gPSBpc05hTih0YXJnZXRQb3NpdGlvblsyXSkgPyAwIDogdGFyZ2V0UG9zaXRpb25bMl07XG4gICAgICBpICs9IHNpemU7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlSW5zdGFuY2VTb3VyY2VUYXJnZXRQb3NpdGlvbnM2NHh5TG93KGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRTb3VyY2VQb3NpdGlvbiwgZ2V0VGFyZ2V0UG9zaXRpb259ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IG9iamVjdCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCBzb3VyY2VQb3NpdGlvbiA9IGdldFNvdXJjZVBvc2l0aW9uKG9iamVjdCk7XG4gICAgICBjb25zdCB0YXJnZXRQb3NpdGlvbiA9IGdldFRhcmdldFBvc2l0aW9uKG9iamVjdCk7XG4gICAgICB2YWx1ZVtpICsgMF0gPSBmcDY0aWZ5KHNvdXJjZVBvc2l0aW9uWzBdKVsxXTtcbiAgICAgIHZhbHVlW2kgKyAxXSA9IGZwNjRpZnkoc291cmNlUG9zaXRpb25bMV0pWzFdO1xuICAgICAgdmFsdWVbaSArIDJdID0gZnA2NGlmeSh0YXJnZXRQb3NpdGlvblswXSlbMV07XG4gICAgICB2YWx1ZVtpICsgM10gPSBmcDY0aWZ5KHRhcmdldFBvc2l0aW9uWzFdKVsxXTtcbiAgICAgIGkgKz0gc2l6ZTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVJbnN0YW5jZUNvbG9ycyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ2V0Q29sb3J9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IG9iamVjdCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCBjb2xvciA9IGdldENvbG9yKG9iamVjdCk7XG4gICAgICB2YWx1ZVtpICsgMF0gPSBjb2xvclswXTtcbiAgICAgIHZhbHVlW2kgKyAxXSA9IGNvbG9yWzFdO1xuICAgICAgdmFsdWVbaSArIDJdID0gY29sb3JbMl07XG4gICAgICB2YWx1ZVtpICsgM10gPSBpc05hTihjb2xvclszXSkgPyAyNTUgOiBjb2xvclszXTtcbiAgICAgIGkgKz0gc2l6ZTtcbiAgICB9XG4gIH1cbn1cblxuTGluZUxheWVyLmxheWVyTmFtZSA9ICdMaW5lTGF5ZXInO1xuTGluZUxheWVyLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbiJdfQ==