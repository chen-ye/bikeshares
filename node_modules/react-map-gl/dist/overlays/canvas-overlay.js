'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _react = require('react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _baseControl = require('../components/base-control');

var _baseControl2 = _interopRequireDefault(_baseControl);

var _globals = require('../utils/globals');

var _autobind = require('../utils/autobind');

var _autobind2 = _interopRequireDefault(_autobind);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var propTypes = (0, _assign2.default)({}, _baseControl2.default.propTypes, {
  redraw: _propTypes2.default.func.isRequired
}); // Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var defaultProps = {
  captureScroll: false,
  captureDrag: false,
  captureClick: false,
  captureDoubleClick: false
};

var CanvasOverlay = function (_BaseControl) {
  (0, _inherits3.default)(CanvasOverlay, _BaseControl);

  function CanvasOverlay(props) {
    (0, _classCallCheck3.default)(this, CanvasOverlay);

    var _this = (0, _possibleConstructorReturn3.default)(this, (CanvasOverlay.__proto__ || (0, _getPrototypeOf2.default)(CanvasOverlay)).call(this, props));

    (0, _autobind2.default)(_this);
    return _this;
  }

  (0, _createClass3.default)(CanvasOverlay, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._redraw();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this._redraw();
    }
  }, {
    key: '_redraw',
    value: function _redraw() {
      var pixelRatio = _globals.window.devicePixelRatio || 1;
      var canvas = this._canvas;
      var ctx = canvas.getContext('2d');
      ctx.save();
      ctx.scale(pixelRatio, pixelRatio);

      var _context = this.context,
          viewport = _context.viewport,
          isDragging = _context.isDragging;

      this.props.redraw({
        width: viewport.width,
        height: viewport.height,
        ctx: ctx,
        isDragging: isDragging,
        project: viewport.project.bind(viewport),
        unproject: viewport.unproject.bind(viewport)
      });

      ctx.restore();
    }
  }, {
    key: '_canvasLoaded',
    value: function _canvasLoaded(ref) {
      this._canvas = ref;
      this._onContainerLoad(ref);
    }
  }, {
    key: 'render',
    value: function render() {
      var pixelRatio = _globals.window.devicePixelRatio || 1;
      var _context$viewport = this.context.viewport,
          width = _context$viewport.width,
          height = _context$viewport.height;


      return (0, _react.createElement)('canvas', {
        ref: this._canvasLoaded,
        width: width * pixelRatio,
        height: height * pixelRatio,
        style: {
          width: width + 'px',
          height: height + 'px',
          position: 'absolute',
          pointerEvents: 'none',
          left: 0,
          top: 0
        }
      });
    }
  }]);
  return CanvasOverlay;
}(_baseControl2.default);

exports.default = CanvasOverlay;


