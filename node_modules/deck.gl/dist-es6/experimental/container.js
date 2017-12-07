var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// ES6 includes iteration and iterable protocols, and new standard containers
// Influential libraries like Immutable.js provide useful containers that
// adopt these conventions.
//
// So, is it possible to write generic JavaScript code that works with any
// well-written container class? And is it possible to write generic container
// classes that work with any well-written code.
//
// Almost. But it is not trivial. Importantly the standard JavaScript `Object`s
// lack even basic iteration support and even standard JavaScript `Array`s
// differ in minor but important aspects from the new classes.
//
// The bad news is that it does not appear that these things are going to be
// solved soon, even in an actively evolving language like JavaScript. The
// reason is concerns.
//
// The good news is that it is not overly hard to "paper over" the differences
// with a set of small efficient functions. And voila, container.js.
//
// Different types of containers provide different types of access.
// A random access container
// A keyed container

var ERR_NOT_CONTAINER = 'Expected a container';
var ERR_NOT_KEYED_CONTAINER = 'Expected a "keyed" container';

/**
 * Checks if argument is an indexable object (not a primitive value, nor null)
 * @param {*} value - JavaScript value to be tested
 * @return {Boolean} - true if argument is a JavaScript object
 */
export function isObject(value) {
  return value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
}

/**
 * Checks if argument is a plain object (not a class or array etc)
 * @param {*} value - JavaScript value to be tested
 * @return {Boolean} - true if argument is a plain JavaScript object
 */
export function isPlainObject(value) {
  return value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value.constructor === Object;
}

export function isContainer(value) {
  return Array.isArray(value) || ArrayBuffer.isView(value) || isObject(value);
}

/**
 * Deduces numer of elements in a JavaScript container.
 * - Auto-deduction for ES6 containers that define a count() method
 * - Auto-deduction for ES6 containers that define a size member
 * - Auto-deduction for Classic Arrays via the built-in length attribute
 * - Also handles objects, although note that this an O(N) operation
 */
export function count(container) {
  // Check if ES6 collection "count" function is available
  if (typeof container.count === 'function') {
    return container.count();
  }

  // Check if ES6 collection "size" attribute is set
  if (Number.isFinite(container.size)) {
    return container.size;
  }

  // Check if array length attribute is set
  // Note: checking this last since some ES6 collections (Immutable.js)
  // emit profuse warnings when trying to access `length` attribute
  if (Number.isFinite(container.length)) {
    return container.length;
  }

  // Note that getting the count of an object is O(N)
  if (isPlainObject(container)) {
    var counter = 0;
    for (var key in container) {
      // eslint-disable-line
      counter++;
    }
    return counter;
  }

  throw new Error(ERR_NOT_CONTAINER);
}

// Returns an iterator over all **values** of a container
//
// Note: Keyed containers are expected to provide an `values()` method,
// with the exception of plain objects which get special handling

export function values(container) {
  // HACK - Needed to make buble compiler work
  if (Array.isArray(container)) {
    return container;
  }

  var prototype = Object.getPrototypeOf(container);
  if (typeof prototype.values === 'function') {
    return container.values();
  }

  if (typeof container.constructor.values === 'function') {
    return container.constructor.values(container);
  }

  var iterator = container[Symbol.iterator];
  if (iterator) {
    return container;
  }

  throw new Error(ERR_NOT_CONTAINER);
}

// /////////////////////////////////////////////////////////
// KEYED CONTAINERS
// Examples: objects, Map, Immutable.Map, ...

export function isKeyedContainer(container) {
  if (Array.isArray(container)) {
    return false;
  }
  var prototype = Object.getPrototypeOf(container);
  // HACK to classify Immutable.List as non keyed container
  if (typeof prototype.shift === 'function') {
    return false;
  }
  var hasKeyedMethods = typeof prototype.get === 'function';
  return hasKeyedMethods || isPlainObject(container);
}

// Returns an iterator over all **entries** of a "keyed container"
// Keyed containers are expected to provide a `keys()` method,
// with the exception of plain objects.
//
export function keys(keyedContainer) {
  var prototype = Object.getPrototypeOf(keyedContainer);
  if (typeof prototype.keys === 'function') {
    return keyedContainer.keys();
  }

  if (typeof keyedContainer.constructor.keys === 'function') {
    return keyedContainer.constructor.keys(keyedContainer);
  }

  throw new Error(ERR_NOT_KEYED_CONTAINER);
}

