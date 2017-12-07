var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MOUSE_EVENTS = ['mousedown', 'mousemove', 'mouseup'];
var EVENT_TYPE = 'pointermove';

/**
 * Hammer.js swallows 'move' events (for pointer/touch/mouse)
 * when the pointer is not down. This class sets up a handler
 * specifically for these events to work around this limitation.
 * Note that this could be extended to more intelligently handle
 * move events across input types, e.g. storing multiple simultaneous
 * pointer/touch events, calculating speed/direction, etc.
 */

var MoveInput = function () {
  function MoveInput(element, callback) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, MoveInput);

    this.element = element;
    this.callback = callback;
    this.pressed = false;

    var events = MOUSE_EVENTS.concat(options.events || []);
    this.options = Object.assign({ enable: true }, options, { events: events });

    this.handleEvent = this.handleEvent.bind(this);
    this.options.events.forEach(function (event) {
      return element.addEventListener(event, _this.handleEvent);
    });
  }

  _createClass(MoveInput, [{
    key: 'destroy',
    value: function destroy() {
      var _this2 = this;

      this.options.events.forEach(function (event) {
        return _this2.element.removeEventListener(event, _this2.handleEvent);
      });
    }
  }, {
    key: 'set',
    value: function set(options) {
      Object.assign(this.options, options);
    }

    /**
     * Enable this input (begin processing events)
     * if the specified event type is among those handled by this input.
     */

  }, {
    key: 'toggleIfEventSupported',
    value: function toggleIfEventSupported(eventType, enabled) {
      if (EVENT_TYPE === eventType) {
        this.options.enable = enabled;
      }
    }
  }, {
    key: 'handleEvent',
    value: function handleEvent(event) {
      if (!this.options.enable) {
        return;
      }

      switch (event.type) {
        case 'mousedown':
          if (event.button === 0) {
            // Left button is down
            this.pressed = true;
          }
          break;
        case 'mousemove':
          // Move events use `which` to track the button being pressed
          if (event.which !== 1) {
            // Left button is not down
            this.pressed = false;
          }
          if (!this.pressed) {
            // Drag events are emitted by hammer already
            // we just need to emit the move event on hover
            this.callback({
              type: EVENT_TYPE,
              srcEvent: event,
              isDown: this.pressed,
              pointerType: 'mouse',
              target: event.target
            });
          }
          break;
        case 'mouseup':
          this.pressed = false;
          break;
        default:
      }
    }
  }]);

  return MoveInput;
}();

