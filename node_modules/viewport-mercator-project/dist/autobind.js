'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = autobind;
var PREDEFINED = ['constructor'];

/**
 * Binds the "this" argument of all functions on a class instance to the instance
 * @param {Object} obj - class instance (typically a react component)
 */
function autobind(obj) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hdXRvYmluZC5qcyJdLCJuYW1lcyI6WyJhdXRvYmluZCIsIlBSRURFRklORUQiLCJvYmoiLCJwcm90byIsIk9iamVjdCIsImdldFByb3RvdHlwZU9mIiwicHJvcE5hbWVzIiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsImtleSIsImZpbmQiLCJuYW1lIiwiYmluZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7a0JBTXdCQSxRO0FBTnhCLElBQU1DLGFBQWEsQ0FBQyxhQUFELENBQW5COztBQUVBOzs7O0FBSWUsU0FBU0QsUUFBVCxDQUFrQkUsR0FBbEIsRUFBdUI7QUFDcEMsTUFBTUMsUUFBUUMsT0FBT0MsY0FBUCxDQUFzQkgsR0FBdEIsQ0FBZDtBQUNBLE1BQU1JLFlBQVlGLE9BQU9HLG1CQUFQLENBQTJCSixLQUEzQixDQUFsQjtBQUZvQztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLFVBR3pCSyxHQUh5Qjs7QUFJbEMsVUFBSSxPQUFPTixJQUFJTSxHQUFKLENBQVAsS0FBb0IsVUFBeEIsRUFBb0M7QUFDbEMsWUFBSSxDQUFDUCxXQUFXUSxJQUFYLENBQWdCO0FBQUEsaUJBQVFELFFBQVFFLElBQWhCO0FBQUEsU0FBaEIsQ0FBTCxFQUE0QztBQUMxQ1IsY0FBSU0sR0FBSixJQUFXTixJQUFJTSxHQUFKLEVBQVNHLElBQVQsQ0FBY1QsR0FBZCxDQUFYO0FBQ0Q7QUFDRjtBQVJpQzs7QUFHcEMseUJBQWtCSSxTQUFsQiw4SEFBNkI7QUFBQTtBQU01QjtBQVRtQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBVXJDIiwiZmlsZSI6ImF1dG9iaW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUFJFREVGSU5FRCA9IFsnY29uc3RydWN0b3InXTtcblxuLyoqXG4gKiBCaW5kcyB0aGUgXCJ0aGlzXCIgYXJndW1lbnQgb2YgYWxsIGZ1bmN0aW9ucyBvbiBhIGNsYXNzIGluc3RhbmNlIHRvIHRoZSBpbnN0YW5jZVxuICogQHBhcmFtIHtPYmplY3R9IG9iaiAtIGNsYXNzIGluc3RhbmNlICh0eXBpY2FsbHkgYSByZWFjdCBjb21wb25lbnQpXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGF1dG9iaW5kKG9iaikge1xuICBjb25zdCBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopO1xuICBjb25zdCBwcm9wTmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhwcm90byk7XG4gIGZvciAoY29uc3Qga2V5IG9mIHByb3BOYW1lcykge1xuICAgIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmICghUFJFREVGSU5FRC5maW5kKG5hbWUgPT4ga2V5ID09PSBuYW1lKSkge1xuICAgICAgICBvYmpba2V5XSA9IG9ialtrZXldLmJpbmQob2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==