// Returns an iterator over all **entries** of a "keyed container"
//
// Keyed containers are expected to provide an `entries()` method,
// with the exception of plain objects.
//
export function entries(keyedContainer) {
  var prototype = Object.getPrototypeOf(keyedContainer);
  if (typeof prototype.entries === 'function') {
    return keyedContainer.entries();
  }

  // if (typeof prototype.constructor.entries === 'function') {
  //   return prototype.constructor.entries(keyedContainer);
  // }

  if (typeof keyedContainer.constructor.entries === 'function') {
    return keyedContainer.constructor.entries(keyedContainer);
  }

  return null;
}

// "Generic" forEach that first attempts to call a
export function forEach(container, visitor) {
  // Hack to work around limitations in buble compiler
  var prototype = Object.getPrototypeOf(container);
  if (prototype.forEach) {
    container.forEach(visitor);
    return;
  }

  var isKeyed = isKeyedContainer(container);
  if (isKeyed) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = entries(container)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _step$value = _slicedToArray(_step.value, 2),
            key = _step$value[0],
            value = _step$value[1];

        visitor(value, key, container);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return;
  }

  var index = 0;
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = values(container)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var element = _step2.value;

      // result[index] = visitor(element, index, container);
      visitor(element, index, container);
      index++;
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
}

export function map(container, visitor) {
  // Hack to work around limitations in buble compiler
  var prototype = Object.getPrototypeOf(container);
  if (prototype.forEach) {
    var _result = [];
    container.forEach(function (x, i, e) {
      return _result.push(visitor(x, i, e));
    });
    return _result;
  }

  var isKeyed = isKeyedContainer(container);
  // const result = new Array(count(container));
  var result = [];
  if (isKeyed) {
    // TODO - should this create an object?
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = entries(container)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var _step3$value = _slicedToArray(_step3.value, 2),
            key = _step3$value[0],
            value = _step3$value[1];

        // result[index] = visitor(element, index, container);
        result.push(visitor(value, key, container));
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }
  } else {
    var index = 0;
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = values(container)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var element = _step4.value;

        // result[index] = visitor(element, index, container);
        result.push(visitor(element, index, container));
        index++;
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }
  }
  return result;
}

export function reduce(container, visitor) {
  // Hack to work around limitations in buble compiler
  var prototype = Object.getPrototypeOf(container);
  if (prototype.forEach) {
    var _result2 = [];
    container.forEach(function (x, i, e) {
      return _result2.push(visitor(x, i, e));
    });
    return _result2;
  }

  var isKeyed = isKeyedContainer(container);
  // const result = new Array(count(container));
  var result = [];
  if (isKeyed) {
    // TODO - should this create an object?
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = entries(container)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var _step5$value = _slicedToArray(_step5.value, 2),
            key = _step5$value[0],
            value = _step5$value[1];

        // result[index] = visitor(element, index, container);
        result.push(visitor(value, key, container));
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5.return) {
          _iterator5.return();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }
  } else {
    var index = 0;
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = values(container)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        var element = _step6.value;

        // result[index] = visitor(element, index, container);
        result.push(visitor(element, index, container));
        index++;
      }
    } catch (err) {
      _didIteratorError6 = true;
      _iteratorError6 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion6 && _iterator6.return) {
          _iterator6.return();
        }
      } finally {
        if (_didIteratorError6) {
          throw _iteratorError6;
        }
      }
    }
  }
  return result;
}

