var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Common environment setup
 */
/* eslint-disable no-console */
/* global process */
import console from 'global/console';
import window from 'global/window';

// Duck-type Node context
export var IS_NODE = (typeof process === 'undefined' ? 'undefined' : _typeof(process)) !== undefined && process.toString() === '[object process]';

// Configure console

// Console.debug is useful in chrome as it gives blue styling, but is not
// available in node
console.debug = console.debug || console.log;

// Some instrumentation may override console methods, so preserve them here
console.native = {
  debug: console.debug.bind(console),
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console)
};

export { console as logger };

// Set up high resolution timer
var timestamp = void 0;
if (IS_NODE) {
  timestamp = function timestamp() {
    var _process$hrtime = process.hrtime(),
        _process$hrtime2 = _slicedToArray(_process$hrtime, 2),
        seconds = _process$hrtime2[0],
        nanoseconds = _process$hrtime2[1];

    return seconds + nanoseconds / 1e6;
  };
} else if (window.performance) {
  timestamp = function timestamp() {
    return window.performance.now();
  };
} else {
  timestamp = function timestamp() {
    return Date.now();
  };
}

export { timestamp };
//# sourceMappingURL=env.js.map