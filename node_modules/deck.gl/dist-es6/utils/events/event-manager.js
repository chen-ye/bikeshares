var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import WheelInput from './wheel-input';
import MoveInput from './move-input';
import { isBrowser } from '../globals';

// Hammer.js directly references `document` and `window`,
// which means that importing it in environments without
// those objects throws errors. Therefore, instead of
// directly `import`ing 'hammerjs' and './constants'
// (which imports Hammer.js) we conditionally require it
// depending on support for those globals, and provide mocks
// for environments without `document`/`window`.
function ManagerMock(m) {
  var instance = {};
  var chainedNoop = function chainedNoop() {
    return instance;
  };
  instance.get = function () {
    return null;
  };
  instance.on = chainedNoop;
  instance.off = chainedNoop;
  instance.destroy = chainedNoop;
  instance.emit = chainedNoop;
  return instance;
}

var Manager = isBrowser ? require('hammerjs').Manager : ManagerMock;

var _ref = isBrowser ? require('./constants') : {
  BASIC_EVENT_ALIASES: {},
  EVENT_RECOGNIZER_MAP: {},
  GESTURE_EVENT_ALIASES: {}
},
    BASIC_EVENT_ALIASES = _ref.BASIC_EVENT_ALIASES,
    EVENT_RECOGNIZER_MAP = _ref.EVENT_RECOGNIZER_MAP,
    RECOGNIZERS = _ref.RECOGNIZERS,
    GESTURE_EVENT_ALIASES = _ref.GESTURE_EVENT_ALIASES;

/**
 * Single API for subscribing to events about both
 * basic input events (e.g. 'mousemove', 'touchstart', 'wheel')
 * and gestural input (e.g. 'click', 'tap', 'panstart').
 * Delegates event registration and handling to Hammer.js.
 * @param {DOM Element} element         DOM element on which event handlers will be registered.
 * @param {Object} options              Options for instantiation
 * @param {Object} options.events       Map of {event name: handler} to register on init.
 * @param {Object} options.recognizers  Gesture recognizers from Hammer.js to register,
 *                                      as an Array in Hammer.Recognizer format.
 *                                      (http://hammerjs.github.io/api/#hammermanager)
 */


var EventManager = function () {
  function EventManager(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, EventManager);

    this.element = element;
    this._onBasicInput = this._onBasicInput.bind(this);
    this.manager = new Manager(element, { recognizers: options.recognizers || RECOGNIZERS }).on('hammer.input', this._onBasicInput);

    this.eventHandlers = [];

    // Handle events not handled by Hammer.js:
    // - mouse wheel
    // - pointer/touch/mouse move
    this._onOtherEvent = this._onOtherEvent.bind(this);
    this.wheelInput = new WheelInput(element, this._onOtherEvent, { enable: false });
    this.moveInput = new MoveInput(element, this._onOtherEvent, { enable: false });

    // Register all passed events.
    var events = options.events;

    if (events) {
      this.on(events);
    }
  }

  /**
   * Tear down internal event management implementations.
   */


  _createClass(EventManager, [{
    key: 'destroy',
    value: function destroy() {
      this.wheelInput.destroy();
      this.moveInput.destroy();
      this.manager.destroy();
    }

    /**
     * Register an event handler function to be called on `event`.
     * @param {string|Object} event   An event name (String) or map of event names to handlers.
     * @param {Function} [handler]    The function to be called on `event`.
     */

  }, {
    key: 'on',
    value: function on(event, handler) {
      if (typeof event === 'string') {
        this._addEventHandler(event, handler);
      } else {
        // If `event` is a map, call `on()` for each entry.
        for (var eventName in event) {
          this._addEventHandler(eventName, event[eventName]);
        }
      }
    }

    /**
     * Deregister a previously-registered event handler.
     * @param {string|Object} event   An event name (String) or map of event names to handlers
     * @param {Function} [handler]    The function to be called on `event`.
     */

  }, {
    key: 'off',
    value: function off(event, handler) {
      if (typeof event === 'string') {
        this._removeEventHandler(event, handler);
      } else {
        // If `event` is a map, call `off()` for each entry.
        for (var eventName in event) {
          this._removeEventHandler(eventName, event[eventName]);
        }
      }
    }

    /*
     * Enable/disable recognizer for the given event
     */

  }, {
    key: '_toggleRecognizer',
    value: function _toggleRecognizer(name, enabled) {
      var recognizer = this.manager.get(name);
      if (recognizer) {
        recognizer.set({ enable: enabled });
      }
      this.wheelInput.toggleIfEventSupported(name, enabled);
      this.moveInput.toggleIfEventSupported(name, enabled);
    }

    /**
     * Process the event registration for a single event + handler.
     */

  }, {
    key: '_addEventHandler',
    value: function _addEventHandler(event, handler) {
      var wrappedHandler = this._wrapEventHandler(event, handler);
      // Alias to a recognized gesture as necessary.
      var eventAlias = GESTURE_EVENT_ALIASES[event] || event;
      // Get recognizer for this event
      var recognizerName = EVENT_RECOGNIZER_MAP[eventAlias] || eventAlias;
      // Enable recognizer for this event.
      this._toggleRecognizer(recognizerName, true);

      // Save wrapped handler
      this.eventHandlers.push({ event: event, eventAlias: eventAlias, recognizerName: recognizerName, handler: handler, wrappedHandler: wrappedHandler });

      this.manager.on(eventAlias, wrappedHandler);
    }

    /**
     * Process the event deregistration for a single event + handler.
     */

  }, {
    key: '_removeEventHandler',
    value: function _removeEventHandler(event, handler) {
      var eventHandlerRemoved = false;

      // Find saved handler if any.
      for (var i = this.eventHandlers.length; i--;) {
        var entry = this.eventHandlers[i];
        if (entry.event === event && entry.handler === handler) {
          // Deregister event handler.
          this.manager.off(entry.eventAlias, entry.wrappedHandler);
          // Delete saved handler
          this.eventHandlers.splice(i, 1);
          eventHandlerRemoved = true;
        }
      }

      if (eventHandlerRemoved) {
        // Alias to a recognized gesture as necessary.
        var eventAlias = GESTURE_EVENT_ALIASES[event] || event;
        // Get recognizer for this event
        var recognizerName = EVENT_RECOGNIZER_MAP[eventAlias] || eventAlias;
        // Disable recognizer if no more handlers are attached to its events
        var isRecognizerUsed = this.eventHandlers.find(function (entry) {
          return entry.recognizerName === recognizerName;
        });
        if (!isRecognizerUsed) {
          this._toggleRecognizer(recognizerName, false);
        }
      }
    }

    /**
     * Returns an event handler that aliases events and add props before passing
     * to the real handler.
     */

  }, {
    key: '_wrapEventHandler',
    value: function _wrapEventHandler(type, handler) {
      var _this = this;

      return function (event) {
        var element = _this.element;
        var srcEvent = event.srcEvent;


        var center = event.center || {
          x: srcEvent.clientX,
          y: srcEvent.clientY
        };

        // Calculate center relative to the root element
        // TODO/xiaoji - avoid using getBoundingClientRect for perf?
        var rect = element.getBoundingClientRect();
        var offsetCenter = {
          x: center.x - rect.left - element.clientLeft,
          y: center.y - rect.top - element.clientTop
        };

        handler(Object.assign({}, event, {
          type: type,
          center: center,
          offsetCenter: offsetCenter,
          rootElement: element
        }));
      };
    }

    /**
     * Handle basic events using the 'hammer.input' Hammer.js API:
     * Before running Recognizers, Hammer emits a 'hammer.input' event
     * with the basic event info. This function emits all basic events
     * aliased to the "class" of event received.
     * See constants.BASIC_EVENT_CLASSES basic event class definitions.
     */

  }, {
    key: '_onBasicInput',
    value: function _onBasicInput(event) {
      var srcEvent = event.srcEvent;

      var alias = BASIC_EVENT_ALIASES[srcEvent.type];
      if (alias) {
        // fire all events aliased to srcEvent.type
        var emitEvent = Object.assign({}, event, { isDown: true, type: alias });
        this.manager.emit(alias, emitEvent);
      }
    }

    /**
     * Handle events not supported by Hammer.js,
     * and pipe back out through same (Hammer) channel used by other events.
     */

  }, {
    key: '_onOtherEvent',
    value: function _onOtherEvent(event) {
      this.manager.emit(event.type, event);
    }
  }]);

  return EventManager;
}();

