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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var propTypes = (0, _assign2.default)({}, _baseControl2.default.propTypes, {
  redraw: _propTypes2.default.func.isRequired,
  style: _propTypes2.default.object
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

var HTMLOverlay = function (_BaseControl) {
  (0, _inherits3.default)(HTMLOverlay, _BaseControl);

  function HTMLOverlay() {
    (0, _classCallCheck3.default)(this, HTMLOverlay);
    return (0, _possibleConstructorReturn3.default)(this, (HTMLOverlay.__proto__ || (0, _getPrototypeOf2.default)(HTMLOverlay)).apply(this, arguments));
  }

  (0, _createClass3.default)(HTMLOverlay, [{
    key: 'render',
    value: function render() {
      var _context = this.context,
          viewport = _context.viewport,
          isDragging = _context.isDragging;

      var style = (0, _assign2.default)({
        position: 'absolute',
        pointerEvents: 'none',
        left: 0,
        top: 0,
        width: viewport.width,
        height: viewport.height
      }, this.props.style);

      return (0, _react.createElement)('div', {
        ref: this._onContainerLoad,
        style: style
      }, this.props.redraw({
        width: viewport.width,
        height: viewport.height,
        isDragging: isDragging,
        project: viewport.project.bind(viewport),
        unproject: viewport.unproject.bind(viewport)
      }));
    }
  }]);
  return HTMLOverlay;
}(_baseControl2.default);

exports.default = HTMLOverlay;


HTMLOverlay.displayName = 'HTMLOverlay';
HTMLOverlay.propTypes = propTypes;
HTMLOverlay.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vdmVybGF5cy9odG1sLW92ZXJsYXkuanMiXSwibmFtZXMiOlsicHJvcFR5cGVzIiwicmVkcmF3IiwiZnVuYyIsImlzUmVxdWlyZWQiLCJzdHlsZSIsIm9iamVjdCIsImRlZmF1bHRQcm9wcyIsImNhcHR1cmVTY3JvbGwiLCJjYXB0dXJlRHJhZyIsImNhcHR1cmVDbGljayIsImNhcHR1cmVEb3VibGVDbGljayIsIkhUTUxPdmVybGF5IiwiY29udGV4dCIsInZpZXdwb3J0IiwiaXNEcmFnZ2luZyIsInBvc2l0aW9uIiwicG9pbnRlckV2ZW50cyIsImxlZnQiLCJ0b3AiLCJ3aWR0aCIsImhlaWdodCIsInByb3BzIiwicmVmIiwiX29uQ29udGFpbmVyTG9hZCIsInByb2plY3QiLCJiaW5kIiwidW5wcm9qZWN0IiwiZGlzcGxheU5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxZQUFZLHNCQUFjLEVBQWQsRUFBa0Isc0JBQVlBLFNBQTlCLEVBQXlDO0FBQ3pEQyxVQUFRLG9CQUFVQyxJQUFWLENBQWVDLFVBRGtDO0FBRXpEQyxTQUFPLG9CQUFVQztBQUZ3QyxDQUF6QyxDQUFsQixDLENBeEJBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQVdBLElBQU1DLGVBQWU7QUFDbkJDLGlCQUFlLEtBREk7QUFFbkJDLGVBQWEsS0FGTTtBQUduQkMsZ0JBQWMsS0FISztBQUluQkMsc0JBQW9CO0FBSkQsQ0FBckI7O0lBT3FCQyxXOzs7Ozs7Ozs7OzZCQUNWO0FBQUEscUJBQ3dCLEtBQUtDLE9BRDdCO0FBQUEsVUFDQUMsUUFEQSxZQUNBQSxRQURBO0FBQUEsVUFDVUMsVUFEVixZQUNVQSxVQURWOztBQUVQLFVBQU1WLFFBQVEsc0JBQWM7QUFDMUJXLGtCQUFVLFVBRGdCO0FBRTFCQyx1QkFBZSxNQUZXO0FBRzFCQyxjQUFNLENBSG9CO0FBSTFCQyxhQUFLLENBSnFCO0FBSzFCQyxlQUFPTixTQUFTTSxLQUxVO0FBTTFCQyxnQkFBUVAsU0FBU087QUFOUyxPQUFkLEVBT1gsS0FBS0MsS0FBTCxDQUFXakIsS0FQQSxDQUFkOztBQVNBLGFBQ0UsMEJBQWMsS0FBZCxFQUFxQjtBQUNuQmtCLGFBQUssS0FBS0MsZ0JBRFM7QUFFbkJuQjtBQUZtQixPQUFyQixFQUlFLEtBQUtpQixLQUFMLENBQVdwQixNQUFYLENBQWtCO0FBQ2hCa0IsZUFBT04sU0FBU00sS0FEQTtBQUVoQkMsZ0JBQVFQLFNBQVNPLE1BRkQ7QUFHaEJOLDhCQUhnQjtBQUloQlUsaUJBQVNYLFNBQVNXLE9BQVQsQ0FBaUJDLElBQWpCLENBQXNCWixRQUF0QixDQUpPO0FBS2hCYSxtQkFBV2IsU0FBU2EsU0FBVCxDQUFtQkQsSUFBbkIsQ0FBd0JaLFFBQXhCO0FBTEssT0FBbEIsQ0FKRixDQURGO0FBY0Q7Ozs7O2tCQTFCa0JGLFc7OztBQTZCckJBLFlBQVlnQixXQUFaLEdBQTBCLGFBQTFCO0FBQ0FoQixZQUFZWCxTQUFaLEdBQXdCQSxTQUF4QjtBQUNBVyxZQUFZTCxZQUFaLEdBQTJCQSxZQUEzQiIsImZpbGUiOiJodG1sLW92ZXJsYXkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cblxuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge2NyZWF0ZUVsZW1lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgQmFzZUNvbnRyb2wgZnJvbSAnLi4vY29tcG9uZW50cy9iYXNlLWNvbnRyb2wnO1xuXG5jb25zdCBwcm9wVHlwZXMgPSBPYmplY3QuYXNzaWduKHt9LCBCYXNlQ29udHJvbC5wcm9wVHlwZXMsIHtcbiAgcmVkcmF3OiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICBzdHlsZTogUHJvcFR5cGVzLm9iamVjdFxufSk7XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgY2FwdHVyZVNjcm9sbDogZmFsc2UsXG4gIGNhcHR1cmVEcmFnOiBmYWxzZSxcbiAgY2FwdHVyZUNsaWNrOiBmYWxzZSxcbiAgY2FwdHVyZURvdWJsZUNsaWNrOiBmYWxzZVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSFRNTE92ZXJsYXkgZXh0ZW5kcyBCYXNlQ29udHJvbCB7XG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7dmlld3BvcnQsIGlzRHJhZ2dpbmd9ID0gdGhpcy5jb250ZXh0O1xuICAgIGNvbnN0IHN0eWxlID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIHBvaW50ZXJFdmVudHM6ICdub25lJyxcbiAgICAgIGxlZnQ6IDAsXG4gICAgICB0b3A6IDAsXG4gICAgICB3aWR0aDogdmlld3BvcnQud2lkdGgsXG4gICAgICBoZWlnaHQ6IHZpZXdwb3J0LmhlaWdodFxuICAgIH0sIHRoaXMucHJvcHMuc3R5bGUpO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgcmVmOiB0aGlzLl9vbkNvbnRhaW5lckxvYWQsXG4gICAgICAgIHN0eWxlXG4gICAgICB9LFxuICAgICAgICB0aGlzLnByb3BzLnJlZHJhdyh7XG4gICAgICAgICAgd2lkdGg6IHZpZXdwb3J0LndpZHRoLFxuICAgICAgICAgIGhlaWdodDogdmlld3BvcnQuaGVpZ2h0LFxuICAgICAgICAgIGlzRHJhZ2dpbmcsXG4gICAgICAgICAgcHJvamVjdDogdmlld3BvcnQucHJvamVjdC5iaW5kKHZpZXdwb3J0KSxcbiAgICAgICAgICB1bnByb2plY3Q6IHZpZXdwb3J0LnVucHJvamVjdC5iaW5kKHZpZXdwb3J0KVxuICAgICAgICB9KVxuICAgICAgKVxuICAgICk7XG4gIH1cbn1cblxuSFRNTE92ZXJsYXkuZGlzcGxheU5hbWUgPSAnSFRNTE92ZXJsYXknO1xuSFRNTE92ZXJsYXkucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuSFRNTE92ZXJsYXkuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19