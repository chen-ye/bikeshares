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

var SVGOverlay = function (_BaseControl) {
  (0, _inherits3.default)(SVGOverlay, _BaseControl);

  function SVGOverlay() {
    (0, _classCallCheck3.default)(this, SVGOverlay);
    return (0, _possibleConstructorReturn3.default)(this, (SVGOverlay.__proto__ || (0, _getPrototypeOf2.default)(SVGOverlay)).apply(this, arguments));
  }

  (0, _createClass3.default)(SVGOverlay, [{
    key: 'render',
    value: function render() {
      var _context = this.context,
          viewport = _context.viewport,
          isDragging = _context.isDragging;

      var style = (0, _assign2.default)({
        pointerEvents: 'none',
        position: 'absolute',
        left: 0,
        top: 0
      }, this.props.style);

      return (0, _react.createElement)('svg', {
        width: viewport.width,
        height: viewport.height,
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
  return SVGOverlay;
}(_baseControl2.default);

exports.default = SVGOverlay;


SVGOverlay.displayName = 'SVGOverlay';
SVGOverlay.propTypes = propTypes;
SVGOverlay.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vdmVybGF5cy9zdmctb3ZlcmxheS5qcyJdLCJuYW1lcyI6WyJwcm9wVHlwZXMiLCJyZWRyYXciLCJmdW5jIiwiaXNSZXF1aXJlZCIsInN0eWxlIiwib2JqZWN0IiwiZGVmYXVsdFByb3BzIiwiY2FwdHVyZVNjcm9sbCIsImNhcHR1cmVEcmFnIiwiY2FwdHVyZUNsaWNrIiwiY2FwdHVyZURvdWJsZUNsaWNrIiwiU1ZHT3ZlcmxheSIsImNvbnRleHQiLCJ2aWV3cG9ydCIsImlzRHJhZ2dpbmciLCJwb2ludGVyRXZlbnRzIiwicG9zaXRpb24iLCJsZWZ0IiwidG9wIiwicHJvcHMiLCJ3aWR0aCIsImhlaWdodCIsInJlZiIsIl9vbkNvbnRhaW5lckxvYWQiLCJwcm9qZWN0IiwiYmluZCIsInVucHJvamVjdCIsImRpc3BsYXlOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTUEsWUFBWSxzQkFBYyxFQUFkLEVBQWtCLHNCQUFZQSxTQUE5QixFQUF5QztBQUN6REMsVUFBUSxvQkFBVUMsSUFBVixDQUFlQyxVQURrQztBQUV6REMsU0FBTyxvQkFBVUM7QUFGd0MsQ0FBekMsQ0FBbEIsQyxDQXhCQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFXQSxJQUFNQyxlQUFlO0FBQ25CQyxpQkFBZSxLQURJO0FBRW5CQyxlQUFhLEtBRk07QUFHbkJDLGdCQUFjLEtBSEs7QUFJbkJDLHNCQUFvQjtBQUpELENBQXJCOztJQU9xQkMsVTs7Ozs7Ozs7Ozs2QkFDVjtBQUFBLHFCQUN3QixLQUFLQyxPQUQ3QjtBQUFBLFVBQ0FDLFFBREEsWUFDQUEsUUFEQTtBQUFBLFVBQ1VDLFVBRFYsWUFDVUEsVUFEVjs7QUFFUCxVQUFNVixRQUFRLHNCQUFjO0FBQzFCVyx1QkFBZSxNQURXO0FBRTFCQyxrQkFBVSxVQUZnQjtBQUcxQkMsY0FBTSxDQUhvQjtBQUkxQkMsYUFBSztBQUpxQixPQUFkLEVBS1gsS0FBS0MsS0FBTCxDQUFXZixLQUxBLENBQWQ7O0FBT0EsYUFDRSwwQkFBYyxLQUFkLEVBQXFCO0FBQ25CZ0IsZUFBT1AsU0FBU08sS0FERztBQUVuQkMsZ0JBQVFSLFNBQVNRLE1BRkU7QUFHbkJDLGFBQUssS0FBS0MsZ0JBSFM7QUFJbkJuQjtBQUptQixPQUFyQixFQU1FLEtBQUtlLEtBQUwsQ0FBV2xCLE1BQVgsQ0FBa0I7QUFDaEJtQixlQUFPUCxTQUFTTyxLQURBO0FBRWhCQyxnQkFBUVIsU0FBU1EsTUFGRDtBQUdoQlAsOEJBSGdCO0FBSWhCVSxpQkFBU1gsU0FBU1csT0FBVCxDQUFpQkMsSUFBakIsQ0FBc0JaLFFBQXRCLENBSk87QUFLaEJhLG1CQUFXYixTQUFTYSxTQUFULENBQW1CRCxJQUFuQixDQUF3QlosUUFBeEI7QUFMSyxPQUFsQixDQU5GLENBREY7QUFnQkQ7Ozs7O2tCQTFCa0JGLFU7OztBQTZCckJBLFdBQVdnQixXQUFYLEdBQXlCLFlBQXpCO0FBQ0FoQixXQUFXWCxTQUFYLEdBQXVCQSxTQUF2QjtBQUNBVyxXQUFXTCxZQUFYLEdBQTBCQSxZQUExQiIsImZpbGUiOiJzdmctb3ZlcmxheS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCB7Y3JlYXRlRWxlbWVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBCYXNlQ29udHJvbCBmcm9tICcuLi9jb21wb25lbnRzL2Jhc2UtY29udHJvbCc7XG5cbmNvbnN0IHByb3BUeXBlcyA9IE9iamVjdC5hc3NpZ24oe30sIEJhc2VDb250cm9sLnByb3BUeXBlcywge1xuICByZWRyYXc6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIHN0eWxlOiBQcm9wVHlwZXMub2JqZWN0XG59KTtcblxuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICBjYXB0dXJlU2Nyb2xsOiBmYWxzZSxcbiAgY2FwdHVyZURyYWc6IGZhbHNlLFxuICBjYXB0dXJlQ2xpY2s6IGZhbHNlLFxuICBjYXB0dXJlRG91YmxlQ2xpY2s6IGZhbHNlXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTVkdPdmVybGF5IGV4dGVuZHMgQmFzZUNvbnRyb2wge1xuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge3ZpZXdwb3J0LCBpc0RyYWdnaW5nfSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCBzdHlsZSA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgcG9pbnRlckV2ZW50czogJ25vbmUnLFxuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICBsZWZ0OiAwLFxuICAgICAgdG9wOiAwXG4gICAgfSwgdGhpcy5wcm9wcy5zdHlsZSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgY3JlYXRlRWxlbWVudCgnc3ZnJywge1xuICAgICAgICB3aWR0aDogdmlld3BvcnQud2lkdGgsXG4gICAgICAgIGhlaWdodDogdmlld3BvcnQuaGVpZ2h0LFxuICAgICAgICByZWY6IHRoaXMuX29uQ29udGFpbmVyTG9hZCxcbiAgICAgICAgc3R5bGVcbiAgICAgIH0sXG4gICAgICAgIHRoaXMucHJvcHMucmVkcmF3KHtcbiAgICAgICAgICB3aWR0aDogdmlld3BvcnQud2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiB2aWV3cG9ydC5oZWlnaHQsXG4gICAgICAgICAgaXNEcmFnZ2luZyxcbiAgICAgICAgICBwcm9qZWN0OiB2aWV3cG9ydC5wcm9qZWN0LmJpbmQodmlld3BvcnQpLFxuICAgICAgICAgIHVucHJvamVjdDogdmlld3BvcnQudW5wcm9qZWN0LmJpbmQodmlld3BvcnQpXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgKTtcbiAgfVxufVxuXG5TVkdPdmVybGF5LmRpc3BsYXlOYW1lID0gJ1NWR092ZXJsYXknO1xuU1ZHT3ZlcmxheS5wcm9wVHlwZXMgPSBwcm9wVHlwZXM7XG5TVkdPdmVybGF5LmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbiJdfQ==