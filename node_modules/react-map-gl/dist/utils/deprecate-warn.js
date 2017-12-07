'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = checkDeprecatedProps;
// 'new' is optional
var DEPRECATED_PROPS = [{ old: 'onChangeViewport', new: 'onViewportChange' }, { old: 'perspectiveEnabled', new: 'dragRotate' }, { old: 'onHoverFeatures', new: 'onHover' }, { old: 'onClickFeatures', new: 'onClick' }];

function getDeprecatedText(name) {
  return 'react-map-gl: `' + name + '` is deprecated and will be removed in a later version.';
}

function getNewText(name) {
  return 'Use `' + name + '` instead.';
}

/**
 * Checks props object for any prop that is deprecated and insert a console
 * warning to the user. This will also print out the recommended new prop/API
 * if one exists.
 */
function checkDeprecatedProps() {
  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  /* eslint-disable no-console, no-undef */
  DEPRECATED_PROPS.forEach(function (depProp) {
    if (props.hasOwnProperty(depProp.old)) {
      var warnMessage = getDeprecatedText(depProp.old);
      if (depProp.new) {
        warnMessage = warnMessage + ' ' + getNewText(depProp.new);
      }
      console.warn(warnMessage);
    }
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9kZXByZWNhdGUtd2Fybi5qcyJdLCJuYW1lcyI6WyJjaGVja0RlcHJlY2F0ZWRQcm9wcyIsIkRFUFJFQ0FURURfUFJPUFMiLCJvbGQiLCJuZXciLCJnZXREZXByZWNhdGVkVGV4dCIsIm5hbWUiLCJnZXROZXdUZXh0IiwicHJvcHMiLCJmb3JFYWNoIiwiZGVwUHJvcCIsImhhc093blByb3BlcnR5Iiwid2Fybk1lc3NhZ2UiLCJjb25zb2xlIiwid2FybiJdLCJtYXBwaW5ncyI6Ijs7Ozs7a0JBcUJ3QkEsb0I7QUFyQnhCO0FBQ0EsSUFBTUMsbUJBQW1CLENBQ3ZCLEVBQUNDLEtBQUssa0JBQU4sRUFBMEJDLEtBQUssa0JBQS9CLEVBRHVCLEVBRXZCLEVBQUNELEtBQUssb0JBQU4sRUFBNEJDLEtBQUssWUFBakMsRUFGdUIsRUFHdkIsRUFBQ0QsS0FBSyxpQkFBTixFQUF5QkMsS0FBSyxTQUE5QixFQUh1QixFQUl2QixFQUFDRCxLQUFLLGlCQUFOLEVBQXlCQyxLQUFLLFNBQTlCLEVBSnVCLENBQXpCOztBQU9BLFNBQVNDLGlCQUFULENBQTJCQyxJQUEzQixFQUFpQztBQUMvQiw2QkFBMEJBLElBQTFCO0FBQ0Q7O0FBRUQsU0FBU0MsVUFBVCxDQUFvQkQsSUFBcEIsRUFBMEI7QUFDeEIsbUJBQWdCQSxJQUFoQjtBQUNEOztBQUVEOzs7OztBQUtlLFNBQVNMLG9CQUFULEdBQTBDO0FBQUEsTUFBWk8sS0FBWSx1RUFBSixFQUFJOztBQUN2RDtBQUNBTixtQkFBaUJPLE9BQWpCLENBQXlCLFVBQUNDLE9BQUQsRUFBYTtBQUNwQyxRQUFJRixNQUFNRyxjQUFOLENBQXFCRCxRQUFRUCxHQUE3QixDQUFKLEVBQXVDO0FBQ3JDLFVBQUlTLGNBQWNQLGtCQUFrQkssUUFBUVAsR0FBMUIsQ0FBbEI7QUFDQSxVQUFJTyxRQUFRTixHQUFaLEVBQWlCO0FBQ2ZRLHNCQUFpQkEsV0FBakIsU0FBZ0NMLFdBQVdHLFFBQVFOLEdBQW5CLENBQWhDO0FBQ0Q7QUFDRFMsY0FBUUMsSUFBUixDQUFhRixXQUFiO0FBQ0Q7QUFDRixHQVJEO0FBU0QiLCJmaWxlIjoiZGVwcmVjYXRlLXdhcm4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAnbmV3JyBpcyBvcHRpb25hbFxuY29uc3QgREVQUkVDQVRFRF9QUk9QUyA9IFtcbiAge29sZDogJ29uQ2hhbmdlVmlld3BvcnQnLCBuZXc6ICdvblZpZXdwb3J0Q2hhbmdlJ30sXG4gIHtvbGQ6ICdwZXJzcGVjdGl2ZUVuYWJsZWQnLCBuZXc6ICdkcmFnUm90YXRlJ30sXG4gIHtvbGQ6ICdvbkhvdmVyRmVhdHVyZXMnLCBuZXc6ICdvbkhvdmVyJ30sXG4gIHtvbGQ6ICdvbkNsaWNrRmVhdHVyZXMnLCBuZXc6ICdvbkNsaWNrJ31cbl07XG5cbmZ1bmN0aW9uIGdldERlcHJlY2F0ZWRUZXh0KG5hbWUpIHtcbiAgcmV0dXJuIGByZWFjdC1tYXAtZ2w6IFxcYCR7bmFtZX1cXGAgaXMgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIGEgbGF0ZXIgdmVyc2lvbi5gO1xufVxuXG5mdW5jdGlvbiBnZXROZXdUZXh0KG5hbWUpIHtcbiAgcmV0dXJuIGBVc2UgXFxgJHtuYW1lfVxcYCBpbnN0ZWFkLmA7XG59XG5cbi8qKlxuICogQ2hlY2tzIHByb3BzIG9iamVjdCBmb3IgYW55IHByb3AgdGhhdCBpcyBkZXByZWNhdGVkIGFuZCBpbnNlcnQgYSBjb25zb2xlXG4gKiB3YXJuaW5nIHRvIHRoZSB1c2VyLiBUaGlzIHdpbGwgYWxzbyBwcmludCBvdXQgdGhlIHJlY29tbWVuZGVkIG5ldyBwcm9wL0FQSVxuICogaWYgb25lIGV4aXN0cy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY2hlY2tEZXByZWNhdGVkUHJvcHMocHJvcHMgPSB7fSkge1xuICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlLCBuby11bmRlZiAqL1xuICBERVBSRUNBVEVEX1BST1BTLmZvckVhY2goKGRlcFByb3ApID0+IHtcbiAgICBpZiAocHJvcHMuaGFzT3duUHJvcGVydHkoZGVwUHJvcC5vbGQpKSB7XG4gICAgICBsZXQgd2Fybk1lc3NhZ2UgPSBnZXREZXByZWNhdGVkVGV4dChkZXBQcm9wLm9sZCk7XG4gICAgICBpZiAoZGVwUHJvcC5uZXcpIHtcbiAgICAgICAgd2Fybk1lc3NhZ2UgPSBgJHt3YXJuTWVzc2FnZX0gJHtnZXROZXdUZXh0KGRlcFByb3AubmV3KX1gO1xuICAgICAgfVxuICAgICAgY29uc29sZS53YXJuKHdhcm5NZXNzYWdlKTtcbiAgICB9XG4gIH0pO1xufVxuIl19