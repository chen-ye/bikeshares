function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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

/* eslint-disable no-console */
/* global console */
import assert from 'assert';

var cache = {};

function formatArgs(firstArg) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (typeof firstArg === 'string') {
    args.unshift('deck.gl ' + firstArg);
  } else {
    args.unshift(firstArg);
    args.unshift('deck.gl');
  }
  return args;
}

function log(priority, arg) {
  for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
    args[_key2 - 2] = arguments[_key2];
  }

  assert(Number.isFinite(priority), 'log priority must be a number');
  if (priority <= log.priority) {
    // Node doesn't have console.debug, but using it looks better in browser consoles
    args = formatArgs.apply(undefined, [arg].concat(_toConsumableArray(args)));
    if (console.debug) {
      var _console;

      (_console = console).debug.apply(_console, _toConsumableArray(args));
    } else {
      var _console2;

      (_console2 = console).info.apply(_console2, _toConsumableArray(args));
    }
  }
}

function once(priority, arg) {
  if (!cache[arg] && priority <= log.priority) {
    var _console3;

    for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
      args[_key3 - 2] = arguments[_key3];
    }

    (_console3 = console).warn.apply(_console3, _toConsumableArray(formatArgs.apply(undefined, [arg].concat(args))));
    cache[arg] = true;
  }
}

// Logs a message with a time
function time(priority, label) {
  assert(Number.isFinite(priority), 'log priority must be a number');
  if (priority <= log.priority) {
    // In case the platform doesn't have console.time
    if (console.time) {
      console.time(label);
    } else {
      console.info(label);
    }
  }
}

function timeEnd(priority, label) {
  assert(Number.isFinite(priority), 'log priority must be a number');
  if (priority <= log.priority) {
    // In case the platform doesn't have console.timeEnd
    if (console.timeEnd) {
      console.timeEnd(label);
    } else {
      console.info(label);
    }
  }
}

log.priority = 0;
log.log = log;
log.once = once;
log.time = time;
log.timeEnd = timeEnd;

