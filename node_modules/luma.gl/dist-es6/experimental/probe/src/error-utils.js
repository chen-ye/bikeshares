/**
 * Utilities for dev-mode error handling
 */
/* eslint-disable no-console, no-debugger */
/* global window */
import { logger as console } from './env';

/**
 * Ensure that your debugger stops when code issues warnings so that
 * you can see what is going on in othercomponents when they decide
 * to issue warnings.
 *
 * @param {Array} consoleBlacklist - array of strings to match against
 */
export function breakOnConsoleWarnings() {
  var consoleBlacklist = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [/.*/];

  function breakOnConsole(log, msg, param1) {
    for (var _len = arguments.length, params = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      params[_key - 3] = arguments[_key];
    }

    if (typeof msg === 'string' && msg.indexOf('Unhandled promise rejection') === 0) {
      log.apply(undefined, [msg, param1].concat(params));
      throw new Error(param1);
    } else if (consoleBlacklist.some(function (pattern) {
      return pattern.test(msg);
    })) {
      log.apply(undefined, [msg, param1].concat(params));
    } else {
      log.apply(undefined, [msg, param1].concat(params));
    }
  }
  console.warn = breakOnConsole.bind(null, console.native.warn);
  console.error = breakOnConsole.bind(null, console.native.error);

  window.onerror = function (message, url, line, column, error) {
    if (error) {
      console.native.error(error + ' ' + url + ':' + line + ':' + (column || 0));
    } else {
      console.native.error(message + ' ' + url + ':' + line + ':' + (column || 0));
    }
    debugger;
  };
}

/**
 * Throw exceptions when code issues warnings so that
 * you can access them in your normal exception handling setup, perhaps
 * displaying them in the UI or logging them in a different way.
 *
 * @param {Array} consoleBlacklist - array of strings to match against
 */
export function throwOnConsoleWarnings() {
  var consoleBlacklist = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [/.*/];

  console.warn = function throwOnWarning(msg) {
    var _console$native;

    if (consoleBlacklist.some(function (patt) {
      return patt.test(msg);
    })) {
      throw new Error('Unacceptable warning: ' + msg);
    }
    (_console$native = console.native).warn.apply(_console$native, arguments);
  };
}

// Chrome has yet to implement onRejectedPromise, so trigger onerror instead
export function interceptRejectedPromises() {
  var _arguments = arguments;

  console.error = function (msg, error) {
    for (var _len2 = arguments.length, params = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      params[_key2 - 2] = arguments[_key2];
    }

    var _console$native3;

    if (typeof msg === 'string' && msg.indexOf('Unhandled promise rejection') === 0) {
      var _console$native2;

      error.unhandledPromise = true;
      // Use different message to avoid triggering again
      (_console$native2 = console.native).error.apply(_console$native2, ['Rejected promise', error].concat(params));
      throw error;
    }
    (_console$native3 = console.native).error.apply(_console$native3, _arguments);
  };
}
//# sourceMappingURL=error-utils.js.map