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

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _react = require('react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _baseControl = require('./base-control');

var _baseControl2 = _interopRequireDefault(_baseControl);

var _autobind = require('../utils/autobind');

var _autobind2 = _interopRequireDefault(_autobind);

var _dynamicPosition = require('../utils/dynamic-position');

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
  offsetTop: _propTypes2.default.number,
  // Size of the tip
  tipSize: _propTypes2.default.number,
  // Whether to show close button
  closeButton: _propTypes2.default.bool,
  // Whether to close on click
  closeOnClick: _propTypes2.default.bool,
  // The popup's location relative to the coordinate
  anchor: _propTypes2.default.oneOf((0, _keys2.default)(_dynamicPosition.ANCHOR_POSITION)),
  // Whether the popup anchor should be auto-adjusted to fit within the container
  dynamicPosition: _propTypes2.default.bool,
  // Callback when component is closed
  onClose: _propTypes2.default.func
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
  offsetTop: 0,
  tipSize: 10,
  anchor: 'bottom',
  dynamicPosition: true,
  closeButton: true,
  closeOnClick: true,
  onClose: function onClose() {}
});

/*
 * PureComponent doesn't update when context changes.
 * The only way is to implement our own shouldComponentUpdate here. Considering
 * the parent component (StaticMap or InteractiveMap) is pure, and map re-render
 * is almost always triggered by a viewport change, we almost definitely need to
 * recalculate the popup's position when the parent re-renders.
 */

var Popup = function (_BaseControl) {
  (0, _inherits3.default)(Popup, _BaseControl);

  function Popup(props) {
    (0, _classCallCheck3.default)(this, Popup);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Popup.__proto__ || (0, _getPrototypeOf2.default)(Popup)).call(this, props));

    (0, _autobind2.default)(_this);
    return _this;
  }

  (0, _createClass3.default)(Popup, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      // Container just got a size, re-calculate position
      this.forceUpdate();
    }
  }, {
    key: '_getPosition',
    value: function _getPosition(x, y) {
      var viewport = this.context.viewport;
      var _props = this.props,
          anchor = _props.anchor,
          dynamicPosition = _props.dynamicPosition,
          tipSize = _props.tipSize;


      if (this._content) {
        return dynamicPosition ? (0, _dynamicPosition.getDynamicPosition)({
          x: x, y: y, anchor: anchor,
          padding: tipSize,
          width: viewport.width,
          height: viewport.height,
          selfWidth: this._content.clientWidth,
          selfHeight: this._content.clientHeight
        }) : anchor;
      }

      return anchor;
    }
  }, {
    key: '_onClose',
    value: function _onClose() {
      this.props.onClose();
    }
  }, {
    key: '_contentLoaded',
    value: function _contentLoaded(ref) {
      this._content = ref;
    }
  }, {
    key: '_renderTip',
    value: function _renderTip() {
      var tipSize = this.props.tipSize;


      return (0, _react.createElement)('div', {
        key: 'tip',
        className: 'mapboxgl-popup-tip',
        style: { borderWidth: tipSize }
      });
    }
  }, {
    key: '_renderContent',
    value: function _renderContent() {
      var _props2 = this.props,
          closeButton = _props2.closeButton,
          children = _props2.children;

      return (0, _react.createElement)('div', {
        key: 'content',
        ref: this._contentLoaded,
        className: 'mapboxgl-popup-content'
      }, [closeButton && (0, _react.createElement)('button', {
        key: 'close-button',
        className: 'mapboxgl-popup-close-button',
        type: 'button',
        onClick: this._onClose
      }, '×'), children]);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props3 = this.props,
          className = _props3.className,
          longitude = _props3.longitude,
          latitude = _props3.latitude,
          offsetLeft = _props3.offsetLeft,
          offsetTop = _props3.offsetTop,
          closeOnClick = _props3.closeOnClick;

      var _context$viewport$pro = this.context.viewport.project([longitude, latitude]),
          _context$viewport$pro2 = (0, _slicedToArray3.default)(_context$viewport$pro, 2),
          x = _context$viewport$pro2[0],
          y = _context$viewport$pro2[1];

      var positionType = this._getPosition(x, y);
      var anchorPosition = _dynamicPosition.ANCHOR_POSITION[positionType];

      var containerStyle = {
        position: 'absolute',
        left: x + offsetLeft,
        top: y + offsetTop,
        transform: 'translate(' + -anchorPosition.x * 100 + '%, ' + -anchorPosition.y * 100 + '%)'
      };

      return (0, _react.createElement)('div', {
        className: 'mapboxgl-popup mapboxgl-popup-anchor-' + positionType + ' ' + className,
        style: containerStyle,
        ref: this._onContainerLoad,
        onClick: closeOnClick ? this._onClose : null
      }, [this._renderTip(), this._renderContent()]);
    }
  }]);
  return Popup;
}(_baseControl2.default);

