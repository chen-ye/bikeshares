var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { PureComponent, createElement } from 'react';
import PropTypes from 'prop-types';

import { MAPBOX_LIMITS } from './map-state';
import EventManager from '../../utils/events/event-manager';
import MapControls from './map-controls';
import config from '../config';

var propTypes = {
  /** The width of the map. */
  width: PropTypes.number.isRequired,
  /** The height of the map. */
  height: PropTypes.number.isRequired,
  /** The longitude of the center of the map. */
  longitude: PropTypes.number.isRequired,
  /** The latitude of the center of the map. */
  latitude: PropTypes.number.isRequired,
  /** The tile zoom level of the map. */
  zoom: PropTypes.number.isRequired,
  /** Specify the bearing of the viewport */
  bearing: PropTypes.number,
  /** Specify the pitch of the viewport */
  pitch: PropTypes.number,
  /** Altitude of the viewport camera. Default 1.5 "screen heights" */
  // Note: Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
  altitude: PropTypes.number,

  /** Viewport constraints */
  // Max zoom level
  maxZoom: PropTypes.number,
  // Min zoom level
  minZoom: PropTypes.number,
  // Max pitch in degrees
  maxPitch: PropTypes.number,
  // Min pitch in degrees
  minPitch: PropTypes.number,

  /**
   * `onViewportChange` callback is fired when the user interacted with the
   * map. The object passed to the callback contains viewport properties
   * such as `longitude`, `latitude`, `zoom` etc.
   */
  onViewportChange: PropTypes.func,

  /** Enables control event handling */
  // Scroll to zoom
  scrollZoom: PropTypes.bool,
  // Drag to pan
  dragPan: PropTypes.bool,
  // Drag to rotate
  dragRotate: PropTypes.bool,
  // Double click to zoom
  doubleClickZoom: PropTypes.bool,
  // Pinch to zoom / rotate
  touchZoomRotate: PropTypes.bool,

  /** Accessor that returns a cursor style to show interactive state */
  getCursor: PropTypes.func,

  // A map control instance to replace the default map controls
  // The object must expose one property: `events` as an array of subscribed
  // event names; and two methods: `setState(state)` and `handle(event)`
  mapControls: PropTypes.shape({
    events: PropTypes.arrayOf(PropTypes.string),
    handleEvent: PropTypes.func
  })
};

var getDefaultCursor = function getDefaultCursor(_ref) {
  var isDragging = _ref.isDragging;
  return isDragging ? config.CURSOR.GRABBING : config.CURSOR.GRAB;
};

var defaultProps = Object.assign({}, MAPBOX_LIMITS, {
  onViewportChange: null,

  scrollZoom: true,
  dragPan: true,
  dragRotate: true,
  doubleClickZoom: true,
  touchZoomRotate: true,

  getCursor: getDefaultCursor
});

var MapController = function (_PureComponent) {
  _inherits(MapController, _PureComponent);

  function MapController(props) {
    _classCallCheck(this, MapController);

    var _this = _possibleConstructorReturn(this, (MapController.__proto__ || Object.getPrototypeOf(MapController)).call(this, props));

    _this.state = {
      // Whether the cursor is down
      isDragging: false
    };

    // If props.mapControls is not provided, fallback to default MapControls instance
    // Cannot use defaultProps here because it needs to be per map instance
    _this._mapControls = props.mapControls || new MapControls();
    return _this;
  }

  _createClass(MapController, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var eventCanvas = this.refs.eventCanvas;


      var eventManager = new EventManager(eventCanvas);

      this._eventManager = eventManager;

      this._mapControls.setOptions(Object.assign({}, this.props, {
        onStateChange: this._onInteractiveStateChange.bind(this),
        eventManager: eventManager
      }));
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(nextProps) {
      this._mapControls.setOptions(nextProps);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._eventManager) {
        // Must destroy because hammer adds event listeners to window
        this._eventManager.destroy();
      }
    }
  }, {
    key: '_onInteractiveStateChange',
    value: function _onInteractiveStateChange(_ref2) {
      var _ref2$isDragging = _ref2.isDragging,
          isDragging = _ref2$isDragging === undefined ? false : _ref2$isDragging;

      if (isDragging !== this.state.isDragging) {
        this.setState({ isDragging: isDragging });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          width = _props.width,
          height = _props.height,
          getCursor = _props.getCursor;


      var eventCanvasStyle = {
        width: width,
        height: height,
        position: 'relative',
        cursor: getCursor(this.state)
      };

      return createElement('div', {
        key: 'map-controls',
        ref: 'eventCanvas',
        style: eventCanvasStyle
      }, this.props.children);
    }
  }]);

  return MapController;
}(PureComponent);

