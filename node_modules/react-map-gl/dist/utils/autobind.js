'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _getOwnPropertyNames = require('babel-runtime/core-js/object/get-own-property-names');

var _getOwnPropertyNames2 = _interopRequireDefault(_getOwnPropertyNames);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

exports.default = autobind;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PREDEFINED = ['constructor', 'render', 'componentWillMount', 'componentDidMount', 'componentWillReceiveProps', 'shouldComponentUpdate', 'componentWillUpdate', 'componentDidUpdate', 'componentWillUnmount'];

/**
 * Binds the "this" argument of all functions on a class instance to the instance
 * @param {Object} obj - class instance (typically a react component)
 */
function autobind(obj) {
  var proto = (0, _getPrototypeOf2.default)(obj);
  var propNames = (0, _getOwnPropertyNames2.default)(proto);
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

    for (var _iterator = (0, _getIterator3.default)(propNames), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9hdXRvYmluZC5qcyJdLCJuYW1lcyI6WyJhdXRvYmluZCIsIlBSRURFRklORUQiLCJvYmoiLCJwcm90byIsInByb3BOYW1lcyIsImtleSIsImZpbmQiLCJuYW1lIiwiYmluZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQVV3QkEsUTs7OztBQVZ4QixJQUFNQyxhQUFhLENBQ2pCLGFBRGlCLEVBQ0YsUUFERSxFQUNRLG9CQURSLEVBQzhCLG1CQUQ5QixFQUVqQiwyQkFGaUIsRUFFWSx1QkFGWixFQUVxQyxxQkFGckMsRUFHakIsb0JBSGlCLEVBR0ssc0JBSEwsQ0FBbkI7O0FBTUE7Ozs7QUFJZSxTQUFTRCxRQUFULENBQWtCRSxHQUFsQixFQUF1QjtBQUNwQyxNQUFNQyxRQUFRLDhCQUFzQkQsR0FBdEIsQ0FBZDtBQUNBLE1BQU1FLFlBQVksbUNBQTJCRCxLQUEzQixDQUFsQjtBQUZvQztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLFVBR3pCRSxHQUh5Qjs7QUFJbEMsVUFBSSxPQUFPSCxJQUFJRyxHQUFKLENBQVAsS0FBb0IsVUFBeEIsRUFBb0M7QUFDbEMsWUFBSSxDQUFDSixXQUFXSyxJQUFYLENBQWdCO0FBQUEsaUJBQVFELFFBQVFFLElBQWhCO0FBQUEsU0FBaEIsQ0FBTCxFQUE0QztBQUMxQ0wsY0FBSUcsR0FBSixJQUFXSCxJQUFJRyxHQUFKLEVBQVNHLElBQVQsQ0FBY04sR0FBZCxDQUFYO0FBQ0Q7QUFDRjtBQVJpQzs7QUFHcEMsb0RBQWtCRSxTQUFsQiw0R0FBNkI7QUFBQTtBQU01QjtBQVRtQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBVXJDIiwiZmlsZSI6ImF1dG9iaW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUFJFREVGSU5FRCA9IFtcbiAgJ2NvbnN0cnVjdG9yJywgJ3JlbmRlcicsICdjb21wb25lbnRXaWxsTW91bnQnLCAnY29tcG9uZW50RGlkTW91bnQnLFxuICAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsICdzaG91bGRDb21wb25lbnRVcGRhdGUnLCAnY29tcG9uZW50V2lsbFVwZGF0ZScsXG4gICdjb21wb25lbnREaWRVcGRhdGUnLCAnY29tcG9uZW50V2lsbFVubW91bnQnXG5dO1xuXG4vKipcbiAqIEJpbmRzIHRoZSBcInRoaXNcIiBhcmd1bWVudCBvZiBhbGwgZnVuY3Rpb25zIG9uIGEgY2xhc3MgaW5zdGFuY2UgdG8gdGhlIGluc3RhbmNlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIC0gY2xhc3MgaW5zdGFuY2UgKHR5cGljYWxseSBhIHJlYWN0IGNvbXBvbmVudClcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXV0b2JpbmQob2JqKSB7XG4gIGNvbnN0IHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaik7XG4gIGNvbnN0IHByb3BOYW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHByb3RvKTtcbiAgZm9yIChjb25zdCBrZXkgb2YgcHJvcE5hbWVzKSB7XG4gICAgaWYgKHR5cGVvZiBvYmpba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKCFQUkVERUZJTkVELmZpbmQobmFtZSA9PiBrZXkgPT09IG5hbWUpKSB7XG4gICAgICAgIG9ialtrZXldID0gb2JqW2tleV0uYmluZChvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19