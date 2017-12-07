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

import { get, count } from '../../../lib/utils';

// Basic polygon support
//
// Handles simple and complex polygons
// Simple polygons are arrays of vertices, implicitly "closed"
// Complex polygons are arrays of simple polygons, with the first polygon
// representing the outer hull and other polygons representing holes

/**
 * Check if this is a non-nested polygon (i.e. the first element of the first element is a number)
 * @param {Array} polygon - either a complex or simple polygon
 * @return {Boolean} - true if the polygon is a simple polygon (i.e. not an array of polygons)
 */
export function isSimple(polygon) {
  return count(polygon) >= 1 && count(get(polygon, 0)) >= 2 && Number.isFinite(get(get(polygon, 0), 0));
}

/**
 * Normalize to ensure that all polygons in a list are complex - simplifies processing
 * @param {Array} polygon - either a complex or a simple polygon
 * @param {Object} opts
 * @param {Object} opts.dimensions - if 3, the coords will be padded with 0's if needed
 * @return {Array} - returns a complex polygons
 */
export function normalize(polygon) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$dimensions = _ref.dimensions,
      dimensions = _ref$dimensions === undefined ? 3 : _ref$dimensions;

  return isSimple(polygon) ? [polygon] : polygon;
}

/**
 * Check if this is a non-nested polygon (i.e. the first element of the first element is a number)
 * @param {Array} polygon - either a complex or simple polygon
 * @return {Boolean} - true if the polygon is a simple polygon (i.e. not an array of polygons)
 */
export function getVertexCount(polygon) {
  return isSimple(polygon) ? count(polygon) : polygon.reduce(function (length, simplePolygon) {
    return length + count(simplePolygon);
  }, 0);
}

// Return number of triangles needed to tesselate the polygon
export function getTriangleCount(polygon) {
  var triangleCount = 0;
  var first = true;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = normalize(polygon)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var simplePolygon = _step.value;

      var size = count(simplePolygon);
      if (first) {
        triangleCount += size >= 3 ? size - 2 : 0;
      } else {
        triangleCount += size + 1;
      }
      first = false;
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

  return triangleCount;
}

