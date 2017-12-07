var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

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

import ChoroplethLayer from '../choropleth-layer/choropleth-layer';
import { fp64ify, log } from '../../../lib/utils';
import flattenDeep from 'lodash.flattendeep';

import choroplethVertex64 from './choropleth-layer-vertex-64.glsl';

var ChoroplethLayer64 = function (_ChoroplethLayer) {
  _inherits(ChoroplethLayer64, _ChoroplethLayer);

  function ChoroplethLayer64(props) {
    _classCallCheck(this, ChoroplethLayer64);

    var _this = _possibleConstructorReturn(this, (ChoroplethLayer64.__proto__ || Object.getPrototypeOf(ChoroplethLayer64)).call(this, props));

    log.once('ChoroplethLayer64 is deprecated. Consider using GeoJsonLayer instead');
    return _this;
  }

  _createClass(ChoroplethLayer64, [{
    key: 'getShaders',
    value: function getShaders() {
      return {
        vs: choroplethVertex64,
        fs: _get(ChoroplethLayer64.prototype.__proto__ || Object.getPrototypeOf(ChoroplethLayer64.prototype), 'getShaders', this).call(this).fs,
        modules: ['project64']
      };
    }
  }, {
    key: 'initializeState',
    value: function initializeState() {
      _get(ChoroplethLayer64.prototype.__proto__ || Object.getPrototypeOf(ChoroplethLayer64.prototype), 'initializeState', this).call(this);

      this.state.attributeManager.add({
        positions64: { size: 4, update: this.calculatePositions64 },
        heights64: { size: 2, update: this.calculateHeights64 }
      });
    }
  }, {
    key: 'calculatePositions64',
    value: function calculatePositions64(attribute) {
      var vertices = flattenDeep(this.state.choropleths);
      attribute.value = new Float32Array(vertices.length / 3 * 4);
      for (var index = 0; index < vertices.length / 3; index++) {
        var _fp64ify = fp64ify(vertices[index * 3]);

        var _fp64ify2 = _slicedToArray(_fp64ify, 2);

        attribute.value[index * 4] = _fp64ify2[0];
        attribute.value[index * 4 + 1] = _fp64ify2[1];

        var _fp64ify3 = fp64ify(vertices[index * 3 + 1]);

        var _fp64ify4 = _slicedToArray(_fp64ify3, 2);

        attribute.value[index * 4 + 2] = _fp64ify4[0];
        attribute.value[index * 4 + 3] = _fp64ify4[1];
      }
    }
  }, {
    key: 'calculateHeights64',
    value: function calculateHeights64(attribute) {
      var vertices = flattenDeep(this.state.choropleths);
      attribute.value = new Float32Array(vertices.length / 3 * 2);
      for (var index = 0; index < vertices.length / 3; index++) {
        var _fp64ify5 = fp64ify(vertices[index * 3 + 2]);

        var _fp64ify6 = _slicedToArray(_fp64ify5, 2);

        attribute.value[index * 2] = _fp64ify6[0];
        attribute.value[index * 2 + 1] = _fp64ify6[1];
      }
    }
  }]);

  return ChoroplethLayer64;
}(ChoroplethLayer);

export default ChoroplethLayer64;