// Attempt to create a simple (array, plain object) representation of
// a nested structure of ES6 iterable classes.
// Assumption is that if an entries() method is available, the iterable object
// should be represented as an object, if not as an array.
export function toJS(container) {
  if (!isObject(container)) {
    return container;
  }

  if (isKeyedContainer(container)) {
    var _result3 = {};
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
      for (var _iterator7 = entries(container)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        var _step7$value = _slicedToArray(_step7.value, 2),
            key = _step7$value[0],
            value = _step7$value[1];

        _result3[key] = toJS(value);
      }
    } catch (err) {
      _didIteratorError7 = true;
      _iteratorError7 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion7 && _iterator7.return) {
          _iterator7.return();
        }
      } finally {
        if (_didIteratorError7) {
          throw _iteratorError7;
        }
      }
    }

    return _result3;
  }

  var result = [];
  var _iteratorNormalCompletion8 = true;
  var _didIteratorError8 = false;
  var _iteratorError8 = undefined;

  try {
    for (var _iterator8 = values(container)[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
      var value = _step8.value;

      result.push(toJS(value));
    }
  } catch (err) {
    _didIteratorError8 = true;
    _iteratorError8 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion8 && _iterator8.return) {
        _iterator8.return();
      }
    } finally {
      if (_didIteratorError8) {
        throw _iteratorError8;
      }
    }
  }

  return result;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHBlcmltZW50YWwvY29udGFpbmVyLmpzIl0sIm5hbWVzIjpbIkVSUl9OT1RfQ09OVEFJTkVSIiwiRVJSX05PVF9LRVlFRF9DT05UQUlORVIiLCJpc09iamVjdCIsInZhbHVlIiwiaXNQbGFpbk9iamVjdCIsImNvbnN0cnVjdG9yIiwiT2JqZWN0IiwiaXNDb250YWluZXIiLCJBcnJheSIsImlzQXJyYXkiLCJBcnJheUJ1ZmZlciIsImlzVmlldyIsImNvdW50IiwiY29udGFpbmVyIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJzaXplIiwibGVuZ3RoIiwiY291bnRlciIsImtleSIsIkVycm9yIiwidmFsdWVzIiwicHJvdG90eXBlIiwiZ2V0UHJvdG90eXBlT2YiLCJpdGVyYXRvciIsIlN5bWJvbCIsImlzS2V5ZWRDb250YWluZXIiLCJzaGlmdCIsImhhc0tleWVkTWV0aG9kcyIsImdldCIsImtleXMiLCJrZXllZENvbnRhaW5lciIsImVudHJpZXMiLCJmb3JFYWNoIiwidmlzaXRvciIsImlzS2V5ZWQiLCJpbmRleCIsImVsZW1lbnQiLCJtYXAiLCJyZXN1bHQiLCJ4IiwiaSIsImUiLCJwdXNoIiwicmVkdWNlIiwidG9KUyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLElBQU1BLG9CQUFvQixzQkFBMUI7QUFDQSxJQUFNQywwQkFBMEIsOEJBQWhDOztBQUVBOzs7OztBQUtBLE9BQU8sU0FBU0MsUUFBVCxDQUFrQkMsS0FBbEIsRUFBeUI7QUFDOUIsU0FBT0EsVUFBVSxJQUFWLElB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QTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBSy9CLFdBQU9vQyxRQUFQO0FBQ0Q7O0FBRUQsTUFBTUEsU0FBUyxFQUFmO0FBYjhCO0FBQUE7QUFBQTs7QUFBQTtBQWM5QiwwQkFBb0JsQixPQUFPUixTQUFQLENBQXBCLG1JQUF1QztBQUFBLFVBQTVCVixLQUE0Qjs7QUFDckNvQyxhQUFPSSxJQUFQLENBQVlFLEtBQUsxQyxLQUFMLENBQVo7QUFDRDtBQWhCNkI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFpQjlCLFNBQU9vQyxNQUFQO0FBQ0QiLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8vIEVTNiBpbmNsdWRlcyBpdGVyYXRpb24gYW5kIGl0ZXJhYmxlIHByb3RvY29scywgYW5kIG5ldyBzdGFuZGFyZCBjb250YWluZXJzXG4vLyBJbmZsdWVudGlhbCBsaWJyYXJpZXMgbGlrZSBJbW11dGFibGUuanMgcHJvdmlkZSB1c2VmdWwgY29udGFpbmVycyB0aGF0XG4vLyBhZG9wdCB0aGVzZSBjb252ZW50aW9ucy5cbi8vXG4vLyBTbywgaXMgaXQgcG9zc2libGUgdG8gd3JpdGUgZ2VuZXJpYyBKYXZhU2NyaXB0IGNvZGUgdGhhdCB3b3JrcyB3aXRoIGFueVxuLy8gd2VsbC13cml0dGVuIGNvbnRhaW5lciBjbGFzcz8gQW5kIGlzIGl0IHBvc3NpYmxlIHRvIHdyaXRlIGdlbmVyaWMgY29udGFpbmVyXG4vLyBjbGFzc2VzIHRoYXQgd29yayB3aXRoIGFueSB3ZWxsLXdyaXR0ZW4gY29kZS5cbi8vXG4vLyBBbG1vc3QuIEJ1dCBpdCBpcyBub3QgdHJpdmlhbC4gSW1wb3J0YW50bHkgdGhlIHN0YW5kYXJkIEphdmFTY3JpcHQgYE9iamVjdGBzXG4vLyBsYWNrIGV2ZW4gYmFzaWMgaXRlcmF0aW9uIHN1cHBvcnQgYW5kIGV2ZW4gc3RhbmRhcmQgSmF2YVNjcmlwdCBgQXJyYXlgc1xuLy8gZGlmZmVyIGluIG1pbm9yIGJ1dCBpbXBvcnRhbnQgYXNwZWN0cyBmcm9tIHRoZSBuZXcgY2xhc3Nlcy5cbi8vXG4vLyBUaGUgYmFkIG5ld3MgaXMgdGhhdCBpdCBkb2VzIG5vdCBhcHBlYXIgdGhhdCB0aGVzZSB0aGluZ3MgYXJlIGdvaW5nIHRvIGJlXG4vLyBzb2x2ZWQgc29vbiwgZXZlbiBpbiBhbiBhY3RpdmVseSBldm9sdmluZyBsYW5ndWFnZSBsaWtlIEphdmFTY3JpcHQuIFRoZVxuLy8gcmVhc29uIGlzIGNvbmNlcm5zLlxuLy9cbi8vIFRoZSBnb29kIG5ld3MgaXMgdGhhdCBpdCBpcyBub3Qgb3Zlcmx5IGhhcmQgdG8gXCJwYXBlciBvdmVyXCIgdGhlIGRpZmZlcmVuY2VzXG4vLyB3aXRoIGEgc2V0IG9mIHNtYWxsIGVmZmljaWVudCBmdW5jdGlvbnMuIEFuZCB2b2lsYSwgY29udGFpbmVyLmpzLlxuLy9cbi8vIERpZmZlcmVudCB0eXBlcyBvZiBjb250YWluZXJzIHByb3ZpZGUgZGlmZmVyZW50IHR5cGVzIG9mIGFjY2Vzcy5cbi8vIEEgcmFuZG9tIGFjY2VzcyBjb250YWluZXJcbi8vIEEga2V5ZWQgY29udGFpbmVyXG5cbmNvbnN0IEVSUl9OT1RfQ09OVEFJTkVSID0gJ0V4cGVjdGVkIGEgY29udGFpbmVyJztcbmNvbnN0IEVSUl9OT1RfS0VZRURfQ09OVEFJTkVSID0gJ0V4cGVjdGVkIGEgXCJrZXllZFwiIGNvbnRhaW5lcic7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGFyZ3VtZW50IGlzIGFuIGluZGV4YWJsZSBvYmplY3QgKG5vdCBhIHByaW1pdGl2ZSB2YWx1ZSwgbm9yIG51bGwpXG4gKiBAcGFyYW0geyp9IHZhbHVlIC0gSmF2YVNjcmlwdCB2YWx1ZSB0byBiZSB0ZXN0ZWRcbiAqIEByZXR1cm4ge0Jvb2xlYW59IC0gdHJ1ZSBpZiBhcmd1bWVudCBpcyBhIEphdmFTY3JpcHQgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYXJndW1lbnQgaXMgYSBwbGFpbiBvYmplY3QgKG5vdCBhIGNsYXNzIG9yIGFycmF5IGV0YylcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgLSBKYXZhU2NyaXB0IHZhbHVlIHRvIGJlIHRlc3RlZFxuICogQHJldHVybiB7Qm9vbGVhbn0gLSB0cnVlIGlmIGFyZ3VtZW50IGlzIGEgcGxhaW4gSmF2YVNjcmlwdCBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUuY29uc3RydWN0b3IgPT09IE9iamVjdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29udGFpbmVyKHZhbHVlKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKSB8fCBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsdWUpIHx8IGlzT2JqZWN0KHZhbHVlKTtcbn1cblxuLyoqXG4gKiBEZWR1Y2VzIG51bWVyIG9mIGVsZW1lbnRzIGluIGEgSmF2YVNjcmlwdCBjb250YWluZXIuXG4gKiAtIEF1dG8tZGVkdWN0aW9uIGZvciBFUzYgY29udGFpbmVycyB0aGF0IGRlZmluZSBhIGNvdW50KCkgbWV0aG9kXG4gKiAtIEF1dG8tZGVkdWN0aW9uIGZvciBFUzYgY29udGFpbmVycyB0aGF0IGRlZmluZSBhIHNpemUgbWVtYmVyXG4gKiAtIEF1dG8tZGVkdWN0aW9uIGZvciBDbGFzc2ljIEFycmF5cyB2aWEgdGhlIGJ1aWx0LWluIGxlbmd0aCBhdHRyaWJ1dGVcbiAqIC0gQWxzbyBoYW5kbGVzIG9iamVjdHMsIGFsdGhvdWdoIG5vdGUgdGhhdCB0aGlzIGFuIE8oTikgb3BlcmF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3VudChjb250YWluZXIpIHtcbiAgLy8gQ2hlY2sgaWYgRVM2IGNvbGxlY3Rpb24gXCJjb3VudFwiIGZ1bmN0aW9uIGlzIGF2YWlsYWJsZVxuICBpZiAodHlwZW9mIGNvbnRhaW5lci5jb3VudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBjb250YWluZXIuY291bnQoKTtcbiAgfVxuXG4gIC8vIENoZWNrIGlmIEVTNiBjb2xsZWN0aW9uIFwic2l6ZVwiIGF0dHJpYnV0ZSBpcyBzZXRcbiAgaWYgKE51bWJlci5pc0Zpbml0ZShjb250YWluZXIuc2l6ZSkpIHtcbiAgICByZXR1cm4gY29udGFpbmVyLnNpemU7XG4gIH1cblxuICAvLyBDaGVjayBpZiBhcnJheSBsZW5ndGggYXR0cmlidXRlIGlzIHNldFxuICAvLyBOb3RlOiBjaGVja2luZyB0aGlzIGxhc3Qgc2luY2Ugc29tZSBFUzYgY29sbGVjdGlvbnMgKEltbXV0YWJsZS5qcylcbiAgLy8gZW1pdCBwcm9mdXNlIHdhcm5pbmdzIHdoZW4gdHJ5aW5nIHRvIGFjY2VzcyBgbGVuZ3RoYCBhdHRyaWJ1dGVcbiAgaWYgKE51bWJlci5pc0Zpbml0ZShjb250YWluZXIubGVuZ3RoKSkge1xuICAgIHJldHVybiBjb250YWluZXIubGVuZ3RoO1xuICB9XG5cbiAgLy8gTm90ZSB0aGF0IGdldHRpbmcgdGhlIGNvdW50IG9mIGFuIG9iamVjdCBpcyBPKE4pXG4gIGlmIChpc1BsYWluT2JqZWN0KGNvbnRhaW5lcikpIHtcbiAgICBsZXQgY291bnRlciA9IDA7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gY29udGFpbmVyKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgIGNvdW50ZXIrKztcbiAgICB9XG4gICAgcmV0dXJuIGNvdW50ZXI7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoRVJSX05PVF9DT05UQUlORVIpO1xufVxuXG4vLyBSZXR1cm5zIGFuIGl0ZXJhdG9yIG92ZXIgYWxsICoqdmFsdWVzKiogb2YgYSBjb250YWluZXJcbi8vXG4vLyBOb3RlOiBLZXllZCBjb250YWluZXJzIGFyZSBleHBlY3RlZCB0byBwcm92aWRlIGFuIGB2YWx1ZXMoKWAgbWV0aG9kLFxuLy8gd2l0aCB0aGUgZXhjZXB0aW9uIG9mIHBsYWluIG9iamVjdHMgd2hpY2ggZ2V0IHNwZWNpYWwgaGFuZGxpbmdcblxuZXhwb3J0IGZ1bmN0aW9uIHZhbHVlcyhjb250YWluZXIpIHtcbiAgLy8gSEFDSyAtIE5lZWRlZCB0byBtYWtlIGJ1YmxlIGNvbXBpbGVyIHdvcmtcbiAgaWYgKEFycmF5LmlzQXJyYXkoY29udGFpbmVyKSkge1xuICAgIHJldHVybiBjb250YWluZXI7XG4gIH1cblxuICBjb25zdCBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoY29udGFpbmVyKTtcbiAgaWYgKHR5cGVvZiBwcm90b3R5cGUudmFsdWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lci52YWx1ZXMoKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgY29udGFpbmVyLmNvbnN0cnVjdG9yLnZhbHVlcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBjb250YWluZXIuY29uc3RydWN0b3IudmFsdWVzKGNvbnRhaW5lcik7XG4gIH1cblxuICBjb25zdCBpdGVyYXRvciA9IGNvbnRhaW5lcltTeW1ib2wuaXRlcmF0b3JdO1xuICBpZiAoaXRlcmF0b3IpIHtcbiAgICByZXR1cm4gY29udGFpbmVyO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKEVSUl9OT1RfQ09OVEFJTkVSKTtcbn1cblxuLy8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBLRVlFRCBDT05UQUlORVJTXG4vLyBFeGFtcGxlczogb2JqZWN0cywgTWFwLCBJbW11dGFibGUuTWFwLCAuLi5cblxuZXhwb3J0IGZ1bmN0aW9uIGlzS2V5ZWRDb250YWluZXIoY29udGFpbmVyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGNvbnRhaW5lcikpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY29uc3QgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGNvbnRhaW5lcik7XG4gIC8vIEhBQ0sgdG8gY2xhc3NpZnkgSW1tdXRhYmxlLkxpc3QgYXMgbm9uIGtleWVkIGNvbnRhaW5lclxuICBpZiAodHlwZW9mIHByb3RvdHlwZS5zaGlmdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBoYXNLZXllZE1ldGhvZHMgPSB0eXBlb2YgcHJvdG90eXBlLmdldCA9PT0gJ2Z1bmN0aW9uJztcbiAgcmV0dXJuIGhhc0tleWVkTWV0aG9kcyB8fCBpc1BsYWluT2JqZWN0KGNvbnRhaW5lcik7XG59XG5cbi8vIFJldHVybnMgYW4gaXRlcmF0b3Igb3ZlciBhbGwgKiplbnRyaWVzKiogb2YgYSBcImtleWVkIGNvbnRhaW5lclwiXG4vLyBLZXllZCBjb250YWluZXJzIGFyZSBleHBlY3RlZCB0byBwcm92aWRlIGEgYGtleXMoKWAgbWV0aG9kLFxuLy8gd2l0aCB0aGUgZXhjZXB0aW9uIG9mIHBsYWluIG9iamVjdHMuXG4vL1xuZXhwb3J0IGZ1bmN0aW9uIGtleXMoa2V5ZWRDb250YWluZXIpIHtcbiAgY29uc3QgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGtleWVkQ29udGFpbmVyKTtcbiAgaWYgKHR5cGVvZiBwcm90b3R5cGUua2V5cyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBrZXllZENvbnRhaW5lci5rZXlzKCk7XG4gIH1cblxuICBpZiAodHlwZW9mIGtleWVkQ29udGFpbmVyLmNvbnN0cnVjdG9yLmtleXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4ga2V5ZWRDb250YWluZXIuY29uc3RydWN0b3Iua2V5cyhrZXllZENvbnRhaW5lcik7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoRVJSX05PVF9LRVlFRF9DT05UQUlORVIpO1xufVxuXG4vLyBSZXR1cm5zIGFuIGl0ZXJhdG9yIG92ZXIgYWxsICoqZW50cmllcyoqIG9mIGEgXCJrZXllZCBjb250YWluZXJcIlxuLy9cbi8vIEtleWVkIGNvbnRhaW5lcnMgYXJlIGV4cGVjdGVkIHRvIHByb3ZpZGUgYW4gYGVudHJpZXMoKWAgbWV0aG9kLFxuLy8gd2l0aCB0aGUgZXhjZXB0aW9uIG9mIHBsYWluIG9iamVjdHMuXG4vL1xuZXhwb3J0IGZ1bmN0aW9uIGVudHJpZXMoa2V5ZWRDb250YWluZXIpIHtcbiAgY29uc3QgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGtleWVkQ29udGFpbmVyKTtcbiAgaWYgKHR5cGVvZiBwcm90b3R5cGUuZW50cmllcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBrZXllZENvbnRhaW5lci5lbnRyaWVzKCk7XG4gIH1cblxuICAvLyBpZiAodHlwZW9mIHByb3RvdHlwZS5jb25zdHJ1Y3Rvci5lbnRyaWVzID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vICAgcmV0dXJuIHByb3RvdHlwZS5jb25zdHJ1Y3Rvci5lbnRyaWVzKGtleWVkQ29udGFpbmVyKTtcbiAgLy8gfVxuXG4gIGlmICh0eXBlb2Yga2V5ZWRDb250YWluZXIuY29uc3RydWN0b3IuZW50cmllcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBrZXllZENvbnRhaW5lci5jb25zdHJ1Y3Rvci5lbnRyaWVzKGtleWVkQ29udGFpbmVyKTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG4vLyBcIkdlbmVyaWNcIiBmb3JFYWNoIHRoYXQgZmlyc3QgYXR0ZW1wdHMgdG8gY2FsbCBhXG5leHBvcnQgZnVuY3Rpb24gZm9yRWFjaChjb250YWluZXIsIHZpc2l0b3IpIHtcbiAgLy8gSGFjayB0byB3b3JrIGFyb3VuZCBsaW1pdGF0aW9ucyBpbiBidWJsZSBjb21waWxlclxuICBjb25zdCBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoY29udGFpbmVyKTtcbiAgaWYgKHByb3RvdHlwZS5mb3JFYWNoKSB7XG4gICAgY29udGFpbmVyLmZvckVhY2godmlzaXRvcik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgaXNLZXllZCA9IGlzS2V5ZWRDb250YWluZXIoY29udGFpbmVyKTtcbiAgaWYgKGlzS2V5ZWQpIHtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBlbnRyaWVzKGNvbnRhaW5lcikpIHtcbiAgICAgIHZpc2l0b3IodmFsdWUsIGtleSwgY29udGFpbmVyKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbGV0IGluZGV4ID0gMDtcbiAgZm9yIChjb25zdCBlbGVtZW50IG9mIHZhbHVlcyhjb250YWluZXIpKSB7XG4gICAgLy8gcmVzdWx0W2luZGV4XSA9IHZpc2l0b3IoZWxlbWVudCwgaW5kZXgsIGNvbnRhaW5lcik7XG4gICAgdmlzaXRvcihlbGVtZW50LCBpbmRleCwgY29udGFpbmVyKTtcbiAgICBpbmRleCsrO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXAoY29udGFpbmVyLCB2aXNpdG9yKSB7XG4gIC8vIEhhY2sgdG8gd29yayBhcm91bmQgbGltaXRhdGlvbnMgaW4gYnVibGUgY29tcGlsZXJcbiAgY29uc3QgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGNvbnRhaW5lcik7XG4gIGlmIChwcm90b3R5cGUuZm9yRWFjaCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGNvbnRhaW5lci5mb3JFYWNoKCh4LCBpLCBlKSA9PiByZXN1bHQucHVzaCh2aXNpdG9yKHgsIGksIGUpKSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGNvbnN0IGlzS2V5ZWQgPSBpc0tleWVkQ29udGFpbmVyKGNvbnRhaW5lcik7XG4gIC8vIGNvbnN0IHJlc3VsdCA9IG5ldyBBcnJheShjb3VudChjb250YWluZXIpKTtcbiAgY29uc3QgcmVzdWx0ID0gW107XG4gIGlmIChpc0tleWVkKSB7XG4gICAgLy8gVE9ETyAtIHNob3VsZCB0aGlzIGNyZWF0ZSBhbiBvYmplY3Q/XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgZW50cmllcyhjb250YWluZXIpKSB7XG4gICAgICAvLyByZXN1bHRbaW5kZXhdID0gdmlzaXRvcihlbGVtZW50LCBpbmRleCwgY29udGFpbmVyKTtcbiAgICAgIHJlc3VsdC5wdXNoKHZpc2l0b3IodmFsdWUsIGtleSwgY29udGFpbmVyKSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxldCBpbmRleCA9IDA7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHZhbHVlcyhjb250YWluZXIpKSB7XG4gICAgICAvLyByZXN1bHRbaW5kZXhdID0gdmlzaXRvcihlbGVtZW50LCBpbmRleCwgY29udGFpbmVyKTtcbiAgICAgIHJlc3VsdC5wdXNoKHZpc2l0b3IoZWxlbWVudCwgaW5kZXgsIGNvbnRhaW5lcikpO1xuICAgICAgaW5kZXgrKztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZHVjZShjb250YWluZXIsIHZpc2l0b3IpIHtcbiAgLy8gSGFjayB0byB3b3JrIGFyb3VuZCBsaW1pdGF0aW9ucyBpbiBidWJsZSBjb21waWxlclxuICBjb25zdCBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoY29udGFpbmVyKTtcbiAgaWYgKHByb3RvdHlwZS5mb3JFYWNoKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgY29udGFpbmVyLmZvckVhY2goKHgsIGksIGUpID0+IHJlc3VsdC5wdXNoKHZpc2l0b3IoeCwgaSwgZSkpKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgY29uc3QgaXNLZXllZCA9IGlzS2V5ZWRDb250YWluZXIoY29udGFpbmVyKTtcbiAgLy8gY29uc3QgcmVzdWx0ID0gbmV3IEFycmF5KGNvdW50KGNvbnRhaW5lcikpO1xuICBjb25zdCByZXN1bHQgPSBbXTtcbiAgaWYgKGlzS2V5ZWQpIHtcbiAgICAvLyBUT0RPIC0gc2hvdWxkIHRoaXMgY3JlYXRlIGFuIG9iamVjdD9cbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBlbnRyaWVzKGNvbnRhaW5lcikpIHtcbiAgICAgIC8vIHJlc3VsdFtpbmRleF0gPSB2aXNpdG9yKGVsZW1lbnQsIGluZGV4LCBjb250YWluZXIpO1xuICAgICAgcmVzdWx0LnB1c2godmlzaXRvcih2YWx1ZSwga2V5LCBjb250YWluZXIpKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbGV0IGluZGV4ID0gMDtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgdmFsdWVzKGNvbnRhaW5lcikpIHtcbiAgICAgIC8vIHJlc3VsdFtpbmRleF0gPSB2aXNpdG9yKGVsZW1lbnQsIGluZGV4LCBjb250YWluZXIpO1xuICAgICAgcmVzdWx0LnB1c2godmlzaXRvcihlbGVtZW50LCBpbmRleCwgY29udGFpbmVyKSk7XG4gICAgICBpbmRleCsrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyBBdHRlbXB0IHRvIGNyZWF0ZSBhIHNpbXBsZSAoYXJyYXksIHBsYWluIG9iamVjdCkgcmVwcmVzZW50YXRpb24gb2Zcbi8vIGEgbmVzdGVkIHN0cnVjdHVyZSBvZiBFUzYgaXRlcmFibGUgY2xhc3Nlcy5cbi8vIEFzc3VtcHRpb24gaXMgdGhhdCBpZiBhbiBlbnRyaWVzKCkgbWV0aG9kIGlzIGF2YWlsYWJsZSwgdGhlIGl0ZXJhYmxlIG9iamVjdFxuLy8gc2hvdWxkIGJlIHJlcHJlc2VudGVkIGFzIGFuIG9iamVjdCwgaWYgbm90IGFzIGFuIGFycmF5LlxuZXhwb3J0IGZ1bmN0aW9uIHRvSlMoY29udGFpbmVyKSB7XG4gIGlmICghaXNPYmplY3QoY29udGFpbmVyKSkge1xuICAgIHJldHVybiBjb250YWluZXI7XG4gIH1cblxuICBpZiAoaXNLZXllZENvbnRhaW5lcihjb250YWluZXIpKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgZW50cmllcyhjb250YWluZXIpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHRvSlModmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgY29uc3QgcmVzdWx0ID0gW107XG4gIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKGNvbnRhaW5lcikpIHtcbiAgICByZXN1bHQucHVzaCh0b0pTKHZhbHVlKSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==