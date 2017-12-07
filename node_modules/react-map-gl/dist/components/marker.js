'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

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

var _baseControl = require('./base-control');

var _baseControl2 = _interopRequireDefault(_baseControl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var propTypes = (0, _assign2.default)({}, _baseControl2.default.propTypes, {
  // Custom className
  className: _propTypes2.default.string,
  // Longitude of the anchor point
  longitude: _propTypes2.default.number.isRequired,
  // Latitude of the anchor point
  latitude: _propTypes2.default.number.isRequired,
  // Offset from the left
  offsetLeft: _propTypes2.default.number,
  // Offset from the top
  offsetTop: _propTypes2.default.number
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


var defaultProps = (0, _assign2.default)({}, _baseControl2.default.defaultProps, {
  className: '',
  offsetLeft: 0,
  offsetTop: 0
});

/*
 * PureComponent doesn't update when context changes.
 * The only way is to implement our own shouldComponentUpdate here. Considering
 * the parent component (StaticMap or InteractiveMap) is pure, and map re-render
 * is almost always triggered by a viewport change, we almost definitely need to
 * recalculate the marker's position when the parent re-renders.
 */

var Marker = function (_BaseControl) {
  (0, _inherits3.default)(Marker, _BaseControl);

  function Marker() {
    (0, _classCallCheck3.default)(this, Marker);
    return (0, _possibleConstructorReturn3.default)(this, (Marker.__proto__ || (0, _getPrototypeOf2.default)(Marker)).apply(this, arguments));
  }

  (0, _createClass3.default)(Marker, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          className = _props.className,
          longitude = _props.longitude,
          latitude = _props.latitude,
          offsetLeft = _props.offsetLeft,
          offsetTop = _props.offsetTop;

      var _context$viewport$pro = this.context.viewport.project([longitude, latitude]),
          _context$viewport$pro2 = (0, _slicedToArray3.default)(_context$viewport$pro, 2),
          x = _context$viewport$pro2[0],
          y = _context$viewport$pro2[1];

      var containerStyle = {
        position: 'absolute',
        left: x + offsetLeft,
        top: y + offsetTop
      };

      return (0, _react.createElement)('div', {
        className: 'mapboxgl-marker ' + className,
        ref: this._onContainerLoad,
        style: containerStyle,
        children: this.props.children
      });
    }
  }]);
  return Marker;
}(_baseControl2.default);

exports.default = Marker;