export function forEachVertex(polygon, visitor) {
  if (isSimple(polygon)) {
    polygon.forEach(visitor);
    return;
  }

  var vertexIndex = 0;
  polygon.forEach(function (simplePolygon) {
    simplePolygon.forEach(function (v, i, p) {
      return visitor(v, vertexIndex, polygon);
    });
    vertexIndex++;
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYXllcnMvY29yZS9zb2xpZC1wb2x5Z29uLWxheWVyL3BvbHlnb24uanMiXSwibmFtZXMiOlsiZ2V0IiwiY291bnQiLCJpc1NpbXBsZSIsInBvbHlnb24iLCJOdW1iZXIiLCJpc0Zpbml0ZSIsIm5vcm1hbGl6ZSIsImRpbWVuc2lvbnMiLCJnZXRWZXJ0ZXhDb3VudCIsInJlZHVjZSIsImxlbmd0aCIsInNpbXBsZVBvbHlnb24iLCJnZXRUcmlhbmdsZUNvdW50IiwidHJpYW5nbGVDb3VudCIsImZpcnN0Iiwic2l6ZSIsImZvckVhY2hWZXJ0ZXgiLCJ2aXNpdG9yIiwiZm9yRWFjaCIsInZlcnRleEluZGV4IiwidiIsImkiLCJwIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFRQSxHQUFSLEVBQWFDLEtBQWIsUUFBeUIsb0JBQXpCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7QUFLQSxPQUFPLFNBQVNDLFFBQVQsQ0FBa0JDLE9BQWxCLEVBQTJCO0FBQ2hDLFNBQU9GLE1BQU1FLE9BQU4sS0FBa0IsQ0FBbEIsSUFDTEYsTUFBTUQsSUFBSUcsT0FBSixFQUFhLENBQWIsQ0FBTixLQUEwQixDQURyQixJQUVMQyxPQUFPQyxRQUFQLENBQWdCTCxJQUFJQSxJQUFJRyxPQUFKLEVBQWEsQ0FBYixDQUFKLEVBQXFCLENBQXJCLENBQWhCLENBRkY7QUFHRDs7QUFFRDs7Ozs7OztBQU9BLE9BQU8sU0FBU0csU0FBVCxDQUFtQkgsT0FBbkIsRUFBbUQ7QUFBQSxpRkFBSixFQUFJO0FBQUEsNkJBQXRCSSxVQUFzQjtBQUFBLE1BQXRCQSxVQUFzQixtQ0FBVCxDQUFTOztBQUN4RCxTQUFPTCxTQUFTQyxPQUFULElBQW9CLENBQUNBLE9BQUQsQ0FBcEIsR0FBZ0NBLE9BQXZDO0FBQ0Q7O0FBRUQ7Ozs7O0FBS0EsT0FBTyxTQUFTSyxjQUFULENBQXdCTCxPQUF4QixFQUFpQztBQUN0QyxTQUFPRCxTQUFTQyxPQUFULElBQ0xGLE1BQU1FLE9BQU4sQ0FESyxHQUVMQSxRQUFRTSxNQUFSLENBQWUsVUFBQ0MsTUFBRCxFQUFTQyxhQUFUO0FBQUEsV0FBMkJELFNBQVNULE1BQU1VLGFBQU4sQ0FBcEM7QUFBQSxHQUFmLEVBQXlFLENBQXpFLENBRkY7QUFHRDs7QUFFRDtBQUNBLE9BQU8sU0FBU0MsZ0JBQVQsQ0FBMEJULE9BQTFCLEVBQW1DO0FBQ3hDLE1BQUlVLGdCQUFnQixDQUFwQjtBQUNBLE1BQUlDLFFBQVEsSUFBWjtBQUZ3QztBQUFBO0FBQUE7O0FBQUE7QUFHeEMseUJBQTRCUixVQUFVSCxPQUFWLENBQTVCLDhIQUFnRDtBQUFBLFVBQXJDUSxhQUFxQzs7QUFDOUMsVUFBTUksT0FBT2QsTUFBTVUsYUFBTixDQUFiO0FBQ0EsVUFBSUcsS0FBSixFQUFXO0FBQ1RELHlCQUFpQkUsUUFBUSxDQUFSLEdBQVlBLE9BQU8sQ0FBbkIsR0FBdUIsQ0FBeEM7QUFDRCxPQUZELE1BRU87QUFDTEYseUJBQWlCRSxPQUFPLENBQXhCO0FBQ0Q7QUFDREQsY0FBUSxLQUFSO0FBQ0Q7QUFYdUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFZeEMsU0FBT0QsYUFBUDtBQUNEOztBQUVELE9BQU8sU0FBU0csYUFBVCxDQUF1QmIsT0FBdkIsRUFBZ0NjLE9BQWhDLEVBQXlDO0FBQzlDLE1BQUlmLFNBQVNDLE9BQVQsQ0FBSixFQUF1QjtBQUNyQkEsWUFBUWUsT0FBUixDQUFnQkQsT0FBaEI7QUFDQTtBQUNEOztBQUVELE1BQUlFLGNBQWMsQ0FBbEI7QUFDQWhCLFVBQVFlLE9BQVIsQ0FBZ0IseUJBQWlCO0FBQy9CUCxrQkFBY08sT0FBZCxDQUFzQixVQUFDRSxDQUFELEVBQUlDLENBQUosRUFBT0MsQ0FBUDtBQUFBLGFBQWFMLFFBQVFHLENBQVIsRUFBV0QsV0FBWCxFQUF3QmhCLE9BQXhCLENBQWI7QUFBQSxLQUF0QjtBQUNBZ0I7QUFDRCxHQUhEO0FBSUQiLCJmaWxlIjoicG9seWdvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge2dldCwgY291bnR9IGZyb20gJy4uLy4uLy4uL2xpYi91dGlscyc7XG5cbi8vIEJhc2ljIHBvbHlnb24gc3VwcG9ydFxuLy9cbi8vIEhhbmRsZXMgc2ltcGxlIGFuZCBjb21wbGV4IHBvbHlnb25zXG4vLyBTaW1wbGUgcG9seWdvbnMgYXJlIGFycmF5cyBvZiB2ZXJ0aWNlcywgaW1wbGljaXRseSBcImNsb3NlZFwiXG4vLyBDb21wbGV4IHBvbHlnb25zIGFyZSBhcnJheXMgb2Ygc2ltcGxlIHBvbHlnb25zLCB3aXRoIHRoZSBmaXJzdCBwb2x5Z29uXG4vLyByZXByZXNlbnRpbmcgdGhlIG91dGVyIGh1bGwgYW5kIG90aGVyIHBvbHlnb25zIHJlcHJlc2VudGluZyBob2xlc1xuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgaXMgYSBub24tbmVzdGVkIHBvbHlnb24gKGkuZS4gdGhlIGZpcnN0IGVsZW1lbnQgb2YgdGhlIGZpcnN0IGVsZW1lbnQgaXMgYSBudW1iZXIpXG4gKiBAcGFyYW0ge0FycmF5fSBwb2x5Z29uIC0gZWl0aGVyIGEgY29tcGxleCBvciBzaW1wbGUgcG9seWdvblxuICogQHJldHVybiB7Qm9vbGVhbn0gLSB0cnVlIGlmIHRoZSBwb2x5Z29uIGlzIGEgc2ltcGxlIHBvbHlnb24gKGkuZS4gbm90IGFuIGFycmF5IG9mIHBvbHlnb25zKVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTaW1wbGUocG9seWdvbikge1xuICByZXR1cm4gY291bnQocG9seWdvbikgPj0gMSAmJlxuICAgIGNvdW50KGdldChwb2x5Z29uLCAwKSkgPj0gMiAmJlxuICAgIE51bWJlci5pc0Zpbml0ZShnZXQoZ2V0KHBvbHlnb24sIDApLCAwKSk7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIHRvIGVuc3VyZSB0aGF0IGFsbCBwb2x5Z29ucyBpbiBhIGxpc3QgYXJlIGNvbXBsZXggLSBzaW1wbGlmaWVzIHByb2Nlc3NpbmdcbiAqIEBwYXJhbSB7QXJyYXl9IHBvbHlnb24gLSBlaXRoZXIgYSBjb21wbGV4IG9yIGEgc2ltcGxlIHBvbHlnb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cy5kaW1lbnNpb25zIC0gaWYgMywgdGhlIGNvb3JkcyB3aWxsIGJlIHBhZGRlZCB3aXRoIDAncyBpZiBuZWVkZWRcbiAqIEByZXR1cm4ge0FycmF5fSAtIHJldHVybnMgYSBjb21wbGV4IHBvbHlnb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUocG9seWdvbiwge2RpbWVuc2lvbnMgPSAzfSA9IHt9KSB7XG4gIHJldHVybiBpc1NpbXBsZShwb2x5Z29uKSA/IFtwb2x5Z29uXSA6IHBvbHlnb247XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhpcyBpcyBhIG5vbi1uZXN0ZWQgcG9seWdvbiAoaS5lLiB0aGUgZmlyc3QgZWxlbWVudCBvZiB0aGUgZmlyc3QgZWxlbWVudCBpcyBhIG51bWJlcilcbiAqIEBwYXJhbSB7QXJyYXl9IHBvbHlnb24gLSBlaXRoZXIgYSBjb21wbGV4IG9yIHNpbXBsZSBwb2x5Z29uXG4gKiBAcmV0dXJuIHtCb29sZWFufSAtIHRydWUgaWYgdGhlIHBvbHlnb24gaXMgYSBzaW1wbGUgcG9seWdvbiAoaS5lLiBub3QgYW4gYXJyYXkgb2YgcG9seWdvbnMpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRWZXJ0ZXhDb3VudChwb2x5Z29uKSB7XG4gIHJldHVybiBpc1NpbXBsZShwb2x5Z29uKSA/XG4gICAgY291bnQocG9seWdvbikgOlxuICAgIHBvbHlnb24ucmVkdWNlKChsZW5ndGgsIHNpbXBsZVBvbHlnb24pID0+IGxlbmd0aCArIGNvdW50KHNpbXBsZVBvbHlnb24pLCAwKTtcbn1cblxuLy8gUmV0dXJuIG51bWJlciBvZiB0cmlhbmdsZXMgbmVlZGVkIHRvIHRlc3NlbGF0ZSB0aGUgcG9seWdvblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRyaWFuZ2xlQ291bnQocG9seWdvbikge1xuICBsZXQgdHJpYW5nbGVDb3VudCA9IDA7XG4gIGxldCBmaXJzdCA9IHRydWU7XG4gIGZvciAoY29uc3Qgc2ltcGxlUG9seWdvbiBvZiBub3JtYWxpemUocG9seWdvbikpIHtcbiAgICBjb25zdCBzaXplID0gY291bnQoc2ltcGxlUG9seWdvbik7XG4gICAgaWYgKGZpcnN0KSB7XG4gICAgICB0cmlhbmdsZUNvdW50ICs9IHNpemUgPj0gMyA/IHNpemUgLSAyIDogMDtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJpYW5nbGVDb3VudCArPSBzaXplICsgMTtcbiAgICB9XG4gICAgZmlyc3QgPSBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJpYW5nbGVDb3VudDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvckVhY2hWZXJ0ZXgocG9seWdvbiwgdmlzaXRvcikge1xuICBpZiAoaXNTaW1wbGUocG9seWdvbikpIHtcbiAgICBwb2x5Z29uLmZvckVhY2godmlzaXRvcik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbGV0IHZlcnRleEluZGV4ID0gMDtcbiAgcG9seWdvbi5mb3JFYWNoKHNpbXBsZVBvbHlnb24gPT4ge1xuICAgIHNpbXBsZVBvbHlnb24uZm9yRWFjaCgodiwgaSwgcCkgPT4gdmlzaXRvcih2LCB2ZXJ0ZXhJbmRleCwgcG9seWdvbikpO1xuICAgIHZlcnRleEluZGV4Kys7XG4gIH0pO1xufVxuIl19