CanvasOverlay.displayName = 'CanvasOverlay';
CanvasOverlay.propTypes = propTypes;
CanvasOverlay.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vdmVybGF5cy9jYW52YXMtb3ZlcmxheS5qcyJdLCJuYW1lcyI6WyJwcm9wVHlwZXMiLCJyZWRyYXciLCJmdW5jIiwiaXNSZXF1aXJlZCIsImRlZmF1bHRQcm9wcyIsImNhcHR1cmVTY3JvbGwiLCJjYXB0dXJlRHJhZyIsImNhcHR1cmVDbGljayIsImNhcHR1cmVEb3VibGVDbGljayIsIkNhbnZhc092ZXJsYXkiLCJwcm9wcyIsIl9yZWRyYXciLCJwaXhlbFJhdGlvIiwiZGV2aWNlUGl4ZWxSYXRpbyIsImNhbnZhcyIsIl9jYW52YXMiLCJjdHgiLCJnZXRDb250ZXh0Iiwic2F2ZSIsInNjYWxlIiwiY29udGV4dCIsInZpZXdwb3J0IiwiaXNEcmFnZ2luZyIsIndpZHRoIiwiaGVpZ2h0IiwicHJvamVjdCIsImJpbmQiLCJ1bnByb2plY3QiLCJyZXN0b3JlIiwicmVmIiwiX29uQ29udGFpbmVyTG9hZCIsIl9jYW52YXNMb2FkZWQiLCJzdHlsZSIsInBvc2l0aW9uIiwicG9pbnRlckV2ZW50cyIsImxlZnQiLCJ0b3AiLCJkaXNwbGF5TmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7Ozs7O0FBRUEsSUFBTUEsWUFBWSxzQkFBYyxFQUFkLEVBQWtCLHNCQUFZQSxTQUE5QixFQUF5QztBQUN6REMsVUFBUSxvQkFBVUMsSUFBVixDQUFlQztBQURrQyxDQUF6QyxDQUFsQixDLENBMUJBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQVlBLElBQU1DLGVBQWU7QUFDbkJDLGlCQUFlLEtBREk7QUFFbkJDLGVBQWEsS0FGTTtBQUduQkMsZ0JBQWMsS0FISztBQUluQkMsc0JBQW9CO0FBSkQsQ0FBckI7O0lBT3FCQyxhOzs7QUFDbkIseUJBQVlDLEtBQVosRUFBbUI7QUFBQTs7QUFBQSxvSkFDWEEsS0FEVzs7QUFFakI7QUFGaUI7QUFHbEI7Ozs7d0NBRW1CO0FBQ2xCLFdBQUtDLE9BQUw7QUFDRDs7O3lDQUVvQjtBQUNuQixXQUFLQSxPQUFMO0FBQ0Q7Ozs4QkFFUztBQUNSLFVBQU1DLGFBQWEsZ0JBQU9DLGdCQUFQLElBQTJCLENBQTlDO0FBQ0EsVUFBTUMsU0FBUyxLQUFLQyxPQUFwQjtBQUNBLFVBQU1DLE1BQU1GLE9BQU9HLFVBQVAsQ0FBa0IsSUFBbEIsQ0FBWjtBQUNBRCxVQUFJRSxJQUFKO0FBQ0FGLFVBQUlHLEtBQUosQ0FBVVAsVUFBVixFQUFzQkEsVUFBdEI7O0FBTFEscUJBT3VCLEtBQUtRLE9BUDVCO0FBQUEsVUFPREMsUUFQQyxZQU9EQSxRQVBDO0FBQUEsVUFPU0MsVUFQVCxZQU9TQSxVQVBUOztBQVFSLFdBQUtaLEtBQUwsQ0FBV1QsTUFBWCxDQUFrQjtBQUNoQnNCLGVBQU9GLFNBQVNFLEtBREE7QUFFaEJDLGdCQUFRSCxTQUFTRyxNQUZEO0FBR2hCUixnQkFIZ0I7QUFJaEJNLDhCQUpnQjtBQUtoQkcsaUJBQVNKLFNBQVNJLE9BQVQsQ0FBaUJDLElBQWpCLENBQXNCTCxRQUF0QixDQUxPO0FBTWhCTSxtQkFBV04sU0FBU00sU0FBVCxDQUFtQkQsSUFBbkIsQ0FBd0JMLFFBQXhCO0FBTkssT0FBbEI7O0FBU0FMLFVBQUlZLE9BQUo7QUFDRDs7O2tDQUVhQyxHLEVBQUs7QUFDakIsV0FBS2QsT0FBTCxHQUFlYyxHQUFmO0FBQ0EsV0FBS0MsZ0JBQUwsQ0FBc0JELEdBQXRCO0FBQ0Q7Ozs2QkFFUTtBQUNQLFVBQU1qQixhQUFhLGdCQUFPQyxnQkFBUCxJQUEyQixDQUE5QztBQURPLDhCQUU2QixLQUFLTyxPQUZsQyxDQUVBQyxRQUZBO0FBQUEsVUFFV0UsS0FGWCxxQkFFV0EsS0FGWDtBQUFBLFVBRWtCQyxNQUZsQixxQkFFa0JBLE1BRmxCOzs7QUFJUCxhQUNFLDBCQUFjLFFBQWQsRUFBd0I7QUFDdEJLLGFBQUssS0FBS0UsYUFEWTtBQUV0QlIsZUFBT0EsUUFBUVgsVUFGTztBQUd0QlksZ0JBQVFBLFNBQVNaLFVBSEs7QUFJdEJvQixlQUFPO0FBQ0xULGlCQUFVQSxLQUFWLE9BREs7QUFFTEMsa0JBQVdBLE1BQVgsT0FGSztBQUdMUyxvQkFBVSxVQUhMO0FBSUxDLHlCQUFlLE1BSlY7QUFLTEMsZ0JBQU0sQ0FMRDtBQU1MQyxlQUFLO0FBTkE7QUFKZSxPQUF4QixDQURGO0FBZUQ7Ozs7O2tCQTFEa0IzQixhOzs7QUE2RHJCQSxjQUFjNEIsV0FBZCxHQUE0QixlQUE1QjtBQUNBNUIsY0FBY1QsU0FBZCxHQUEwQkEsU0FBMUI7QUFDQVMsY0FBY0wsWUFBZCxHQUE2QkEsWUFBN0IiLCJmaWxlIjoiY2FudmFzLW92ZXJsYXkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cblxuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge2NyZWF0ZUVsZW1lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgQmFzZUNvbnRyb2wgZnJvbSAnLi4vY29tcG9uZW50cy9iYXNlLWNvbnRyb2wnO1xuaW1wb3J0IHt3aW5kb3d9IGZyb20gJy4uL3V0aWxzL2dsb2JhbHMnO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4uL3V0aWxzL2F1dG9iaW5kJztcblxuY29uc3QgcHJvcFR5cGVzID0gT2JqZWN0LmFzc2lnbih7fSwgQmFzZUNvbnRyb2wucHJvcFR5cGVzLCB7XG4gIHJlZHJhdzogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxufSk7XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgY2FwdHVyZVNjcm9sbDogZmFsc2UsXG4gIGNhcHR1cmVEcmFnOiBmYWxzZSxcbiAgY2FwdHVyZUNsaWNrOiBmYWxzZSxcbiAgY2FwdHVyZURvdWJsZUNsaWNrOiBmYWxzZVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2FudmFzT3ZlcmxheSBleHRlbmRzIEJhc2VDb250cm9sIHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgYXV0b2JpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLl9yZWRyYXcoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICB0aGlzLl9yZWRyYXcoKTtcbiAgfVxuXG4gIF9yZWRyYXcoKSB7XG4gICAgY29uc3QgcGl4ZWxSYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG4gICAgY29uc3QgY2FudmFzID0gdGhpcy5fY2FudmFzO1xuICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGN0eC5zYXZlKCk7XG4gICAgY3R4LnNjYWxlKHBpeGVsUmF0aW8sIHBpeGVsUmF0aW8pO1xuXG4gICAgY29uc3Qge3ZpZXdwb3J0LCBpc0RyYWdnaW5nfSA9IHRoaXMuY29udGV4dDtcbiAgICB0aGlzLnByb3BzLnJlZHJhdyh7XG4gICAgICB3aWR0aDogdmlld3BvcnQud2lkdGgsXG4gICAgICBoZWlnaHQ6IHZpZXdwb3J0LmhlaWdodCxcbiAgICAgIGN0eCxcbiAgICAgIGlzRHJhZ2dpbmcsXG4gICAgICBwcm9qZWN0OiB2aWV3cG9ydC5wcm9qZWN0LmJpbmQodmlld3BvcnQpLFxuICAgICAgdW5wcm9qZWN0OiB2aWV3cG9ydC51bnByb2plY3QuYmluZCh2aWV3cG9ydClcbiAgICB9KTtcblxuICAgIGN0eC5yZXN0b3JlKCk7XG4gIH1cblxuICBfY2FudmFzTG9hZGVkKHJlZikge1xuICAgIHRoaXMuX2NhbnZhcyA9IHJlZjtcbiAgICB0aGlzLl9vbkNvbnRhaW5lckxvYWQocmVmKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwaXhlbFJhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgICBjb25zdCB7dmlld3BvcnQ6IHt3aWR0aCwgaGVpZ2h0fX0gPSB0aGlzLmNvbnRleHQ7XG5cbiAgICByZXR1cm4gKFxuICAgICAgY3JlYXRlRWxlbWVudCgnY2FudmFzJywge1xuICAgICAgICByZWY6IHRoaXMuX2NhbnZhc0xvYWRlZCxcbiAgICAgICAgd2lkdGg6IHdpZHRoICogcGl4ZWxSYXRpbyxcbiAgICAgICAgaGVpZ2h0OiBoZWlnaHQgKiBwaXhlbFJhdGlvLFxuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIHdpZHRoOiBgJHt3aWR0aH1weGAsXG4gICAgICAgICAgaGVpZ2h0OiBgJHtoZWlnaHR9cHhgLFxuICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgIHBvaW50ZXJFdmVudHM6ICdub25lJyxcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHRvcDogMFxuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG4gIH1cbn1cblxuQ2FudmFzT3ZlcmxheS5kaXNwbGF5TmFtZSA9ICdDYW52YXNPdmVybGF5JztcbkNhbnZhc092ZXJsYXkucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuQ2FudmFzT3ZlcmxheS5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG4iXX0=