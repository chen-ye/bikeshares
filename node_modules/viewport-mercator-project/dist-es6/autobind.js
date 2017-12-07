var PREDEFINED = ['constructor'];

/**
 * Binds the "this" argument of all functions on a class instance to the instance
 * @param {Object} obj - class instance (typically a react component)
 */
export default function autobind(obj) {
  var proto = Object.getPrototypeOf(obj);
  var propNames = Object.getOwnPropertyNames(proto);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function _loop() {
      var key = _step.value;

      if (typeof obj[key] === 'function') {
        if (!PREDEFINED.find(function (name) {
          return key === name;
        })) {
          obj[key] = obj[key].bind(obj);
        }
      }
    };

    for (var _iterator = propNames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop();
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
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hdXRvYmluZC5qcyJdLCJuYW1lcyI6WyJQUkVERUZJTkVEIiwiYXV0b2JpbmQiLCJvYmoiLCJwcm90byIsIk9iamVjdCIsImdldFByb3RvdHlwZU9mIiwicHJvcE5hbWVzIiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsImtleSIsImZpbmQiLCJuYW1lIiwiYmluZCJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBTUEsYUFBYSxDQUFDLGFBQUQsQ0FBbkI7O0FBRUE7Ozs7QUFJQSxlQUFlLFNBQVNDLFFBQVQsQ0FBa0JDLEdBQWxCLEVBQXVCO0FBQ3BDLE1BQU1DLFFBQVFDLE9BQU9DLGNBQVAsQ0FBc0JILEdBQXRCLENBQWQ7QUFDQSxNQUFNSSxZQUFZRixPQUFPRyxtQkFBUCxDQUEyQkosS0FBM0IsQ0FBbEI7QUFGb0M7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxVQUd6QkssR0FIeUI7O0FBSWxDLFVBQUksT0FBT04sSUFBSU0sR0FBSixDQUFQLEtBQW9CLFVBQXhCLEVBQW9DO0FBQ2xDLFlBQUksQ0FBQ1IsV0FBV1MsSUFBWCxDQUFnQjtBQUFBLGlCQUFRRCxRQUFRRSxJQUFoQjtBQUFBLFNBQWhCLENBQUwsRUFBNEM7QUFDMUNSLGNBQUlNLEdBQUosSUFBV04sSUFBSU0sR0FBSixFQUFTRyxJQUFULENBQWNULEdBQWQsQ0FBWDtBQUNEO0FBQ0Y7QUFSaUM7O0FBR3BDLHlCQUFrQkksU0FBbEIsOEhBQTZCO0FBQUE7QUFNNUI7QUFUbUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVVyQyIsImZpbGUiOiJhdXRvYmluZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBSRURFRklORUQgPSBbJ2NvbnN0cnVjdG9yJ107XG5cbi8qKlxuICogQmluZHMgdGhlIFwidGhpc1wiIGFyZ3VtZW50IG9mIGFsbCBmdW5jdGlvbnMgb24gYSBjbGFzcyBpbnN0YW5jZSB0byB0aGUgaW5zdGFuY2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogLSBjbGFzcyBpbnN0YW5jZSAodHlwaWNhbGx5IGEgcmVhY3QgY29tcG9uZW50KVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhdXRvYmluZChvYmopIHtcbiAgY29uc3QgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKTtcbiAgY29uc3QgcHJvcE5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocHJvdG8pO1xuICBmb3IgKGNvbnN0IGtleSBvZiBwcm9wTmFtZXMpIHtcbiAgICBpZiAodHlwZW9mIG9ialtrZXldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAoIVBSRURFRklORUQuZmluZChuYW1lID0+IGtleSA9PT0gbmFtZSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSBvYmpba2V5XS5iaW5kKG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=