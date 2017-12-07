var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Stats = function () {
  function Stats(_ref) {
    var id = _ref.id;

    _classCallCheck(this, Stats);

    this.id = id;
    this.time = 0;
    this.total = 0;
    this.average = 0;
    this.count = 0;

    this._time = 0;
  }

  _createClass(Stats, [{
    key: "timeStart",
    value: function timeStart() {
      this._time = this.timestampMs();
    }
  }, {
    key: "timeEnd",
    value: function timeEnd() {
      this.time = this.timestampMs() - this._time;
      this.total += this.time;
      this.count++;
      this.average = this.total / this.count;
    }
  }, {
    key: "timestampMs",
    value: function timestampMs() {
      /* global window */
      return (typeof window === "undefined" ? "undefined" : _typeof(window)) !== undefined && window.performance ? window.performance.now() : Date.now();
    }
  }, {
    key: "getTimeString",
    value: function getTimeString() {
      return this.id + ":" + formatTime(this.time) + "(" + this.count + ")";
    }
  }]);

  return Stats;
}();

// TODO: Currently unused, keeping in case we want it later for log formatting


export default Stats;
export function formatTime(ms) {
  var formatted = void 0;
  if (ms < 10) {
    formatted = ms.toFixed(2) + "ms";
  } else if (ms < 100) {
    formatted = ms.toFixed(1) + "ms";
  } else if (ms < 1000) {
    formatted = ms.toFixed(0) + "ms";
  } else {
    formatted = (ms / 1000).toFixed(2) + "s";
  }
  return formatted;
}

