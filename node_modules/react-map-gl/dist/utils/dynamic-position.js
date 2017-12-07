'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ANCHOR_POSITION = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.getDynamicPosition = getDynamicPosition;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ANCHOR_POSITION = exports.ANCHOR_POSITION = {
  top: { x: 0.5, y: 0 },
  'top-left': { x: 0, y: 0 },
  'top-right': { x: 1, y: 0 },
  bottom: { x: 0.5, y: 1 },
  'bottom-left': { x: 0, y: 1 },
  'bottom-right': { x: 1, y: 1 },
  left: { x: 0, y: 0.5 },
  right: { x: 1, y: 0.5 }
};

/**
 * Calculate the dynamic position for a popup to fit in a container.
 * @param {Number} x - x position of the anchor on screen
 * @param {Number} y - y position of the anchor on screen
 * @param {Number} width - width of the container
 * @param {Number} height - height of the container
 * @param {Number} padding - extra space from the edge in pixels
 * @param {Number} selfWidth - width of the popup
 * @param {Number} selfHeight - height of the popup
 * @param {String} anchor - type of the anchor, one of 'top', 'bottom',
    'left', 'right', 'top-left', 'top-right', 'bottom-left' , and  'bottom-right'
 * @returns {String} position - one of 'top', 'bottom',
    'left', 'right', 'top-left', 'top-right', 'bottom-left' , and  'bottom-right'
 */
