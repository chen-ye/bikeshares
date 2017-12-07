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

/**
 * Flattens a nested array into a single level array,
 * or a single value into an array with one value
 * @example flatten([[1, [2]], [3], 4]) => [1, 2, 3, 4]
 * @example flatten(1) => [1]
 * @param {Array} array The array to flatten.
 * @param {Function} filter= - Optional predicate called on each `value` to
 *   determine if it should be included (pushed onto) the resulting array.
 * @param {Array} result=[] - Optional array to push value into
 * @return {Array} Returns the new flattened array (new array or `result` if provided)
 */
export function flatten(array) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$filter = _ref.filter,
      filter = _ref$filter === undefined ? function () {
    return true;
  } : _ref$filter,
      _ref$result = _ref.result,
      result = _ref$result === undefined ? [] : _ref$result;

  array = Array.isArray(array) ? array : [array];
  return flattenArray(array, filter, result);
}

// Deep flattens an array. Helper to `flatten`, see its parameters
function flattenArray(array, filter, result) {
  var index = -1;
  while (++index < array.length) {
    var value = array[index];
    if (Array.isArray(value)) {
      flattenArray(value, filter, result);
    } else if (filter(value)) {
      result.push(value);
    }
  }
  return result;
}

export function countVertices(nestedArray) {
  var count = 0;
  var index = -1;
  while (++index < nestedArray.length) {
    var value = nestedArray[index];
    if (Array.isArray(value) || ArrayBuffer.isView(value)) {
      count += countVertices(value);
    } else {
      count++;
    }
  }
  return count;
}

// Flattens nested array of vertices, padding third coordinate as needed
export function flattenVertices(nestedArray) {
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref2$result = _ref2.result,
      result = _ref2$result === undefined ? [] : _ref2$result,
      _ref2$dimensions = _ref2.dimensions,
      dimensions = _ref2$dimensions === undefined ? 3 : _ref2$dimensions;

  var index = -1;
  var vertexLength = 0;
  while (++index < nestedArray.length) {
    var value = nestedArray[index];
    if (Array.isArray(value) || ArrayBuffer.isView(value)) {
      flattenVertices(value, { result: result, dimensions: dimensions });
    } else {
      if (vertexLength < dimensions) {
        // eslint-disable-line
        result.push(value);
        vertexLength++;
      }
    }
  }
  // Add a third coordinate if needed
  if (vertexLength > 0 && vertexLength < dimensions) {
    result.push(0);
  }
  return result;
}

// Uses copyWithin to significantly speed up typed array value filling
export function fillArray(_ref3) {
  var target = _ref3.target,
      source = _ref3.source,
      _ref3$start = _ref3.start,
      start = _ref3$start === undefined ? 0 : _ref3$start,
      _ref3$count = _ref3.count,
      count = _ref3$count === undefined ? 1 : _ref3$count;

  var total = count * source.length;
  var copied = 0;
  for (var i = 0; i < source.length; ++i) {
    target[start + copied++] = source[i];
  }

  while (copied < total) {
    // If we have copied less than half, copy everything we got
    // else copy remaining in one operation
    if (copied < total - copied) {
      target.copyWithin(start + copied, start, start + copied);
      copied *= 2;
    } else {
      target.copyWithin(start + copied, start, start + total - copied);
      copied = total;
    }
  }

  return target;
}

