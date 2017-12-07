'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

exports.diffSources = diffSources;
exports.diffLayers = diffLayers;
exports.default = diffStyle;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint-disable max-statements */
function diffSources(prevStyle, nextStyle) {
  var prevSources = prevStyle.get('sources');
  var nextSources = nextStyle.get('sources');
  var enter = [];
  var update = [];
  var exit = [];
  var prevIds = prevSources.keySeq().toArray();
  var nextIds = nextSources.keySeq().toArray();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)(prevIds), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var id = _step.value;

      var nextSource = nextSources.get(id);
      if (nextSource) {
        if (!nextSource.equals(prevSources.get(id))) {
          update.push({ id: id, source: nextSources.get(id) });
        }
      } else {
        exit.push({ id: id, source: prevSources.get(id) });
      }
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

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = (0, _getIterator3.default)(nextIds), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _id = _step2.value;

      var prevSource = prevSources.get(_id);
      if (!prevSource) {
        enter.push({ id: _id, source: nextSources.get(_id) });
      }
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

  return { enter: enter, update: update, exit: exit };
}
/* eslint-enable max-statements */

function diffLayers(prevStyle, nextStyle) {
  var prevLayers = prevStyle.get('layers');
  var nextLayers = nextStyle.get('layers');
  var updates = [];
  var exiting = [];
  var prevMap = {};
  var nextMap = {};
  nextLayers.forEach(function (layer, index) {
    var id = layer.get('id');
    var layerImBehind = nextLayers.get(index + 1);
    nextMap[id] = {
      layer: layer,
      id: id,
      // The `id` of the layer before this one.
      before: layerImBehind ? layerImBehind.get('id') : null,
      enter: true
    };
  });
  prevLayers.forEach(function (layer, index) {
    var id = layer.get('id');
    var layerImBehind = prevLayers.get(index + 1);
    prevMap[id] = {
      layer: layer,
      id: id,
      before: layerImBehind ? layerImBehind.get('id') : null
    };
    if (nextMap[id]) {
      // Not a new layer.
      nextMap[id].enter = false;
    } else {
      // This layer is being removed.
      exiting.push(prevMap[id]);
    }
  });
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = (0, _getIterator3.default)(nextLayers.reverse()), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var layer = _step3.value;

      var id = layer.get('id');
      if (!prevMap[id] || !prevMap[id].layer.equals(nextMap[id].layer) || prevMap[id].before !== nextMap[id].before) {
        // This layer is being changed.
        updates.push(nextMap[id]);
      }
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

  return { updates: updates, exiting: exiting };
}

