function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

import Viewport from './viewport';
import mat4_lookAt from 'gl-mat4/lookAt';
import mat4_ortho from 'gl-mat4/ortho';

var OrthographicViewport = function (_Viewport) {
  _inherits(OrthographicViewport, _Viewport);

  function OrthographicViewport(_ref) {
    var width = _ref.width,
        height = _ref.height,
        _ref$eye = _ref.eye,
        eye = _ref$eye === undefined ? [0, 0, 1] : _ref$eye,
        _ref$lookAt = _ref.lookAt,
        lookAt = _ref$lookAt === undefined ? [0, 0, 0] : _ref$lookAt,
        _ref$up = _ref.up,
        up = _ref$up === undefined ? [0, 1, 0] : _ref$up,
        _ref$near = _ref.near,
        near = _ref$near === undefined ? 1 : _ref$near,
        _ref$far = _ref.far,
        far = _ref$far === undefined ? 100 : _ref$far,
        left = _ref.left,
        top = _ref.top,
        _ref$right = _ref.right,
        right = _ref$right === undefined ? null : _ref$right,
        _ref$bottom = _ref.bottom,
        bottom = _ref$bottom === undefined ? null : _ref$bottom;

    _classCallCheck(this, OrthographicViewport);

    right = Number.isFinite(right) ? right : left + width;
    bottom = Number.isFinite(bottom) ? bottom : top + height;
    return _possibleConstructorReturn(this, (OrthographicViewport.__proto__ || Object.getPrototypeOf(OrthographicViewport)).call(this, {
      viewMatrix: mat4_lookAt([], eye, lookAt, up),
      projectionMatrix: mat4_ortho([], left, right, bottom, top, near, far),
      width: width,
      height: height
    }));
  }

  return OrthographicViewport;
}(Viewport);

