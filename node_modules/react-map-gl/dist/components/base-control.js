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

var _react = require('react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _viewportMercatorProject = require('viewport-mercator-project');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var propTypes = {
  /** Event handling */
  captureScroll: _propTypes2.default.bool,
  // Stop map pan & rotate
  captureDrag: _propTypes2.default.bool,
  // Stop map click
  captureClick: _propTypes2.default.bool,
  // Stop map double click
  captureDoubleClick: _propTypes2.default.bool
}; // Copyright (c) 2015 Uber Technologies, Inc.

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
  captureDrag: true,
  captureClick: true,
  captureDoubleClick: true
};

var contextTypes = {
  viewport: _propTypes2.default.instanceOf(_viewportMercatorProject.PerspectiveMercatorViewport),
  isDragging: _propTypes2.default.bool,
  eventManager: _propTypes2.default.object
};

/*
 * PureComponent doesn't update when context changes.
 * The only way is to implement our own shouldComponentUpdate here. Considering
 * the parent component (StaticMap or InteractiveMap) is pure, and map re-render
 * is almost always triggered by a viewport change, we almost definitely need to
 * recalculate the marker's position when the parent re-renders.
 */

var BaseControl = function (_Component) {
  (0, _inherits3.default)(BaseControl, _Component);

  function BaseControl(props) {
    (0, _classCallCheck3.default)(this, BaseControl);

    var _this = (0, _possibleConstructorReturn3.default)(this, (BaseControl.__proto__ || (0, _getPrototypeOf2.default)(BaseControl)).call(this, props));

    _this._onContainerLoad = _this._onContainerLoad.bind(_this);
    _this._onEvent = _this._onEvent.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(BaseControl, [{
    key: '_onContainerLoad',
    value: function _onContainerLoad(ref) {
      var events = {
        wheel: this._onEvent,
        panstart: this._onEvent,
        click: this._onEvent,
        dblclick: this._onEvent
      };

      if (ref) {
        this.context.eventManager.on(events, ref);
      } else {
        this.context.eventManager.off(events);
      }
    }
  }, {
    key: '_onEvent',
    value: function _onEvent(event) {
      var stopPropagation = void 0;
      switch (event.type) {
        case 'wheel':
          stopPropagation = this.props.captureScroll;
          break;
        case 'panstart':
          stopPropagation = this.props.captureDrag;
          break;
        case 'click':
          stopPropagation = this.props.captureClick;
          break;
        case 'dblclick':
          stopPropagation = this.props.captureDoubleClick;
          break;
        default:
      }

      if (stopPropagation) {
        event.stopPropagation();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return null;
    }
  }]);
  return BaseControl;
}(_react.Component);

exports.default = BaseControl;


BaseControl.propTypes = propTypes;
BaseControl.defaultProps = defaultProps;
BaseControl.contextTypes = contextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2Jhc2UtY29udHJvbC5qcyJdLCJuYW1lcyI6WyJwcm9wVHlwZXMiLCJjYXB0dXJlU2Nyb2xsIiwiYm9vbCIsImNhcHR1cmVEcmFnIiwiY2FwdHVyZUNsaWNrIiwiY2FwdHVyZURvdWJsZUNsaWNrIiwiZGVmYXVsdFByb3BzIiwiY29udGV4dFR5cGVzIiwidmlld3BvcnQiLCJpbnN0YW5jZU9mIiwiaXNEcmFnZ2luZyIsImV2ZW50TWFuYWdlciIsIm9iamVjdCIsIkJhc2VDb250cm9sIiwicHJvcHMiLCJfb25Db250YWluZXJMb2FkIiwiYmluZCIsIl9vbkV2ZW50IiwicmVmIiwiZXZlbnRzIiwid2hlZWwiLCJwYW5zdGFydCIsImNsaWNrIiwiZGJsY2xpY2siLCJjb250ZXh0Iiwib24iLCJvZmYiLCJldmVudCIsInN0b3BQcm9wYWdhdGlvbiIsInR5cGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBOztBQUNBOzs7O0FBQ0E7Ozs7QUFFQSxJQUFNQSxZQUFZO0FBQ2hCO0FBQ0FDLGlCQUFlLG9CQUFVQyxJQUZUO0FBR2hCO0FBQ0FDLGVBQWEsb0JBQVVELElBSlA7QUFLaEI7QUFDQUUsZ0JBQWMsb0JBQVVGLElBTlI7QUFPaEI7QUFDQUcsc0JBQW9CLG9CQUFVSDtBQVJkLENBQWxCLEMsQ0F2QkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQWdCQSxJQUFNSSxlQUFlO0FBQ25CTCxpQkFBZSxLQURJO0FBRW5CRSxlQUFhLElBRk07QUFHbkJDLGdCQUFjLElBSEs7QUFJbkJDLHNCQUFvQjtBQUpELENBQXJCOztBQU9BLElBQU1FLGVBQWU7QUFDbkJDLFlBQVUsb0JBQVVDLFVBQVYsc0RBRFM7QUFFbkJDLGNBQVksb0JBQVVSLElBRkg7QUFHbkJTLGdCQUFjLG9CQUFVQztBQUhMLENBQXJCOztBQU1BOzs7Ozs7OztJQU9xQkMsVzs7O0FBRW5CLHVCQUFZQyxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsZ0pBQ1hBLEtBRFc7O0FBR2pCLFVBQUtDLGdCQUFMLEdBQXdCLE1BQUtBLGdCQUFMLENBQXNCQyxJQUF0QixPQUF4QjtBQUNBLFVBQUtDLFFBQUwsR0FBZ0IsTUFBS0EsUUFBTCxDQUFjRCxJQUFkLE9BQWhCO0FBSmlCO0FBS2xCOzs7O3FDQUVnQkUsRyxFQUFLO0FBQ3BCLFVBQU1DLFNBQVM7QUFDYkMsZUFBTyxLQUFLSCxRQURDO0FBRWJJLGtCQUFVLEtBQUtKLFFBRkY7QUFHYkssZUFBTyxLQUFLTCxRQUhDO0FBSWJNLGtCQUFVLEtBQUtOO0FBSkYsT0FBZjs7QUFPQSxVQUFJQyxHQUFKLEVBQVM7QUFDUCxhQUFLTSxPQUFMLENBQWFiLFlBQWIsQ0FBMEJjLEVBQTFCLENBQTZCTixNQUE3QixFQUFxQ0QsR0FBckM7QUFDRCxPQUZELE1BRU87QUFDTCxhQUFLTSxPQUFMLENBQWFiLFlBQWIsQ0FBMEJlLEdBQTFCLENBQThCUCxNQUE5QjtBQUNEO0FBQ0Y7Ozs2QkFFUVEsSyxFQUFPO0FBQ2QsVUFBSUMsd0JBQUo7QUFDQSxjQUFRRCxNQUFNRSxJQUFkO0FBQ0EsYUFBSyxPQUFMO0FBQ0VELDRCQUFrQixLQUFLZCxLQUFMLENBQVdiLGFBQTdCO0FBQ0E7QUFDRixhQUFLLFVBQUw7QUFDRTJCLDRCQUFrQixLQUFLZCxLQUFMLENBQVdYLFdBQTdCO0FBQ0E7QUFDRixhQUFLLE9BQUw7QUFDRXlCLDRCQUFrQixLQUFLZCxLQUFMLENBQVdWLFlBQTdCO0FBQ0E7QUFDRixhQUFLLFVBQUw7QUFDRXdCLDRCQUFrQixLQUFLZCxLQUFMLENBQVdULGtCQUE3QjtBQUNBO0FBQ0Y7QUFiQTs7QUFnQkEsVUFBSXVCLGVBQUosRUFBcUI7QUFDbkJELGNBQU1DLGVBQU47QUFDRDtBQUNGOzs7NkJBRVE7QUFDUCxhQUFPLElBQVA7QUFDRDs7Ozs7a0JBakRrQmYsVzs7O0FBcURyQkEsWUFBWWIsU0FBWixHQUF3QkEsU0FBeEI7QUFDQWEsWUFBWVAsWUFBWixHQUEyQkEsWUFBM0I7QUFDQU8sWUFBWU4sWUFBWixHQUEyQkEsWUFBM0IiLCJmaWxlIjoiYmFzZS1jb250cm9sLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG5cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnR9IGZyb20gJ3ZpZXdwb3J0LW1lcmNhdG9yLXByb2plY3QnO1xuXG5jb25zdCBwcm9wVHlwZXMgPSB7XG4gIC8qKiBFdmVudCBoYW5kbGluZyAqL1xuICBjYXB0dXJlU2Nyb2xsOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gU3RvcCBtYXAgcGFuICYgcm90YXRlXG4gIGNhcHR1cmVEcmFnOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gU3RvcCBtYXAgY2xpY2tcbiAgY2FwdHVyZUNsaWNrOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gU3RvcCBtYXAgZG91YmxlIGNsaWNrXG4gIGNhcHR1cmVEb3VibGVDbGljazogUHJvcFR5cGVzLmJvb2xcbn07XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgY2FwdHVyZVNjcm9sbDogZmFsc2UsXG4gIGNhcHR1cmVEcmFnOiB0cnVlLFxuICBjYXB0dXJlQ2xpY2s6IHRydWUsXG4gIGNhcHR1cmVEb3VibGVDbGljazogdHJ1ZVxufTtcblxuY29uc3QgY29udGV4dFR5cGVzID0ge1xuICB2aWV3cG9ydDogUHJvcFR5cGVzLmluc3RhbmNlT2YoUGVyc3BlY3RpdmVNZXJjYXRvclZpZXdwb3J0KSxcbiAgaXNEcmFnZ2luZzogUHJvcFR5cGVzLmJvb2wsXG4gIGV2ZW50TWFuYWdlcjogUHJvcFR5cGVzLm9iamVjdFxufTtcblxuLypcbiAqIFB1cmVDb21wb25lbnQgZG9lc24ndCB1cGRhdGUgd2hlbiBjb250ZXh0IGNoYW5nZXMuXG4gKiBUaGUgb25seSB3YXkgaXMgdG8gaW1wbGVtZW50IG91ciBvd24gc2hvdWxkQ29tcG9uZW50VXBkYXRlIGhlcmUuIENvbnNpZGVyaW5nXG4gKiB0aGUgcGFyZW50IGNvbXBvbmVudCAoU3RhdGljTWFwIG9yIEludGVyYWN0aXZlTWFwKSBpcyBwdXJlLCBhbmQgbWFwIHJlLXJlbmRlclxuICogaXMgYWxtb3N0IGFsd2F5cyB0cmlnZ2VyZWQgYnkgYSB2aWV3cG9ydCBjaGFuZ2UsIHdlIGFsbW9zdCBkZWZpbml0ZWx5IG5lZWQgdG9cbiAqIHJlY2FsY3VsYXRlIHRoZSBtYXJrZXIncyBwb3NpdGlvbiB3aGVuIHRoZSBwYXJlbnQgcmUtcmVuZGVycy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZUNvbnRyb2wgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgdGhpcy5fb25Db250YWluZXJMb2FkID0gdGhpcy5fb25Db250YWluZXJMb2FkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25FdmVudCA9IHRoaXMuX29uRXZlbnQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIF9vbkNvbnRhaW5lckxvYWQocmVmKSB7XG4gICAgY29uc3QgZXZlbnRzID0ge1xuICAgICAgd2hlZWw6IHRoaXMuX29uRXZlbnQsXG4gICAgICBwYW5zdGFydDogdGhpcy5fb25FdmVudCxcbiAgICAgIGNsaWNrOiB0aGlzLl9vbkV2ZW50LFxuICAgICAgZGJsY2xpY2s6IHRoaXMuX29uRXZlbnRcbiAgICB9O1xuXG4gICAgaWYgKHJlZikge1xuICAgICAgdGhpcy5jb250ZXh0LmV2ZW50TWFuYWdlci5vbihldmVudHMsIHJlZik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29udGV4dC5ldmVudE1hbmFnZXIub2ZmKGV2ZW50cyk7XG4gICAgfVxuICB9XG5cbiAgX29uRXZlbnQoZXZlbnQpIHtcbiAgICBsZXQgc3RvcFByb3BhZ2F0aW9uO1xuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgIGNhc2UgJ3doZWVsJzpcbiAgICAgIHN0b3BQcm9wYWdhdGlvbiA9IHRoaXMucHJvcHMuY2FwdHVyZVNjcm9sbDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3BhbnN0YXJ0JzpcbiAgICAgIHN0b3BQcm9wYWdhdGlvbiA9IHRoaXMucHJvcHMuY2FwdHVyZURyYWc7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjbGljayc6XG4gICAgICBzdG9wUHJvcGFnYXRpb24gPSB0aGlzLnByb3BzLmNhcHR1cmVDbGljaztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2RibGNsaWNrJzpcbiAgICAgIHN0b3BQcm9wYWdhdGlvbiA9IHRoaXMucHJvcHMuY2FwdHVyZURvdWJsZUNsaWNrO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICB9XG5cbiAgICBpZiAoc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxufVxuXG5CYXNlQ29udHJvbC5wcm9wVHlwZXMgPSBwcm9wVHlwZXM7XG5CYXNlQ29udHJvbC5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG5CYXNlQ29udHJvbC5jb250ZXh0VHlwZXMgPSBjb250ZXh0VHlwZXM7XG4iXX0=