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
import mat4_perspective from 'gl-mat4/perspective';

var DEGREES_TO_RADIANS = Math.PI / 180;

var PerspectiveViewport = function (_Viewport) {
  _inherits(PerspectiveViewport, _Viewport);

  function PerspectiveViewport(_ref) {
    var width = _ref.width,
        height = _ref.height,
        eye = _ref.eye,
        _ref$lookAt = _ref.lookAt,
        lookAt = _ref$lookAt === undefined ? [0, 0, 0] : _ref$lookAt,
        _ref$up = _ref.up,
        up = _ref$up === undefined ? [0, 1, 0] : _ref$up,
        _ref$fovy = _ref.fovy,
        fovy = _ref$fovy === undefined ? 75 : _ref$fovy,
        _ref$near = _ref.near,
        near = _ref$near === undefined ? 1 : _ref$near,
        _ref$far = _ref.far,
        far = _ref$far === undefined ? 100 : _ref$far,
        _ref$aspect = _ref.aspect,
        aspect = _ref$aspect === undefined ? null : _ref$aspect;

    _classCallCheck(this, PerspectiveViewport);

    var fovyRadians = fovy * DEGREES_TO_RADIANS;
    aspect = Number.isFinite(aspect) ? aspect : width / height;
    return _possibleConstructorReturn(this, (PerspectiveViewport.__proto__ || Object.getPrototypeOf(PerspectiveViewport)).call(this, {
      viewMatrix: mat4_lookAt([], eye, lookAt, up),
      projectionMatrix: mat4_perspective([], fovyRadians, aspect, near, far),
      width: width,
      height: height
    }));
  }

  return PerspectiveViewport;
}(Viewport);