export default OrthographicViewport;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvdmlld3BvcnRzL29ydGhvZ3JhcGhpYy12aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJWaWV3cG9ydCIsIm1hdDRfbG9va0F0IiwibWF0NF9vcnRobyIsIk9ydGhvZ3JhcGhpY1ZpZXdwb3J0Iiwid2lkdGgiLCJoZWlnaHQiLCJleWUiLCJsb29rQXQiLCJ1cCIsIm5lYXIiLCJmYXIiLCJsZWZ0IiwidG9wIiwicmlnaHQiLCJib3R0b20iLCJOdW1iZXIiLCJpc0Zpbml0ZSIsInZpZXdNYXRyaXgiLCJwcm9qZWN0aW9uTWF0cml4Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFQLE1BQXFCLFlBQXJCO0FBQ0EsT0FBT0MsV0FBUCxNQUF3QixnQkFBeEI7QUFDQSxPQUFPQyxVQUFQLE1BQXVCLGVBQXZCOztJQUVxQkMsb0I7OztBQUNuQixzQ0FnQkc7QUFBQSxRQWREQyxLQWNDLFFBZERBLEtBY0M7QUFBQSxRQWJEQyxNQWFDLFFBYkRBLE1BYUM7QUFBQSx3QkFYREMsR0FXQztBQUFBLFFBWERBLEdBV0MsNEJBWEssQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FXTDtBQUFBLDJCQVZEQyxNQVVDO0FBQUEsUUFWREEsTUFVQywrQkFWUSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQVVSO0FBQUEsdUJBVERDLEVBU0M7QUFBQSxRQVREQSxFQVNDLDJCQVRJLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBU0o7QUFBQSx5QkFQREMsSUFPQztBQUFBLFFBUERBLElBT0MsNkJBUE0sQ0FPTjtBQUFBLHdCQU5EQyxHQU1DO0FBQUEsUUFOREEsR0FNQyw0QkFOSyxHQU1MO0FBQUEsUUFMREMsSUFLQyxRQUxEQSxJQUtDO0FBQUEsUUFKREMsR0FJQyxRQUpEQSxHQUlDO0FBQUEsMEJBRkRDLEtBRUM7QUFBQSxRQUZEQSxLQUVDLDhCQUZPLElBRVA7QUFBQSwyQkFEREMsTUFDQztBQUFBLFFBRERBLE1BQ0MsK0JBRFEsSUFDUjs7QUFBQTs7QUFDREQsWUFBUUUsT0FBT0MsUUFBUCxDQUFnQkgsS0FBaEIsSUFBeUJBLEtBQXpCLEdBQWlDRixPQUFPUCxLQUFoRDtBQUNBVSxhQUFTQyxPQUFPQyxRQUFQLENBQWdCRixNQUFoQixJQUEwQkEsTUFBMUIsR0FBbUNGLE1BQU1QLE1BQWxEO0FBRkMsdUlBR0s7QUFDSlksa0JBQVloQixZQUFZLEVBQVosRUFBZ0JLLEdBQWhCLEVBQXFCQyxNQUFyQixFQUE2QkMsRUFBN0IsQ0FEUjtBQUVKVSx3QkFBa0JoQixXQUFXLEVBQVgsRUFBZVMsSUFBZixFQUFxQkUsS0FBckIsRUFBNEJDLE1BQTVCLEVBQW9DRixHQUFwQyxFQUF5Q0gsSUFBekMsRUFBK0NDLEdBQS9DLENBRmQ7QUFHSk4sa0JBSEk7QUFJSkM7QUFKSSxLQUhMO0FBU0Y7OztFQTFCK0NMLFE7O2VBQTdCRyxvQiIsImZpbGUiOiJvcnRob2dyYXBoaWMtdmlld3BvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFZpZXdwb3J0IGZyb20gJy4vdmlld3BvcnQnO1xuaW1wb3J0IG1hdDRfbG9va0F0IGZyb20gJ2dsLW1hdDQvbG9va0F0JztcbmltcG9ydCBtYXQ0X29ydGhvIGZyb20gJ2dsLW1hdDQvb3J0aG8nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPcnRob2dyYXBoaWNWaWV3cG9ydCBleHRlbmRzIFZpZXdwb3J0IHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIC8vIHZpZXdwb3J0IGFyZ3VtZW50c1xuICAgIHdpZHRoLCAvLyBXaWR0aCBvZiB2aWV3cG9ydFxuICAgIGhlaWdodCwgLy8gSGVpZ2h0IG9mIHZpZXdwb3J0XG4gICAgLy8gdmlldyBtYXRyaXggYXJndW1lbnRzXG4gICAgZXllID0gWzAsIDAsIDFdLCAvLyBEZWZpbmVzIGV5ZSBwb3NpdGlvbiwgZGVmYXVsdCB1bml0IGRpc3RhbmNlIGFsb25nIHogYXhpc1xuICAgIGxvb2tBdCA9IFswLCAwLCAwXSwgLy8gV2hpY2ggcG9pbnQgaXMgY2FtZXJhIGxvb2tpbmcgYXQsIGRlZmF1bHQgb3JpZ2luXG4gICAgdXAgPSBbMCwgMSwgMF0sIC8vIERlZmluZXMgdXAgZGlyZWN0aW9uLCBkZWZhdWx0IHBvc2l0aXZlIHkgYXhpc1xuICAgIC8vIHByb2plY3Rpb24gbWF0cml4IGFyZ3VtZW50c1xuICAgIG5lYXIgPSAxLCAvLyBEaXN0YW5jZSBvZiBuZWFyIGNsaXBwaW5nIHBsYW5lXG4gICAgZmFyID0gMTAwLCAvLyBEaXN0YW5jZSBvZiBmYXIgY2xpcHBpbmcgcGxhbmVcbiAgICBsZWZ0LCAvLyBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gICAgdG9wLCAvLyBUb3AgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAgICAvLyBhdXRvbWF0aWNhbGx5IGNhbGN1bGF0ZWRcbiAgICByaWdodCA9IG51bGwsIC8vIFJpZ2h0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gICAgYm90dG9tID0gbnVsbCAvLyBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cbiAgfSkge1xuICAgIHJpZ2h0ID0gTnVtYmVyLmlzRmluaXRlKHJpZ2h0KSA/IHJpZ2h0IDogbGVmdCArIHdpZHRoO1xuICAgIGJvdHRvbSA9IE51bWJlci5pc0Zpbml0ZShib3R0b20pID8gYm90dG9tIDogdG9wICsgaGVpZ2h0O1xuICAgIHN1cGVyKHtcbiAgICAgIHZpZXdNYXRyaXg6IG1hdDRfbG9va0F0KFtdLCBleWUsIGxvb2tBdCwgdXApLFxuICAgICAgcHJvamVjdGlvbk1hdHJpeDogbWF0NF9vcnRobyhbXSwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHRcbiAgICB9KTtcbiAgfVxufVxuIl19