var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Copyright (c) 2015 Uber Technologies, Inc.

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

import OrbitState from './orbit-state';

// EVENT HANDLING PARAMETERS
var ZOOM_ACCEL = 0.01;

var EVENT_TYPES = {
  WHEEL: ['wheel'],
  PAN: ['panstart', 'panmove', 'panend'],
  PINCH: ['pinchstart', 'pinchmove', 'pinchend'],
  DOUBLE_TAP: ['doubletap']
};

var OrbitControls = function () {
  /**
   * @classdesc
   * A class that handles events and updates mercator style viewport parameters
   */
  function OrbitControls() {
    _classCallCheck(this, OrbitControls);

    this._state = {
      isDragging: false
    };
    this.handleEvent = this.handleEvent.bind(this);
  }

  /**
   * Callback for events
   * @param {hammer.Event} event
   */


  _createClass(OrbitControls, [{
    key: 'handleEvent',
    value: function handleEvent(event) {
      this.orbitState = new OrbitState(Object.assign({}, this.orbitStateProps, this._state));

      switch (event.type) {
        case 'panstart':
          return this._onPanStart(event);
        case 'panmove':
          return this._onPan(event);
        case 'panend':
          return this._onPanEnd(event);
        case 'pinchstart':
          return this._onPinchStart(event);
        case 'pinch':
          return this._onPinch(event);
        case 'pinchend':
          return this._onPinchEnd(event);
        case 'doubletap':
          return this._onDoubleTap(event);
        case 'wheel':
          return this._onWheel(event);
        default:
          return false;
      }
    }

    /* Event utils */
    // Event object: http://hammerjs.github.io/api/#event-object

  }, {
    key: 'getCenter',
    value: function getCenter(event) {
      var _event$offsetCenter = event.offsetCenter,
          x = _event$offsetCenter.x,
          y = _event$offsetCenter.y;

      return [x, y];
    }
  }, {
    key: 'isFunctionKeyPressed',
    value: function isFunctionKeyPressed(event) {
      var srcEvent = event.srcEvent;

      return Boolean(srcEvent.metaKey || srcEvent.altKey || srcEvent.ctrlKey || srcEvent.shiftKey);
    }
  }, {
    key: 'setState',
    value: function setState(newState) {
      Object.assign(this._state, newState);
      if (this.onStateChange) {
        this.onStateChange(this._state);
      }
    }

    /* Callback util */
    // formats map state and invokes callback function

  }, {
    key: 'updateViewport',
    value: function updateViewport(newOrbitState) {
      var extraState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var oldViewport = this.orbitState.getViewportProps();
      var newViewport = newOrbitState.getViewportProps();

      if (this.onViewportChange && Object.keys(newViewport).some(function (key) {
        return oldViewport[key] !== newViewport[key];
      })) {
        // Viewport has changed
        this.onViewportChange(newViewport);
      }

      this.setState(Object.assign({}, newOrbitState.getInteractiveState(), extraState));
    }

    /**
     * Extract interactivity options
     */

  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      var onViewportChange = options.onViewportChange,
          _options$onStateChang = options.onStateChange,
          onStateChange = _options$onStateChang === undefined ? this.onStateChange : _options$onStateChang,
          _options$eventManager = options.eventManager,
          eventManager = _options$eventManager === undefined ? this.eventManager : _options$eventManager,
          _options$scrollZoom = options.scrollZoom,
          scrollZoom = _options$scrollZoom === undefined ? true : _options$scrollZoom,
          _options$dragPan = options.dragPan,
          dragPan = _options$dragPan === undefined ? true : _options$dragPan,
          _options$dragRotate = options.dragRotate,
          dragRotate = _options$dragRotate === undefined ? true : _options$dragRotate,
          _options$doubleClickZ = options.doubleClickZoom,
          doubleClickZoom = _options$doubleClickZ === undefined ? true : _options$doubleClickZ,
          _options$touchZoomRot = options.touchZoomRotate,
          touchZoomRotate = _options$touchZoomRot === undefined ? true : _options$touchZoomRot;

      this.onViewportChange = onViewportChange;
      this.onStateChange = onStateChange;
      this.orbitStateProps = options;
      if (this.eventManager !== eventManager) {
        // EventManager has changed
        this.eventManager = eventManager;
        this._events = {};
      }

      // Register/unregister events
      this.toggleEvents(EVENT_TYPES.WHEEL, scrollZoom);
      this.toggleEvents(EVENT_TYPES.PAN, dragPan || dragRotate);
      this.toggleEvents(EVENT_TYPES.PINCH, touchZoomRotate);
      this.toggleEvents(EVENT_TYPES.DOUBLE_TAP, doubleClickZoom);

      this.scrollZoom = scrollZoom;
      this.dragPan = dragPan;
      this.dragRotate = dragRotate;
      this.doubleClickZoom = doubleClickZoom;
      this.touchZoomRotate = touchZoomRotate;
    }
  }, {
    key: 'toggleEvents',
    value: function toggleEvents(eventNames, enabled) {
      var _this = this;

      if (this.eventManager) {
        eventNames.forEach(function (eventName) {
          if (_this._events[eventName] !== enabled) {
            _this._events[eventName] = enabled;
            if (enabled) {
              _this.eventManager.on(eventName, _this.handleEvent);
            } else {
              _this.eventManager.off(eventName, _this.handleEvent);
            }
          }
        });
      }
    }

    /* Event handlers */
    // Default handler for the `panstart` event.

  }, {
    key: '_onPanStart',
    value: function _onPanStart(event) {
      var pos = this.getCenter(event);
      var newOrbitState = this.orbitState.panStart({ pos: pos }).rotateStart({ pos: pos });
      return this.updateViewport(newOrbitState, { isDragging: true });
    }

    // Default handler for the `panmove` event.

  }, {
    key: '_onPan',
    value: function _onPan(event) {
      return this.isFunctionKeyPressed(event) ? this._onPanMove(event) : this._onPanRotate(event);
    }

    // Default handler for the `panend` event.

  }, {
    key: '_onPanEnd',
    value: function _onPanEnd(event) {
      var newOrbitState = this.orbitState.panEnd().rotateEnd();
      return this.updateViewport(newOrbitState, { isDragging: false });
    }

    // Default handler for panning to move.
    // Called by `_onPan` when panning without function key pressed.

  }, {
    key: '_onPanMove',
    value: function _onPanMove(event) {
      if (!this.dragPan) {
        return false;
      }
      var pos = this.getCenter(event);
      var newOrbitState = this.orbitState.pan({ pos: pos });
      return this.updateViewport(newOrbitState);
    }

    // Default handler for panning to rotate.
    // Called by `_onPan` when panning with function key pressed.

  }, {
    key: '_onPanRotate',
    value: function _onPanRotate(event) {
      if (!this.dragRotate) {
        return false;
      }

      var deltaX = event.deltaX,
          deltaY = event.deltaY;

      var _orbitState$getViewpo = this.orbitState.getViewportProps(),
          width = _orbitState$getViewpo.width,
          height = _orbitState$getViewpo.height;

      var deltaScaleX = deltaX / width;
      var deltaScaleY = deltaY / height;

      var newOrbitState = this.orbitState.rotate({ deltaScaleX: deltaScaleX, deltaScaleY: deltaScaleY });
      return this.updateViewport(newOrbitState);
    }

    // Default handler for the `wheel` event.

  }, {
    key: '_onWheel',
    value: function _onWheel(event) {
      if (!this.scrollZoom) {
        return false;
      }
      event.srcEvent.preventDefault();

      var pos = this.getCenter(event);
      var delta = event.delta;

      // Map wheel delta to relative scale

      var scale = 2 / (1 + Math.exp(-Math.abs(delta * ZOOM_ACCEL)));
      if (delta < 0 && scale !== 0) {
        scale = 1 / scale;
      }

      var newOrbitState = this.orbitState.zoom({ pos: pos, scale: scale });
      return this.updateViewport(newOrbitState);
    }

    // Default handler for the `pinchstart` event.

  }, {
    key: '_onPinchStart',
    value: function _onPinchStart(event) {
      var pos = this.getCenter(event);
      var newOrbitState = this.orbitState.zoomStart({ pos: pos });
      return this.updateViewport(newOrbitState, { isDragging: true });
    }

    // Default handler for the `pinch` event.

  }, {
    key: '_onPinch',
    value: function _onPinch(event) {
      if (!this.touchZoomRotate) {
        return false;
      }
      var pos = this.getCenter(event);
      var scale = event.scale;

      var newOrbitState = this.orbitState.zoom({ pos: pos, scale: scale });
      return this.updateViewport(newOrbitState);
    }

    // Default handler for the `pinchend` event.

  }, {
    key: '_onPinchEnd',
    value: function _onPinchEnd(event) {
      var newOrbitState = this.orbitState.zoomEnd();
      return this.updateViewport(newOrbitState, { isDragging: false });
    }

    // Default handler for the `doubletap` event.

  }, {
    key: '_onDoubleTap',
    value: function _onDoubleTap(event) {
      if (!this.doubleClickZoom) {
        return false;
      }
      var pos = this.getCenter(event);
      var isZoomOut = this.isFunctionKeyPressed(event);

      var newOrbitState = this.orbitState.zoom({ pos: pos, scale: isZoomOut ? 0.5 : 2 });
      return this.updateViewport(newOrbitState);
    }
  }]);

  return OrbitControls;
}();

