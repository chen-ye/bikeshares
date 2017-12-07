var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { createElement } from 'react';
import PropTypes from 'prop-types';
import OrbitViewport from './orbit-viewport';
import OrbitControls from './orbit-controls';

import EventManager from '../../utils/events/event-manager';

var propTypes = {
  /* Viewport properties */
  lookAt: PropTypes.arrayOf(PropTypes.number), // target position
  distance: PropTypes.number, // distance from camera to the target
  rotationX: PropTypes.number, // rotation around X axis
  rotationY: PropTypes.number, // rotation around Y axis
  translationX: PropTypes.number, // translation x in screen space
  translationY: PropTypes.number, // translation y in screen space
  zoom: PropTypes.number, // scale in screen space
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number,
  fov: PropTypes.number, // field of view
  near: PropTypes.number,
  far: PropTypes.number,
  width: PropTypes.number.isRequired, // viewport width in pixels
  height: PropTypes.number.isRequired, // viewport height in pixels

  /* Model properties */
  bounds: PropTypes.object, // bounds in the shape of {minX, minY, minZ, maxX, maxY, maxZ}

  /* Callbacks */
  onViewportChange: PropTypes.func.isRequired,

  /* Controls */
  orbitControls: PropTypes.object
};

var defaultProps = {
  lookAt: [0, 0, 0],
  rotationX: 0,
  rotationY: 0,
  translationX: 0,
  translationY: 0,
  distance: 10,
  zoom: 1,
  minZoom: 0,
  maxZoom: Infinity,
  fov: 50,
  near: 1,
  far: 1000
};

/*
 * Maps mouse interaction to a deck.gl Viewport
 */

var OrbitController = function (_React$Component) {
  _inherits(OrbitController, _React$Component);

  _createClass(OrbitController, null, [{
    key: 'getViewport',


    // Returns a deck.gl Viewport instance, to be used with the DeckGL component
    value: function getViewport(viewport) {
      return new OrbitViewport(viewport);
    }
  }]);

  function OrbitController(props) {
    _classCallCheck(this, OrbitController);

    var _this = _possibleConstructorReturn(this, (OrbitController.__proto__ || Object.getPrototypeOf(OrbitController)).call(this, props));

    _this.state = {
      // Whether the cursor is down
      isDragging: false
    };

    _this._orbitControls = props.orbitControls || new OrbitControls();
    return _this;
  }

  _createClass(OrbitController, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var eventCanvas = this.refs.eventCanvas;


      var eventManager = new EventManager(eventCanvas);
      this._eventManager = eventManager;

      this._orbitControls.setOptions(Object.assign({}, this.props, {
        onStateChange: this._onInteractiveStateChange.bind(this),
        eventManager: eventManager
      }));
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(nextProps) {
      this._orbitControls.setOptions(nextProps);
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
    value: function _onInteractiveStateChange(_ref) {
      var _ref$isDragging = _ref.isDragging,
          isDragging = _ref$isDragging === undefined ? false : _ref$isDragging;

      if (isDragging !== this.state.isDragging) {
        this.setState({ isDragging: isDragging });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return createElement('div', {
        ref: 'eventCanvas'
      }, this.props.children);
    }
  }]);

  return OrbitController;
}(React.Component);

export default OrbitController;