exports.default = Popup;


Popup.displayName = 'Popup';
Popup.propTypes = propTypes;
Popup.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL3BvcHVwLmpzIl0sIm5hbWVzIjpbInByb3BUeXBlcyIsImNsYXNzTmFtZSIsInN0cmluZyIsImxvbmdpdHVkZSIsIm51bWJlciIsImlzUmVxdWlyZWQiLCJsYXRpdHVkZSIsIm9mZnNldExlZnQiLCJvZmZzZXRUb3AiLCJ0aXBTaXplIiwiY2xvc2VCdXR0b24iLCJib29sIiwiY2xvc2VPbkNsaWNrIiwiYW5jaG9yIiwib25lT2YiLCJkeW5hbWljUG9zaXRpb24iLCJvbkNsb3NlIiwiZnVuYyIsImRlZmF1bHRQcm9wcyIsIlBvcHVwIiwicHJvcHMiLCJmb3JjZVVwZGF0ZSIsIngiLCJ5Iiwidmlld3BvcnQiLCJjb250ZXh0IiwiX2NvbnRlbnQiLCJwYWRkaW5nIiwid2lkdGgiLCJoZWlnaHQiLCJzZWxmV2lkdGgiLCJjbGllbnRXaWR0aCIsInNlbGZIZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJyZWYiLCJrZXkiLCJzdHlsZSIsImJvcmRlcldpZHRoIiwiY2hpbGRyZW4iLCJfY29udGVudExvYWRlZCIsInR5cGUiLCJvbkNsaWNrIiwiX29uQ2xvc2UiLCJwcm9qZWN0IiwicG9zaXRpb25UeXBlIiwiX2dldFBvc2l0aW9uIiwiYW5jaG9yUG9zaXRpb24iLCJjb250YWluZXJTdHlsZSIsInBvc2l0aW9uIiwibGVmdCIsInRvcCIsInRyYW5zZm9ybSIsIl9vbkNvbnRhaW5lckxvYWQiLCJfcmVuZGVyVGlwIiwiX3JlbmRlckNvbnRlbnQiLCJkaXNwbGF5TmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkE7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7QUFFQSxJQUFNQSxZQUFZLHNCQUFjLEVBQWQsRUFBa0Isc0JBQVlBLFNBQTlCLEVBQXlDO0FBQ3pEO0FBQ0FDLGFBQVcsb0JBQVVDLE1BRm9DO0FBR3pEO0FBQ0FDLGFBQVcsb0JBQVVDLE1BQVYsQ0FB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SSxDQUFQO0FBU0Q7Ozs7O2tCQXpGa0JuQyxLOzs7QUE2RnJCQSxNQUFNb0MsV0FBTixHQUFvQixPQUFwQjtBQUNBcEMsTUFBTW5CLFNBQU4sR0FBa0JBLFNBQWxCO0FBQ0FtQixNQUFNRCxZQUFOLEdBQXFCQSxZQUFyQiIsImZpbGUiOiJwb3B1cC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5pbXBvcnQge2NyZWF0ZUVsZW1lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgQmFzZUNvbnRyb2wgZnJvbSAnLi9iYXNlLWNvbnRyb2wnO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4uL3V0aWxzL2F1dG9iaW5kJztcblxuaW1wb3J0IHtnZXREeW5hbWljUG9zaXRpb24sIEFOQ0hPUl9QT1NJVElPTn0gZnJvbSAnLi4vdXRpbHMvZHluYW1pYy1wb3NpdGlvbic7XG5cbmNvbnN0IHByb3BUeXBlcyA9IE9iamVjdC5hc3NpZ24oe30sIEJhc2VDb250cm9sLnByb3BUeXBlcywge1xuICAvLyBDdXN0b20gY2xhc3NOYW1lXG4gIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgLy8gTG9uZ2l0dWRlIG9mIHRoZSBhbmNob3IgcG9pbnRcbiAgbG9uZ2l0dWRlOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIC8vIExhdGl0dWRlIG9mIHRoZSBhbmNob3IgcG9pbnRcbiAgbGF0aXR1ZGU6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgLy8gT2Zmc2V0IGZyb20gdGhlIGxlZnRcbiAgb2Zmc2V0TGVmdDogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gT2Zmc2V0IGZyb20gdGhlIHRvcFxuICBvZmZzZXRUb3A6IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIFNpemUgb2YgdGhlIHRpcFxuICB0aXBTaXplOiBQcm9wVHlwZXMubnVtYmVyLFxuICAvLyBXaGV0aGVyIHRvIHNob3cgY2xvc2UgYnV0dG9uXG4gIGNsb3NlQnV0dG9uOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gV2hldGhlciB0byBjbG9zZSBvbiBjbGlja1xuICBjbG9zZU9uQ2xpY2s6IFByb3BUeXBlcy5ib29sLFxuICAvLyBUaGUgcG9wdXAncyBsb2NhdGlvbiByZWxhdGl2ZSB0byB0aGUgY29vcmRpbmF0ZVxuICBhbmNob3I6IFByb3BUeXBlcy5vbmVPZihPYmplY3Qua2V5cyhBTkNIT1JfUE9TSVRJT04pKSxcbiAgLy8gV2hldGhlciB0aGUgcG9wdXAgYW5jaG9yIHNob3VsZCBiZSBhdXRvLWFkanVzdGVkIHRvIGZpdCB3aXRoaW4gdGhlIGNvbnRhaW5lclxuICBkeW5hbWljUG9zaXRpb246IFByb3BUeXBlcy5ib29sLFxuICAvLyBDYWxsYmFjayB3aGVuIGNvbXBvbmVudCBpcyBjbG9zZWRcbiAgb25DbG9zZTogUHJvcFR5cGVzLmZ1bmNcbn0pO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBCYXNlQ29udHJvbC5kZWZhdWx0UHJvcHMsIHtcbiAgY2xhc3NOYW1lOiAnJyxcbiAgb2Zmc2V0TGVmdDogMCxcbiAgb2Zmc2V0VG9wOiAwLFxuICB0aXBTaXplOiAxMCxcbiAgYW5jaG9yOiAnYm90dG9tJyxcbiAgZHluYW1pY1Bvc2l0aW9uOiB0cnVlLFxuICBjbG9zZUJ1dHRvbjogdHJ1ZSxcbiAgY2xvc2VPbkNsaWNrOiB0cnVlLFxuICBvbkNsb3NlOiAoKSA9PiB7fVxufSk7XG5cbi8qXG4gKiBQdXJlQ29tcG9uZW50IGRvZXNuJ3QgdXBkYXRlIHdoZW4gY29udGV4dCBjaGFuZ2VzLlxuICogVGhlIG9ubHkgd2F5IGlzIHRvIGltcGxlbWVudCBvdXIgb3duIHNob3VsZENvbXBvbmVudFVwZGF0ZSBoZXJlLiBDb25zaWRlcmluZ1xuICogdGhlIHBhcmVudCBjb21wb25lbnQgKFN0YXRpY01hcCBvciBJbnRlcmFjdGl2ZU1hcCkgaXMgcHVyZSwgYW5kIG1hcCByZS1yZW5kZXJcbiAqIGlzIGFsbW9zdCBhbHdheXMgdHJpZ2dlcmVkIGJ5IGEgdmlld3BvcnQgY2hhbmdlLCB3ZSBhbG1vc3QgZGVmaW5pdGVseSBuZWVkIHRvXG4gKiByZWNhbGN1bGF0ZSB0aGUgcG9wdXAncyBwb3NpdGlvbiB3aGVuIHRoZSBwYXJlbnQgcmUtcmVuZGVycy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9wdXAgZXh0ZW5kcyBCYXNlQ29udHJvbCB7XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgYXV0b2JpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAvLyBDb250YWluZXIganVzdCBnb3QgYSBzaXplLCByZS1jYWxjdWxhdGUgcG9zaXRpb25cbiAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gIH1cblxuICBfZ2V0UG9zaXRpb24oeCwgeSkge1xuICAgIGNvbnN0IHt2aWV3cG9ydH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgY29uc3Qge2FuY2hvciwgZHluYW1pY1Bvc2l0aW9uLCB0aXBTaXplfSA9IHRoaXMucHJvcHM7XG5cbiAgICBpZiAodGhpcy5fY29udGVudCkge1xuICAgICAgcmV0dXJuIGR5bmFtaWNQb3NpdGlvbiA/IGdldER5bmFtaWNQb3NpdGlvbih7XG4gICAgICAgIHgsIHksIGFuY2hvcixcbiAgICAgICAgcGFkZGluZzogdGlwU2l6ZSxcbiAgICAgICAgd2lkdGg6IHZpZXdwb3J0LndpZHRoLFxuICAgICAgICBoZWlnaHQ6IHZpZXdwb3J0LmhlaWdodCxcbiAgICAgICAgc2VsZldpZHRoOiB0aGlzLl9jb250ZW50LmNsaWVudFdpZHRoLFxuICAgICAgICBzZWxmSGVpZ2h0OiB0aGlzLl9jb250ZW50LmNsaWVudEhlaWdodFxuICAgICAgfSkgOiBhbmNob3I7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFuY2hvcjtcbiAgfVxuXG4gIF9vbkNsb3NlKCkge1xuICAgIHRoaXMucHJvcHMub25DbG9zZSgpO1xuICB9XG5cbiAgX2NvbnRlbnRMb2FkZWQocmVmKSB7XG4gICAgdGhpcy5fY29udGVudCA9IHJlZjtcbiAgfVxuXG4gIF9yZW5kZXJUaXAoKSB7XG4gICAgY29uc3Qge3RpcFNpemV9ID0gdGhpcy5wcm9wcztcblxuICAgIHJldHVybiBjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICBrZXk6ICd0aXAnLFxuICAgICAgY2xhc3NOYW1lOiAnbWFwYm94Z2wtcG9wdXAtdGlwJyxcbiAgICAgIHN0eWxlOiB7Ym9yZGVyV2lkdGg6IHRpcFNpemV9XG4gICAgfSk7XG4gIH1cblxuICBfcmVuZGVyQ29udGVudCgpIHtcbiAgICBjb25zdCB7Y2xvc2VCdXR0b24sIGNoaWxkcmVufSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgIGtleTogJ2NvbnRlbnQnLFxuICAgICAgcmVmOiB0aGlzLl9jb250ZW50TG9hZGVkLFxuICAgICAgY2xhc3NOYW1lOiAnbWFwYm94Z2wtcG9wdXAtY29udGVudCdcbiAgICB9LCBbXG4gICAgICBjbG9zZUJ1dHRvbiAmJiBjcmVhdGVFbGVtZW50KCdidXR0b24nLCB7XG4gICAgICAgIGtleTogJ2Nsb3NlLWJ1dHRvbicsXG4gICAgICAgIGNsYXNzTmFtZTogJ21hcGJveGdsLXBvcHVwLWNsb3NlLWJ1dHRvbicsXG4gICAgICAgIHR5cGU6ICdidXR0b24nLFxuICAgICAgICBvbkNsaWNrOiB0aGlzLl9vbkNsb3NlXG4gICAgICB9LCAnw5cnKSxcbiAgICAgIGNoaWxkcmVuXG4gICAgXSk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge2NsYXNzTmFtZSwgbG9uZ2l0dWRlLCBsYXRpdHVkZSwgb2Zmc2V0TGVmdCwgb2Zmc2V0VG9wLCBjbG9zZU9uQ2xpY2t9ID0gdGhpcy5wcm9wcztcblxuICAgIGNvbnN0IFt4LCB5XSA9IHRoaXMuY29udGV4dC52aWV3cG9ydC5wcm9qZWN0KFtsb25naXR1ZGUsIGxhdGl0dWRlXSk7XG5cbiAgICBjb25zdCBwb3NpdGlvblR5cGUgPSB0aGlzLl9nZXRQb3NpdGlvbih4LCB5KTtcbiAgICBjb25zdCBhbmNob3JQb3NpdGlvbiA9IEFOQ0hPUl9QT1NJVElPTltwb3NpdGlvblR5cGVdO1xuXG4gICAgY29uc3QgY29udGFpbmVyU3R5bGUgPSB7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIGxlZnQ6IHggKyBvZmZzZXRMZWZ0LFxuICAgICAgdG9wOiB5ICsgb2Zmc2V0VG9wLFxuICAgICAgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7LWFuY2hvclBvc2l0aW9uLnggKiAxMDB9JSwgJHstYW5jaG9yUG9zaXRpb24ueSAqIDEwMH0lKWBcbiAgICB9O1xuXG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgIGNsYXNzTmFtZTogYG1hcGJveGdsLXBvcHVwIG1hcGJveGdsLXBvcHVwLWFuY2hvci0ke3Bvc2l0aW9uVHlwZX0gJHtjbGFzc05hbWV9YCxcbiAgICAgIHN0eWxlOiBjb250YWluZXJTdHlsZSxcbiAgICAgIHJlZjogdGhpcy5fb25Db250YWluZXJMb2FkLFxuICAgICAgb25DbGljazogY2xvc2VPbkNsaWNrID8gdGhpcy5fb25DbG9zZSA6IG51bGxcbiAgICB9LCBbXG4gICAgICB0aGlzLl9yZW5kZXJUaXAoKSxcbiAgICAgIHRoaXMuX3JlbmRlckNvbnRlbnQoKVxuICAgIF0pO1xuICB9XG5cbn1cblxuUG9wdXAuZGlzcGxheU5hbWUgPSAnUG9wdXAnO1xuUG9wdXAucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuUG9wdXAuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19