function getDynamicPosition(_ref) {
  var x = _ref.x,
      y = _ref.y,
      width = _ref.width,
      height = _ref.height,
      selfWidth = _ref.selfWidth,
      selfHeight = _ref.selfHeight,
      anchor = _ref.anchor,
      _ref$padding = _ref.padding,
      padding = _ref$padding === undefined ? 0 : _ref$padding;
  var _ANCHOR_POSITION$anch = ANCHOR_POSITION[anchor],
      anchorX = _ANCHOR_POSITION$anch.x,
      anchorY = _ANCHOR_POSITION$anch.y;

  // anchorY: top - 0, center - 0.5, bottom - 1

  var top = y - anchorY * selfHeight;
  var bottom = top + selfHeight;
  // If needed, adjust anchorY at 0.5 step between [0, 1]
  var yStep = 0.5;

  if (top < padding) {
    // Top edge is outside, try move down
    while (top < padding && anchorY >= yStep) {
      anchorY -= yStep;
      top += yStep * selfHeight;
    }
  } else if (bottom > height - padding) {
    // bottom edge is outside, try move up
    while (bottom > height - padding && anchorY <= 1 - yStep) {
      anchorY += yStep;
      bottom -= yStep * selfHeight;
    }
  }

  // anchorX: left - 0, center - 0.5, right - 1
  var left = x - anchorX * selfWidth;
  var right = left + selfWidth;

  // If needed, adjust anchorX at 0.5 step between [0, 1]
  var xStep = 0.5;
  if (anchorY === 0.5) {
    // If y is centered, then x cannot also be centered
    anchorX = Math.floor(anchorX);
    xStep = 1;
  }

  if (left < padding) {
    // Left edge is outside, try move right
    while (left < padding && anchorX >= xStep) {
      anchorX -= xStep;
      left += xStep * selfWidth;
    }
  } else if (right > width - padding) {
    // Right edge is outside, try move left
    while (right > width - padding && anchorX <= 1 - xStep) {
      anchorX += xStep;
      right -= xStep * selfWidth;
    }
  }

  // Find the name of the new anchor position
  return (0, _keys2.default)(ANCHOR_POSITION).find(function (positionType) {
    var anchorPosition = ANCHOR_POSITION[positionType];
    return anchorPosition.x === anchorX && anchorPosition.y === anchorY;
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9keW5hbWljLXBvc2l0aW9uLmpzIl0sIm5hbWVzIjpbImdldER5bmFtaWNQb3NpdGlvbiIsIkFOQ0hPUl9QT1NJVElPTiIsInRvcCIsIngiLCJ5IiwiYm90dG9tIiwibGVmdCIsInJpZ2h0Iiwid2lkdGgiLCJoZWlnaHQiLCJzZWxmV2lkdGgiLCJzZWxmSGVpZ2h0IiwiYW5jaG9yIiwicGFkZGluZyIsImFuY2hvclgiLCJhbmNob3JZIiwieVN0ZXAiLCJ4U3RlcCIsIk1hdGgiLCJmbG9vciIsImZpbmQiLCJwb3NpdGlvblR5cGUiLCJhbmNob3JQb3NpdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7UUEwQmdCQSxrQixHQUFBQSxrQjs7OztBQXpCVCxJQUFNQyw0Q0FBa0I7QUFDN0JDLE9BQUssRUFBQ0MsR0FBRyxHQUFKLEVBQVNDLEdBQUcsQ0FBWixFQUR3QjtBQUU3QixjQUFZLEVBQUNELEdBQUcsQ0FBSixFQUFPQyxHQUFHLENBQVYsRUFGaUI7QUFHN0IsZUFBYSxFQUFDRCxHQUFHLENBQUosRUFBT0MsR0FBRyxDQUFWLEVBSGdCO0FBSTdCQyxVQUFRLEVBQUNGLEdBQUcsR0FBSixFQUFTQyxHQUFHLENBQVosRUFKcUI7QUFLN0IsaUJBQWUsRUFBQ0QsR0FBRyxDQUFKLEVBQU9DLEdBQUcsQ0FBVixFQUxjO0FBTTdCLGtCQUFnQixFQUFDRCxHQUFHLENBQUosRUFBT0MsR0FBRyxDQUFWLEVBTmE7QUFPN0JFLFFBQU0sRUFBQ0gsR0FBRyxDQUFKLEVBQU9DLEdBQUcsR0FBVixFQVB1QjtBQVE3QkcsU0FBTyxFQUFDSixHQUFHLENBQUosRUFBT0MsR0FBRyxHQUFWO0FBUnNCLENBQXhCOztBQVdQOzs7Ozs7Ozs7Ozs7OztBQWNPLFNBQVNKLGtCQUFULE9BTUo7QUFBQSxNQUxERyxDQUtDLFFBTERBLENBS0M7QUFBQSxNQUxFQyxDQUtGLFFBTEVBLENBS0Y7QUFBQSxNQUpESSxLQUlDLFFBSkRBLEtBSUM7QUFBQSxNQUpNQyxNQUlOLFFBSk1BLE1BSU47QUFBQSxNQUhEQyxTQUdDLFFBSERBLFNBR0M7QUFBQSxNQUhVQyxVQUdWLFFBSFVBLFVBR1Y7QUFBQSxNQUZEQyxNQUVDLFFBRkRBLE1BRUM7QUFBQSwwQkFEREMsT0FDQztBQUFBLE1BRERBLE9BQ0MsZ0NBRFMsQ0FDVDtBQUFBLDhCQUM4QlosZ0JBQWdCVyxNQUFoQixDQUQ5QjtBQUFBLE1BQ09FLE9BRFAseUJBQ0lYLENBREo7QUFBQSxNQUNtQlksT0FEbkIseUJBQ2dCWCxDQURoQjs7QUFHRDs7QUFDQSxNQUFJRixNQUFNRSxJQUFJVyxVQUFVSixVQUF4QjtBQUNBLE1BQUlOLFNBQVNILE1BQU1TLFVBQW5CO0FBQ0E7QUFDQSxNQUFNSyxRQUFRLEdBQWQ7O0FBRUEsTUFBSWQsTUFBTVcsT0FBVixFQUFtQjtBQUNqQjtBQUNBLFdBQU9YLE1BQU1XLE9BQU4sSUFBaUJFLFdBQVdDLEtBQW5DLEVBQTBDO0FBQ3hDRCxpQkFBV0MsS0FBWDtBQUNBZCxhQUFPYyxRQUFRTCxVQUFmO0FBQ0Q7QUFDRixHQU5ELE1BTU8sSUFBSU4sU0FBU0ksU0FBU0ksT0FBdEIsRUFBK0I7QUFDcEM7QUFDQSxXQUFPUixTQUFTSSxTQUFTSSxPQUFsQixJQUE2QkUsV0FBVyxJQUFJQyxLQUFuRCxFQUEwRDtBQUN4REQsaUJBQVdDLEtBQVg7QUFDQVgsZ0JBQVVXLFFBQVFMLFVBQWxCO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBLE1BQUlMLE9BQU9ILElBQUlXLFVBQVVKLFNBQXpCO0FBQ0EsTUFBSUgsUUFBUUQsT0FBT0ksU0FBbkI7O0FBRUE7QUFDQSxNQUFJTyxRQUFRLEdBQVo7QUFDQSxNQUFJRixZQUFZLEdBQWhCLEVBQXFCO0FBQ25CO0FBQ0FELGNBQVVJLEtBQUtDLEtBQUwsQ0FBV0wsT0FBWCxDQUFWO0FBQ0FHLFlBQVEsQ0FBUjtBQUNEOztBQUVELE1BQUlYLE9BQU9PLE9BQVgsRUFBb0I7QUFDbEI7QUFDQSxXQUFPUCxPQUFPTyxPQUFQLElBQWtCQyxXQUFXRyxLQUFwQyxFQUEyQztBQUN6Q0gsaUJBQVdHLEtBQVg7QUFDQVgsY0FBUVcsUUFBUVAsU0FBaEI7QUFDRDtBQUNGLEdBTkQsTUFNTyxJQUFJSCxRQUFRQyxRQUFRSyxPQUFwQixFQUE2QjtBQUNsQztBQUNBLFdBQU9OLFFBQVFDLFFBQVFLLE9BQWhCLElBQTJCQyxXQUFXLElBQUlHLEtBQWpELEVBQXdEO0FBQ3RESCxpQkFBV0csS0FBWDtBQUNBVixlQUFTVSxRQUFRUCxTQUFqQjtBQUNEO0FBQ0Y7O0FBRUQ7QUFDQSxTQUFPLG9CQUFZVCxlQUFaLEVBQTZCbUIsSUFBN0IsQ0FBa0MsVUFBQ0MsWUFBRCxFQUFrQjtBQUN6RCxRQUFNQyxpQkFBaUJyQixnQkFBZ0JvQixZQUFoQixDQUF2QjtBQUNBLFdBQU9DLGVBQWVuQixDQUFmLEtBQXFCVyxPQUFyQixJQUFnQ1EsZUFBZWxCLENBQWYsS0FBcUJXLE9BQTVEO0FBQ0QsR0FITSxDQUFQO0FBSUQiLCJmaWxlIjoiZHluYW1pYy1wb3NpdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuZXhwb3J0IGNvbnN0IEFOQ0hPUl9QT1NJVElPTiA9IHtcbiAgdG9wOiB7eDogMC41LCB5OiAwfSxcbiAgJ3RvcC1sZWZ0Jzoge3g6IDAsIHk6IDB9LFxuICAndG9wLXJpZ2h0Jzoge3g6IDEsIHk6IDB9LFxuICBib3R0b206IHt4OiAwLjUsIHk6IDF9LFxuICAnYm90dG9tLWxlZnQnOiB7eDogMCwgeTogMX0sXG4gICdib3R0b20tcmlnaHQnOiB7eDogMSwgeTogMX0sXG4gIGxlZnQ6IHt4OiAwLCB5OiAwLjV9LFxuICByaWdodDoge3g6IDEsIHk6IDAuNX1cbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlIHRoZSBkeW5hbWljIHBvc2l0aW9uIGZvciBhIHBvcHVwIHRvIGZpdCBpbiBhIGNvbnRhaW5lci5cbiAqIEBwYXJhbSB7TnVtYmVyfSB4IC0geCBwb3NpdGlvbiBvZiB0aGUgYW5jaG9yIG9uIHNjcmVlblxuICogQHBhcmFtIHtOdW1iZXJ9IHkgLSB5IHBvc2l0aW9uIG9mIHRoZSBhbmNob3Igb24gc2NyZWVuXG4gKiBAcGFyYW0ge051bWJlcn0gd2lkdGggLSB3aWR0aCBvZiB0aGUgY29udGFpbmVyXG4gKiBAcGFyYW0ge051bWJlcn0gaGVpZ2h0IC0gaGVpZ2h0IG9mIHRoZSBjb250YWluZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBwYWRkaW5nIC0gZXh0cmEgc3BhY2UgZnJvbSB0aGUgZWRnZSBpbiBwaXhlbHNcbiAqIEBwYXJhbSB7TnVtYmVyfSBzZWxmV2lkdGggLSB3aWR0aCBvZiB0aGUgcG9wdXBcbiAqIEBwYXJhbSB7TnVtYmVyfSBzZWxmSGVpZ2h0IC0gaGVpZ2h0IG9mIHRoZSBwb3B1cFxuICogQHBhcmFtIHtTdHJpbmd9IGFuY2hvciAtIHR5cGUgb2YgdGhlIGFuY2hvciwgb25lIG9mICd0b3AnLCAnYm90dG9tJyxcbiAgICAnbGVmdCcsICdyaWdodCcsICd0b3AtbGVmdCcsICd0b3AtcmlnaHQnLCAnYm90dG9tLWxlZnQnICwgYW5kICAnYm90dG9tLXJpZ2h0J1xuICogQHJldHVybnMge1N0cmluZ30gcG9zaXRpb24gLSBvbmUgb2YgJ3RvcCcsICdib3R0b20nLFxuICAgICdsZWZ0JywgJ3JpZ2h0JywgJ3RvcC1sZWZ0JywgJ3RvcC1yaWdodCcsICdib3R0b20tbGVmdCcgLCBhbmQgICdib3R0b20tcmlnaHQnXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREeW5hbWljUG9zaXRpb24oe1xuICB4LCB5LFxuICB3aWR0aCwgaGVpZ2h0LFxuICBzZWxmV2lkdGgsIHNlbGZIZWlnaHQsXG4gIGFuY2hvcixcbiAgcGFkZGluZyA9IDBcbn0pIHtcbiAgbGV0IHt4OiBhbmNob3JYLCB5OiBhbmNob3JZfSA9IEFOQ0hPUl9QT1NJVElPTlthbmNob3JdO1xuXG4gIC8vIGFuY2hvclk6IHRvcCAtIDAsIGNlbnRlciAtIDAuNSwgYm90dG9tIC0gMVxuICBsZXQgdG9wID0geSAtIGFuY2hvclkgKiBzZWxmSGVpZ2h0O1xuICBsZXQgYm90dG9tID0gdG9wICsgc2VsZkhlaWdodDtcbiAgLy8gSWYgbmVlZGVkLCBhZGp1c3QgYW5jaG9yWSBhdCAwLjUgc3RlcCBiZXR3ZWVuIFswLCAxXVxuICBjb25zdCB5U3RlcCA9IDAuNTtcblxuICBpZiAodG9wIDwgcGFkZGluZykge1xuICAgIC8vIFRvcCBlZGdlIGlzIG91dHNpZGUsIHRyeSBtb3ZlIGRvd25cbiAgICB3aGlsZSAodG9wIDwgcGFkZGluZyAmJiBhbmNob3JZID49IHlTdGVwKSB7XG4gICAgICBhbmNob3JZIC09IHlTdGVwO1xuICAgICAgdG9wICs9IHlTdGVwICogc2VsZkhlaWdodDtcbiAgICB9XG4gIH0gZWxzZSBpZiAoYm90dG9tID4gaGVpZ2h0IC0gcGFkZGluZykge1xuICAgIC8vIGJvdHRvbSBlZGdlIGlzIG91dHNpZGUsIHRyeSBtb3ZlIHVwXG4gICAgd2hpbGUgKGJvdHRvbSA+IGhlaWdodCAtIHBhZGRpbmcgJiYgYW5jaG9yWSA8PSAxIC0geVN0ZXApIHtcbiAgICAgIGFuY2hvclkgKz0geVN0ZXA7XG4gICAgICBib3R0b20gLT0geVN0ZXAgKiBzZWxmSGVpZ2h0O1xuICAgIH1cbiAgfVxuXG4gIC8vIGFuY2hvclg6IGxlZnQgLSAwLCBjZW50ZXIgLSAwLjUsIHJpZ2h0IC0gMVxuICBsZXQgbGVmdCA9IHggLSBhbmNob3JYICogc2VsZldpZHRoO1xuICBsZXQgcmlnaHQgPSBsZWZ0ICsgc2VsZldpZHRoO1xuXG4gIC8vIElmIG5lZWRlZCwgYWRqdXN0IGFuY2hvclggYXQgMC41IHN0ZXAgYmV0d2VlbiBbMCwgMV1cbiAgbGV0IHhTdGVwID0gMC41O1xuICBpZiAoYW5jaG9yWSA9PT0gMC41KSB7XG4gICAgLy8gSWYgeSBpcyBjZW50ZXJlZCwgdGhlbiB4IGNhbm5vdCBhbHNvIGJlIGNlbnRlcmVkXG4gICAgYW5jaG9yWCA9IE1hdGguZmxvb3IoYW5jaG9yWCk7XG4gICAgeFN0ZXAgPSAxO1xuICB9XG5cbiAgaWYgKGxlZnQgPCBwYWRkaW5nKSB7XG4gICAgLy8gTGVmdCBlZGdlIGlzIG91dHNpZGUsIHRyeSBtb3ZlIHJpZ2h0XG4gICAgd2hpbGUgKGxlZnQgPCBwYWRkaW5nICYmIGFuY2hvclggPj0geFN0ZXApIHtcbiAgICAgIGFuY2hvclggLT0geFN0ZXA7XG4gICAgICBsZWZ0ICs9IHhTdGVwICogc2VsZldpZHRoO1xuICAgIH1cbiAgfSBlbHNlIGlmIChyaWdodCA+IHdpZHRoIC0gcGFkZGluZykge1xuICAgIC8vIFJpZ2h0IGVkZ2UgaXMgb3V0c2lkZSwgdHJ5IG1vdmUgbGVmdFxuICAgIHdoaWxlIChyaWdodCA+IHdpZHRoIC0gcGFkZGluZyAmJiBhbmNob3JYIDw9IDEgLSB4U3RlcCkge1xuICAgICAgYW5jaG9yWCArPSB4U3RlcDtcbiAgICAgIHJpZ2h0IC09IHhTdGVwICogc2VsZldpZHRoO1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgdGhlIG5hbWUgb2YgdGhlIG5ldyBhbmNob3IgcG9zaXRpb25cbiAgcmV0dXJuIE9iamVjdC5rZXlzKEFOQ0hPUl9QT1NJVElPTikuZmluZCgocG9zaXRpb25UeXBlKSA9PiB7XG4gICAgY29uc3QgYW5jaG9yUG9zaXRpb24gPSBBTkNIT1JfUE9TSVRJT05bcG9zaXRpb25UeXBlXTtcbiAgICByZXR1cm4gYW5jaG9yUG9zaXRpb24ueCA9PT0gYW5jaG9yWCAmJiBhbmNob3JQb3NpdGlvbi55ID09PSBhbmNob3JZO1xuICB9KTtcbn1cbiJdfQ==