ChoroplethLayer64.layerName = 'ChoroplethLayer64';
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYXllcnMvZGVwcmVjYXRlZC9jaG9yb3BsZXRoLWxheWVyLTY0L2Nob3JvcGxldGgtbGF5ZXItNjQuanMiXSwibmFtZXMiOlsiQ2hvcm9wbGV0aExheWVyIiwiZnA2NGlmeSIsImxvZyIsImZsYXR0ZW5EZWVwIiwiY2hvcm9wbGV0aFZlcnRleDY0IiwiQ2hvcm9wbGV0aExheWVyNjQiLCJwcm9wcyIsIm9uY2UiLCJ2cyIsImZzIiwibW9kdWxlcyIsInN0YXRlIiwiYXR0cmlidXRlTWFuYWdlciIsImFkZCIsInBvc2l0aW9uczY0Iiwic2l6ZSIsInVwZGF0ZSIsImNhbGN1bGF0ZVBvc2l0aW9uczY0IiwiaGVpZ2h0czY0IiwiY2FsY3VsYXRlSGVpZ2h0czY0IiwiYXR0cmlidXRlIiwidmVydGljZXMiLCJjaG9yb3BsZXRocyIsInZhbHVlIiwiRmxvYXQzMkFycmF5IiwibGVuZ3RoIiwiaW5kZXgiLCJsYXllck5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQVAsTUFBNEIsc0NBQTVCO0FBQ0EsU0FBUUMsT0FBUixFQUFpQkMsR0FBakIsUUFBMkIsb0JBQTNCO0FBQ0EsT0FBT0MsV0FBUCxNQUF3QixvQkFBeEI7O0FBRUEsT0FBT0Msa0JBQVAsTUFBK0IsbUNBQS9COztJQUVxQkMsaUI7OztBQUVuQiw2QkFBWUMsS0FBWixFQUFtQjtBQUFBOztBQUFBLHNJQUNYQSxLQURXOztBQUVqQkosUUFBSUssSUFBSixDQUFTLHNFQUFUO0FBRmlCO0FBR2xCOzs7O2lDQUVZO0FBQ1gsYUFBTztBQUNMQyxZQUFJSixrQkFEQztBQUVMSyxZQUFJLGlJQUFtQkEsRUFGbEI7QUFHTEMsaUJBQVMsQ0FBQyxXQUFEO0FBSEosT0FBUDtBQUtEOzs7c0NBRWlCO0FBQ2hCOztBQUVBLFdBQUtDLEtBQUwsQ0FBV0MsZ0JBQVgsQ0FBNEJDLEdBQTVCLENBQWdDO0FBQzlCQyxxQkFBYSxFQUFDQyxNQUFNLENBQVAsRUFBVUMsUUFBUSxLQUFLQyxvQkFBdkIsRUFEaUI7QUFFOUJDLG1CQUFXLEVBQUNILE1BQU0sQ0FBUCxFQUFVQyxRQUFRLEtBQUtHLGtCQUF2QjtBQUZtQixPQUFoQztBQUlEOzs7eUNBRW9CQyxTLEVBQVc7QUFDOUIsVUFBTUMsV0FBV2xCLFlBQVksS0FBS1EsS0FBTCxDQUFXVyxXQUF2QixDQUFqQjtBQUNBRixnQkFBVUcsS0FBVixHQUFrQixJQUFJQyxZQUFKLENBQWlCSCxTQUFTSSxNQUFULEdBQWtCLENBQWxCLEdBQXNCLENBQXZDLENBQWxCO0FBQ0EsV0FBSyxJQUFJQyxRQUFRLENBQWpCLEVBQW9CQSxRQUFRTCxTQUFTSSxNQUFULEdBQWtCLENBQTlDLEVBQWlEQyxPQUFqRCxFQUEwRDtBQUFBLHVCQUlwRHpCLFFBQVFvQixTQUFTSyxRQUFRLENBQWpCLENBQVIsQ0FKb0Q7O0FBQUE7O0FBRXRETixrQkFBVUcsS0FBVixDQUFnQkcsUUFBUSxDQUF4QixDQUZzRDtBQUd0RE4sa0JBQVVHLEtBQVYsQ0FBZ0JHLFFBQVEsQ0FBUixHQUFZLENBQTVCLENBSHNEOztBQUFBLHdCQVFwRHpCLFFBQVFvQixTQUFTSyxRQUFRLENBQVIsR0FBWSxDQUFyQixDQUFSLENBUm9EOztBQUFBOztBQU10RE4sa0JBQVVHLEtBQVYsQ0FBZ0JHLFFBQVEsQ0FBUixHQUFZLENBQTVCLENBTnNEO0FBT3RETixrQkFBVUcsS0FBVixDQUFnQkcsUUFBUSxDQUFSLEdBQVksQ0FBNUIsQ0FQc0Q7QUFTekQ7QUFDRjs7O3VDQUVrQk4sUyxFQUFXO0FBQzVCLFVBQU1DLFdBQVdsQixZQUFZLEtBQUtRLEtBQUwsQ0FBV1csV0FBdkIsQ0FBakI7QUFDQUYsZ0JBQVVHLEtBQVYsR0FBa0IsSUFBSUMsWUFBSixDQUFpQkgsU0FBU0ksTUFBVCxHQUFrQixDQUFsQixHQUFzQixDQUF2QyxDQUFsQjtBQUNBLFdBQUssSUFBSUMsUUFBUSxDQUFqQixFQUFvQkEsUUFBUUwsU0FBU0ksTUFBVCxHQUFrQixDQUE5QyxFQUFpREMsT0FBakQsRUFBMEQ7QUFBQSx3QkFJcER6QixRQUFRb0IsU0FBU0ssUUFBUSxDQUFSLEdBQVksQ0FBckIsQ0FBUixDQUpvRDs7QUFBQTs7QUFFdEROLGtCQUFVRyxLQUFWLENBQWdCRyxRQUFRLENBQXhCLENBRnNEO0FBR3RETixrQkFBVUcsS0FBVixDQUFnQkcsUUFBUSxDQUFSLEdBQVksQ0FBNUIsQ0FIc0Q7QUFLekQ7QUFDRjs7OztFQWhENEMxQixlOztlQUExQkssaUI7OztBQW1EckJBLGtCQUFrQnNCLFNBQWxCLEdBQThCLG1CQUE5QiIsImZpbGUiOiJjaG9yb3BsZXRoLWxheWVyLTY0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBDaG9yb3BsZXRoTGF5ZXIgZnJvbSAnLi4vY2hvcm9wbGV0aC1sYXllci9jaG9yb3BsZXRoLWxheWVyJztcbmltcG9ydCB7ZnA2NGlmeSwgbG9nfSBmcm9tICcuLi8uLi8uLi9saWIvdXRpbHMnO1xuaW1wb3J0IGZsYXR0ZW5EZWVwIGZyb20gJ2xvZGFzaC5mbGF0dGVuZGVlcCc7XG5cbmltcG9ydCBjaG9yb3BsZXRoVmVydGV4NjQgZnJvbSAnLi9jaG9yb3BsZXRoLWxheWVyLXZlcnRleC02NC5nbHNsJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hvcm9wbGV0aExheWVyNjQgZXh0ZW5kcyBDaG9yb3BsZXRoTGF5ZXIge1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIGxvZy5vbmNlKCdDaG9yb3BsZXRoTGF5ZXI2NCBpcyBkZXByZWNhdGVkLiBDb25zaWRlciB1c2luZyBHZW9Kc29uTGF5ZXIgaW5zdGVhZCcpO1xuICB9XG5cbiAgZ2V0U2hhZGVycygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdnM6IGNob3JvcGxldGhWZXJ0ZXg2NCxcbiAgICAgIGZzOiBzdXBlci5nZXRTaGFkZXJzKCkuZnMsXG4gICAgICBtb2R1bGVzOiBbJ3Byb2plY3Q2NCddXG4gICAgfTtcbiAgfVxuXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICBzdXBlci5pbml0aWFsaXplU3RhdGUoKTtcblxuICAgIHRoaXMuc3RhdGUuYXR0cmlidXRlTWFuYWdlci5hZGQoe1xuICAgICAgcG9zaXRpb25zNjQ6IHtzaXplOiA0LCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlUG9zaXRpb25zNjR9LFxuICAgICAgaGVpZ2h0czY0OiB7c2l6ZTogMiwgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUhlaWdodHM2NH1cbiAgICB9KTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVBvc2l0aW9uczY0KGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHZlcnRpY2VzID0gZmxhdHRlbkRlZXAodGhpcy5zdGF0ZS5jaG9yb3BsZXRocyk7XG4gICAgYXR0cmlidXRlLnZhbHVlID0gbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcy5sZW5ndGggLyAzICogNCk7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHZlcnRpY2VzLmxlbmd0aCAvIDM7IGluZGV4KyspIHtcbiAgICAgIFtcbiAgICAgICAgYXR0cmlidXRlLnZhbHVlW2luZGV4ICogNF0sXG4gICAgICAgIGF0dHJpYnV0ZS52YWx1ZVtpbmRleCAqIDQgKyAxXVxuICAgICAgXSA9IGZwNjRpZnkodmVydGljZXNbaW5kZXggKiAzXSk7XG4gICAgICBbXG4gICAgICAgIGF0dHJpYnV0ZS52YWx1ZVtpbmRleCAqIDQgKyAyXSxcbiAgICAgICAgYXR0cmlidXRlLnZhbHVlW2luZGV4ICogNCArIDNdXG4gICAgICBdID0gZnA2NGlmeSh2ZXJ0aWNlc1tpbmRleCAqIDMgKyAxXSk7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlSGVpZ2h0czY0KGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHZlcnRpY2VzID0gZmxhdHRlbkRlZXAodGhpcy5zdGF0ZS5jaG9yb3BsZXRocyk7XG4gICAgYXR0cmlidXRlLnZhbHVlID0gbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcy5sZW5ndGggLyAzICogMik7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHZlcnRpY2VzLmxlbmd0aCAvIDM7IGluZGV4KyspIHtcbiAgICAgIFtcbiAgICAgICAgYXR0cmlidXRlLnZhbHVlW2luZGV4ICogMl0sXG4gICAgICAgIGF0dHJpYnV0ZS52YWx1ZVtpbmRleCAqIDIgKyAxXVxuICAgICAgXSA9IGZwNjRpZnkodmVydGljZXNbaW5kZXggKiAzICsgMl0pO1xuICAgIH1cbiAgfVxufVxuXG5DaG9yb3BsZXRoTGF5ZXI2NC5sYXllck5hbWUgPSAnQ2hvcm9wbGV0aExheWVyNjQnO1xuIl19