function diffStyle(prevStyle, nextStyle) {
  return {
    sourcesDiff: diffSources(prevStyle, nextStyle),
    layersDiff: diffLayers(prevStyle, nextStyle)
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9kaWZmLXN0eWxlcy5qcyJdLCJuYW1lcyI6WyJkaWZmU291cmNlcyIsImRpZmZMYXllcnMiLCJkaWZmU3R5bGUiLCJwcmV2U3R5bGUiLCJuZXh0U3R5bGUiLCJwcmV2U291cmNlcyIsImdldCIsIm5leHRTb3VyY2VzIiwiZW50ZXIiLCJ1cGRhdGUiLCJleGl0IiwicHJldklkcyIsImtleVNlcSIsInRvQXJyYXkiLCJuZXh0SWRzIiwiaWQiLCJuZXh0U291cmNlIiwiZXF1YWxzIiwicHVzaCIsInNvdXJjZSIsInByZXZTb3VyY2UiLCJwcmV2TGF5ZXJzIiwibmV4dExheWVycyIsInVwZGF0ZXMiLCJleGl0aW5nIiwicHJldk1hcCIsIm5leHRNYXAiLCJmb3JFYWNoIiwibGF5ZXIiLCJpbmRleCIsImxheWVySW1CZWhpbmQiLCJiZWZvcmUiLCJyZXZlcnNlIiwic291cmNlc0RpZmYiLCJsYXllcnNEaWZmIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O1FBcUJnQkEsVyxHQUFBQSxXO1FBNEJBQyxVLEdBQUFBLFU7a0JBZ0RRQyxTOzs7O0FBakd4Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNPLFNBQVNGLFdBQVQsQ0FBcUJHLFNBQXJCLEVBQWdDQyxTQUFoQyxFQUEyQztBQUNoRCxNQUFNQyxjQUFjRixVQUFVRyxHQUFWLENBQWMsU0FBZCxDQUFwQjtBQUNBLE1BQU1DLGNBQWNILFVBQVVFLEdBQVYsQ0FBYyxTQUFkLENBQXBCO0FBQ0EsTUFBTUUsUUFBUSxFQUFkO0FBQ0EsTUFBTUMsU0FBUyxFQUFmO0FBQ0EsTUFBTUMsT0FBTyxFQUFiO0FBQ0EsTUFBTUMsVUFBVU4sWUFBWU8sTUFBWixHQUFxQkMsT0FBckIsRUFBaEI7QUFDQSxNQUFNQyxVQUFVUCxZQUFZSyxNQUFaLEdBQXFCQyxPQUFyQixFQUFoQjtBQVBnRDtB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QUFrQy9DLHFEQUFvQk8sV0FBV1UsT0FBWCxFQUFwQixpSEFBMEM7QUFBQSxVQUEvQkosS0FBK0I7O0FBQ3hDLFVBQU1iLEtBQUthLE1BQU10QixHQUFOLENBQVUsSUFBVixDQUFYO0FBQ0EsVUFDRSxDQUFDbUIsUUFBUVYsRUFBUixDQUFELElBQ0EsQ0FBQ1UsUUFBUVYsRUFBUixFQUFZYSxLQUFaLENBQWtCWCxNQUFsQixDQUF5QlMsUUFBUVgsRUFBUixFQUFZYSxLQUFyQyxDQURELElBRUFILFFBQVFWLEVBQVIsRUFBWWdCLE1BQVosS0FBdUJMLFFBQVFYLEVBQVIsRUFBWWdCLE1BSHJDLEVBSUU7QUFDQTtBQUNBUixnQkFBUUwsSUFBUixDQUFhUSxRQUFRWCxFQUFSLENBQWI7QUFDRDtBQUNGO0FBNUM4QztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQTZDL0MsU0FBTyxFQUFDUSxnQkFBRCxFQUFVQyxnQkFBVixFQUFQO0FBQ0Q7O0FBRWMsU0FBU3RCLFNBQVQsQ0FBbUJDLFNBQW5CLEVBQThCQyxTQUE5QixFQUF5QztBQUN0RCxTQUFPO0FBQ0w2QixpQkFBYWpDLFlBQVlHLFNBQVosRUFBdUJDLFNBQXZCLENBRFI7QUFFTDhCLGdCQUFZakMsV0FBV0UsU0FBWCxFQUFzQkMsU0FBdEI7QUFGUCxHQUFQO0FBSUQiLCJmaWxlIjoiZGlmZi1zdHlsZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cblxuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpZmZTb3VyY2VzKHByZXZTdHlsZSwgbmV4dFN0eWxlKSB7XG4gIGNvbnN0IHByZXZTb3VyY2VzID0gcHJldlN0eWxlLmdldCgnc291cmNlcycpO1xuICBjb25zdCBuZXh0U291cmNlcyA9IG5leHRTdHlsZS5nZXQoJ3NvdXJjZXMnKTtcbiAgY29uc3QgZW50ZXIgPSBbXTtcbiAgY29uc3QgdXBkYXRlID0gW107XG4gIGNvbnN0IGV4aXQgPSBbXTtcbiAgY29uc3QgcHJldklkcyA9IHByZXZTb3VyY2VzLmtleVNlcSgpLnRvQXJyYXkoKTtcbiAgY29uc3QgbmV4dElkcyA9IG5leHRTb3VyY2VzLmtleVNlcSgpLnRvQXJyYXkoKTtcbiAgZm9yIChjb25zdCBpZCBvZiBwcmV2SWRzKSB7XG4gICAgY29uc3QgbmV4dFNvdXJjZSA9IG5leHRTb3VyY2VzLmdldChpZCk7XG4gICAgaWYgKG5leHRTb3VyY2UpIHtcbiAgICAgIGlmICghbmV4dFNvdXJjZS5lcXVhbHMocHJldlNvdXJjZXMuZ2V0KGlkKSkpIHtcbiAgICAgICAgdXBkYXRlLnB1c2goe2lkLCBzb3VyY2U6IG5leHRTb3VyY2VzLmdldChpZCl9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZXhpdC5wdXNoKHtpZCwgc291cmNlOiBwcmV2U291cmNlcy5nZXQoaWQpfSk7XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgaWQgb2YgbmV4dElkcykge1xuICAgIGNvbnN0IHByZXZTb3VyY2UgPSBwcmV2U291cmNlcy5nZXQoaWQpO1xuICAgIGlmICghcHJldlNvdXJjZSkge1xuICAgICAgZW50ZXIucHVzaCh7aWQsIHNvdXJjZTogbmV4dFNvdXJjZXMuZ2V0KGlkKX0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4ge2VudGVyLCB1cGRhdGUsIGV4aXR9O1xufVxuLyogZXNsaW50LWVuYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZGlmZkxheWVycyhwcmV2U3R5bGUsIG5leHRTdHlsZSkge1xuICBjb25zdCBwcmV2TGF5ZXJzID0gcHJldlN0eWxlLmdldCgnbGF5ZXJzJyk7XG4gIGNvbnN0IG5leHRMYXllcnMgPSBuZXh0U3R5bGUuZ2V0KCdsYXllcnMnKTtcbiAgY29uc3QgdXBkYXRlcyA9IFtdO1xuICBjb25zdCBleGl0aW5nID0gW107XG4gIGNvbnN0IHByZXZNYXAgPSB7fTtcbiAgY29uc3QgbmV4dE1hcCA9IHt9O1xuICBuZXh0TGF5ZXJzLmZvckVhY2goKGxheWVyLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IGlkID0gbGF5ZXIuZ2V0KCdpZCcpO1xuICAgIGNvbnN0IGxheWVySW1CZWhpbmQgPSBuZXh0TGF5ZXJzLmdldChpbmRleCArIDEpO1xuICAgIG5leHRNYXBbaWRdID0ge1xuICAgICAgbGF5ZXIsXG4gICAgICBpZCxcbiAgICAgIC8vIFRoZSBgaWRgIG9mIHRoZSBsYXllciBiZWZvcmUgdGhpcyBvbmUuXG4gICAgICBiZWZvcmU6IGxheWVySW1CZWhpbmQgPyBsYXllckltQmVoaW5kLmdldCgnaWQnKSA6IG51bGwsXG4gICAgICBlbnRlcjogdHJ1ZVxuICAgIH07XG4gIH0pO1xuICBwcmV2TGF5ZXJzLmZvckVhY2goKGxheWVyLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IGlkID0gbGF5ZXIuZ2V0KCdpZCcpO1xuICAgIGNvbnN0IGxheWVySW1CZWhpbmQgPSBwcmV2TGF5ZXJzLmdldChpbmRleCArIDEpO1xuICAgIHByZXZNYXBbaWRdID0ge1xuICAgICAgbGF5ZXIsXG4gICAgICBpZCxcbiAgICAgIGJlZm9yZTogbGF5ZXJJbUJlaGluZCA/IGxheWVySW1CZWhpbmQuZ2V0KCdpZCcpIDogbnVsbFxuICAgIH07XG4gICAgaWYgKG5leHRNYXBbaWRdKSB7XG4gICAgICAvLyBOb3QgYSBuZXcgbGF5ZXIuXG4gICAgICBuZXh0TWFwW2lkXS5lbnRlciA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGlzIGxheWVyIGlzIGJlaW5nIHJlbW92ZWQuXG4gICAgICBleGl0aW5nLnB1c2gocHJldk1hcFtpZF0pO1xuICAgIH1cbiAgfSk7XG4gIGZvciAoY29uc3QgbGF5ZXIgb2YgbmV4dExheWVycy5yZXZlcnNlKCkpIHtcbiAgICBjb25zdCBpZCA9IGxheWVyLmdldCgnaWQnKTtcbiAgICBpZiAoXG4gICAgICAhcHJldk1hcFtpZF0gfHxcbiAgICAgICFwcmV2TWFwW2lkXS5sYXllci5lcXVhbHMobmV4dE1hcFtpZF0ubGF5ZXIpIHx8XG4gICAgICBwcmV2TWFwW2lkXS5iZWZvcmUgIT09IG5leHRNYXBbaWRdLmJlZm9yZVxuICAgICkge1xuICAgICAgLy8gVGhpcyBsYXllciBpcyBiZWluZyBjaGFuZ2VkLlxuICAgICAgdXBkYXRlcy5wdXNoKG5leHRNYXBbaWRdKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHt1cGRhdGVzLCBleGl0aW5nfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGlmZlN0eWxlKHByZXZTdHlsZSwgbmV4dFN0eWxlKSB7XG4gIHJldHVybiB7XG4gICAgc291cmNlc0RpZmY6IGRpZmZTb3VyY2VzKHByZXZTdHlsZSwgbmV4dFN0eWxlKSxcbiAgICBsYXllcnNEaWZmOiBkaWZmTGF5ZXJzKHByZXZTdHlsZSwgbmV4dFN0eWxlKVxuICB9O1xufVxuIl19