export default log;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvdXRpbHMvbG9nLmpzIl0sIm5hbWVzIjpbImFzc2VydCIsImNhY2hlIiwiZm9ybWF0QXJncyIsImZpcnN0QXJnIiwiYXJncyIsInVuc2hpZnQiLCJsb2ciLCJwcmlvcml0eSIsImFyZyIsIk51bWJlciIsImlzRmluaXRlIiwiY29uc29sZSIsImRlYnVnIiwiaW5mbyIsIm9uY2UiLCJ3YXJuIiwidGltZSIsImxhYmVsIiwidGltZUVuZCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsT0FBT0EsTUFBUCxNQUFtQixRQUFuQjs7QUFFQSxJQUFNQyxRQUFRLEVBQWQ7O0FBRUEsU0FBU0MsVUFBVCxDQUFvQkMsUUFBcEIsRUFBdUM7QUFBQSxvQ0FBTkMsSUFBTTtBQUFOQSxRQUFNO0FBQUE7O0FBQ3JDLE1BQUksT0FBT0QsUUFBUCxLQUFvQixRQUF4QixFQUFrQztBQUNoQ0MsU0FBS0MsT0FBTCxjQUF3QkYsUUFBeEI7QUFDRCxHQUZELE1BRU87QUFDTEMsU0FBS0MsT0FBTCxDQUFhRixRQUFiO0FBQ0FDLFNBQUtDLE9BQUwsQ0FBYSxTQUFiO0FBQ0Q7QUFDRCxTQUFPRCxJQUFQO0FBQ0Q7O0FBRUQsU0FBU0UsR0FBVCxDQUFhQyxRQUFiLEVBQXVCQyxHQUF2QixFQUFxQztBQUFBLHFDQUFOSixJQUFNO0FBQU5BLFFBQU07QUFBQTs7QUFDbkNKLFNBQU9TLE9BQU9DLFFBQVAsQ0FBZ0JILFFBQWhCLENBQVAsRUFBa0MsK0JBQWxDO0FBQ0EsTUFBSUEsWUFBWUQsSUFBSUMsUUFBcEIsRUFBOEI7QUFDNUI7QUFDQUgsV0FBT0YsNkJBQVdNLEdBQVgsNEJBQW1CSixJQUFuQixHQUFQO0FBQ0EsUUFBSU8sUUFBUUMsS0FBWixFQUFtQjtBQUFBOztBQUNqQiwyQkFBUUEsS0FBUixvQ0FBaUJSLElBQWpCO0FBQ0QsS0FGRCxNQUVPO0FBQUE7O0FBQ0wsNEJBQVFTLElBQVIscUNBQWdCVCxJQUFoQjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRCxTQUFTVSxJQUFULENBQWNQLFFBQWQsRUFBd0JDLEdBQXhCLEVBQXNDO0FBQ3BDLE1BQUksQ0FBQ1AsTUFBTU8sR0FBTixDQUFELElBQWVELFlBQVlELElBQUlDLFFBQW5DLEVBQTZDO0FBQUE7O0FBQUEsdUNBRGZILElBQ2U7QUFEZkEsVUFDZTtBQUFBOztBQUMzQywwQkFBUVcsSUFBUixxQ0FBZ0JiLDZCQUFXTSxHQUFYLFNBQW1CSixJQUFuQixFQUFoQjtBQUNBSCxVQUFNTyxHQUFOLElBQWEsSUFBYjtBQUNEO0FBQ0Y7O0FBRUQ7QUFDQSxTQUFTUSxJQUFULENBQWNULFFBQWQsRUFBd0JVLEtBQXhCLEVBQStCO0FBQzdCakIsU0FBT1MsT0FBT0MsUUFBUCxDQUFnQkgsUUFBaEIsQ0FBUCxFQUFrQywrQkFBbEM7QUFDQSxNQUFJQSxZQUFZRCxJQUFJQyxRQUFwQixFQUE4QjtBQUM1QjtBQUNBLFFBQUlJLFFBQVFLLElBQVosRUFBa0I7QUFDaEJMLGNBQVFLLElBQVIsQ0FBYUMsS0FBYjtBQUNELEtBRkQsTUFFTztBQUNMTixjQUFRRSxJQUFSLENBQWFJLEtBQWI7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQsU0FBU0MsT0FBVCxDQUFpQlgsUUFBakIsRUFBMkJVLEtBQTNCLEVBQWtDO0FBQ2hDakIsU0FBT1MsT0FBT0MsUUFBUCxDQUFnQkgsUUFBaEIsQ0FBUCxFQUFrQywrQkFBbEM7QUFDQSxNQUFJQSxZQUFZRCxJQUFJQyxRQUFwQixFQUE4QjtBQUM1QjtBQUNBLFFBQUlJLFFBQVFPLE9BQVosRUFBcUI7QUFDbkJQLGNBQVFPLE9BQVIsQ0FBZ0JELEtBQWhCO0FBQ0QsS0FGRCxNQUVPO0FBQ0xOLGNBQVFFLElBQVIsQ0FBYUksS0FBYjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRFgsSUFBSUMsUUFBSixHQUFlLENBQWY7QUFDQUQsSUFBSUEsR0FBSixHQUFVQSxHQUFWO0FBQ0FBLElBQUlRLElBQUosR0FBV0EsSUFBWDtBQUNBUixJQUFJVSxJQUFKLEdBQVdBLElBQVg7QUFDQVYsSUFBSVksT0FBSixHQUFjQSxPQUFkOztBQUVBLGVBQWVaLEdBQWYiLCJmaWxlIjoibG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbi8qIGdsb2JhbCBjb25zb2xlICovXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IGNhY2hlID0ge307XG5cbmZ1bmN0aW9uIGZvcm1hdEFyZ3MoZmlyc3RBcmcsIC4uLmFyZ3MpIHtcbiAgaWYgKHR5cGVvZiBmaXJzdEFyZyA9PT0gJ3N0cmluZycpIHtcbiAgICBhcmdzLnVuc2hpZnQoYGRlY2suZ2wgJHtmaXJzdEFyZ31gKTtcbiAgfSBlbHNlIHtcbiAgICBhcmdzLnVuc2hpZnQoZmlyc3RBcmcpO1xuICAgIGFyZ3MudW5zaGlmdCgnZGVjay5nbCcpO1xuICB9XG4gIHJldHVybiBhcmdzO1xufVxuXG5mdW5jdGlvbiBsb2cocHJpb3JpdHksIGFyZywgLi4uYXJncykge1xuICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKHByaW9yaXR5KSwgJ2xvZyBwcmlvcml0eSBtdXN0IGJlIGEgbnVtYmVyJyk7XG4gIGlmIChwcmlvcml0eSA8PSBsb2cucHJpb3JpdHkpIHtcbiAgICAvLyBOb2RlIGRvZXNuJ3QgaGF2ZSBjb25zb2xlLmRlYnVnLCBidXQgdXNpbmcgaXQgbG9va3MgYmV0dGVyIGluIGJyb3dzZXIgY29uc29sZXNcbiAgICBhcmdzID0gZm9ybWF0QXJncyhhcmcsIC4uLmFyZ3MpO1xuICAgIGlmIChjb25zb2xlLmRlYnVnKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKC4uLmFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmluZm8oLi4uYXJncyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG9uY2UocHJpb3JpdHksIGFyZywgLi4uYXJncykge1xuICBpZiAoIWNhY2hlW2FyZ10gJiYgcHJpb3JpdHkgPD0gbG9nLnByaW9yaXR5KSB7XG4gICAgY29uc29sZS53YXJuKC4uLmZvcm1hdEFyZ3MoYXJnLCAuLi5hcmdzKSk7XG4gICAgY2FjaGVbYXJnXSA9IHRydWU7XG4gIH1cbn1cblxuLy8gTG9ncyBhIG1lc3NhZ2Ugd2l0aCBhIHRpbWVcbmZ1bmN0aW9uIHRpbWUocHJpb3JpdHksIGxhYmVsKSB7XG4gIGFzc2VydChOdW1iZXIuaXNGaW5pdGUocHJpb3JpdHkpLCAnbG9nIHByaW9yaXR5IG11c3QgYmUgYSBudW1iZXInKTtcbiAgaWYgKHByaW9yaXR5IDw9IGxvZy5wcmlvcml0eSkge1xuICAgIC8vIEluIGNhc2UgdGhlIHBsYXRmb3JtIGRvZXNuJ3QgaGF2ZSBjb25zb2xlLnRpbWVcbiAgICBpZiAoY29uc29sZS50aW1lKSB7XG4gICAgICBjb25zb2xlLnRpbWUobGFiZWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmluZm8obGFiZWwpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB0aW1lRW5kKHByaW9yaXR5LCBsYWJlbCkge1xuICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKHByaW9yaXR5KSwgJ2xvZyBwcmlvcml0eSBtdXN0IGJlIGEgbnVtYmVyJyk7XG4gIGlmIChwcmlvcml0eSA8PSBsb2cucHJpb3JpdHkpIHtcbiAgICAvLyBJbiBjYXNlIHRoZSBwbGF0Zm9ybSBkb2Vzbid0IGhhdmUgY29uc29sZS50aW1lRW5kXG4gICAgaWYgKGNvbnNvbGUudGltZUVuZCkge1xuICAgICAgY29uc29sZS50aW1lRW5kKGxhYmVsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5pbmZvKGxhYmVsKTtcbiAgICB9XG4gIH1cbn1cblxubG9nLnByaW9yaXR5ID0gMDtcbmxvZy5sb2cgPSBsb2c7XG5sb2cub25jZSA9IG9uY2U7XG5sb2cudGltZSA9IHRpbWU7XG5sb2cudGltZUVuZCA9IHRpbWVFbmQ7XG5cbmV4cG9ydCBkZWZhdWx0IGxvZztcbiJdfQ==