Marker.displayName = 'Marker';
Marker.propTypes = propTypes;
Marker.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL21hcmtlci5qcyJdLCJuYW1lcyI6WyJwcm9wVHlwZXMiLCJjbGFzc05hbWUiLCJzdHJpbmciLCJsb25naXR1ZGUiLCJudW1iZXIiLCJpc1JlcXVpcmVkIiwibGF0aXR1ZGUiLCJvZmZzZXRMZWZ0Iiwib2Zmc2V0VG9wIiwiZGVmYXVsdFByb3BzIiwiTWFya2VyIiwicHJvcHMiLCJjb250ZXh0Iiwidmlld3BvcnQiLCJwcm9qZWN0IiwieCIsInkiLCJjb250YWluZXJTdHlsZSIsInBvc2l0aW9uIiwibGVmdCIsInRvcCIsInJlZiIsIl9vbkNvbnRhaW5lckxvYWQiLCJzdHlsZSIsImNoaWxkcmVuIiwiZGlzcGxheU5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkE7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTUEsWUFBWSxzQkFBYyxFQUFkLEVBQWtCLHNCQUFZQSxTQUE5QixFQUF5QztBQUN6RDtBQUNBQyxhQUFXLG9CQUFVQyxNQUZvQztBQUd6RDtBQUNBQyxhQUFXLG9CQUFVQyxNQUFWLENBQWlCQyxVQUo2QjtBQUt6RDtBQUNBQyxZQUFVLG9CQUFVRixNQUFWLENBQWlCQyxVQU44QjtBQU96RDtBQUNBRSxjQUFZLG9CQUFVSCxNQVJtQztBQVN6RDtBQUNBSSxhQUFXLG9CQUFVSjtBQVZvQyxDQUF6QyxDQUFsQixDLENBdkJBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFrQkEsSUFBTUssZUFBZSxzQkFBYyxFQUFkLEVBQWtCLHNCQUFZQSxZQUE5QixFQUE0QztBQUMvRFIsYUFBVyxFQURvRDtBQUUvRE0sY0FBWSxDQUZtRDtBQUcvREMsYUFBVztBQUhvRCxDQUE1QyxDQUFyQjs7QUFNQTs7Ozs7Ozs7SUFPcUJFLE07Ozs7Ozs7Ozs7NkJBRVY7QUFBQSxtQkFDeUQsS0FBS0MsS0FEOUQ7QUFBQSxVQUNBVixTQURBLFVBQ0FBLFNBREE7QUFBQSxVQUNXRSxTQURYLFVBQ1dBLFNBRFg7QUFBQSxVQUNzQkcsUUFEdEIsVUFDc0JBLFFBRHRCO0FBQUEsVUFDZ0NDLFVBRGhDLFVBQ2dDQSxVQURoQztBQUFBLFVBQzRDQyxTQUQ1QyxVQUM0Q0EsU0FENUM7O0FBQUEsa0NBR1EsS0FBS0ksT0FBTCxDQUFhQyxRQUFiLENBQXNCQyxPQUF0QixDQUE4QixDQUFDWCxTQUFELEVBQVlHLFFBQVosQ0FBOUIsQ0FIUjtBQUFBO0FBQUEsVUFHQVMsQ0FIQTtBQUFBLFVBR0dDLENBSEg7O0FBSVAsVUFBTUMsaUJBQWlCO0FBQ3JCQyxrQkFBVSxVQURXO0FBRXJCQyxjQUFNSixJQUFJUixVQUZXO0FBR3JCYSxhQUFLSixJQUFJUjtBQUhZLE9BQXZCOztBQU1BLGFBQU8sMEJBQWMsS0FBZCxFQUFxQjtBQUMxQlAsd0NBQThCQSxTQURKO0FBRTFCb0IsYUFBSyxLQUFLQyxnQkFGZ0I7QUFHMUJDLGVBQU9OLGNBSG1CO0FBSTFCTyxrQkFBVSxLQUFLYixLQUFMLENBQVdhO0FBSkssT0FBckIsQ0FBUDtBQU1EOzs7OztrQkFsQmtCZCxNOzs7QUFzQnJCQSxPQUFPZSxXQUFQLEdBQXFCLFFBQXJCO0FBQ0FmLE9BQU9WLFNBQVAsR0FBbUJBLFNBQW5CO0FBQ0FVLE9BQU9ELFlBQVAsR0FBc0JBLFlBQXRCIiwiZmlsZSI6Im1hcmtlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5pbXBvcnQge2NyZWF0ZUVsZW1lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgQmFzZUNvbnRyb2wgZnJvbSAnLi9iYXNlLWNvbnRyb2wnO1xuXG5jb25zdCBwcm9wVHlwZXMgPSBPYmplY3QuYXNzaWduKHt9LCBCYXNlQ29udHJvbC5wcm9wVHlwZXMsIHtcbiAgLy8gQ3VzdG9tIGNsYXNzTmFtZVxuICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIC8vIExvbmdpdHVkZSBvZiB0aGUgYW5jaG9yIHBvaW50XG4gIGxvbmdpdHVkZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAvLyBMYXRpdHVkZSBvZiB0aGUgYW5jaG9yIHBvaW50XG4gIGxhdGl0dWRlOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIC8vIE9mZnNldCBmcm9tIHRoZSBsZWZ0XG4gIG9mZnNldExlZnQ6IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIE9mZnNldCBmcm9tIHRoZSB0b3BcbiAgb2Zmc2V0VG9wOiBQcm9wVHlwZXMubnVtYmVyXG59KTtcblxuY29uc3QgZGVmYXVsdFByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgQmFzZUNvbnRyb2wuZGVmYXVsdFByb3BzLCB7XG4gIGNsYXNzTmFtZTogJycsXG4gIG9mZnNldExlZnQ6IDAsXG4gIG9mZnNldFRvcDogMFxufSk7XG5cbi8qXG4gKiBQdXJlQ29tcG9uZW50IGRvZXNuJ3QgdXBkYXRlIHdoZW4gY29udGV4dCBjaGFuZ2VzLlxuICogVGhlIG9ubHkgd2F5IGlzIHRvIGltcGxlbWVudCBvdXIgb3duIHNob3VsZENvbXBvbmVudFVwZGF0ZSBoZXJlLiBDb25zaWRlcmluZ1xuICogdGhlIHBhcmVudCBjb21wb25lbnQgKFN0YXRpY01hcCBvciBJbnRlcmFjdGl2ZU1hcCkgaXMgcHVyZSwgYW5kIG1hcCByZS1yZW5kZXJcbiAqIGlzIGFsbW9zdCBhbHdheXMgdHJpZ2dlcmVkIGJ5IGEgdmlld3BvcnQgY2hhbmdlLCB3ZSBhbG1vc3QgZGVmaW5pdGVseSBuZWVkIHRvXG4gKiByZWNhbGN1bGF0ZSB0aGUgbWFya2VyJ3MgcG9zaXRpb24gd2hlbiB0aGUgcGFyZW50IHJlLXJlbmRlcnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcmtlciBleHRlbmRzIEJhc2VDb250cm9sIHtcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge2NsYXNzTmFtZSwgbG9uZ2l0dWRlLCBsYXRpdHVkZSwgb2Zmc2V0TGVmdCwgb2Zmc2V0VG9wfSA9IHRoaXMucHJvcHM7XG5cbiAgICBjb25zdCBbeCwgeV0gPSB0aGlzLmNvbnRleHQudmlld3BvcnQucHJvamVjdChbbG9uZ2l0dWRlLCBsYXRpdHVkZV0pO1xuICAgIGNvbnN0IGNvbnRhaW5lclN0eWxlID0ge1xuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICBsZWZ0OiB4ICsgb2Zmc2V0TGVmdCxcbiAgICAgIHRvcDogeSArIG9mZnNldFRvcFxuICAgIH07XG5cbiAgICByZXR1cm4gY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgY2xhc3NOYW1lOiBgbWFwYm94Z2wtbWFya2VyICR7Y2xhc3NOYW1lfWAsXG4gICAgICByZWY6IHRoaXMuX29uQ29udGFpbmVyTG9hZCxcbiAgICAgIHN0eWxlOiBjb250YWluZXJTdHlsZSxcbiAgICAgIGNoaWxkcmVuOiB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgfSk7XG4gIH1cblxufVxuXG5NYXJrZXIuZGlzcGxheU5hbWUgPSAnTWFya2VyJztcbk1hcmtlci5wcm9wVHlwZXMgPSBwcm9wVHlwZXM7XG5NYXJrZXIuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19