export function leftPad(string) {
  var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8;

  while (string.length < length) {
    string = " " + string;
  }
  return string;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvc3RhdHMuanMiXSwibmFtZXMiOlsiU3RhdHMiLCJpZCIsInRpbWUiLCJ0b3RhbCIsImF2ZXJhZ2UiLCJjb3VudCIsIl90aW1lIiwidGltZXN0YW1wTXMiLCJ3aW5kb3ciLCJ1bmRlZmluZWQiLCJwZXJmb3JtYW5jZSIsIm5vdyIsIkRhdGUiLCJmb3JtYXRUaW1lIiwibXMiLCJmb3JtYXR0ZWQiLCJ0b0ZpeGVkIiwibGVmdFBhZCIsInN0cmluZyIsImxlbmd0aCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQ3FCQSxLO0FBQ25CLHVCQUFrQjtBQUFBLFFBQUxDLEVBQUssUUFBTEEsRUFBSzs7QUFBQTs7QUFDaEIsU0FBS0EsRUFBTCxHQUFVQSxFQUFWO0FBQ0EsU0FBS0MsSUFBTCxHQUFZLENBQVo7QUFDQSxTQUFLQyxLQUFMLEdBQWEsQ0FBYjtBQUNBLFNBQUtDLE9BQUwsR0FBZSxDQUFmO0FBQ0EsU0FBS0MsS0FBTCxHQUFhLENBQWI7O0FBRUEsU0FBS0MsS0FBTCxHQUFhLENBQWI7QUFDRDs7OztnQ0FFVztBQUNWLFdBQUtBLEtBQUwsR0FBYSxLQUFLQyxXQUFMLEVBQWI7QUFDRDs7OzhCQUVTO0FBQ1IsV0FBS0wsSUFBTCxHQUFZLEtBQUtLLFdBQUwsS0FBcUIsS0FBS0QsS0FBdEM7QUFDQSxXQUFLSCxLQUFMLElBQWMsS0FBS0QsSUFBbkI7QUFDQSxXQUFLRyxLQUFMO0FBQ0EsV0FBS0QsT0FBTCxHQUFlLEtBQUtELEtBQUwsR0FBYSxLQUFLRSxLQUFqQztBQUNEOzs7a0NBRWE7QUFDWjtBQUNBLGFBQU8sUUFBT0csTUFBUCx5Q0FBT0EsTUFBUCxPQUFrQkMsU0FBbEIsSUFBK0JELE9BQU9FLFdBQXRDLEdBQ0xGLE9BQU9FLFdBQVAsQ0FBbUJDLEdBQW5CLEVBREssR0FFTEMsS0FBS0QsR0FBTCxFQUZGO0FBR0Q7OztvQ0FFZTtBQUNkLGFBQVUsS0FBS1YsRUFBZixTQUFxQlksV0FBVyxLQUFLWCxJQUFoQixDQUFyQixTQUE4QyxLQUFLRyxLQUFuRDtBQUNEOzs7Ozs7QUFHSDs7O2VBbENxQkwsSztBQW1DckIsT0FBTyxTQUFTYSxVQUFULENBQW9CQyxFQUFwQixFQUF3QjtBQUM3QixNQUFJQyxrQkFBSjtBQUNBLE1BQUlELEtBQUssRUFBVCxFQUFhO0FBQ1hDLGdCQUFlRCxHQUFHRSxPQUFILENBQVcsQ0FBWCxDQUFmO0FBQ0QsR0FGRCxNQUVPLElBQUlGLEtBQUssR0FBVCxFQUFjO0FBQ25CQyxnQkFBZUQsR0FBR0UsT0FBSCxDQUFXLENBQVgsQ0FBZjtBQUNELEdBRk0sTUFFQSxJQUFJRixLQUFLLElBQVQsRUFBZTtBQUNwQkMsZ0JBQWVELEdBQUdFLE9BQUgsQ0FBVyxDQUFYLENBQWY7QUFDRCxHQUZNLE1BRUE7QUFDTEQsZ0JBQWUsQ0FBQ0QsS0FBSyxJQUFOLEVBQVlFLE9BQVosQ0FBb0IsQ0FBcEIsQ0FBZjtBQUNEO0FBQ0QsU0FBT0QsU0FBUDtBQUNEOztBQUVELE9BQU8sU0FBU0UsT0FBVCxDQUFpQkMsTUFBakIsRUFBcUM7QUFBQSxNQUFaQyxNQUFZLHVFQUFILENBQUc7O0FBQzFDLFNBQU9ELE9BQU9DLE1BQVAsR0FBZ0JBLE1BQXZCLEVBQStCO0FBQzdCRCxtQkFBYUEsTUFBYjtBQUNEO0FBQ0QsU0FBT0EsTUFBUDtBQUNEIiwiZmlsZSI6InN0YXRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0cyB7XG4gIGNvbnN0cnVjdG9yKHtpZH0pIHtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy50aW1lID0gMDtcbiAgICB0aGlzLnRvdGFsID0gMDtcbiAgICB0aGlzLmF2ZXJhZ2UgPSAwO1xuICAgIHRoaXMuY291bnQgPSAwO1xuXG4gICAgdGhpcy5fdGltZSA9IDA7XG4gIH1cblxuICB0aW1lU3RhcnQoKSB7XG4gICAgdGhpcy5fdGltZSA9IHRoaXMudGltZXN0YW1wTXMoKTtcbiAgfVxuXG4gIHRpbWVFbmQoKSB7XG4gICAgdGhpcy50aW1lID0gdGhpcy50aW1lc3RhbXBNcygpIC0gdGhpcy5fdGltZTtcbiAgICB0aGlzLnRvdGFsICs9IHRoaXMudGltZTtcbiAgICB0aGlzLmNvdW50Kys7XG4gICAgdGhpcy5hdmVyYWdlID0gdGhpcy50b3RhbCAvIHRoaXMuY291bnQ7XG4gIH1cblxuICB0aW1lc3RhbXBNcygpIHtcbiAgICAvKiBnbG9iYWwgd2luZG93ICovXG4gICAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgIT09IHVuZGVmaW5lZCAmJiB3aW5kb3cucGVyZm9ybWFuY2UgP1xuICAgICAgd2luZG93LnBlcmZvcm1hbmNlLm5vdygpIDpcbiAgICAgIERhdGUubm93KCk7XG4gIH1cblxuICBnZXRUaW1lU3RyaW5nKCkge1xuICAgIHJldHVybiBgJHt0aGlzLmlkfToke2Zvcm1hdFRpbWUodGhpcy50aW1lKX0oJHt0aGlzLmNvdW50fSlgO1xuICB9XG59XG5cbi8vIFRPRE86IEN1cnJlbnRseSB1bnVzZWQsIGtlZXBpbmcgaW4gY2FzZSB3ZSB3YW50IGl0IGxhdGVyIGZvciBsb2cgZm9ybWF0dGluZ1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFRpbWUobXMpIHtcbiAgbGV0IGZvcm1hdHRlZDtcbiAgaWYgKG1zIDwgMTApIHtcbiAgICBmb3JtYXR0ZWQgPSBgJHttcy50b0ZpeGVkKDIpfW1zYDtcbiAgfSBlbHNlIGlmIChtcyA8IDEwMCkge1xuICAgIGZvcm1hdHRlZCA9IGAke21zLnRvRml4ZWQoMSl9bXNgO1xuICB9IGVsc2UgaWYgKG1zIDwgMTAwMCkge1xuICAgIGZvcm1hdHRlZCA9IGAke21zLnRvRml4ZWQoMCl9bXNgO1xuICB9IGVsc2Uge1xuICAgIGZvcm1hdHRlZCA9IGAkeyhtcyAvIDEwMDApLnRvRml4ZWQoMil9c2A7XG4gIH1cbiAgcmV0dXJuIGZvcm1hdHRlZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxlZnRQYWQoc3RyaW5nLCBsZW5ndGggPSA4KSB7XG4gIHdoaWxlIChzdHJpbmcubGVuZ3RoIDwgbGVuZ3RoKSB7XG4gICAgc3RyaW5nID0gYCAke3N0cmluZ31gO1xuICB9XG4gIHJldHVybiBzdHJpbmc7XG59XG4iXX0=