export default OrbitControls;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9vcmJpdC1jb250cm9sbGVyL29yYml0LWNvbnRyb2xzLmpzIl0sIm5hbWVzIjpbIk9yYml0U3RhdGUiLCJaT09NX0FDQ0VMIiwiRVZFTlRfVFlQRVMiLCJXSEVFTCIsIlBBTiIsIlBJTkNIIiwiRE9VQkxFX1RBUCIsIk9yYml0Q29udHJvbHMiLCJfc3RhdGUiLCJpc0RyYWdnaW5nIiwiaGFuZGxlRXZlbnQiLCJiaW5kIiwiZXZlbnQiLCJvcmJpdFN0YXRlIiwiT2JqZWN0IiwiYXNzaWduIiwib3JiaXRTdGF0ZVByb3BzIiwidHlwZSIsIl9vblBhblN0YXJ0IiwiX29uUGFuIiwiX29uUGFuRW5kIiwiX29uUGluY2hTdGFydCIsIl9vblBpbmNoIiwiX29uUGluY2hFbmQiLCJfb25Eb3VibGVUYXAiLCJfb25XaGVlbCIsIm9mZnNldENlbnRlciIsIngiLCJ5Iiwic3JjRXZlbnQiLCJCb29sZWFuIiwibWV0YUtleSIsImFsdEtleSIsImN0cmxLZXkiLCJzaGlmdEtleSIsIm5ld1N0YXRlIiwib25TdGF0ZUNoYW5nZSIsIm5ld09yYml0U3RhdGUiLCJleHRyYVN0YXRlIiwib2xkVmlld3BvcnQiLCJnZXRWaWV3cG9ydFByb3BzIiwibmV3Vmlld3BvcnQiLCJvblZpZXdwb3J0Q2hhbmdlIiwia2V5cyIsInNvbWUiLCJrZXkiLCJzZXRTdGF0ZSIsImdldEludGVyYWN0aXZlU3RhdGUiLCJvcHRpb25zIiwiZXZlbnRNYW5hZ2VyIiwic2Nyb2xsWm9vbSIsImRyYWdQYW4iLCJkcmFnUm90YXRlIiwiZG91YmxlQ2xpY2tab29tIiwidG91Y2hab29tUm90YXRlIiwiX2V2ZW50cyIsInRvZ2dsZUV2ZW50cyIsImV2ZW50TmFtZXMiLCJlbmFibGVkIiwiZm9yRWFjaCIsImV2ZW50TmFtZSIsIm9uIiwib2ZmIiwicG9zIiwiZ2V0Q2VudGVyIiwicGFuU3RhcnQiLCJyb3RhdGVTdGFydCIsInVwZGF0ZVZpZXdwb3J0IiwiaXNGdW5jdGlvbktleVByZXNzZWQiLCJfb25QYW5Nb3ZlIiwiX29uUGFuUm90YXRlIiwicGFuRW5kIiwicm90YXRlRW5kIiwicGFuIiwiZGVsdGFYIiwiZGVsdGFZIiwid2lkdGgiLCJoZWlnaHQiLCJkZWx0YVNjYWxlWCIsImRlbHRhU2NhbGVZIiwicm90YXRlIiwicHJldmVudERlZmF1bHQiLCJkZWx0YSIsInNjYWxlIiwiTWF0aCIsImV4cCIsImFicyIsInpvb20iLCJ6b29tU3RhcnQiLCJ6b29tRW5kIiwiaXNab29tT3V0Il0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBUCxNQUF1QixlQUF2Qjs7QUFFQTtBQUNBLElBQU1DLGFBQWEsSUFBbkI7O0FBRUEsSUFBTUMsY0FBYztBQUNsQkMsU0FBTyxDQUFDLE9BQUQsQ0FEVztBQUVsQkMsT0FBSyxDQUFDLFVBQUQsRUFBYSxTQUFiLEVBQXdCLFFBQXhCLENBRmE7QUFHbEJDLFNBQU8sQ0FBQyxZQUFELEVBQWUsV0FBZixFQUE0QixVQUE1QixDQUhXO0FBSWxCQyxjQUFZLENBQUMsV0FBRDtBQUpNLENBQXBCOztJQU9xQkMsYTtBQUNuQjs7OztBQUlBLDJCQUFjO0FBQUE7O0FBQ1osU0FBS0MsTUFBTCxHQUFjO0FBQ1pDLGtCQUFZO0FBREEsS0FBZDtBQUdBLFNBQUtDLFdBQUwsR0FBbUIsS0FBS0EsV0FBTCxDQUFpQkMsSUFBakIsQ0FBc0IsSUFBdEIsQ0FBbkI7QUFDRDs7QUFFRDs7Ozs7Ozs7Z0NBSVlDLEssRUFBTztBQUNqQixXQUFLQyxVQUFMLEdBQWtCLElBQUliLFVBQUosQ0FBZWMsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0IsS0FBS0MsZUFBdkIsRUFBd0MsS0FBS1IsTUFBN0MsQ0FBZixDQUFsQjs7QUFFQSxjQUFRSSxNQUFNSyxJQUFkO0FBQ0EsYUFBSyxVQUFMO0FBQ0UsaUJBQU8s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cUIsRUFBQ3hCLFFBQUQsRUFBTW9CLE9BQU9PLFlBQVksR0FBWixHQUFrQixDQUEvQixFQUFyQixDQUF0QjtBQUNBLGFBQU8sS0FBS3ZCLGNBQUwsQ0FBb0I5QixhQUFwQixDQUFQO0FBQ0Q7Ozs7OztlQXBPa0I5QixhIiwiZmlsZSI6Im9yYml0LWNvbnRyb2xzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG5cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IE9yYml0U3RhdGUgZnJvbSAnLi9vcmJpdC1zdGF0ZSc7XG5cbi8vIEVWRU5UIEhBTkRMSU5HIFBBUkFNRVRFUlNcbmNvbnN0IFpPT01fQUNDRUwgPSAwLjAxO1xuXG5jb25zdCBFVkVOVF9UWVBFUyA9IHtcbiAgV0hFRUw6IFsnd2hlZWwnXSxcbiAgUEFOOiBbJ3BhbnN0YXJ0JywgJ3Bhbm1vdmUnLCAncGFuZW5kJ10sXG4gIFBJTkNIOiBbJ3BpbmNoc3RhcnQnLCAncGluY2htb3ZlJywgJ3BpbmNoZW5kJ10sXG4gIERPVUJMRV9UQVA6IFsnZG91YmxldGFwJ11cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9yYml0Q29udHJvbHMge1xuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBBIGNsYXNzIHRoYXQgaGFuZGxlcyBldmVudHMgYW5kIHVwZGF0ZXMgbWVyY2F0b3Igc3R5bGUgdmlld3BvcnQgcGFyYW1ldGVyc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fc3RhdGUgPSB7XG4gICAgICBpc0RyYWdnaW5nOiBmYWxzZVxuICAgIH07XG4gICAgdGhpcy5oYW5kbGVFdmVudCA9IHRoaXMuaGFuZGxlRXZlbnQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBmb3IgZXZlbnRzXG4gICAqIEBwYXJhbSB7aGFtbWVyLkV2ZW50fSBldmVudFxuICAgKi9cbiAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICB0aGlzLm9yYml0U3RhdGUgPSBuZXcgT3JiaXRTdGF0ZShPYmplY3QuYXNzaWduKHt9LCB0aGlzLm9yYml0U3RhdGVQcm9wcywgdGhpcy5fc3RhdGUpKTtcblxuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgIGNhc2UgJ3BhbnN0YXJ0JzpcbiAgICAgIHJldHVybiB0aGlzLl9vblBhblN0YXJ0KGV2ZW50KTtcbiAgICBjYXNlICdwYW5tb3ZlJzpcbiAgICAgIHJldHVybiB0aGlzLl9vblBhbihldmVudCk7XG4gICAgY2FzZSAncGFuZW5kJzpcbiAgICAgIHJldHVybiB0aGlzLl9vblBhbkVuZChldmVudCk7XG4gICAgY2FzZSAncGluY2hzdGFydCc6XG4gICAgICByZXR1cm4gdGhpcy5fb25QaW5jaFN0YXJ0KGV2ZW50KTtcbiAgICBjYXNlICdwaW5jaCc6XG4gICAgICByZXR1cm4gdGhpcy5fb25QaW5jaChldmVudCk7XG4gICAgY2FzZSAncGluY2hlbmQnOlxuICAgICAgcmV0dXJuIHRoaXMuX29uUGluY2hFbmQoZXZlbnQpO1xuICAgIGNhc2UgJ2RvdWJsZXRhcCc6XG4gICAgICByZXR1cm4gdGhpcy5fb25Eb3VibGVUYXAoZXZlbnQpO1xuICAgIGNhc2UgJ3doZWVsJzpcbiAgICAgIHJldHVybiB0aGlzLl9vbldoZWVsKGV2ZW50KTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qIEV2ZW50IHV0aWxzICovXG4gIC8vIEV2ZW50IG9iamVjdDogaHR0cDovL2hhbW1lcmpzLmdpdGh1Yi5pby9hcGkvI2V2ZW50LW9iamVjdFxuICBnZXRDZW50ZXIoZXZlbnQpIHtcbiAgICBjb25zdCB7b2Zmc2V0Q2VudGVyOiB7eCwgeX19ID0gZXZlbnQ7XG4gICAgcmV0dXJuIFt4LCB5XTtcbiAgfVxuXG4gIGlzRnVuY3Rpb25LZXlQcmVzc2VkKGV2ZW50KSB7XG4gICAgY29uc3Qge3NyY0V2ZW50fSA9IGV2ZW50O1xuICAgIHJldHVybiBCb29sZWFuKHNyY0V2ZW50Lm1ldGFLZXkgfHwgc3JjRXZlbnQuYWx0S2V5IHx8XG4gICAgICBzcmNFdmVudC5jdHJsS2V5IHx8IHNyY0V2ZW50LnNoaWZ0S2V5KTtcbiAgfVxuXG4gIHNldFN0YXRlKG5ld1N0YXRlKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLl9zdGF0ZSwgbmV3U3RhdGUpO1xuICAgIGlmICh0aGlzLm9uU3RhdGVDaGFuZ2UpIHtcbiAgICAgIHRoaXMub25TdGF0ZUNoYW5nZSh0aGlzLl9zdGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgLyogQ2FsbGJhY2sgdXRpbCAqL1xuICAvLyBmb3JtYXRzIG1hcCBzdGF0ZSBhbmQgaW52b2tlcyBjYWxsYmFjayBmdW5jdGlvblxuICB1cGRhdGVWaWV3cG9ydChuZXdPcmJpdFN0YXRlLCBleHRyYVN0YXRlID0ge30pIHtcbiAgICBjb25zdCBvbGRWaWV3cG9ydCA9IHRoaXMub3JiaXRTdGF0ZS5nZXRWaWV3cG9ydFByb3BzKCk7XG4gICAgY29uc3QgbmV3Vmlld3BvcnQgPSBuZXdPcmJpdFN0YXRlLmdldFZpZXdwb3J0UHJvcHMoKTtcblxuICAgIGlmICh0aGlzLm9uVmlld3BvcnRDaGFuZ2UgJiZcbiAgICAgIE9iamVjdC5rZXlzKG5ld1ZpZXdwb3J0KS5zb21lKGtleSA9PiBvbGRWaWV3cG9ydFtrZXldICE9PSBuZXdWaWV3cG9ydFtrZXldKSkge1xuICAgICAgLy8gVmlld3BvcnQgaGFzIGNoYW5nZWRcbiAgICAgIHRoaXMub25WaWV3cG9ydENoYW5nZShuZXdWaWV3cG9ydCk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZShPYmplY3QuYXNzaWduKHt9LCBuZXdPcmJpdFN0YXRlLmdldEludGVyYWN0aXZlU3RhdGUoKSwgZXh0cmFTdGF0ZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4dHJhY3QgaW50ZXJhY3Rpdml0eSBvcHRpb25zXG4gICAqL1xuICBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBjb25zdCB7XG4gICAgICBvblZpZXdwb3J0Q2hhbmdlLFxuICAgICAgb25TdGF0ZUNoYW5nZSA9IHRoaXMub25TdGF0ZUNoYW5nZSxcbiAgICAgIGV2ZW50TWFuYWdlciA9IHRoaXMuZXZlbnRNYW5hZ2VyLFxuICAgICAgc2Nyb2xsWm9vbSA9IHRydWUsXG4gICAgICBkcmFnUGFuID0gdHJ1ZSxcbiAgICAgIGRyYWdSb3RhdGUgPSB0cnVlLFxuICAgICAgZG91YmxlQ2xpY2tab29tID0gdHJ1ZSxcbiAgICAgIHRvdWNoWm9vbVJvdGF0ZSA9IHRydWVcbiAgICB9ID0gb3B0aW9ucztcbiAgICB0aGlzLm9uVmlld3BvcnRDaGFuZ2UgPSBvblZpZXdwb3J0Q2hhbmdlO1xuICAgIHRoaXMub25TdGF0ZUNoYW5nZSA9IG9uU3RhdGVDaGFuZ2U7XG4gICAgdGhpcy5vcmJpdFN0YXRlUHJvcHMgPSBvcHRpb25zO1xuICAgIGlmICh0aGlzLmV2ZW50TWFuYWdlciAhPT0gZXZlbnRNYW5hZ2VyKSB7XG4gICAgICAvLyBFdmVudE1hbmFnZXIgaGFzIGNoYW5nZWRcbiAgICAgIHRoaXMuZXZlbnRNYW5hZ2VyID0gZXZlbnRNYW5hZ2VyO1xuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgfVxuXG4gICAgLy8gUmVnaXN0ZXIvdW5yZWdpc3RlciBldmVudHNcbiAgICB0aGlzLnRvZ2dsZUV2ZW50cyhFVkVOVF9UWVBFUy5XSEVFTCwgc2Nyb2xsWm9vbSk7XG4gICAgdGhpcy50b2dnbGVFdmVudHMoRVZFTlRfVFlQRVMuUEFOLCBkcmFnUGFuIHx8IGRyYWdSb3RhdGUpO1xuICAgIHRoaXMudG9nZ2xlRXZlbnRzKEVWRU5UX1RZUEVTLlBJTkNILCB0b3VjaFpvb21Sb3RhdGUpO1xuICAgIHRoaXMudG9nZ2xlRXZlbnRzKEVWRU5UX1RZUEVTLkRPVUJMRV9UQVAsIGRvdWJsZUNsaWNrWm9vbSk7XG5cbiAgICB0aGlzLnNjcm9sbFpvb20gPSBzY3JvbGxab29tO1xuICAgIHRoaXMuZHJhZ1BhbiA9IGRyYWdQYW47XG4gICAgdGhpcy5kcmFnUm90YXRlID0gZHJhZ1JvdGF0ZTtcbiAgICB0aGlzLmRvdWJsZUNsaWNrWm9vbSA9IGRvdWJsZUNsaWNrWm9vbTtcbiAgICB0aGlzLnRvdWNoWm9vbVJvdGF0ZSA9IHRvdWNoWm9vbVJvdGF0ZTtcbiAgfVxuXG4gIHRvZ2dsZUV2ZW50cyhldmVudE5hbWVzLCBlbmFibGVkKSB7XG4gICAgaWYgKHRoaXMuZXZlbnRNYW5hZ2VyKSB7XG4gICAgICBldmVudE5hbWVzLmZvckVhY2goZXZlbnROYW1lID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2V2ZW50c1tldmVudE5hbWVdICE9PSBlbmFibGVkKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzW2V2ZW50TmFtZV0gPSBlbmFibGVkO1xuICAgICAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50TWFuYWdlci5vbihldmVudE5hbWUsIHRoaXMuaGFuZGxlRXZlbnQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50TWFuYWdlci5vZmYoZXZlbnROYW1lLCB0aGlzLmhhbmRsZUV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qIEV2ZW50IGhhbmRsZXJzICovXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgdGhlIGBwYW5zdGFydGAgZXZlbnQuXG4gIF9vblBhblN0YXJ0KGV2ZW50KSB7XG4gICAgY29uc3QgcG9zID0gdGhpcy5nZXRDZW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IG5ld09yYml0U3RhdGUgPSB0aGlzLm9yYml0U3RhdGUucGFuU3RhcnQoe3Bvc30pLnJvdGF0ZVN0YXJ0KHtwb3N9KTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdPcmJpdFN0YXRlLCB7aXNEcmFnZ2luZzogdHJ1ZX0pO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYHBhbm1vdmVgIGV2ZW50LlxuICBfb25QYW4oZXZlbnQpIHtcbiAgICByZXR1cm4gdGhpcy5pc0Z1bmN0aW9uS2V5UHJlc3NlZChldmVudCkgPyB0aGlzLl9vblBhbk1vdmUoZXZlbnQpIDogdGhpcy5fb25QYW5Sb3RhdGUoZXZlbnQpO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYHBhbmVuZGAgZXZlbnQuXG4gIF9vblBhbkVuZChldmVudCkge1xuICAgIGNvbnN0IG5ld09yYml0U3RhdGUgPSB0aGlzLm9yYml0U3RhdGUucGFuRW5kKCkucm90YXRlRW5kKCk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3T3JiaXRTdGF0ZSwge2lzRHJhZ2dpbmc6IGZhbHNlfSk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHBhbm5pbmcgdG8gbW92ZS5cbiAgLy8gQ2FsbGVkIGJ5IGBfb25QYW5gIHdoZW4gcGFubmluZyB3aXRob3V0IGZ1bmN0aW9uIGtleSBwcmVzc2VkLlxuICBfb25QYW5Nb3ZlKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmRyYWdQYW4pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgcG9zID0gdGhpcy5nZXRDZW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IG5ld09yYml0U3RhdGUgPSB0aGlzLm9yYml0U3RhdGUucGFuKHtwb3N9KTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdPcmJpdFN0YXRlKTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgcGFubmluZyB0byByb3RhdGUuXG4gIC8vIENhbGxlZCBieSBgX29uUGFuYCB3aGVuIHBhbm5pbmcgd2l0aCBmdW5jdGlvbiBrZXkgcHJlc3NlZC5cbiAgX29uUGFuUm90YXRlKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmRyYWdSb3RhdGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCB7ZGVsdGFYLCBkZWx0YVl9ID0gZXZlbnQ7XG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHR9ID0gdGhpcy5vcmJpdFN0YXRlLmdldFZpZXdwb3J0UHJvcHMoKTtcblxuICAgIGNvbnN0IGRlbHRhU2NhbGVYID0gZGVsdGFYIC8gd2lkdGg7XG4gICAgY29uc3QgZGVsdGFTY2FsZVkgPSBkZWx0YVkgLyBoZWlnaHQ7XG5cbiAgICBjb25zdCBuZXdPcmJpdFN0YXRlID0gdGhpcy5vcmJpdFN0YXRlLnJvdGF0ZSh7ZGVsdGFTY2FsZVgsIGRlbHRhU2NhbGVZfSk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3T3JiaXRTdGF0ZSk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHRoZSBgd2hlZWxgIGV2ZW50LlxuICBfb25XaGVlbChldmVudCkge1xuICAgIGlmICghdGhpcy5zY3JvbGxab29tKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGV2ZW50LnNyY0V2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBjb25zdCBwb3MgPSB0aGlzLmdldENlbnRlcihldmVudCk7XG4gICAgY29uc3Qge2RlbHRhfSA9IGV2ZW50O1xuXG4gICAgLy8gTWFwIHdoZWVsIGRlbHRhIHRvIHJlbGF0aXZlIHNjYWxlXG4gICAgbGV0IHNjYWxlID0gMiAvICgxICsgTWF0aC5leHAoLU1hdGguYWJzKGRlbHRhICogWk9PTV9BQ0NFTCkpKTtcbiAgICBpZiAoZGVsdGEgPCAwICYmIHNjYWxlICE9PSAwKSB7XG4gICAgICBzY2FsZSA9IDEgLyBzY2FsZTtcbiAgICB9XG5cbiAgICBjb25zdCBuZXdPcmJpdFN0YXRlID0gdGhpcy5vcmJpdFN0YXRlLnpvb20oe3Bvcywgc2NhbGV9KTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdPcmJpdFN0YXRlKTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgdGhlIGBwaW5jaHN0YXJ0YCBldmVudC5cbiAgX29uUGluY2hTdGFydChldmVudCkge1xuICAgIGNvbnN0IHBvcyA9IHRoaXMuZ2V0Q2VudGVyKGV2ZW50KTtcbiAgICBjb25zdCBuZXdPcmJpdFN0YXRlID0gdGhpcy5vcmJpdFN0YXRlLnpvb21TdGFydCh7cG9zfSk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3T3JiaXRTdGF0ZSwge2lzRHJhZ2dpbmc6IHRydWV9KTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgdGhlIGBwaW5jaGAgZXZlbnQuXG4gIF9vblBpbmNoKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLnRvdWNoWm9vbVJvdGF0ZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBwb3MgPSB0aGlzLmdldENlbnRlcihldmVudCk7XG4gICAgY29uc3Qge3NjYWxlfSA9IGV2ZW50O1xuICAgIGNvbnN0IG5ld09yYml0U3RhdGUgPSB0aGlzLm9yYml0U3RhdGUuem9vbSh7cG9zLCBzY2FsZX0pO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpZXdwb3J0KG5ld09yYml0U3RhdGUpO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYHBpbmNoZW5kYCBldmVudC5cbiAgX29uUGluY2hFbmQoZXZlbnQpIHtcbiAgICBjb25zdCBuZXdPcmJpdFN0YXRlID0gdGhpcy5vcmJpdFN0YXRlLnpvb21FbmQoKTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdPcmJpdFN0YXRlLCB7aXNEcmFnZ2luZzogZmFsc2V9KTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgdGhlIGBkb3VibGV0YXBgIGV2ZW50LlxuICBfb25Eb3VibGVUYXAoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuZG91YmxlQ2xpY2tab29tKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHBvcyA9IHRoaXMuZ2V0Q2VudGVyKGV2ZW50KTtcbiAgICBjb25zdCBpc1pvb21PdXQgPSB0aGlzLmlzRnVuY3Rpb25LZXlQcmVzc2VkKGV2ZW50KTtcblxuICAgIGNvbnN0IG5ld09yYml0U3RhdGUgPSB0aGlzLm9yYml0U3RhdGUuem9vbSh7cG9zLCBzY2FsZTogaXNab29tT3V0ID8gMC41IDogMn0pO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpZXdwb3J0KG5ld09yYml0U3RhdGUpO1xuICB9XG59XG4iXX0=