OrbitController.propTypes = propTypes;
OrbitController.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9vcmJpdC1jb250cm9sbGVyL29yYml0LWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOlsiUmVhY3QiLCJjcmVhdGVFbGVtZW50IiwiUHJvcFR5cGVzIiwiT3JiaXRWaWV3cG9ydCIsIk9yYml0Q29udHJvbHMiLCJFdmVudE1hbmFnZXIiLCJwcm9wVHlwZXMiLCJsb29rQXQiLCJhcnJheU9mIiwibnVtYmVyIiwiZGlzdGFuY2UiLCJyb3RhdGlvblgiLCJyb3RhdGlvblkiLCJ0cmFuc2xhdGlvblgiLCJ0cmFuc2xhdGlvblkiLCJ6b29tIiwibWluWm9vbSIsIm1heFpvb20iLCJmb3YiLCJuZWFyIiwiZmFyIiwid2lkdGgiLCJpc1JlcXVpcmVkIiwiaGVpZ2h0IiwiYm91bmRzIiwib2JqZWN0Iiwib25WaWV3cG9ydENoYW5nZSIsImZ1bmMiLCJvcmJpdENvbnRyb2xzIiwiZGVmYXVsdFByb3BzIiwiSW5maW5pdHkiLCJPcmJpdENvbnRyb2xsZXIiLCJ2aWV3cG9ydCIsInByb3BzIiwic3RhdGUiLCJpc0RyYWdnaW5nIiwiX29yYml0Q29udHJvbHMiLCJldmVudENhbnZhcyIsInJlZnMiLCJldmVudE1hbmFnZXIiLCJfZXZlbnRNYW5hZ2VyIiwic2V0T3B0aW9ucyIsIk9iamVjdCIsImFzc2lnbiIsIm9uU3RhdGVDaGFuZ2UiLCJfb25JbnRlcmFjdGl2ZVN0YXRlQ2hhbmdlIiwiYmluZCIsIm5leHRQcm9wcyIsImRlc3Ryb3kiLCJzZXRTdGF0ZSIsInJlZiIsImNoaWxkcmVuIiwiQ29tcG9uZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLE9BQU9BLEtBQVAsSUFBZUMsYUFBZixRQUFtQyxPQUFuQztBQUNBLE9BQU9DLFNBQVAsTUFBc0IsWUFBdEI7QUFDQSxPQUFPQyxhQUFQLE1BQTBCLGtCQUExQjtBQUNBLE9BQU9DLGFBQVAsTUFBMEIsa0JBQTFCOztBQUVBLE9BQU9DLFlBQVAsTUFBeUIsa0NBQXpCOztBQUVB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QUZkLENBREY7QUFLRDs7OztFQXJEMENuRCxNQUFNb0QsUzs7ZUFBOUJyQixlOzs7QUF3RHJCQSxnQkFBZ0J6QixTQUFoQixHQUE0QkEsU0FBNUI7QUFDQXlCLGdCQUFnQkYsWUFBaEIsR0FBK0JBLFlBQS9CIiwiZmlsZSI6Im9yYml0LWNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHtjcmVhdGVFbGVtZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IE9yYml0Vmlld3BvcnQgZnJvbSAnLi9vcmJpdC12aWV3cG9ydCc7XG5pbXBvcnQgT3JiaXRDb250cm9scyBmcm9tICcuL29yYml0LWNvbnRyb2xzJztcblxuaW1wb3J0IEV2ZW50TWFuYWdlciBmcm9tICcuLi8uLi91dGlscy9ldmVudHMvZXZlbnQtbWFuYWdlcic7XG5cbmNvbnN0IHByb3BUeXBlcyA9IHtcbiAgLyogVmlld3BvcnQgcHJvcGVydGllcyAqL1xuICBsb29rQXQ6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5udW1iZXIpLCAvLyB0YXJnZXQgcG9zaXRpb25cbiAgZGlzdGFuY2U6IFByb3BUeXBlcy5udW1iZXIsIC8vIGRpc3RhbmNlIGZyb20gY2FtZXJhIHRvIHRoZSB0YXJnZXRcbiAgcm90YXRpb25YOiBQcm9wVHlwZXMubnVtYmVyLCAvLyByb3RhdGlvbiBhcm91bmQgWCBheGlzXG4gIHJvdGF0aW9uWTogUHJvcFR5cGVzLm51bWJlciwgLy8gcm90YXRpb24gYXJvdW5kIFkgYXhpc1xuICB0cmFuc2xhdGlvblg6IFByb3BUeXBlcy5udW1iZXIsIC8vIHRyYW5zbGF0aW9uIHggaW4gc2NyZWVuIHNwYWNlXG4gIHRyYW5zbGF0aW9uWTogUHJvcFR5cGVzLm51bWJlciwgLy8gdHJhbnNsYXRpb24geSBpbiBzY3JlZW4gc3BhY2VcbiAgem9vbTogUHJvcFR5cGVzLm51bWJlciwgLy8gc2NhbGUgaW4gc2NyZWVuIHNwYWNlXG4gIG1pblpvb206IFByb3BUeXBlcy5udW1iZXIsXG4gIG1heFpvb206IFByb3BUeXBlcy5udW1iZXIsXG4gIGZvdjogUHJvcFR5cGVzLm51bWJlciwgLy8gZmllbGQgb2Ygdmlld1xuICBuZWFyOiBQcm9wVHlwZXMubnVtYmVyLFxuICBmYXI6IFByb3BUeXBlcy5udW1iZXIsXG4gIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8vIHZpZXdwb3J0IHdpZHRoIGluIHBpeGVsc1xuICBoZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCwgLy8gdmlld3BvcnQgaGVpZ2h0IGluIHBpeGVsc1xuXG4gIC8qIE1vZGVsIHByb3BlcnRpZXMgKi9cbiAgYm91bmRzOiBQcm9wVHlwZXMub2JqZWN0LCAvLyBib3VuZHMgaW4gdGhlIHNoYXBlIG9mIHttaW5YLCBtaW5ZLCBtaW5aLCBtYXhYLCBtYXhZLCBtYXhafVxuXG4gIC8qIENhbGxiYWNrcyAqL1xuICBvblZpZXdwb3J0Q2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuXG4gIC8qIENvbnRyb2xzICovXG4gIG9yYml0Q29udHJvbHM6IFByb3BUeXBlcy5vYmplY3Rcbn07XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgbG9va0F0OiBbMCwgMCwgMF0sXG4gIHJvdGF0aW9uWDogMCxcbiAgcm90YXRpb25ZOiAwLFxuICB0cmFuc2xhdGlvblg6IDAsXG4gIHRyYW5zbGF0aW9uWTogMCxcbiAgZGlzdGFuY2U6IDEwLFxuICB6b29tOiAxLFxuICBtaW5ab29tOiAwLFxuICBtYXhab29tOiBJbmZpbml0eSxcbiAgZm92OiA1MCxcbiAgbmVhcjogMSxcbiAgZmFyOiAxMDAwXG59O1xuXG4vKlxuICogTWFwcyBtb3VzZSBpbnRlcmFjdGlvbiB0byBhIGRlY2suZ2wgVmlld3BvcnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3JiaXRDb250cm9sbGVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICAvLyBSZXR1cm5zIGEgZGVjay5nbCBWaWV3cG9ydCBpbnN0YW5jZSwgdG8gYmUgdXNlZCB3aXRoIHRoZSBEZWNrR0wgY29tcG9uZW50XG4gIHN0YXRpYyBnZXRWaWV3cG9ydCh2aWV3cG9ydCkge1xuICAgIHJldHVybiBuZXcgT3JiaXRWaWV3cG9ydCh2aWV3cG9ydCk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAvLyBXaGV0aGVyIHRoZSBjdXJzb3IgaXMgZG93blxuICAgICAgaXNEcmFnZ2luZzogZmFsc2VcbiAgICB9O1xuXG4gICAgdGhpcy5fb3JiaXRDb250cm9scyA9IHByb3BzLm9yYml0Q29udHJvbHMgfHwgbmV3IE9yYml0Q29udHJvbHMoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IHtldmVudENhbnZhc30gPSB0aGlzLnJlZnM7XG5cbiAgICBjb25zdCBldmVudE1hbmFnZXIgPSBuZXcgRXZlbnRNYW5hZ2VyKGV2ZW50Q2FudmFzKTtcbiAgICB0aGlzLl9ldmVudE1hbmFnZXIgPSBldmVudE1hbmFnZXI7XG5cbiAgICB0aGlzLl9vcmJpdENvbnRyb2xzLnNldE9wdGlvbnMoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wcm9wcywge1xuICAgICAgb25TdGF0ZUNoYW5nZTogdGhpcy5fb25JbnRlcmFjdGl2ZVN0YXRlQ2hhbmdlLmJpbmQodGhpcyksXG4gICAgICBldmVudE1hbmFnZXJcbiAgICB9KSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVXBkYXRlKG5leHRQcm9wcykge1xuICAgIHRoaXMuX29yYml0Q29udHJvbHMuc2V0T3B0aW9ucyhuZXh0UHJvcHMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgaWYgKHRoaXMuX2V2ZW50TWFuYWdlcikge1xuICAgICAgLy8gTXVzdCBkZXN0cm95IGJlY2F1c2UgaGFtbWVyIGFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHdpbmRvd1xuICAgICAgdGhpcy5fZXZlbnRNYW5hZ2VyLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cblxuICBfb25JbnRlcmFjdGl2ZVN0YXRlQ2hhbmdlKHtpc0RyYWdnaW5nID0gZmFsc2V9KSB7XG4gICAgaWYgKGlzRHJhZ2dpbmcgIT09IHRoaXMuc3RhdGUuaXNEcmFnZ2luZykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNEcmFnZ2luZ30pO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICByZWY6ICdldmVudENhbnZhcydcbiAgICAgIH0sIHRoaXMucHJvcHMuY2hpbGRyZW4pXG4gICAgKTtcbiAgfVxufVxuXG5PcmJpdENvbnRyb2xsZXIucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuT3JiaXRDb250cm9sbGVyLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbiJdfQ==