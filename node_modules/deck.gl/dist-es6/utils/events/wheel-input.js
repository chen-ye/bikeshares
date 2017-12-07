var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { window } from '../globals';

var ua = typeof window.navigator !== 'undefined' ? window.navigator.userAgent.toLowerCase() : '';
var firefox = ua.indexOf('firefox') !== -1;

var WHEEL_EVENTS = [
// Chrome, Safari
'wheel',
// IE
'mousewheel',
// legacy Firefox
'DOMMouseScroll'];
var EVENT_TYPE = 'wheel';

// Constants for normalizing input delta
var WHEEL_DELTA_MAGIC_SCALER = 4.000244140625;
var WHEEL_DELTA_PER_LINE = 40;
var TRACKPAD_MAX_DELTA = 4;
var TRACKPAD_MAX_DELTA_PER_TIME = 200;
// Slow down zoom if shift key is held for more precise zooming
var SHIFT_MULTIPLIER = 0.25;

var WheelInput = function () {
  function WheelInput(element, callback) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, WheelInput);

    this.element = element;
    this.callback = callback;

    var events = WHEEL_EVENTS.concat(options.events || []);
    this.options = Object.assign({ enable: true }, options, { events: events });

    this.time = 0;
    this.wheelPosition = null;
    this.type = null;
    this.timeout = null;
    this.lastValue = 0;

    this.handleEvent = this.handleEvent.bind(this);
    this.options.events.forEach(function (event) {
      return element.addEventListener(event, _this.handleEvent);
    });
  }

  _createClass(WheelInput, [{
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
      if (eventType === EVENT_TYPE) {
        this.options.enable = enabled;
      }
    }

    /* eslint-disable complexity, max-statements */

  }, {
    key: 'handleEvent',
    value: function handleEvent(event) {
      if (!this.options.enable) {
        return;
      }
      event.preventDefault();

      var value = event.deltaY;
      if (window.WheelEvent) {
        // Firefox doubles the values on retina screens...
        if (firefox && event.deltaMode === window.WheelEvent.DOM_DELTA_PIXEL) {
          value /= window.devicePixelRatio;
        }
        if (event.deltaMode === window.WheelEvent.DOM_DELTA_LINE) {
          value *= WHEEL_DELTA_PER_LINE;
        }
      }

      var type = this.type,
          timeout = this.timeout,
          lastValue = this.lastValue,
          time = this.time;


      var now = (window && window.performance || Date).now();
      var timeDelta = now - (time || 0);

      this.wheelPosition = {
        x: event.clientX,
        y: event.clientY
      };
      time = now;

      if (value !== 0 && value % WHEEL_DELTA_MAGIC_SCALER === 0) {
        // This one is definitely a mouse wheel event.
        type = 'wheel';
        // Normalize this value to match trackpad.
        value = Math.floor(value / WHEEL_DELTA_MAGIC_SCALER);
      } else if (value !== 0 && Math.abs(value) < TRACKPAD_MAX_DELTA) {
        // This one is definitely a trackpad event because it is so small.
        type = 'trackpad';
      } else if (timeDelta > 400) {
        // This is likely a new scroll action.
        type = null;
        lastValue = value;
        // Start a timeout in case this was a singular event,
        // and delay it by up to 40ms.
        timeout = window.setTimeout(function setTimeout() {
          this._onWheel(event, -lastValue, this.wheelPosition);
          type = 'wheel';
        }.bind(this), 40);
      } else if (!type) {
        // This is a repeating event, but we don't know the type of event just yet.
        // If the delta per time is small, we assume it's a fast trackpad;
        // otherwise we switch into wheel mode.
        type = Math.abs(timeDelta * value) < TRACKPAD_MAX_DELTA_PER_TIME ? 'trackpad' : 'wheel';

        // Make sure our delayed event isn't fired again, because we accumulate
        // the previous event (which was less than 40ms ago) into this event.
        if (timeout) {
          window.clearTimeout(timeout);
          timeout = null;
          value += lastValue;
        }
      }

      if (event.shiftKey && value) {
        value = value * SHIFT_MULTIPLIER;
      }

      // Only fire the callback if we actually know
      // what type of scrolling device the user uses.
      if (type) {
        this._onWheel(event, -value, this.wheelPosition);
      }
    }
  }, {
    key: '_onWheel',
    value: function _onWheel(srcEvent, delta, position) {
      this.callback({
        type: EVENT_TYPE,
        center: position,
        delta: delta,
        srcEvent: srcEvent,
        pointerType: 'mouse',
        target: srcEvent.target
      });
    }
  }]);

  return WheelInput;
}();

export default WheelInput;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9ldmVudHMvd2hlZWwtaW5wdXQuanMiXSwibmFtZXMiOlsid2luZG93IiwidWEiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJ0b0xvd2VyQ2FzZSIsImZpcmVmb3giLCJpbmRleE9mIiwiV0hFRUxfRVZFTlRTIiwiRVZFTlRfVFlQRSIsIldIRUVMX0RFTFRBX01BR0lDX1NDQUxFUiIsIldIRUVMX0RFTFRBX1BFUl9MSU5FIiwiVFJBQ0tQQURfTUFYX0RFTFRBIiwiVFJBQ0tQQURfTUFYX0RFTFRBX1BFUl9USU1FIiwiU0hJRlRfTVVMVElQTElFUiIsIldoZWVsSW5wdXQiLCJlbGVtZW50IiwiY2FsbGJhY2siLCJvcHRpb25zIiwiZXZlbnRzIiwiY29uY2F0IiwiT2JqZWN0IiwiYXNzaWduIiwiZW5hYmxlIiwidGltZSIsIndoZWVsUG9zaXRpb24iLCJ0eXBlIiwidGltZW91dCIsImxhc3RWYWx1ZSIsImhhbmRsZUV2ZW50IiwiYmluZCIsImZvckVhY2giLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZXZlbnRUeXBlIiwiZW5hYmxlZCIsInByZXZlbnREZWZhdWx0IiwidmFsdWUiLCJkZWx0YVkiLCJXaGVlbEV2ZW50IiwiZGVsdGFNb2RlIiwiRE9NX0RFTFRBX1BJWEVMIiwiZGV2aWNlUGl4ZWxSYXRpbyIsIkRPTV9ERUxUQV9MSU5FIiwibm93IiwicGVyZm9ybWFuY2UiLCJEYXRlIiwidGltZURlbHRhIiwieCIsImNsaWVudFgiLCJ5IiwiY2xpZW50WSIsIk1hdGgiLCJmbG9vciIsImFicyIsInNldFRpbWVvdXQiLCJfb25XaGVlbCIsImNsZWFyVGltZW91dCIsInNoaWZ0S2V5Iiwic3JjRXZlbnQiLCJkZWx0YSIsInBvc2l0aW9uIiwiY2VudGVyIiwicG9pbnRlclR5cGUiLCJ0YXJnZXQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxTQUFRQSxNQUFSLFFBQXFCLFlBQXJCOztB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LFlBQVlWLEtBQXJCLElBQThCekIsMkJBQTlCLEdBQTRELFVBQTVELEdBQXlFLE9BQWhGOztBQUVBO0FBQ0E7QUFDQSxZQUFJYyxPQUFKLEVBQWE7QUFDWDFCLGlCQUFPeUQsWUFBUCxDQUFvQi9CLE9BQXBCO0FBQ0FBLG9CQUFVLElBQVY7QUFDQVcsbUJBQVNWLFNBQVQ7QUFDRDtBQUNGOztBQUVELFVBQUlLLE1BQU0wQixRQUFOLElBQWtCckIsS0FBdEIsRUFBNkI7QUFDM0JBLGdCQUFRQSxRQUFReEIsZ0JBQWhCO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBLFVBQUlZLElBQUosRUFBVTtBQUNSLGFBQUsrQixRQUFMLENBQWN4QixLQUFkLEVBQXFCLENBQUNLLEtBQXRCLEVBQTZCLEtBQUtiLGFBQWxDO0FBQ0Q7QUFDRjs7OzZCQUVRbUMsUSxFQUFVQyxLLEVBQU9DLFEsRUFBVTtBQUNsQyxXQUFLN0MsUUFBTCxDQUFjO0FBQ1pTLGNBQU1qQixVQURNO0FBRVpzRCxnQkFBUUQsUUFGSTtBQUdaRCxvQkFIWTtBQUlaRCwwQkFKWTtBQUtaSSxxQkFBYSxPQUxEO0FBTVpDLGdCQUFRTCxTQUFTSztBQU5MLE9BQWQ7QUFRRDs7Ozs7O2VBNUhrQmxELFUiLCJmaWxlIjoid2hlZWwtaW5wdXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3dpbmRvd30gZnJvbSAnLi4vZ2xvYmFscyc7XG5cbmNvbnN0IHVhID0gdHlwZW9mIHdpbmRvdy5uYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnID9cbiAgd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSA6ICcnO1xuY29uc3QgZmlyZWZveCA9IHVhLmluZGV4T2YoJ2ZpcmVmb3gnKSAhPT0gLTE7XG5cbmNvbnN0IFdIRUVMX0VWRU5UUyA9IFtcbiAgLy8gQ2hyb21lLCBTYWZhcmlcbiAgJ3doZWVsJyxcbiAgLy8gSUVcbiAgJ21vdXNld2hlZWwnLFxuICAvLyBsZWdhY3kgRmlyZWZveFxuICAnRE9NTW91c2VTY3JvbGwnXG5dO1xuY29uc3QgRVZFTlRfVFlQRSA9ICd3aGVlbCc7XG5cbi8vIENvbnN0YW50cyBmb3Igbm9ybWFsaXppbmcgaW5wdXQgZGVsdGFcbmNvbnN0IFdIRUVMX0RFTFRBX01BR0lDX1NDQUxFUiA9IDQuMDAwMjQ0MTQwNjI1O1xuY29uc3QgV0hFRUxfREVMVEFfUEVSX0xJTkUgPSA0MDtcbmNvbnN0IFRSQUNLUEFEX01BWF9ERUxUQSA9IDQ7XG5jb25zdCBUUkFDS1BBRF9NQVhfREVMVEFfUEVSX1RJTUUgPSAyMDA7XG4vLyBTbG93IGRvd24gem9vbSBpZiBzaGlmdCBrZXkgaXMgaGVsZCBmb3IgbW9yZSBwcmVjaXNlIHpvb21pbmdcbmNvbnN0IFNISUZUX01VTFRJUExJRVIgPSAwLjI1O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXaGVlbElucHV0IHtcblxuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBjYWxsYmFjaywgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICBjb25zdCBldmVudHMgPSBXSEVFTF9FVkVOVFMuY29uY2F0KG9wdGlvbnMuZXZlbnRzIHx8IFtdKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtlbmFibGU6IHRydWV9LCBvcHRpb25zLCB7ZXZlbnRzfSk7XG5cbiAgICB0aGlzLnRpbWUgPSAwO1xuICAgIHRoaXMud2hlZWxQb3NpdGlvbiA9IG51bGw7XG4gICAgdGhpcy50eXBlID0gbnVsbDtcbiAgICB0aGlzLnRpbWVvdXQgPSBudWxsO1xuICAgIHRoaXMubGFzdFZhbHVlID0gMDtcblxuICAgIHRoaXMuaGFuZGxlRXZlbnQgPSB0aGlzLmhhbmRsZUV2ZW50LmJpbmQodGhpcyk7XG4gICAgdGhpcy5vcHRpb25zLmV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgdGhpcy5oYW5kbGVFdmVudCkpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLm9wdGlvbnMuZXZlbnRzLmZvckVhY2goZXZlbnQgPT4gdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIHRoaXMuaGFuZGxlRXZlbnQpKTtcbiAgfVxuXG4gIHNldChvcHRpb25zKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuYWJsZSB0aGlzIGlucHV0IChiZWdpbiBwcm9jZXNzaW5nIGV2ZW50cylcbiAgICogaWYgdGhlIHNwZWNpZmllZCBldmVudCB0eXBlIGlzIGFtb25nIHRob3NlIGhhbmRsZWQgYnkgdGhpcyBpbnB1dC5cbiAgICovXG4gIHRvZ2dsZUlmRXZlbnRTdXBwb3J0ZWQoZXZlbnRUeXBlLCBlbmFibGVkKSB7XG4gICAgaWYgKGV2ZW50VHlwZSA9PT0gRVZFTlRfVFlQRSkge1xuICAgICAgdGhpcy5vcHRpb25zLmVuYWJsZSA9IGVuYWJsZWQ7XG4gICAgfVxuICB9XG5cbiAgLyogZXNsaW50LWRpc2FibGUgY29tcGxleGl0eSwgbWF4LXN0YXRlbWVudHMgKi9cbiAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMub3B0aW9ucy5lbmFibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGxldCB2YWx1ZSA9IGV2ZW50LmRlbHRhWTtcbiAgICBpZiAod2luZG93LldoZWVsRXZlbnQpIHtcbiAgICAgIC8vIEZpcmVmb3ggZG91YmxlcyB0aGUgdmFsdWVzIG9uIHJldGluYSBzY3JlZW5zLi4uXG4gICAgICBpZiAoZmlyZWZveCAmJiBldmVudC5kZWx0YU1vZGUgPT09IHdpbmRvdy5XaGVlbEV2ZW50LkRPTV9ERUxUQV9QSVhFTCkge1xuICAgICAgICB2YWx1ZSAvPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgIH1cbiAgICAgIGlmIChldmVudC5kZWx0YU1vZGUgPT09IHdpbmRvdy5XaGVlbEV2ZW50LkRPTV9ERUxUQV9MSU5FKSB7XG4gICAgICAgIHZhbHVlICo9IFdIRUVMX0RFTFRBX1BFUl9MSU5FO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCB7XG4gICAgICB0eXBlLFxuICAgICAgdGltZW91dCxcbiAgICAgIGxhc3RWYWx1ZSxcbiAgICAgIHRpbWVcbiAgICB9ID0gdGhpcztcblxuICAgIGNvbnN0IG5vdyA9ICgod2luZG93ICYmIHdpbmRvdy5wZXJmb3JtYW5jZSkgfHwgRGF0ZSkubm93KCk7XG4gICAgY29uc3QgdGltZURlbHRhID0gbm93IC0gKHRpbWUgfHwgMCk7XG5cbiAgICB0aGlzLndoZWVsUG9zaXRpb24gPSB7XG4gICAgICB4OiBldmVudC5jbGllbnRYLFxuICAgICAgeTogZXZlbnQuY2xpZW50WVxuICAgIH07XG4gICAgdGltZSA9IG5vdztcblxuICAgIGlmICh2YWx1ZSAhPT0gMCAmJiB2YWx1ZSAlIFdIRUVMX0RFTFRBX01BR0lDX1NDQUxFUiA9PT0gMCkge1xuICAgICAgLy8gVGhpcyBvbmUgaXMgZGVmaW5pdGVseSBhIG1vdXNlIHdoZWVsIGV2ZW50LlxuICAgICAgdHlwZSA9ICd3aGVlbCc7XG4gICAgICAvLyBOb3JtYWxpemUgdGhpcyB2YWx1ZSB0byBtYXRjaCB0cmFja3BhZC5cbiAgICAgIHZhbHVlID0gTWF0aC5mbG9vcih2YWx1ZSAvIFdIRUVMX0RFTFRBX01BR0lDX1NDQUxFUik7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSAhPT0gMCAmJiBNYXRoLmFicyh2YWx1ZSkgPCBUUkFDS1BBRF9NQVhfREVMVEEpIHtcbiAgICAgIC8vIFRoaXMgb25lIGlzIGRlZmluaXRlbHkgYSB0cmFja3BhZCBldmVudCBiZWNhdXNlIGl0IGlzIHNvIHNtYWxsLlxuICAgICAgdHlwZSA9ICd0cmFja3BhZCc7XG4gICAgfSBlbHNlIGlmICh0aW1lRGVsdGEgPiA0MDApIHtcbiAgICAgIC8vIFRoaXMgaXMgbGlrZWx5IGEgbmV3IHNjcm9sbCBhY3Rpb24uXG4gICAgICB0eXBlID0gbnVsbDtcbiAgICAgIGxhc3RWYWx1ZSA9IHZhbHVlO1xuICAgICAgLy8gU3RhcnQgYSB0aW1lb3V0IGluIGNhc2UgdGhpcyB3YXMgYSBzaW5ndWxhciBldmVudCxcbiAgICAgIC8vIGFuZCBkZWxheSBpdCBieSB1cCB0byA0MG1zLlxuICAgICAgdGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uIHNldFRpbWVvdXQoKSB7XG4gICAgICAgIHRoaXMuX29uV2hlZWwoZXZlbnQsIC1sYXN0VmFsdWUsIHRoaXMud2hlZWxQb3NpdGlvbik7XG4gICAgICAgIHR5cGUgPSAnd2hlZWwnO1xuICAgICAgfS5iaW5kKHRoaXMpLCA0MCk7XG4gICAgfSBlbHNlIGlmICghdHlwZSkge1xuICAgICAgLy8gVGhpcyBpcyBhIHJlcGVhdGluZyBldmVudCwgYnV0IHdlIGRvbid0IGtub3cgdGhlIHR5cGUgb2YgZXZlbnQganVzdCB5ZXQuXG4gICAgICAvLyBJZiB0aGUgZGVsdGEgcGVyIHRpbWUgaXMgc21hbGwsIHdlIGFzc3VtZSBpdCdzIGEgZmFzdCB0cmFja3BhZDtcbiAgICAgIC8vIG90aGVyd2lzZSB3ZSBzd2l0Y2ggaW50byB3aGVlbCBtb2RlLlxuICAgICAgdHlwZSA9IE1hdGguYWJzKHRpbWVEZWx0YSAqIHZhbHVlKSA8IFRSQUNLUEFEX01BWF9ERUxUQV9QRVJfVElNRSA/ICd0cmFja3BhZCcgOiAnd2hlZWwnO1xuXG4gICAgICAvLyBNYWtlIHN1cmUgb3VyIGRlbGF5ZWQgZXZlbnQgaXNuJ3QgZmlyZWQgYWdhaW4sIGJlY2F1c2Ugd2UgYWNjdW11bGF0ZVxuICAgICAgLy8gdGhlIHByZXZpb3VzIGV2ZW50ICh3aGljaCB3YXMgbGVzcyB0aGFuIDQwbXMgYWdvKSBpbnRvIHRoaXMgZXZlbnQuXG4gICAgICBpZiAodGltZW91dCkge1xuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgdmFsdWUgKz0gbGFzdFZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChldmVudC5zaGlmdEtleSAmJiB2YWx1ZSkge1xuICAgICAgdmFsdWUgPSB2YWx1ZSAqIFNISUZUX01VTFRJUExJRVI7XG4gICAgfVxuXG4gICAgLy8gT25seSBmaXJlIHRoZSBjYWxsYmFjayBpZiB3ZSBhY3R1YWxseSBrbm93XG4gICAgLy8gd2hhdCB0eXBlIG9mIHNjcm9sbGluZyBkZXZpY2UgdGhlIHVzZXIgdXNlcy5cbiAgICBpZiAodHlwZSkge1xuICAgICAgdGhpcy5fb25XaGVlbChldmVudCwgLXZhbHVlLCB0aGlzLndoZWVsUG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIF9vbldoZWVsKHNyY0V2ZW50LCBkZWx0YSwgcG9zaXRpb24pIHtcbiAgICB0aGlzLmNhbGxiYWNrKHtcbiAgICAgIHR5cGU6IEVWRU5UX1RZUEUsXG4gICAgICBjZW50ZXI6IHBvc2l0aW9uLFxuICAgICAgZGVsdGEsXG4gICAgICBzcmNFdmVudCxcbiAgICAgIHBvaW50ZXJUeXBlOiAnbW91c2UnLFxuICAgICAgdGFyZ2V0OiBzcmNFdmVudC50YXJnZXRcbiAgICB9KTtcbiAgfVxufVxuIl19