export default MapController;


MapController.displayName = 'MapController';
MapController.propTypes = propTypes;
MapController.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9tYXAtY29udHJvbGxlci9tYXAtY29udHJvbGxlci5qcyJdLCJuYW1lcyI6WyJQdXJlQ29tcG9uZW50IiwiY3JlYXRlRWxlbWVudCIsIlByb3BUeXBlcyIsIk1BUEJPWF9MSU1JVFMiLCJFdmVudE1hbmFnZXIiLCJNYXBDb250cm9scyIsImNvbmZpZyIsInByb3BUeXBlcyIsIndpZHRoIiwibnVtYmVyIiwiaXNSZXF1aXJlZCIsImhlaWdodCIsImxvbmdpdHVkZSIsImxhdGl0dWRlIiwiem9vbSIsImJlYXJpbmciLCJwaXRjaCIsImFsdGl0dWRlIiwibWF4Wm9vbSIsIm1pblpvb20iLCJtYXhQaXRjaCIsIm1pblBpdGNoIiwib25WaWV3cG9ydENoYW5nZSIsImZ1bmMiLCJzY3JvbGxab29tIiwiYm9vbCIsImRyYWdQYW4iLCJkcmFnUm90YXRlIiwiZG91YmxlQ2xpY2tab29tIiwidG91Y2hab29tUm90YXRlIiwiZ2V0Q3Vyc29yIiwibWFwQ29udHJvbHMiLCJzaGFwZSIsImV2ZW50cyIsImFycmF5T2YiLCJzdHJpbmciLCJoYW5kbGVFdmVudCIsImdldERlZmF1bHRDdXJzb3IiLCJpc0RyYWdnaW5nIiwiQ1VSU09SIiwiR1JBQkJJTkciLCJHUkFCIiwiZGVmYXVsdFByb3BzIiwiT2JqZWN0IiwiYXNzaWduIiwiTWFwQ29udHJvbGxlciIsInByb3BzIiwic3RhdGUiLCJfbWFwQ29udHJvbHMiLCJldmVudENhbnZhcyIsInJlZnMiLCJldmVudE1hbmFnZXIiLCJfZXZlbnRNYW5hZ2VyIiwic2V0T3B0aW9ucyIsIm9uU3RhdGVDaGFuZ2UiLCJfb25JbnRlcmFjdGl2ZVN0YXRlQ2hhbmdlIiwiYmluZCIsIm5leHRQcm9wcyIsImRlc3Ryb3kiLCJzZXRTdGF0ZSIsImV2ZW50Q2FudmFzU3R5bGUiLCJwb3NpdGlvbiIsImN1cnNvciIsImtleSIsInJlZiIsInN0eWxlIiwiY2hpbGRyZW4iLCJkaXNwbGF5TmFtZSJdLCJt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LCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1B1cmVDb21wb25lbnQsIGNyZWF0ZUVsZW1lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5cbmltcG9ydCB7TUFQQk9YX0xJTUlUU30gZnJvbSAnLi9tYXAtc3RhdGUnO1xuaW1wb3J0IEV2ZW50TWFuYWdlciBmcm9tICcuLi8uLi91dGlscy9ldmVudHMvZXZlbnQtbWFuYWdlcic7XG5pbXBvcnQgTWFwQ29udHJvbHMgZnJvbSAnLi9tYXAtY29udHJvbHMnO1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcnO1xuXG5jb25zdCBwcm9wVHlwZXMgPSB7XG4gIC8qKiBUaGUgd2lkdGggb2YgdGhlIG1hcC4gKi9cbiAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgLyoqIFRoZSBoZWlnaHQgb2YgdGhlIG1hcC4gKi9cbiAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIC8qKiBUaGUgbG9uZ2l0dWRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIG1hcC4gKi9cbiAgbG9uZ2l0dWRlOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIC8qKiBUaGUgbGF0aXR1ZGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgbWFwLiAqL1xuICBsYXRpdHVkZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAvKiogVGhlIHRpbGUgem9vbSBsZXZlbCBvZiB0aGUgbWFwLiAqL1xuICB6b29tOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIC8qKiBTcGVjaWZ5IHRoZSBiZWFyaW5nIG9mIHRoZSB2aWV3cG9ydCAqL1xuICBiZWFyaW5nOiBQcm9wVHlwZXMubnVtYmVyLFxuICAvKiogU3BlY2lmeSB0aGUgcGl0Y2ggb2YgdGhlIHZpZXdwb3J0ICovXG4gIHBpdGNoOiBQcm9wVHlwZXMubnVtYmVyLFxuICAvKiogQWx0aXR1ZGUgb2YgdGhlIHZpZXdwb3J0IGNhbWVyYS4gRGVmYXVsdCAxLjUgXCJzY3JlZW4gaGVpZ2h0c1wiICovXG4gIC8vIE5vdGU6IE5vbi1wdWJsaWMgQVBJLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvaXNzdWVzLzExMzdcbiAgYWx0aXR1ZGU6IFByb3BUeXBlcy5udW1iZXIsXG5cbiAgLyoqIFZpZXdwb3J0IGNvbnN0cmFpbnRzICovXG4gIC8vIE1heCB6b29tIGxldmVsXG4gIG1heFpvb206IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIE1pbiB6b29tIGxldmVsXG4gIG1pblpvb206IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIE1heCBwaXRjaCBpbiBkZWdyZWVzXG4gIG1heFBpdGNoOiBQcm9wVHlwZXMubnVtYmVyLFxuICAvLyBNaW4gcGl0Y2ggaW4gZGVncmVlc1xuICBtaW5QaXRjaDogUHJvcFR5cGVzLm51bWJlcixcblxuICAvKipcbiAgICogYG9uVmlld3BvcnRDaGFuZ2VgIGNhbGxiYWNrIGlzIGZpcmVkIHdoZW4gdGhlIHVzZXIgaW50ZXJhY3RlZCB3aXRoIHRoZVxuICAgKiBtYXAuIFRoZSBvYmplY3QgcGFzc2VkIHRvIHRoZSBjYWxsYmFjayBjb250YWlucyB2aWV3cG9ydCBwcm9wZXJ0aWVzXG4gICAqIHN1Y2ggYXMgYGxvbmdpdHVkZWAsIGBsYXRpdHVkZWAsIGB6b29tYCBldGMuXG4gICAqL1xuICBvblZpZXdwb3J0Q2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiogRW5hYmxlcyBjb250cm9sIGV2ZW50IGhhbmRsaW5nICovXG4gIC8vIFNjcm9sbCB0byB6b29tXG4gIHNjcm9sbFpvb206IFByb3BUeXBlcy5ib29sLFxuICAvLyBEcmFnIHRvIHBhblxuICBkcmFnUGFuOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gRHJhZyB0byByb3RhdGVcbiAgZHJhZ1JvdGF0ZTogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIERvdWJsZSBjbGljayB0byB6b29tXG4gIGRvdWJsZUNsaWNrWm9vbTogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIFBpbmNoIHRvIHpvb20gLyByb3RhdGVcbiAgdG91Y2hab29tUm90YXRlOiBQcm9wVHlwZXMuYm9vbCxcblxuICAvKiogQWNjZXNzb3IgdGhhdCByZXR1cm5zIGEgY3Vyc29yIHN0eWxlIHRvIHNob3cgaW50ZXJhY3RpdmUgc3RhdGUgKi9cbiAgZ2V0Q3Vyc29yOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvLyBBIG1hcCBjb250cm9sIGluc3RhbmNlIHRvIHJlcGxhY2UgdGhlIGRlZmF1bHQgbWFwIGNvbnRyb2xzXG4gIC8vIFRoZSBvYmplY3QgbXVzdCBleHBvc2Ugb25lIHByb3BlcnR5OiBgZXZlbnRzYCBhcyBhbiBhcnJheSBvZiBzdWJzY3JpYmVkXG4gIC8vIGV2ZW50IG5hbWVzOyBhbmQgdHdvIG1ldGhvZHM6IGBzZXRTdGF0ZShzdGF0ZSlgIGFuZCBgaGFuZGxlKGV2ZW50KWBcbiAgbWFwQ29udHJvbHM6IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgZXZlbnRzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMuc3RyaW5nKSxcbiAgICBoYW5kbGVFdmVudDogUHJvcFR5cGVzLmZ1bmNcbiAgfSlcbn07XG5cbmNvbnN0IGdldERlZmF1bHRDdXJzb3IgPSAoe2lzRHJhZ2dpbmd9KSA9PiBpc0RyYWdnaW5nID9cbiAgY29uZmlnLkNVUlNPUi5HUkFCQklORyA6IGNvbmZpZy5DVVJTT1IuR1JBQjtcblxuY29uc3QgZGVmYXVsdFByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgTUFQQk9YX0xJTUlUUywge1xuICBvblZpZXdwb3J0Q2hhbmdlOiBudWxsLFxuXG4gIHNjcm9sbFpvb206IHRydWUsXG4gIGRyYWdQYW46IHRydWUsXG4gIGRyYWdSb3RhdGU6IHRydWUsXG4gIGRvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcbiAgdG91Y2hab29tUm90YXRlOiB0cnVlLFxuXG4gIGdldEN1cnNvcjogZ2V0RGVmYXVsdEN1cnNvclxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcENvbnRyb2xsZXIgZXh0ZW5kcyBQdXJlQ29tcG9uZW50IHtcblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAvLyBXaGV0aGVyIHRoZSBjdXJzb3IgaXMgZG93blxuICAgICAgaXNEcmFnZ2luZzogZmFsc2VcbiAgICB9O1xuXG4gICAgLy8gSWYgcHJvcHMubWFwQ29udHJvbHMgaXMgbm90IHByb3ZpZGVkLCBmYWxsYmFjayB0byBkZWZhdWx0IE1hcENvbnRyb2xzIGluc3RhbmNlXG4gICAgLy8gQ2Fubm90IHVzZSBkZWZhdWx0UHJvcHMgaGVyZSBiZWNhdXNlIGl0IG5lZWRzIHRvIGJlIHBlciBtYXAgaW5zdGFuY2VcbiAgICB0aGlzLl9tYXBDb250cm9scyA9IHByb3BzLm1hcENvbnRyb2xzIHx8IG5ldyBNYXBDb250cm9scygpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3Qge2V2ZW50Q2FudmFzfSA9IHRoaXMucmVmcztcblxuICAgIGNvbnN0IGV2ZW50TWFuYWdlciA9IG5ldyBFdmVudE1hbmFnZXIoZXZlbnRDYW52YXMpO1xuXG4gICAgdGhpcy5fZXZlbnRNYW5hZ2VyID0gZXZlbnRNYW5hZ2VyO1xuXG4gICAgdGhpcy5fbWFwQ29udHJvbHMuc2V0T3B0aW9ucyhPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLCB7XG4gICAgICBvblN0YXRlQ2hhbmdlOiB0aGlzLl9vbkludGVyYWN0aXZlU3RhdGVDaGFuZ2UuYmluZCh0aGlzKSxcbiAgICAgIGV2ZW50TWFuYWdlclxuICAgIH0pKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzKSB7XG4gICAgdGhpcy5fbWFwQ29udHJvbHMuc2V0T3B0aW9ucyhuZXh0UHJvcHMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgaWYgKHRoaXMuX2V2ZW50TWFuYWdlcikge1xuICAgICAgLy8gTXVzdCBkZXN0cm95IGJlY2F1c2UgaGFtbWVyIGFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHdpbmRvd1xuICAgICAgdGhpcy5fZXZlbnRNYW5hZ2VyLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cblxuICBfb25JbnRlcmFjdGl2ZVN0YXRlQ2hhbmdlKHtpc0RyYWdnaW5nID0gZmFsc2V9KSB7XG4gICAgaWYgKGlzRHJhZ2dpbmcgIT09IHRoaXMuc3RhdGUuaXNEcmFnZ2luZykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNEcmFnZ2luZ30pO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodCwgZ2V0Q3Vyc29yfSA9IHRoaXMucHJvcHM7XG5cbiAgICBjb25zdCBldmVudENhbnZhc1N0eWxlID0ge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgIGN1cnNvcjogZ2V0Q3Vyc29yKHRoaXMuc3RhdGUpXG4gICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICBjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIGtleTogJ21hcC1jb250cm9scycsXG4gICAgICAgIHJlZjogJ2V2ZW50Q2FudmFzJyxcbiAgICAgICAgc3R5bGU6IGV2ZW50Q2FudmFzU3R5bGVcbiAgICAgIH0sXG4gICAgICAgIHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgIClcbiAgICApO1xuICB9XG59XG5cbk1hcENvbnRyb2xsZXIuZGlzcGxheU5hbWUgPSAnTWFwQ29udHJvbGxlcic7XG5NYXBDb250cm9sbGVyLnByb3BUeXBlcyA9IHByb3BUeXBlcztcbk1hcENvbnRyb2xsZXIuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19