export default EventManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9ldmVudHMvZXZlbnQtbWFuYWdlci5qcyJdLCJuYW1lcyI6WyJXaGVlbElucHV0IiwiTW92ZUlucHV0IiwiaXNCcm93c2VyIiwiTWFuYWdlck1vY2siLCJtIiwiaW5zdGFuY2UiLCJjaGFpbmVkTm9vcCIsImdldCIsIm9uIiwib2ZmIiwiZGVzdHJveSIsImVtaXQiLCJNYW5hZ2VyIiwicmVxdWlyZSIsIkJBU0lDX0VWRU5UX0FMSUFTRVMiLCJFVkVOVF9SRUNPR05JWkVSX01BUCIsIkdFU1RVUkVfRVZFTlRfQUxJQVNFUyIsIlJFQ09HTklaRVJTIiwiRXZlbnRNYW5hZ2VyIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfb25CYXNpY0lucHV0IiwiYmluZCIsIm1hbmFnZXIiLCJyZWNvZ25pemVycyIsImV2ZW50SGFuZGxlcnMiLCJfb25PdGhlckV2ZW50Iiwid2hlZWxJbnB1dCIsImVuYWJsZSIsIm1vdmVJbnB1dCIsImV2ZW50cyIsImV2ZW50IiwiaGFuZGxlciIsIl9hZGRFdmVudEhhbmRsZXIiLCJldmVudE5hbWUiLCJfcmVtb3ZlRXZlbnRIYW5kbGVyIiwibmFtZSIsImVuYWJsZWQiLCJyZWNvZ25pemVyIiwic2V0IiwidG9nZ2xlSWZFdmVudFN1cHBvcnRlZCIsIndyYXBwZWRIYW5kbGVyIiwiX3dyYXBFdmVudEhhbmRsZXIiLCJldmVudEFsaWFzIiwicmVjb2duaXplck5hbWUiLCJfdG9nZ2xlUmVjb2duaXplciIsInB1c2giLCJldmVudEhhbmRsZXJSZW1vdmVkIiwiaSIsImxlbmd0aCIsImVudHJ5Iiwic3BsaWNlIiwiaXNSZWNvZ25pemVyVXNlZCIsImZpbmQiLCJ0eXBlIiwic3JjRXZlbnQiLCJjZW50ZXIiLCJ4IiwiY2xpZW50WCIsInkiLCJjbGllbnRZIiwicmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsIm9mZnNldENlbnRlciIsImxlZnQiLCJjbGllbnRMZWZ0IiwidG9wIiwiY2xpZW50VG9wIiwiT2JqZWN0IiwiYXNzaWduIiwicm9vdEVsZW1lbnQiLCJhbGlhcyIsImVtaXRFdmVudCIsImlzRG93biJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU9BLFVBQVAsTUFBdUIsZUFBdkI7QUFDQSxPQUFPQyxTQUFQLE1BQXNCLGNBQXRCO0FBQ0EsU0FBUUMsU0FBUixRQUF3QixZQUF4Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNDLFdBQVQsQ0FBcUJDLENBQXJCLEVBQXdCO0FBQ3RCLE1BQU1DLFdBQVcsRUFBakI7QUFDQSxNQUFNQyxjQUFjLFNBQWRBLFdBQWM7QUFBQSxXQUFNRCxRQUFOO0FBQUEsR0FBcEI7QUFDQUEsV0FBU0UsR0FBVCxHQUFlO0FBQUEsV0FBTSxJQUFOO0FBQUEsR0FBZjtBQUNBRixXQUFTRyxFQUFULEdBQWNGLFdBQWQ7QUFDQUQsV0FBU0ksR0FBVCxHQUFlSCxXQUFmO0FBQ0FELFdBQVNLLE9BQVQsR0FBbUJKLFdBQW5CO0FBQ0FELFdBQVNNLElBQVQsR0FBZ0JMLFdBQWhCO0FBQ0EsU0FBT0QsUUFBUDtBQUNEOztBQUVELElBQU1PLFVBQVVWLFlBQVlXLFFBQVEsVUFBUixFQUFvQkQsT0FBaEMsR0FBMENULFdBQTFEOztXQU1JRCxZQUFZVyxRQUFRLGFBQVIsQ0FBWixHQUFxQztBQUN2Q0MsdUJBQXFCLEVBRGtCO0FBRXZDQyx3QkFBc0IsRUFGaUI7QUFHdkNDLHlCQUF1QjtBQUhnQixDO0lBSnZDRixtQixRQUFBQSxtQjtJQUNBQyxvQixRQUFBQSxvQjtJQUNBRSxXLFFBQUFBLFc7SUFDQUQscUIsUUFBQUEscUI7O0FBT0Y7Ozs7Ozs7Ozs7Ozs7O0lBWXFCRSxZO0FBQ25CLHdCQUFZQyxPQUFaLEVBQW1DO0FBQUEsUUFBZEMsT0FBYyx1RUFBSixFQUFJOztBQUFBOztBQUNqQyxTQUFLRCxPQUFMLEdBQWVBLE9BQWY7QUFDQSxTQUFLRSxhQUFMLEdBQXFCLEtBQUtBLGFBQUwsQ0FBbUJDLElBQW5CLENBQXdCLElBQXhCLENBQXJCO0FBQ0EsU0FBS0MsT0FBTCxHQUFlLElBQUlYLE9BQUosQ0FBWU8sT0FBWixFQUFxQixFQUFDSyxhQUFhSixRQUFRSSxXQUFSLElBQXVCUCxXQUFyQyxFQUFyQixFQUNaVCxFQURZLENBQ1QsY0FEUyxFQUNPLEtBQUthLGFBRFosQ0FBZjs7QUFHQSxTQUFLSSxhQUFMLEdBQXFCLEVBQXJCOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQUtDLGFBQUwsR0FBcUIsS0FBS0EsYUFBTCxDQUFtQkosSUFBbkIsQ0FBd0IsSUFBeEIsQ0FBckI7QUFDQSxTQUFLSyxVQUFMLEdBQWtCLElBQUkzQixVQUFKLENBQWVtQixPQUFmLEVBQXdCLEtBQUtPLGFBQTdCLEVBQTRDLEVBQUNFLFFBQVEsS0FBVCxFQUE1QyxDQUFsQjtBQUNBLFNBQUtDLFNBQUwsR0FBaUIsSUFBSTVCLFNBQUosQ0FBY2tCLE9BQWQsRUFBdUIsS0FBS08sYUFBNUIsRUFBMkMsRUFBQ0UsUUFBUSxLQUFULEVBQTNDLENBQWpCOztBQUVBO0FBZmlDLFFBZ0IxQkUsTUFoQjBCLEdBZ0JoQlYsT0FoQmdCLENBZ0IxQlUsTUFoQjBCOztBQWlCakMsUUFBSUEsTUFBSixFQUFZO0FBQ1YsV0FBS3RCLEVBQUwsQ0FBUXNCLE1BQVI7QUFDRDtBQUNGOztBQUVEOzs7Ozs7OzhCQUdVO0FBQ1IsV0FBS0gsVUFBTCxDQUFnQmpCLE9BQWhCO0FBQ0EsV0FBS21CLFNBQUwsQ0FBZW5CLE9BQWY7QUFDQSxXQUFLYSxPQUFMLENBQWFiLE9BQWI7QUFDRDs7QUFFRDs7Ozs7Ozs7dUJBS0dxQixLLEVBQU9DLE8sRUFBUztBQUNqQixVQUFJLE9BQU9ELEtBQVAsS0FBaUIsUUFBckIsRUFBK0I7QUFDN0IsYUFBS0UsZ0JBQUwsQ0FBc0JGLEtBQXRCLEVBQTZCQyxPQUE3QjtBQUNELE9BRkQsTUFFTztBQUNMO0FBQ0EsYUFBSyxJQUFNRSxTQUFYLElBQXdCSCxLQUF4QixFQUErQjtBQUM3QixlQUFLRSxnQkFBTCxDQUFzQkMsU0FBdEIsRUFBaUNILE1BQU1HLFNBQU4sQ0FBakM7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQ7Ozs7Ozs7O3dCQUtJSCxLLEVBQU9DLE8sRUFBUztBQUNsQixVQUFJLE9BQU9ELEtBQVAsS0FBaUIsUUFBckIsRUFBK0I7QUFDN0IsYUFBS0ksbUJBQUwsQ0FBeUJKLEtBQXpCLEVBQWdDQyxPQUFoQztBQUNELE9BRkQsTUFFTztBQUNMO0FBQ0EsYUFBSyxJQUFNRSxTQUFYLElBQXdCSCxLQUF4QixFQUErQjtBQUM3QixlQUFLSSxtQkFBTCxDQUF5QkQsU0FBekIsRUFBb0NILE1BQU1HLFNBQU4sQ0FBcEM7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQ7Ozs7OztzQ0FHa0JFLEksRUFBTUMsTyxFQUFTO0FBQy9CLFVBQU1DLGFBQWEsS0FBS2YsT0FBTCxDQUFhaEIsR0FBYixDQUFpQjZCLElBQWpCLENBQW5CO0FBQ0EsVUFBSUUsVUFBSixFQUFnQjtBQUNkQSxtQkFBV0MsR0FBWCxDQUFlLEVBQUNYLFFBQVFTLE9BQVQsRUFBZjtBQUNEO0FBQ0QsV0FBS1YsVUFBTCxDQUFnQmEsc0JBQWhCLENBQXVDSixJQUF2QyxFQUE2Q0MsT0FBN0M7QUFDQSxXQUFLUixTQUFMLENBQWVXLHNCQUFmLENBQXNDSixJQUF0QyxFQUE0Q0MsT0FBNUM7QUFDRDs7QUFFRDs7Ozs7O3FDQUdpQk4sSyxFQUFPQyxPLEVBQVM7QUFDL0IsVUFBTVMsaUJBQWlCLEtBQUtDLGlCQUFMLENBQXVCWCxLQUF2QixFQUE4QkMsT0FBOUIsQ0FBdkI7QUFDQTtBQUNBLFVBQU1XLGFBQWEzQixzQkFBc0JlLEtBQXRCLEtBQWdDQSxLQUFuRDtBQUNBO0FBQ0EsVUFBTWEsaUJBQWlCN0IscUJBQXFCNEIsVUFBckIsS0FBb0NBLFVBQTNEO0FBQ0E7QUFDQSxXQUFLRSxpQkFBTCxDQUF1QkQsY0FBdkIsRUFBdUMsSUFBdkM7O0FBRUE7QUFDQSxXQUFLbkIsYUFBTCxDQUFtQnFCLElBQW5CLENBQXdCLEVBQUNmLFlBQUQsRUFBUVksc0JBQVIsRUFBb0JDLDhCQUFwQixFQUFvQ1osZ0JBQXBDLEVBQTZDUyw4QkFBN0MsRUFBeEI7O0FBRUEsV0FBS2xCLE9BQUwsQ0FBYWYsRUFBYixDQUFnQm1DLFVBQWhCLEVBQTRCRixjQUE1QjtBQUNEOztBQUVEOzs7Ozs7d0NBR29CVixLLEVBQU9DLE8sRUFBUztBQUNsQyxVQUFJZSxzQkFBc0IsS0FBMUI7O0FBRUE7QUFDQSxXQUFLLElBQUlDLElBQUksS0FBS3ZCLGFBQUwsQ0FBbUJ3QixNQUFoQyxFQUF3Q0QsR0FBeEMsR0FBOEM7QUFDNUMsWUFBTUUsUUFBUSxLQUFLekIsYUFBTCxDQUFtQnVCLENBQW5CLENBQWQ7QUFDQSxZQUFJRSxNQUFNbkIsS0FBTixLQUFnQkEsS0FBaEIsSUFBeUJtQixNQUFNbEIsT0FBTixLQUFrQkEsT0FBL0MsRUFBd0Q7QUFDdEQ7QUFDQSxlQUFLVCxPQUFMLENBQWFkLEdBQWIsQ0FBaUJ5QyxNQUFNUCxVQUF2QixFQUFtQ08sTUFBTVQsY0FBekM7QUFDQTtBQUNBLGVBQUtoQixhQUFMLENBQW1CMEIsTUFBbkIsQ0FBMEJILENBQTFCLEVBQTZCLENBQTdCO0FBQ0FELGdDQUFzQixJQUF0QjtBQUNEO0FBQ0Y7O0FBRUQsVUFBSUEsbUJBQUosRUFBeUI7QUFDdkI7QUFDQSxZQUFNSixhQUFhM0Isc0JBQXNCZSxLQUF0QixLQUFnQ0EsS0FBbkQ7QUFDQTtBQUNBLFlBQU1hLGlCQUFpQjdCLHFCQUFxQjRCLFVBQXJCLEtBQW9DQSxVQUEzRDtBQUNBO0FBQ0EsWUFBTVMsbUJBQW1CLEtBQUszQixhQUFMLENBQW1CNEIsSUFBbkIsQ0FDdkI7QUFBQSxpQkFBU0gsTUFBTU4sY0FBTixLQUF5QkEsY0FBbEM7QUFBQSxTQUR1QixDQUF6QjtBQUdBLFlBQUksQ0FBQ1EsZ0JBQUwsRUFBdUI7QUFDckIsZUFBS1AsaUJBQUwsQ0FBdUJELGNBQXZCLEVBQXVDLEtBQXZDO0FBQ0Q7QUFDRjtBQUNGOztBQUVEOzs7Ozs7O3NDQUlrQlUsSSxFQUFNdEIsTyxFQUFTO0FBQUE7O0FBQy9CLGFBQU8saUJBQVM7QUFBQSxZQUNQYixPQURPLFNBQ1BBLE9BRE87QUFBQSxZQUVQb0MsUUFGTyxHQUVLeEIsS0FGTCxDQUVQd0IsUUFGTzs7O0FBSWQsWUFBTUMsU0FBU3pCLE1BQU15QixNQUFOLElBQWdCO0FBQzdCQyxhQUFHRixTQUFTRyxPQURpQjtBQUU3QkMsYUFBR0osU0FBU0s7QUFGaUIsU0FBL0I7O0FBS0E7QUFDQTtBQUNBLFlBQU1DLE9BQU8xQyxRQUFRMkMscUJBQVIsRUFBYjtBQUNBLFlBQU1DLGVBQWU7QUFDbkJOLGFBQUdELE9BQU9DLENBQVAsR0FBV0ksS0FBS0csSUFBaEIsR0FBdUI3QyxRQUFROEMsVUFEZjtBQUVuQk4sYUFBR0gsT0FBT0csQ0FBUCxHQUFXRSxLQUFLSyxHQUFoQixHQUFzQi9DLFFBQVFnRDtBQUZkLFNBQXJCOztBQUtBbkMsZ0JBQVFvQyxPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQnRDLEtBQWxCLEVBQXlCO0FBQy9CdUIsb0JBRCtCO0FBRS9CRSx3QkFGK0I7QUFHL0JPLG9DQUgrQjtBQUkvQk8sdUJBQWFuRDtBQUprQixTQUF6QixDQUFSO0FBTUQsT0F2QkQ7QUF3QkQ7O0FBRUQ7Ozs7Ozs7Ozs7a0NBT2NZLEssRUFBTztBQUFBLFVBQ1p3QixRQURZLEdBQ0F4QixLQURBLENBQ1p3QixRQURZOztBQUVuQixVQUFNZ0IsUUFBUXpELG9CQUFvQnlDLFNBQVNELElBQTdCLENBQWQ7QUFDQSxVQUFJaUIsS0FBSixFQUFXO0FBQ1Q7QUFDQSxZQUFNQyxZQUFZSixPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQnRDLEtBQWxCLEVBQXlCLEVBQUMwQyxRQUFRLElBQVQsRUFBZW5CLE1BQU1pQixLQUFyQixFQUF6QixDQUFsQjtBQUNBLGFBQUtoRCxPQUFMLENBQWFaLElBQWIsQ0FBa0I0RCxLQUFsQixFQUF5QkMsU0FBekI7QUFDRDtBQUNGOztBQUVEOzs7Ozs7O2tDQUljekMsSyxFQUFPO0FBQ25CLFdBQUtSLE9BQUwsQ0FBYVosSUFBYixDQUFrQm9CLE1BQU11QixJQUF4QixFQUE4QnZCLEtBQTlCO0FBQ0Q7Ozs7OztlQXJMa0JiLFkiLCJmaWxlIjoiZXZlbnQtbWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBXaGVlbElucHV0IGZyb20gJy4vd2hlZWwtaW5wdXQnO1xuaW1wb3J0IE1vdmVJbnB1dCBmcm9tICcuL21vdmUtaW5wdXQnO1xuaW1wb3J0IHtpc0Jyb3dzZXJ9IGZyb20gJy4uL2dsb2JhbHMnO1xuXG4vLyBIYW1tZXIuanMgZGlyZWN0bHkgcmVmZXJlbmNlcyBgZG9jdW1lbnRgIGFuZCBgd2luZG93YCxcbi8vIHdoaWNoIG1lYW5zIHRoYXQgaW1wb3J0aW5nIGl0IGluIGVudmlyb25tZW50cyB3aXRob3V0XG4vLyB0aG9zZSBvYmplY3RzIHRocm93cyBlcnJvcnMuIFRoZXJlZm9yZSwgaW5zdGVhZCBvZlxuLy8gZGlyZWN0bHkgYGltcG9ydGBpbmcgJ2hhbW1lcmpzJyBhbmQgJy4vY29uc3RhbnRzJ1xuLy8gKHdoaWNoIGltcG9ydHMgSGFtbWVyLmpzKSB3ZSBjb25kaXRpb25hbGx5IHJlcXVpcmUgaXRcbi8vIGRlcGVuZGluZyBvbiBzdXBwb3J0IGZvciB0aG9zZSBnbG9iYWxzLCBhbmQgcHJvdmlkZSBtb2Nrc1xuLy8gZm9yIGVudmlyb25tZW50cyB3aXRob3V0IGBkb2N1bWVudGAvYHdpbmRvd2AuXG5mdW5jdGlvbiBNYW5hZ2VyTW9jayhtKSB7XG4gIGNvbnN0IGluc3RhbmNlID0ge307XG4gIGNvbnN0IGNoYWluZWROb29wID0gKCkgPT4gaW5zdGFuY2U7XG4gIGluc3RhbmNlLmdldCA9ICgpID0+IG51bGw7XG4gIGluc3RhbmNlLm9uID0gY2hhaW5lZE5vb3A7XG4gIGluc3RhbmNlLm9mZiA9IGNoYWluZWROb29wO1xuICBpbnN0YW5jZS5kZXN0cm95ID0gY2hhaW5lZE5vb3A7XG4gIGluc3RhbmNlLmVtaXQgPSBjaGFpbmVkTm9vcDtcbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG5jb25zdCBNYW5hZ2VyID0gaXNCcm93c2VyID8gcmVxdWlyZSgnaGFtbWVyanMnKS5NYW5hZ2VyIDogTWFuYWdlck1vY2s7XG5jb25zdCB7XG4gIEJBU0lDX0VWRU5UX0FMSUFTRVMsXG4gIEVWRU5UX1JFQ09HTklaRVJfTUFQLFxuICBSRUNPR05JWkVSUyxcbiAgR0VTVFVSRV9FVkVOVF9BTElBU0VTXG59ID0gaXNCcm93c2VyID8gcmVxdWlyZSgnLi9jb25zdGFudHMnKSA6IHtcbiAgQkFTSUNfRVZFTlRfQUxJQVNFUzoge30sXG4gIEVWRU5UX1JFQ09HTklaRVJfTUFQOiB7fSxcbiAgR0VTVFVSRV9FVkVOVF9BTElBU0VTOiB7fVxufTtcblxuLyoqXG4gKiBTaW5nbGUgQVBJIGZvciBzdWJzY3JpYmluZyB0byBldmVudHMgYWJvdXQgYm90aFxuICogYmFzaWMgaW5wdXQgZXZlbnRzIChlLmcuICdtb3VzZW1vdmUnLCAndG91Y2hzdGFydCcsICd3aGVlbCcpXG4gKiBhbmQgZ2VzdHVyYWwgaW5wdXQgKGUuZy4gJ2NsaWNrJywgJ3RhcCcsICdwYW5zdGFydCcpLlxuICogRGVsZWdhdGVzIGV2ZW50IHJlZ2lzdHJhdGlvbiBhbmQgaGFuZGxpbmcgdG8gSGFtbWVyLmpzLlxuICogQHBhcmFtIHtET00gRWxlbWVudH0gZWxlbWVudCAgICAgICAgIERPTSBlbGVtZW50IG9uIHdoaWNoIGV2ZW50IGhhbmRsZXJzIHdpbGwgYmUgcmVnaXN0ZXJlZC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zICAgICAgICAgICAgICBPcHRpb25zIGZvciBpbnN0YW50aWF0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucy5ldmVudHMgICAgICAgTWFwIG9mIHtldmVudCBuYW1lOiBoYW5kbGVyfSB0byByZWdpc3RlciBvbiBpbml0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMucmVjb2duaXplcnMgIEdlc3R1cmUgcmVjb2duaXplcnMgZnJvbSBIYW1tZXIuanMgdG8gcmVnaXN0ZXIsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgYW4gQXJyYXkgaW4gSGFtbWVyLlJlY29nbml6ZXIgZm9ybWF0LlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChodHRwOi8vaGFtbWVyanMuZ2l0aHViLmlvL2FwaS8jaGFtbWVybWFuYWdlcilcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXZlbnRNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLl9vbkJhc2ljSW5wdXQgPSB0aGlzLl9vbkJhc2ljSW5wdXQuYmluZCh0aGlzKTtcbiAgICB0aGlzLm1hbmFnZXIgPSBuZXcgTWFuYWdlcihlbGVtZW50LCB7cmVjb2duaXplcnM6IG9wdGlvbnMucmVjb2duaXplcnMgfHwgUkVDT0dOSVpFUlN9KVxuICAgICAgLm9uKCdoYW1tZXIuaW5wdXQnLCB0aGlzLl9vbkJhc2ljSW5wdXQpO1xuXG4gICAgdGhpcy5ldmVudEhhbmRsZXJzID0gW107XG5cbiAgICAvLyBIYW5kbGUgZXZlbnRzIG5vdCBoYW5kbGVkIGJ5IEhhbW1lci5qczpcbiAgICAvLyAtIG1vdXNlIHdoZWVsXG4gICAgLy8gLSBwb2ludGVyL3RvdWNoL21vdXNlIG1vdmVcbiAgICB0aGlzLl9vbk90aGVyRXZlbnQgPSB0aGlzLl9vbk90aGVyRXZlbnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLndoZWVsSW5wdXQgPSBuZXcgV2hlZWxJbnB1dChlbGVtZW50LCB0aGlzLl9vbk90aGVyRXZlbnQsIHtlbmFibGU6IGZhbHNlfSk7XG4gICAgdGhpcy5tb3ZlSW5wdXQgPSBuZXcgTW92ZUlucHV0KGVsZW1lbnQsIHRoaXMuX29uT3RoZXJFdmVudCwge2VuYWJsZTogZmFsc2V9KTtcblxuICAgIC8vIFJlZ2lzdGVyIGFsbCBwYXNzZWQgZXZlbnRzLlxuICAgIGNvbnN0IHtldmVudHN9ID0gb3B0aW9ucztcbiAgICBpZiAoZXZlbnRzKSB7XG4gICAgICB0aGlzLm9uKGV2ZW50cyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRlYXIgZG93biBpbnRlcm5hbCBldmVudCBtYW5hZ2VtZW50IGltcGxlbWVudGF0aW9ucy5cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy53aGVlbElucHV0LmRlc3Ryb3koKTtcbiAgICB0aGlzLm1vdmVJbnB1dC5kZXN0cm95KCk7XG4gICAgdGhpcy5tYW5hZ2VyLmRlc3Ryb3koKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhbiBldmVudCBoYW5kbGVyIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBvbiBgZXZlbnRgLlxuICAgKiBAcGFyYW0ge3N0cmluZ3xPYmplY3R9IGV2ZW50ICAgQW4gZXZlbnQgbmFtZSAoU3RyaW5nKSBvciBtYXAgb2YgZXZlbnQgbmFtZXMgdG8gaGFuZGxlcnMuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtoYW5kbGVyXSAgICBUaGUgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG9uIGBldmVudGAuXG4gICAqL1xuICBvbihldmVudCwgaGFuZGxlcikge1xuICAgIGlmICh0eXBlb2YgZXZlbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLl9hZGRFdmVudEhhbmRsZXIoZXZlbnQsIGhhbmRsZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiBgZXZlbnRgIGlzIGEgbWFwLCBjYWxsIGBvbigpYCBmb3IgZWFjaCBlbnRyeS5cbiAgICAgIGZvciAoY29uc3QgZXZlbnROYW1lIGluIGV2ZW50KSB7XG4gICAgICAgIHRoaXMuX2FkZEV2ZW50SGFuZGxlcihldmVudE5hbWUsIGV2ZW50W2V2ZW50TmFtZV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXJlZ2lzdGVyIGEgcHJldmlvdXNseS1yZWdpc3RlcmVkIGV2ZW50IGhhbmRsZXIuXG4gICAqIEBwYXJhbSB7c3RyaW5nfE9iamVjdH0gZXZlbnQgICBBbiBldmVudCBuYW1lIChTdHJpbmcpIG9yIG1hcCBvZiBldmVudCBuYW1lcyB0byBoYW5kbGVyc1xuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbaGFuZGxlcl0gICAgVGhlIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBvbiBgZXZlbnRgLlxuICAgKi9cbiAgb2ZmKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgaWYgKHR5cGVvZiBldmVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuX3JlbW92ZUV2ZW50SGFuZGxlcihldmVudCwgaGFuZGxlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIGBldmVudGAgaXMgYSBtYXAsIGNhbGwgYG9mZigpYCBmb3IgZWFjaCBlbnRyeS5cbiAgICAgIGZvciAoY29uc3QgZXZlbnROYW1lIGluIGV2ZW50KSB7XG4gICAgICAgIHRoaXMuX3JlbW92ZUV2ZW50SGFuZGxlcihldmVudE5hbWUsIGV2ZW50W2V2ZW50TmFtZV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qXG4gICAqIEVuYWJsZS9kaXNhYmxlIHJlY29nbml6ZXIgZm9yIHRoZSBnaXZlbiBldmVudFxuICAgKi9cbiAgX3RvZ2dsZVJlY29nbml6ZXIobmFtZSwgZW5hYmxlZCkge1xuICAgIGNvbnN0IHJlY29nbml6ZXIgPSB0aGlzLm1hbmFnZXIuZ2V0KG5hbWUpO1xuICAgIGlmIChyZWNvZ25pemVyKSB7XG4gICAgICByZWNvZ25pemVyLnNldCh7ZW5hYmxlOiBlbmFibGVkfSk7XG4gICAgfVxuICAgIHRoaXMud2hlZWxJbnB1dC50b2dnbGVJZkV2ZW50U3VwcG9ydGVkKG5hbWUsIGVuYWJsZWQpO1xuICAgIHRoaXMubW92ZUlucHV0LnRvZ2dsZUlmRXZlbnRTdXBwb3J0ZWQobmFtZSwgZW5hYmxlZCk7XG4gIH1cblxuICAvKipcbiAgICogUHJvY2VzcyB0aGUgZXZlbnQgcmVnaXN0cmF0aW9uIGZvciBhIHNpbmdsZSBldmVudCArIGhhbmRsZXIuXG4gICAqL1xuICBfYWRkRXZlbnRIYW5kbGVyKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgY29uc3Qgd3JhcHBlZEhhbmRsZXIgPSB0aGlzLl93cmFwRXZlbnRIYW5kbGVyKGV2ZW50LCBoYW5kbGVyKTtcbiAgICAvLyBBbGlhcyB0byBhIHJlY29nbml6ZWQgZ2VzdHVyZSBhcyBuZWNlc3NhcnkuXG4gICAgY29uc3QgZXZlbnRBbGlhcyA9IEdFU1RVUkVfRVZFTlRfQUxJQVNFU1tldmVudF0gfHwgZXZlbnQ7XG4gICAgLy8gR2V0IHJlY29nbml6ZXIgZm9yIHRoaXMgZXZlbnRcbiAgICBjb25zdCByZWNvZ25pemVyTmFtZSA9IEVWRU5UX1JFQ09HTklaRVJfTUFQW2V2ZW50QWxpYXNdIHx8IGV2ZW50QWxpYXM7XG4gICAgLy8gRW5hYmxlIHJlY29nbml6ZXIgZm9yIHRoaXMgZXZlbnQuXG4gICAgdGhpcy5fdG9nZ2xlUmVjb2duaXplcihyZWNvZ25pemVyTmFtZSwgdHJ1ZSk7XG5cbiAgICAvLyBTYXZlIHdyYXBwZWQgaGFuZGxlclxuICAgIHRoaXMuZXZlbnRIYW5kbGVycy5wdXNoKHtldmVudCwgZXZlbnRBbGlhcywgcmVjb2duaXplck5hbWUsIGhhbmRsZXIsIHdyYXBwZWRIYW5kbGVyfSk7XG5cbiAgICB0aGlzLm1hbmFnZXIub24oZXZlbnRBbGlhcywgd3JhcHBlZEhhbmRsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3MgdGhlIGV2ZW50IGRlcmVnaXN0cmF0aW9uIGZvciBhIHNpbmdsZSBldmVudCArIGhhbmRsZXIuXG4gICAqL1xuICBfcmVtb3ZlRXZlbnRIYW5kbGVyKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgbGV0IGV2ZW50SGFuZGxlclJlbW92ZWQgPSBmYWxzZTtcblxuICAgIC8vIEZpbmQgc2F2ZWQgaGFuZGxlciBpZiBhbnkuXG4gICAgZm9yIChsZXQgaSA9IHRoaXMuZXZlbnRIYW5kbGVycy5sZW5ndGg7IGktLTspIHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5ldmVudEhhbmRsZXJzW2ldO1xuICAgICAgaWYgKGVudHJ5LmV2ZW50ID09PSBldmVudCAmJiBlbnRyeS5oYW5kbGVyID09PSBoYW5kbGVyKSB7XG4gICAgICAgIC8vIERlcmVnaXN0ZXIgZXZlbnQgaGFuZGxlci5cbiAgICAgICAgdGhpcy5tYW5hZ2VyLm9mZihlbnRyeS5ldmVudEFsaWFzLCBlbnRyeS53cmFwcGVkSGFuZGxlcik7XG4gICAgICAgIC8vIERlbGV0ZSBzYXZlZCBoYW5kbGVyXG4gICAgICAgIHRoaXMuZXZlbnRIYW5kbGVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGV2ZW50SGFuZGxlclJlbW92ZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChldmVudEhhbmRsZXJSZW1vdmVkKSB7XG4gICAgICAvLyBBbGlhcyB0byBhIHJlY29nbml6ZWQgZ2VzdHVyZSBhcyBuZWNlc3NhcnkuXG4gICAgICBjb25zdCBldmVudEFsaWFzID0gR0VTVFVSRV9FVkVOVF9BTElBU0VTW2V2ZW50XSB8fCBldmVudDtcbiAgICAgIC8vIEdldCByZWNvZ25pemVyIGZvciB0aGlzIGV2ZW50XG4gICAgICBjb25zdCByZWNvZ25pemVyTmFtZSA9IEVWRU5UX1JFQ09HTklaRVJfTUFQW2V2ZW50QWxpYXNdIHx8IGV2ZW50QWxpYXM7XG4gICAgICAvLyBEaXNhYmxlIHJlY29nbml6ZXIgaWYgbm8gbW9yZSBoYW5kbGVycyBhcmUgYXR0YWNoZWQgdG8gaXRzIGV2ZW50c1xuICAgICAgY29uc3QgaXNSZWNvZ25pemVyVXNlZCA9IHRoaXMuZXZlbnRIYW5kbGVycy5maW5kKFxuICAgICAgICBlbnRyeSA9PiBlbnRyeS5yZWNvZ25pemVyTmFtZSA9PT0gcmVjb2duaXplck5hbWVcbiAgICAgICk7XG4gICAgICBpZiAoIWlzUmVjb2duaXplclVzZWQpIHtcbiAgICAgICAgdGhpcy5fdG9nZ2xlUmVjb2duaXplcihyZWNvZ25pemVyTmFtZSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGV2ZW50IGhhbmRsZXIgdGhhdCBhbGlhc2VzIGV2ZW50cyBhbmQgYWRkIHByb3BzIGJlZm9yZSBwYXNzaW5nXG4gICAqIHRvIHRoZSByZWFsIGhhbmRsZXIuXG4gICAqL1xuICBfd3JhcEV2ZW50SGFuZGxlcih0eXBlLCBoYW5kbGVyKSB7XG4gICAgcmV0dXJuIGV2ZW50ID0+IHtcbiAgICAgIGNvbnN0IHtlbGVtZW50fSA9IHRoaXM7XG4gICAgICBjb25zdCB7c3JjRXZlbnR9ID0gZXZlbnQ7XG5cbiAgICAgIGNvbnN0IGNlbnRlciA9IGV2ZW50LmNlbnRlciB8fCB7XG4gICAgICAgIHg6IHNyY0V2ZW50LmNsaWVudFgsXG4gICAgICAgIHk6IHNyY0V2ZW50LmNsaWVudFlcbiAgICAgIH07XG5cbiAgICAgIC8vIENhbGN1bGF0ZSBjZW50ZXIgcmVsYXRpdmUgdG8gdGhlIHJvb3QgZWxlbWVudFxuICAgICAgLy8gVE9ETy94aWFvamkgLSBhdm9pZCB1c2luZyBnZXRCb3VuZGluZ0NsaWVudFJlY3QgZm9yIHBlcmY/XG4gICAgICBjb25zdCByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGNvbnN0IG9mZnNldENlbnRlciA9IHtcbiAgICAgICAgeDogY2VudGVyLnggLSByZWN0LmxlZnQgLSBlbGVtZW50LmNsaWVudExlZnQsXG4gICAgICAgIHk6IGNlbnRlci55IC0gcmVjdC50b3AgLSBlbGVtZW50LmNsaWVudFRvcFxuICAgICAgfTtcblxuICAgICAgaGFuZGxlcihPYmplY3QuYXNzaWduKHt9LCBldmVudCwge1xuICAgICAgICB0eXBlLFxuICAgICAgICBjZW50ZXIsXG4gICAgICAgIG9mZnNldENlbnRlcixcbiAgICAgICAgcm9vdEVsZW1lbnQ6IGVsZW1lbnRcbiAgICAgIH0pKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBiYXNpYyBldmVudHMgdXNpbmcgdGhlICdoYW1tZXIuaW5wdXQnIEhhbW1lci5qcyBBUEk6XG4gICAqIEJlZm9yZSBydW5uaW5nIFJlY29nbml6ZXJzLCBIYW1tZXIgZW1pdHMgYSAnaGFtbWVyLmlucHV0JyBldmVudFxuICAgKiB3aXRoIHRoZSBiYXNpYyBldmVudCBpbmZvLiBUaGlzIGZ1bmN0aW9uIGVtaXRzIGFsbCBiYXNpYyBldmVudHNcbiAgICogYWxpYXNlZCB0byB0aGUgXCJjbGFzc1wiIG9mIGV2ZW50IHJlY2VpdmVkLlxuICAgKiBTZWUgY29uc3RhbnRzLkJBU0lDX0VWRU5UX0NMQVNTRVMgYmFzaWMgZXZlbnQgY2xhc3MgZGVmaW5pdGlvbnMuXG4gICAqL1xuICBfb25CYXNpY0lucHV0KGV2ZW50KSB7XG4gICAgY29uc3Qge3NyY0V2ZW50fSA9IGV2ZW50O1xuICAgIGNvbnN0IGFsaWFzID0gQkFTSUNfRVZFTlRfQUxJQVNFU1tzcmNFdmVudC50eXBlXTtcbiAgICBpZiAoYWxpYXMpIHtcbiAgICAgIC8vIGZpcmUgYWxsIGV2ZW50cyBhbGlhc2VkIHRvIHNyY0V2ZW50LnR5cGVcbiAgICAgIGNvbnN0IGVtaXRFdmVudCA9IE9iamVjdC5hc3NpZ24oe30sIGV2ZW50LCB7aXNEb3duOiB0cnVlLCB0eXBlOiBhbGlhc30pO1xuICAgICAgdGhpcy5tYW5hZ2VyLmVtaXQoYWxpYXMsIGVtaXRFdmVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBldmVudHMgbm90IHN1cHBvcnRlZCBieSBIYW1tZXIuanMsXG4gICAqIGFuZCBwaXBlIGJhY2sgb3V0IHRocm91Z2ggc2FtZSAoSGFtbWVyKSBjaGFubmVsIHVzZWQgYnkgb3RoZXIgZXZlbnRzLlxuICAgKi9cbiAgX29uT3RoZXJFdmVudChldmVudCkge1xuICAgIHRoaXMubWFuYWdlci5lbWl0KGV2ZW50LnR5cGUsIGV2ZW50KTtcbiAgfVxuXG59XG4iXX0=