// Flattens nested array of vertices, padding third coordinate as needed
/*
export function flattenTypedVertices(nestedArray, {
  result = [],
  Type = Float32Array,
  start = 0,
  dimensions = 3
} = {}) {
  let index = -1;
  let vertexLength = 0;
  while (++index < nestedArray.length) {
    const value = nestedArray[index];
    if (Array.isArray(value) || ArrayBuffer.isView(value)) {
      start = flattenTypedVertices(value, {result, start, dimensions});
    } else {
      if (vertexLength < dimensions) { // eslint-disable-line
        result[start++] = value;
        vertexLength++;
      }
    }
  }
  // Add a third coordinate if needed
  if (vertexLength > 0 && vertexLength < dimensions) {
    result[start++] = 0;
  }
  return start;
}
*/
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvdXRpbHMvZmxhdHRlbi5qcyJdLCJuYW1lcyI6WyJmbGF0dGVuIiwiYXJyYXkiLCJmaWx0ZXIiLCJyZXN1bHQiLCJBcnJheSIsImlzQXJyYXkiLCJmbGF0dGVuQXJyYXkiLCJpbmRleCIsImxlbmd0aCIsInZhbHVlIiwicHVzaCIsImNvdW50VmVydGljZXMiLCJuZXN0ZWRBcnJheSIsImNvdW50IiwiQXJyYXlCdWZmZXIiLCJpc1ZpZXciLCJmbGF0dGVuVmVydGljZXMiLCJkaW1lbnNpb25zIiwidmVydGV4TGVuZ3RoIiwiZmlsbEFycmF5IiwidGFyZ2V0Iiwic291cmNlIiwic3RhcnQiLCJ0b3RhbCIsImNvcGllZCIsImkiLCJjb3B5V2l0aGluIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7QUFXQSxPQUFPLFNBQVNBLE9BQVQsQ0FBaUJDLEtBQWpCLEVBR0M7QUFBQSxpRkFBSixFQUFJO0FBQUEseUJBRk5DLE1BRU07QUFBQSxNQUZOQSxNQUVNLCtCQUZHO0FBQUEsV0FBTSxJQUFOO0FBQUEsR0FFSDtBQUFBLHlCQUROQyxNQUNNO0FBQUEsTUFETkEsTUFDTSwrQkFERyxFQUNIOztBQUNORixVQUFRRyxNQUFNQyxPQUFOLENBQWNKLEtBQWQsSUFBdUJBLEtBQXZCLEdBQStCLENBQUNBLEtBQUQsQ0FBdkM7QUFDQSxTQUFPSyxhQUFhTCxLQUFiLEVBQW9CQyxNQUFwQixFQUE0QkMsTUFBNUIsQ0FBUDtBQUNEOztBQUVEO0FBQ0EsU0FBU0csWUFBVCxDQUFzQkwsS0FBdEIsRUFBNkJDLE1BQTdCLEVBQXFDQyxNQUFyQyxFQUE2QztBQUMzQyxNQUFJSSxRQUFRLENBQUMsQ0FBYjtBQUNBLFNBQU8sRUFBRUEsS0FBRixHQUFVTixNQUFNTyxNQUF2QixFQUErQjtBQUM3QixRQUFNQyxRQUFRUixNQUFNTSxLQUFOLENBQWQ7QUFDQSxRQUFJSCxNQUFNQyxPQUFOLENBQWNJLEtBQWQsQ0FBSixFQUEwQjtBQUN4QkgsbUJBQWFHLEtBQWIsRUFBb0JQLE1BQXBCLEVBQTRCQyxNQUE1QjtBQUNELEtBRkQsTUFFTyxJQUFJRCxPQUFPTyxLQUFQLENBQUosRUFBbUI7QUFDeEJOLGFBQU9PLElBQVAsQ0FBWUQsS0FBWjtBQUNEO0FBQ0Y7QUFDRCxTQUFPTixNQUFQO0FBQ0Q7O0FBRUQsT0FBTyxTQUFTUSxhQUFULENBQXVCQyxXQUF2QixFQUFvQztBQUN6QyxNQUFJQyxRQUFRLENBQVo7QUFDQSxNQUFJTixRQUFRLENBQUMsQ0FBYjtBQUNBLFNBQU8sRUFBRUEsS0FBRixHQUFVSyxZQUFZSixNQUE3QixFQUFxQztBQUNuQyxRQUFNQyxRQUFRRyxZQUFZTCxLQUFaLENBQWQ7QUFDQSxRQUFJSCxNQUFNQyxPQUFOLENBQWNJLEtBQWQsS0FBd0JLLFlBQVlDLE1BQVosQ0FBbUJOLEtBQW5CLENBQTVCLEVBQXVEO0FBQ3JESSxlQUFTRixjQUFjRixLQUFkLENBQVQ7QUFDRCxLQUZELE1BRU87QUFDTEk7QUFDRDtBQUNGO0FBQ0QsU0FBT0EsS0FBUDtBQUNEOztBQUVEO0FBQ0EsT0FBTyxTQUFTRyxlQUFULENBQXlCSixXQUF6QixFQUEwRTtBQUFBLGtGQUFKLEVBQUk7QUFBQSwyQkFBbkNULE1BQW1DO0FBQUEsTUFBbkNBLE1BQW1DLGdDQUExQixFQUEwQjtBQUFBLCtCQUF0QmMsVUFBc0I7QUFBQSxNQUF0QkEsVUFBc0Isb0NBQVQsQ0FBUzs7QUFDL0UsTUFBSVYsUUFBUSxDQUFDLENBQWI7QUFDQSxNQUFJVyxlQUFlLENBQW5CO0FBQ0EsU0FBTyxFQUFFWCxLQUFGLEdBQVVLLFlBQVlKLE1BQTdCLEVBQXFDO0FBQ25DLFFBQU1DLFFBQVFHLFlBQVlMLEtBQVosQ0FBZDtBQUNBLFFBQUlILE1BQU1DLE9BQU4sQ0FBY0ksS0FBZCxLQUF3QkssWUFBWUMsTUFBWixDQUFtQk4sS0FBbkIsQ0FBNUIsRUFBdUQ7QUFDckRPLHNCQUFnQlAsS0FBaEIsRUFBdUIsRUFBQ04sY0FBRCxFQUFTYyxzQkFBVCxFQUF2QjtBQUNELEtBRkQsTUFFTztBQUNMLFVBQUlDLGVBQWVELFVBQW5CLEVBQStCO0FBQUU7QUFDL0JkLGVBQU9PLElBQVAsQ0FBWUQsS0FBWjtBQUNBUztBQUNEO0FBQ0Y7QUFDRjtBQUNEO0FBQ0EsTUFBSUEsZUFBZSxDQUFmLElBQW9CQSxlQUFlRCxVQUF2QyxFQUFtRDtBQUNqRGQsV0FBT08sSUFBUCxDQUFZLENBQVo7QUFDRDtBQUNELFNBQU9QLE1BQVA7QUFDRDs7QUFFRDtBQUNBLE9BQU8sU0FBU2dCLFNBQVQsUUFBMkQ7QUFBQSxNQUF2Q0MsTUFBdUMsU0FBdkNBLE1BQXVDO0FBQUEsTUFBL0JDLE1BQStCLFNBQS9CQSxNQUErQjtBQUFBLDBCQUF2QkMsS0FBdUI7QUFBQSxNQUF2QkEsS0FBdUIsK0JBQWYsQ0FBZTtBQUFBLDBCQUFaVCxLQUFZO0FBQUEsTUFBWkEsS0FBWSwrQkFBSixDQUFJOztBQUNoRSxNQUFNVSxRQUFRVixRQUFRUSxPQUFPYixNQUE3QjtBQUNBLE1BQUlnQixTQUFTLENBQWI7QUFDQSxPQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSUosT0FBT2IsTUFBM0IsRUFBbUMsRUFBRWlCLENBQXJDLEVBQXdDO0FBQ3RDTCxXQUFPRSxRQUFRRSxRQUFmLElBQTJCSCxPQUFPSSxDQUFQLENBQTNCO0FBQ0Q7O0FBRUQsU0FBT0QsU0FBU0QsS0FBaEIsRUFBdUI7QUFDckI7QUFDQTtBQUNBLFFBQUlDLFNBQVNELFFBQVFDLE1BQXJCLEVBQTZCO0FBQzNCSixhQUFPTSxVQUFQLENBQWtCSixRQUFRRSxNQUExQixFQUFrQ0YsS0FBbEMsRUFBeUNBLFFBQVFFLE1BQWpEO0FBQ0FBLGdCQUFVLENBQVY7QUFDRCxLQUhELE1BR087QUFDTEosYUFBT00sVUFBUCxDQUFrQkosUUFBUUUsTUFBMUIsRUFBa0NGLEtBQWxDLEVBQXlDQSxRQUFRQyxLQUFSLEdBQWdCQyxNQUF6RDtBQUNBQSxlQUFTRCxLQUFUO0FBQ0Q7QUFDRjs7QUFFRCxTQUFPSCxNQUFQO0FBQ0Q7O0FBRUQ7QUFDQSIsImZpbGUiOiJmbGF0dGVuLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8qKlxuICogRmxhdHRlbnMgYSBuZXN0ZWQgYXJyYXkgaW50byBhIHNpbmdsZSBsZXZlbCBhcnJheSxcbiAqIG9yIGEgc2luZ2xlIHZhbHVlIGludG8gYW4gYXJyYXkgd2l0aCBvbmUgdmFsdWVcbiAqIEBleGFtcGxlIGZsYXR0ZW4oW1sxLCBbMl1dLCBbM10sIDRdKSA9PiBbMSwgMiwgMywgNF1cbiAqIEBleGFtcGxlIGZsYXR0ZW4oMSkgPT4gWzFdXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gZmxhdHRlbi5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZpbHRlcj0gLSBPcHRpb25hbCBwcmVkaWNhdGUgY2FsbGVkIG9uIGVhY2ggYHZhbHVlYCB0b1xuICogICBkZXRlcm1pbmUgaWYgaXQgc2hvdWxkIGJlIGluY2x1ZGVkIChwdXNoZWQgb250bykgdGhlIHJlc3VsdGluZyBhcnJheS5cbiAqIEBwYXJhbSB7QXJyYXl9IHJlc3VsdD1bXSAtIE9wdGlvbmFsIGFycmF5IHRvIHB1c2ggdmFsdWUgaW50b1xuICogQHJldHVybiB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBmbGF0dGVuZWQgYXJyYXkgKG5ldyBhcnJheSBvciBgcmVzdWx0YCBpZiBwcm92aWRlZClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsYXR0ZW4oYXJyYXksIHtcbiAgZmlsdGVyID0gKCkgPT4gdHJ1ZSxcbiAgcmVzdWx0ID0gW11cbn0gPSB7fSkge1xuICBhcnJheSA9IEFycmF5LmlzQXJyYXkoYXJyYXkpID8gYXJyYXkgOiBbYXJyYXldO1xuICByZXR1cm4gZmxhdHRlbkFycmF5KGFycmF5LCBmaWx0ZXIsIHJlc3VsdCk7XG59XG5cbi8vIERlZXAgZmxhdHRlbnMgYW4gYXJyYXkuIEhlbHBlciB0byBgZmxhdHRlbmAsIHNlZSBpdHMgcGFyYW1ldGVyc1xuZnVuY3Rpb24gZmxhdHRlbkFycmF5KGFycmF5LCBmaWx0ZXIsIHJlc3VsdCkge1xuICBsZXQgaW5kZXggPSAtMTtcbiAgd2hpbGUgKCsraW5kZXggPCBhcnJheS5sZW5ndGgpIHtcbiAgICBjb25zdCB2YWx1ZSA9IGFycmF5W2luZGV4XTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIGZsYXR0ZW5BcnJheSh2YWx1ZSwgZmlsdGVyLCByZXN1bHQpO1xuICAgIH0gZWxzZSBpZiAoZmlsdGVyKHZhbHVlKSkge1xuICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY291bnRWZXJ0aWNlcyhuZXN0ZWRBcnJheSkge1xuICBsZXQgY291bnQgPSAwO1xuICBsZXQgaW5kZXggPSAtMTtcbiAgd2hpbGUgKCsraW5kZXggPCBuZXN0ZWRBcnJheS5sZW5ndGgpIHtcbiAgICBjb25zdCB2YWx1ZSA9IG5lc3RlZEFycmF5W2luZGV4XTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHwgQXJyYXlCdWZmZXIuaXNWaWV3KHZhbHVlKSkge1xuICAgICAgY291bnQgKz0gY291bnRWZXJ0aWNlcyh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvdW50Kys7XG4gICAgfVxuICB9XG4gIHJldHVybiBjb3VudDtcbn1cblxuLy8gRmxhdHRlbnMgbmVzdGVkIGFycmF5IG9mIHZlcnRpY2VzLCBwYWRkaW5nIHRoaXJkIGNvb3JkaW5hdGUgYXMgbmVlZGVkXG5leHBvcnQgZnVuY3Rpb24gZmxhdHRlblZlcnRpY2VzKG5lc3RlZEFycmF5LCB7cmVzdWx0ID0gW10sIGRpbWVuc2lvbnMgPSAzfSA9IHt9KSB7XG4gIGxldCBpbmRleCA9IC0xO1xuICBsZXQgdmVydGV4TGVuZ3RoID0gMDtcbiAgd2hpbGUgKCsraW5kZXggPCBuZXN0ZWRBcnJheS5sZW5ndGgpIHtcbiAgICBjb25zdCB2YWx1ZSA9IG5lc3RlZEFycmF5W2luZGV4XTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHwgQXJyYXlCdWZmZXIuaXNWaWV3KHZhbHVlKSkge1xuICAgICAgZmxhdHRlblZlcnRpY2VzKHZhbHVlLCB7cmVzdWx0LCBkaW1lbnNpb25zfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh2ZXJ0ZXhMZW5ndGggPCBkaW1lbnNpb25zKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICB2ZXJ0ZXhMZW5ndGgrKztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gQWRkIGEgdGhpcmQgY29vcmRpbmF0ZSBpZiBuZWVkZWRcbiAgaWYgKHZlcnRleExlbmd0aCA+IDAgJiYgdmVydGV4TGVuZ3RoIDwgZGltZW5zaW9ucykge1xuICAgIHJlc3VsdC5wdXNoKDApO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIFVzZXMgY29weVdpdGhpbiB0byBzaWduaWZpY2FudGx5IHNwZWVkIHVwIHR5cGVkIGFycmF5IHZhbHVlIGZpbGxpbmdcbmV4cG9ydCBmdW5jdGlvbiBmaWxsQXJyYXkoe3RhcmdldCwgc291cmNlLCBzdGFydCA9IDAsIGNvdW50ID0gMX0pIHtcbiAgY29uc3QgdG90YWwgPSBjb3VudCAqIHNvdXJjZS5sZW5ndGg7XG4gIGxldCBjb3BpZWQgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHNvdXJjZS5sZW5ndGg7ICsraSkge1xuICAgIHRhcmdldFtzdGFydCArIGNvcGllZCsrXSA9IHNvdXJjZVtpXTtcbiAgfVxuXG4gIHdoaWxlIChjb3BpZWQgPCB0b3RhbCkge1xuICAgIC8vIElmIHdlIGhhdmUgY29waWVkIGxlc3MgdGhhbiBoYWxmLCBjb3B5IGV2ZXJ5dGhpbmcgd2UgZ290XG4gICAgLy8gZWxzZSBjb3B5IHJlbWFpbmluZyBpbiBvbmUgb3BlcmF0aW9uXG4gICAgaWYgKGNvcGllZCA8IHRvdGFsIC0gY29waWVkKSB7XG4gICAgICB0YXJnZXQuY29weVdpdGhpbihzdGFydCArIGNvcGllZCwgc3RhcnQsIHN0YXJ0ICsgY29waWVkKTtcbiAgICAgIGNvcGllZCAqPSAyO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YXJnZXQuY29weVdpdGhpbihzdGFydCArIGNvcGllZCwgc3RhcnQsIHN0YXJ0ICsgdG90YWwgLSBjb3BpZWQpO1xuICAgICAgY29waWVkID0gdG90YWw7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuLy8gRmxhdHRlbnMgbmVzdGVkIGFycmF5IG9mIHZlcnRpY2VzLCBwYWRkaW5nIHRoaXJkIGNvb3JkaW5hdGUgYXMgbmVlZGVkXG4vKlxuZXhwb3J0IGZ1bmN0aW9uIGZsYXR0ZW5UeXBlZFZlcnRpY2VzKG5lc3RlZEFycmF5LCB7XG4gIHJlc3VsdCA9IFtdLFxuICBUeXBlID0gRmxvYXQzMkFycmF5LFxuICBzdGFydCA9IDAsXG4gIGRpbWVuc2lvbnMgPSAzXG59ID0ge30pIHtcbiAgbGV0IGluZGV4ID0gLTE7XG4gIGxldCB2ZXJ0ZXhMZW5ndGggPSAwO1xuICB3aGlsZSAoKytpbmRleCA8IG5lc3RlZEFycmF5Lmxlbmd0aCkge1xuICAgIGNvbnN0IHZhbHVlID0gbmVzdGVkQXJyYXlbaW5kZXhdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSB8fCBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsdWUpKSB7XG4gICAgICBzdGFydCA9IGZsYXR0ZW5UeXBlZFZlcnRpY2VzKHZhbHVlLCB7cmVzdWx0LCBzdGFydCwgZGltZW5zaW9uc30pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodmVydGV4TGVuZ3RoIDwgZGltZW5zaW9ucykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgIHJlc3VsdFtzdGFydCsrXSA9IHZhbHVlO1xuICAgICAgICB2ZXJ0ZXhMZW5ndGgrKztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gQWRkIGEgdGhpcmQgY29vcmRpbmF0ZSBpZiBuZWVkZWRcbiAgaWYgKHZlcnRleExlbmd0aCA+IDAgJiYgdmVydGV4TGVuZ3RoIDwgZGltZW5zaW9ucykge1xuICAgIHJlc3VsdFtzdGFydCsrXSA9IDA7XG4gIH1cbiAgcmV0dXJuIHN0YXJ0O1xufVxuKi9cbiJdfQ==