export default PerspectiveViewport;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvdmlld3BvcnRzL3BlcnNwZWN0aXZlLXZpZXdwb3J0LmpzIl0sIm5hbWVzIjpbIlZpZXdwb3J0IiwibWF0NF9sb29rQXQiLCJtYXQ0X3BlcnNwZWN0aXZlIiwiREVHUkVFU19UT19SQURJQU5TIiwiTWF0aCIsIlBJIiwiUGVyc3BlY3RpdmVWaWV3cG9ydCIsIndpZHRoIiwiaGVpZ2h0IiwiZXllIiwibG9va0F0IiwidXAiLCJmb3Z5IiwibmVhciIsImZhciIsImFzcGVjdCIsImZvdnlSYWRpYW5zIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJ2aWV3TWF0cml4IiwicHJvamVjdGlvbk1hdHJpeCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUCxNQUFxQixZQUFyQjtBQUNBLE9BQU9DLFdBQVAsTUFBd0IsZ0JBQXhCO0FBQ0EsT0FBT0MsZ0JBQVAsTUFBNkIscUJBQTdCOztBQUVBLElBQU1DLHFCQUFxQkMsS0FBS0MsRUFBTCxHQUFVLEdBQXJDOztJQUVxQkMsbUI7OztBQUNuQixxQ0FjRztBQUFBLFFBWkRDLEtBWUMsUUFaREEsS0FZQztBQUFBLFFBWERDLE1BV0MsUUFYREEsTUFXQztBQUFBLFFBVERDLEdBU0MsUUFUREEsR0FTQztBQUFBLDJCQVJEQyxNQVFDO0FBQUEsUUFSREEsTUFRQywrQkFSUSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQVFSO0FBQUEsdUJBUERDLEVBT0M7QUFBQSxRQVBEQSxFQU9DLDJCQVBJLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBT0o7QUFBQSx5QkFMREMsSUFLQztBQUFBLFFBTERBLElBS0MsNkJBTE0sRUFLTjtBQUFBLHlCQUpEQyxJQUlDO0FBQUEsUUFKREEsSUFJQyw2QkFKTSxDQUlOO0FBQUEsd0JBSERDLEdBR0M7QUFBQSxRQUhEQSxHQUdDLDRCQUhLLEdBR0w7QUFBQSwyQkFEREMsTUFDQztBQUFBLFFBRERBLE1BQ0MsK0JBRFEsSUFDUjs7QUFBQTs7QUFDRCxRQUFNQyxjQUFjSixPQUFPVCxrQkFBM0I7QUFDQVksYUFBU0UsT0FBT0MsUUFBUCxDQUFnQkgsTUFBaEIsSUFBMEJBLE1BQTFCLEdBQW1DUixRQUFRQyxNQUFwRDtBQUZDLHFJQUdLO0FBQ0pXLGtCQUFZbEIsWUFBWSxFQUFaLEVBQWdCUSxHQUFoQixFQUFxQkMsTUFBckIsRUFBNkJDLEVBQTdCLENBRFI7QUFFSlMsd0JBQWtCbEIsaUJBQWlCLEVBQWpCLEVBQXFCYyxXQUFyQixFQUFrQ0QsTUFBbEMsRUFBMENGLElBQTFDLEVBQWdEQyxHQUFoRCxDQUZkO0FBR0pQLGtCQUhJO0FBSUpDO0FBSkksS0FITDtBQVNGOzs7RUF4QjhDUixROztlQUE1Qk0sbUIiLCJmaWxlIjoicGVyc3BlY3RpdmUtdmlld3BvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFZpZXdwb3J0IGZyb20gJy4vdmlld3BvcnQnO1xuaW1wb3J0IG1hdDRfbG9va0F0IGZyb20gJ2dsLW1hdDQvbG9va0F0JztcbmltcG9ydCBtYXQ0X3BlcnNwZWN0aXZlIGZyb20gJ2dsLW1hdDQvcGVyc3BlY3RpdmUnO1xuXG5jb25zdCBERUdSRUVTX1RPX1JBRElBTlMgPSBNYXRoLlBJIC8gMTgwO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQZXJzcGVjdGl2ZVZpZXdwb3J0IGV4dGVuZHMgVmlld3BvcnQge1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgLy8gdmlld3BvcnQgYXJndW1lbnRzXG4gICAgd2lkdGgsIC8vIFdpZHRoIG9mIHZpZXdwb3J0XG4gICAgaGVpZ2h0LCAvLyBIZWlnaHQgb2Ygdmlld3BvcnRcbiAgICAvLyB2aWV3IG1hdHJpeCBhcmd1bWVudHNcbiAgICBleWUsIC8vIERlZmluZXMgZXllIHBvc2l0aW9uXG4gICAgbG9va0F0ID0gWzAsIDAsIDBdLCAvLyBXaGljaCBwb2ludCBpcyBjYW1lcmEgbG9va2luZyBhdCwgZGVmYXVsdCBvcmlnaW5cbiAgICB1cCA9IFswLCAxLCAwXSwgLy8gRGVmaW5lcyB1cCBkaXJlY3Rpb24sIGRlZmF1bHQgcG9zaXRpdmUgeSBheGlzXG4gICAgLy8gcHJvamVjdGlvbiBtYXRyaXggYXJndW1lbnRzXG4gICAgZm92eSA9IDc1LCAvLyBGaWVsZCBvZiB2aWV3IGNvdmVyZWQgYnkgY2FtZXJhXG4gICAgbmVhciA9IDEsIC8vIERpc3RhbmNlIG9mIG5lYXIgY2xpcHBpbmcgcGxhbmVcbiAgICBmYXIgPSAxMDAsIC8vIERpc3RhbmNlIG9mIGZhciBjbGlwcGluZyBwbGFuZVxuICAgIC8vIGF1dG9tYXRpY2FsbHkgY2FsY3VsYXRlZFxuICAgIGFzcGVjdCA9IG51bGwgLy8gQXNwZWN0IHJhdGlvIChzZXQgdG8gdmlld3BvcnQgd2lkaHQvaGVpZ2h0KVxuICB9KSB7XG4gICAgY29uc3QgZm92eVJhZGlhbnMgPSBmb3Z5ICogREVHUkVFU19UT19SQURJQU5TO1xuICAgIGFzcGVjdCA9IE51bWJlci5pc0Zpbml0ZShhc3BlY3QpID8gYXNwZWN0IDogd2lkdGggLyBoZWlnaHQ7XG4gICAgc3VwZXIoe1xuICAgICAgdmlld01hdHJpeDogbWF0NF9sb29rQXQoW10sIGV5ZSwgbG9va0F0LCB1cCksXG4gICAgICBwcm9qZWN0aW9uTWF0cml4OiBtYXQ0X3BlcnNwZWN0aXZlKFtdLCBmb3Z5UmFkaWFucywgYXNwZWN0LCBuZWFyLCBmYXIpLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHRcbiAgICB9KTtcbiAgfVxufVxuIl19