export default MoveInput;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9ldmVudHMvbW92ZS1pbnB1dC5qcyJdLCJuYW1lcyI6WyJNT1VTRV9FVkVOVFMiLCJFVkVOVF9UWVBFIiwiTW92ZUlucHV0IiwiZWxlbWVudCIsImNhbGxiYWNrIiwib3B0aW9ucyIsInByZXNzZWQiLCJldmVudHMiLCJjb25jYXQiLCJPYmplY3QiLCJhc3NpZ24iLCJlbmFibGUiLCJoYW5kbGVFdmVudCIsImJpbmQiLCJmb3JFYWNoIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImV2ZW50VHlwZSIsImVuYWJsZWQiLCJ0eXBlIiwiYnV0dG9uIiwid2hpY2giLCJzcmNFdmVudCIsImlzRG93biIsInBvaW50ZXJUeXBlIiwidGFyZ2V0Il0sIm1hcHBpbmdzIjoiOzs7O0FBQUEsSUFBTUEsZUFBZSxDQUFDLFdBQUQsRUFBYyxXQUFkLEVBQTJCLFNBQTNCLENBQXJCO0FBQ0EsSUFBTUMsYUFBYSxhQUFuQjs7QUFFQTs7Ozs7Ozs7O0lBUXFCQyxTO0FBRW5CLHFCQUFZQyxPQUFaLEVBQXFCQyxRQUFyQixFQUE2QztBQUFBOztBQUFBLFFBQWRDLE9BQWMsdUVBQUosRUFBSTs7QUFBQTs7QUFDM0MsU0FBS0YsT0FBTCxHQUFlQSxPQUFmO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkEsUUFBaEI7QUFDQSxTQUFLRSxPQUFMLEdBQWUsS0FBZjs7QUFFQSxRQUFNQyxTQUFTUCxhQUFhUSxNQUFiLENBQW9CSCxRQUFRRSxNQUFSLElBQWtCLEVBQXRDLENBQWY7QUFDQSxTQUFLRixPQUFMLEdBQWVJLE9BQU9DLE1BQVAsQ0FBYyxFQUFDQyxRQUFRLElBQVQsRUFBZCxFQUE4Qk4sT0FBOUIsRUFBdUMsRUFBQ0UsY0FBRCxFQUF2QyxDQUFmOztBQUVBLFNBQUtLLFdBQUwsR0FBbUIsS0FBS0EsV0FBTCxDQUFpQkMsSUFBakIsQ0FBc0IsSUFBdEIsQ0FBbkI7QUFDQSxTQUFLUixPQUFMLENBQWFFLE1BQWIsQ0FBb0JPLE9BQXBCLENBQTRCO0FBQUEsYUFBU1gsUUFBUVksZ0JBQVIsQ0FBeUJDLEtBQXpCLEVBQWdDLE1BQUtKLFdBQXJDLENBQVQ7QUFBQSxLQUE1QjtBQUNEOzs7OzhCQUVTO0FBQUE7O0FBQ1IsV0FBS1AsT0FBTCxDQUFhRSxNQUFiLENBQW9CTyxPQUFwQixDQUE0QjtBQUFBLGVBQVMsT0FBS1gsT0FBTCxDQUFhYyxtQkFBYixDQUFpQ0QsS0FBakMsRUFBd0MsT0FBS0osV0FBN0MsQ0FBVDtBQUFBLE9BQTVCO0FBQ0Q7Ozt3QkFFR1AsTyxFQUFTO0FBQ1hJLGFBQU9DLE1BQVAsQ0FBYyxLQUFLTCxPQUFuQixFQUE0QkEsT0FBNUI7QUFDRDs7QUFFRDs7Ozs7OzsyQ0FJdUJhLFMsRUFBV0MsTyxFQUFTO0FBQ3pDLFVBQUlsQixlQUFlaUIsU0FBbkIsRUFBOEI7QUFDNUIsYUFBS2IsT0FBTCxDQUFhTSxNQUFiLEdBQXNCUSxPQUF0QjtBQUNEO0FBQ0Y7OztnQ0FFV0gsSyxFQUFPO0FBQ2pCLFVBQUksQ0FBQyxLQUFLWCxPQUFMLENBQWFNLE1BQWxCLEVBQTBCO0FBQ3hCO0FBQ0Q7O0FBRUQsY0FBUUssTUFBTUksSUFBZDtBQUNBLGFBQUssV0FBTDtBQUNFLGNBQUlKLE1BQU1LLE1BQU4sS0FBaUIsQ0FBckIsRUFBd0I7QUFDdEI7QUFDQSxpQkFBS2YsT0FBTCxHQUFlLElBQWY7QUFDRDtBQUNEO0FBQ0YsYUFBSyxXQUFMO0FBQ0U7QUFDQSxjQUFJVSxNQUFNTSxLQUFOLEtBQWdCLENBQXBCLEVBQXVCO0FBQ3JCO0FBQ0EsaUJBQUtoQixPQUFMLEdBQWUsS0FBZjtBQUNEO0FBQ0QsY0FBSSxDQUFDLEtBQUtBLE9BQVYsRUFBbUI7QUFDakI7QUFDQTtBQUNBLGlCQUFLRixRQUFMLENBQWM7QUFDWmdCLG9CQUFNbkIsVUFETTtBQUVac0Isd0JBQVVQLEtBRkU7QUFHWlEsc0JBQVEsS0FBS2xCLE9BSEQ7QUFJWm1CLDJCQUFhLE9BSkQ7QUFLWkMsc0JBQVFWLE1BQU1VO0FBTEYsYUFBZDtBQU9EO0FBQ0Q7QUFDRixhQUFLLFNBQUw7QUFDRSxlQUFLcEIsT0FBTCxHQUFlLEtBQWY7QUFDQTtBQUNGO0FBNUJBO0FBOEJEOzs7Ozs7ZUFuRWtCSixTIiwiZmlsZSI6Im1vdmUtaW5wdXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBNT1VTRV9FVkVOVFMgPSBbJ21vdXNlZG93bicsICdtb3VzZW1vdmUnLCAnbW91c2V1cCddO1xuY29uc3QgRVZFTlRfVFlQRSA9ICdwb2ludGVybW92ZSc7XG5cbi8qKlxuICogSGFtbWVyLmpzIHN3YWxsb3dzICdtb3ZlJyBldmVudHMgKGZvciBwb2ludGVyL3RvdWNoL21vdXNlKVxuICogd2hlbiB0aGUgcG9pbnRlciBpcyBub3QgZG93bi4gVGhpcyBjbGFzcyBzZXRzIHVwIGEgaGFuZGxlclxuICogc3BlY2lmaWNhbGx5IGZvciB0aGVzZSBldmVudHMgdG8gd29yayBhcm91bmQgdGhpcyBsaW1pdGF0aW9uLlxuICogTm90ZSB0aGF0IHRoaXMgY291bGQgYmUgZXh0ZW5kZWQgdG8gbW9yZSBpbnRlbGxpZ2VudGx5IGhhbmRsZVxuICogbW92ZSBldmVudHMgYWNyb3NzIGlucHV0IHR5cGVzLCBlLmcuIHN0b3JpbmcgbXVsdGlwbGUgc2ltdWx0YW5lb3VzXG4gKiBwb2ludGVyL3RvdWNoIGV2ZW50cywgY2FsY3VsYXRpbmcgc3BlZWQvZGlyZWN0aW9uLCBldGMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vdmVJbnB1dCB7XG5cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgY2FsbGJhY2ssIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHRoaXMucHJlc3NlZCA9IGZhbHNlO1xuXG4gICAgY29uc3QgZXZlbnRzID0gTU9VU0VfRVZFTlRTLmNvbmNhdChvcHRpb25zLmV2ZW50cyB8fCBbXSk7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7ZW5hYmxlOiB0cnVlfSwgb3B0aW9ucywge2V2ZW50c30pO1xuXG4gICAgdGhpcy5oYW5kbGVFdmVudCA9IHRoaXMuaGFuZGxlRXZlbnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9wdGlvbnMuZXZlbnRzLmZvckVhY2goZXZlbnQgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCB0aGlzLmhhbmRsZUV2ZW50KSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMub3B0aW9ucy5ldmVudHMuZm9yRWFjaChldmVudCA9PiB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgdGhpcy5oYW5kbGVFdmVudCkpO1xuICB9XG5cbiAgc2V0KG9wdGlvbnMpIHtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogRW5hYmxlIHRoaXMgaW5wdXQgKGJlZ2luIHByb2Nlc3NpbmcgZXZlbnRzKVxuICAgKiBpZiB0aGUgc3BlY2lmaWVkIGV2ZW50IHR5cGUgaXMgYW1vbmcgdGhvc2UgaGFuZGxlZCBieSB0aGlzIGlucHV0LlxuICAgKi9cbiAgdG9nZ2xlSWZFdmVudFN1cHBvcnRlZChldmVudFR5cGUsIGVuYWJsZWQpIHtcbiAgICBpZiAoRVZFTlRfVFlQRSA9PT0gZXZlbnRUeXBlKSB7XG4gICAgICB0aGlzLm9wdGlvbnMuZW5hYmxlID0gZW5hYmxlZDtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVFdmVudChldmVudCkge1xuICAgIGlmICghdGhpcy5vcHRpb25zLmVuYWJsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgIGNhc2UgJ21vdXNlZG93bic6XG4gICAgICBpZiAoZXZlbnQuYnV0dG9uID09PSAwKSB7XG4gICAgICAgIC8vIExlZnQgYnV0dG9uIGlzIGRvd25cbiAgICAgICAgdGhpcy5wcmVzc2VkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21vdXNlbW92ZSc6XG4gICAgICAvLyBNb3ZlIGV2ZW50cyB1c2UgYHdoaWNoYCB0byB0cmFjayB0aGUgYnV0dG9uIGJlaW5nIHByZXNzZWRcbiAgICAgIGlmIChldmVudC53aGljaCAhPT0gMSkge1xuICAgICAgICAvLyBMZWZ0IGJ1dHRvbiBpcyBub3QgZG93blxuICAgICAgICB0aGlzLnByZXNzZWQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5wcmVzc2VkKSB7XG4gICAgICAgIC8vIERyYWcgZXZlbnRzIGFyZSBlbWl0dGVkIGJ5IGhhbW1lciBhbHJlYWR5XG4gICAgICAgIC8vIHdlIGp1c3QgbmVlZCB0byBlbWl0IHRoZSBtb3ZlIGV2ZW50IG9uIGhvdmVyXG4gICAgICAgIHRoaXMuY2FsbGJhY2soe1xuICAgICAgICAgIHR5cGU6IEVWRU5UX1RZUEUsXG4gICAgICAgICAgc3JjRXZlbnQ6IGV2ZW50LFxuICAgICAgICAgIGlzRG93bjogdGhpcy5wcmVzc2VkLFxuICAgICAgICAgIHBvaW50ZXJUeXBlOiAnbW91c2UnLFxuICAgICAgICAgIHRhcmdldDogZXZlbnQudGFyZ2V0XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbW91c2V1cCc6XG4gICAgICB0aGlzLnByZXNzZWQgPSBmYWxzZTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9XG59XG4iXX0=