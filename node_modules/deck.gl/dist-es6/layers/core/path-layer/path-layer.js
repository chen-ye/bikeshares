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

import { Layer } from '../../../lib';
import { GL, Model, Geometry } from 'luma.gl';
import { fp64ify, enable64bitSupport } from '../../../lib/utils/fp64';
import { COORDINATE_SYSTEM } from '../../../lib';

import vs from './path-layer-vertex.glsl';
import vs64 from './path-layer-vertex-64.glsl';
import fs from './path-layer-fragment.glsl';

var DEFAULT_COLOR = [0, 0, 0, 255];

var defaultProps = {
  widthScale: 1, // stroke width in meters
  widthMinPixels: 0, //  min stroke width in pixels
  widthMaxPixels: Number.MAX_SAFE_INTEGER, // max stroke width in pixels
  rounded: false,
  miterLimit: 4,
  fp64: false,

  getPath: function getPath(object) {
    return object.path;
  },
  getColor: function getColor(object) {
    return object.color || DEFAULT_COLOR;
  },
  getWidth: function getWidth(object) {
    return object.width || 1;
  }
};

var isClosed = function isClosed(path) {
  var firstPoint = path[0];
  var lastPoint = path[path.length - 1];
  return firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1] && firstPoint[2] === lastPoint[2];
};

var PathLayer = function (_Layer) {
  _inherits(PathLayer, _Layer);

  function PathLayer() {
    _classCallCheck(this, PathLayer);

    return _possibleConstructorReturn(this, (PathLayer.__proto__ || Object.getPrototypeOf(PathLayer)).apply(this, arguments));
  }

  _createClass(PathLayer, [{
    key: 'getShaders',
    value: function getShaders() {
      return enable64bitSupport(this.props) ? { vs: vs64, fs: fs, modules: ['project64'] } : { vs: vs, fs: fs }; // 'project' module added by default.
    }
  }, {
    key: 'initializeState',
    value: function initializeState() {
      var gl = this.context.gl;

      this.setState({ model: this._getModel(gl) });

      var attributeManager = this.state.attributeManager;
      /* eslint-disable max-len */

      attributeManager.addInstanced({
        instanceStartPositions: { size: 3, update: this.calculateStartPositions },
        instanceEndPositions: { size: 3, update: this.calculateEndPositions },
        instanceLeftDeltas: { size: 3, update: this.calculateLeftDeltas },
        instanceRightDeltas: { size: 3, update: this.calculateRightDeltas },
        instanceStrokeWidths: { size: 1, accessor: 'getWidth', update: this.calculateStrokeWidths },
        instanceColors: { size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateColors },
        instancePickingColors: { size: 3, type: GL.UNSIGNED_BYTE, update: this.calculatePickingColors }
      });
      /* eslint-enable max-len */
    }
  }, {
    key: 'updateAttribute',
    value: function updateAttribute(_ref) {
      var props = _ref.props,
          oldProps = _ref.oldProps,
          changeFlags = _ref.changeFlags;

      if (props.fp64 !== oldProps.fp64) {
        var attributeManager = this.state.attributeManager;

        attributeManager.invalidateAll();

        if (props.fp64 && props.projectionMode === COORDINATE_SYSTEM.LNGLAT) {
          attributeManager.addInstanced({
            instanceStartEndPositions64xyLow: {
              size: 4,
              update: this.calculateInstanceStartEndPositions64xyLow
            }
          });
        } else {
          attributeManager.remove(['instanceStartEndPositions64xyLow']);
        }
      }
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref2) {
      var oldProps = _ref2.oldProps,
          props = _ref2.props,
          changeFlags = _ref2.changeFlags;

      _get(PathLayer.prototype.__proto__ || Object.getPrototypeOf(PathLayer.prototype), 'updateState', this).call(this, { props: props, oldProps: oldProps, changeFlags: changeFlags });

      var getPath = this.props.getPath;
      var attributeManager = this.state.attributeManager;

      if (props.fp64 !== oldProps.fp64) {
        var gl = this.context.gl;

        this.setState({ model: this._getModel(gl) });
      }
      this.updateAttribute({ props: props, oldProps: oldProps, changeFlags: changeFlags });

      if (changeFlags.dataChanged) {
        // this.state.paths only stores point positions in each path
        var paths = props.data.map(getPath);
        var numInstances = paths.reduce(function (count, path) {
          return count + path.length - 1;
        }, 0);

        this.setState({ paths: paths, numInstances: numInstances });
        attributeManager.invalidateAll();
      }
    }
  }, {
    key: 'draw',
    value: function draw(_ref3) {
      var uniforms = _ref3.uniforms;
      var _props = this.props,
          rounded = _props.rounded,
          miterLimit = _props.miterLimit,
          widthScale = _props.widthScale,
          widthMinPixels = _props.widthMinPixels,
          widthMaxPixels = _props.widthMaxPixels;


      this.state.model.render(Object.assign({}, uniforms, {
        jointType: Number(rounded),
        widthScale: widthScale,
        miterLimit: miterLimit,
        widthMinPixels: widthMinPixels,
        widthMaxPixels: widthMaxPixels
      }));
    }
  }, {
    key: '_getModel',
    value: function _getModel(gl) {
      /*
       *       _
       *        "-_ 1                   3                       5
       *     _     "o---------------------o-------------------_-o
       *       -   / ""--..__              '.             _.-' /
       *   _     "@- - - - - ""--..__- - - - x - - - -_.@'    /
       *    "-_  /                   ""--..__ '.  _,-` :     /
       *       "o----------------------------""-o'    :     /
       *      0,2                            4 / '.  :     /
       *                                      /   '.:     /
       *                                     /     :'.   /
       *                                    /     :  ', /
       *                                   /     :     o
       */

      var SEGMENT_INDICES = [
      // start corner
      0, 2, 1,
      // body
      1, 2, 4, 1, 4, 3,
      // end corner
      3, 4, 5];

      // [0] position on segment - 0: start, 1: end
      // [1] side of path - -1: left, 0: center, 1: right
      // [2] role - 0: offset point 1: joint point
      var SEGMENT_POSITIONS = [
      // bevel start corner
      0, 0, 1,
      // start inner corner
      0, -1, 0,
      // start outer corner
      0, 1, 0,
      // end inner corner
      1, -1, 0,
      // end outer corner
      1, 1, 0,
      // bevel end corner
      1, 0, 1];

      return new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLES,
          attributes: {
            indices: new Uint16Array(SEGMENT_INDICES),
            positions: new Float32Array(SEGMENT_POSITIONS)
          }
        }),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      }));
    }
  }, {
    key: 'calculateStartPositions',
    value: function calculateStartPositions(attribute) {
      var paths = this.state.paths;
      var value = attribute.value;


      var i = 0;
      paths.forEach(function (path) {
        var numSegments = path.length - 1;
        for (var ptIndex = 0; ptIndex < numSegments; ptIndex++) {
          var point = path[ptIndex];
          value[i++] = point[0];
          value[i++] = point[1];
          value[i++] = point[2] || 0;
        }
      });
    }
  }, {
    key: 'calculateEndPositions',
    value: function calculateEndPositions(attribute) {
      var paths = this.state.paths;
      var value = attribute.value;


      var i = 0;
      paths.forEach(function (path) {
        for (var ptIndex = 1; ptIndex < path.length; ptIndex++) {
          var point = path[ptIndex];
          value[i++] = point[0];
          value[i++] = point[1];
          value[i++] = point[2] || 0;
        }
      });
    }
  }, {
    key: 'calculateInstanceStartEndPositions64xyLow',
    value: function calculateInstanceStartEndPositions64xyLow(attribute) {
      var paths = this.state.paths;
      var value = attribute.value;


      var i = 0;
      paths.forEach(function (path) {
        var numSegments = path.length - 1;
        for (var ptIndex = 0; ptIndex < numSegments; ptIndex++) {
          var startPoint = path[ptIndex];
          var endPoint = path[ptIndex + 1];
          value[i++] = fp64ify(startPoint[0])[1];
          value[i++] = fp64ify(startPoint[1])[1];
          value[i++] = fp64ify(endPoint[0])[1];
          value[i++] = fp64ify(endPoint[1])[1];
        }
      });
    }
  }, {
    key: 'calculateLeftDeltas',
    value: function calculateLeftDeltas(attribute) {
      var paths = this.state.paths;
      var value = attribute.value;


      var i = 0;
      paths.forEach(function (path) {
        var numSegments = path.length - 1;
        var prevPoint = isClosed(path) ? path[path.length - 2] : path[0];

        for (var ptIndex = 0; ptIndex < numSegments; ptIndex++) {
          var point = path[ptIndex];
          value[i++] = point[0] - prevPoint[0];
          value[i++] = point[1] - prevPoint[1];
          value[i++] = point[2] - prevPoint[2] || 0;
          prevPoint = point;
        }
      });
    }
  }, {
    key: 'calculateRightDeltas',
    value: function calculateRightDeltas(attribute) {
      var paths = this.state.paths;
      var value = attribute.value;


      var i = 0;
      paths.forEach(function (path) {
        for (var ptIndex = 1; ptIndex < path.length; ptIndex++) {
          var point = path[ptIndex];
          var nextPoint = path[ptIndex + 1];
          if (!nextPoint) {
            nextPoint = isClosed(path) ? path[1] : point;
          }

          value[i++] = nextPoint[0] - point[0];
          value[i++] = nextPoint[1] - point[1];
          value[i++] = nextPoint[2] - point[2] || 0;
        }
      });
    }
  }, {
    key: 'calculateStrokeWidths',
    value: function calculateStrokeWidths(attribute) {
      var _props2 = this.props,
          data = _props2.data,
          getWidth = _props2.getWidth;
      var paths = this.state.paths;
      var value = attribute.value;


      var i = 0;
      paths.forEach(function (path, index) {
        var width = getWidth(data[index], index);
        for (var ptIndex = 1; ptIndex < path.length; ptIndex++) {
          value[i++] = width;
        }
      });
    }
  }, {
    key: 'calculateColors',
    value: function calculateColors(attribute) {
      var _props3 = this.props,
          data = _props3.data,
          getColor = _props3.getColor;
      var paths = this.state.paths;
      var value = attribute.value;


      var i = 0;
      paths.forEach(function (path, index) {
        var pointColor = getColor(data[index], index);
        if (isNaN(pointColor[3])) {
          pointColor[3] = 255;
        }
        for (var ptIndex = 1; ptIndex < path.length; ptIndex++) {
          value[i++] = pointColor[0];
          value[i++] = pointColor[1];
          value[i++] = pointColor[2];
          value[i++] = pointColor[3];
        }
      });
    }

    // Override the default picking colors calculation

  }, {
    key: 'calculatePickingColors',
    value: function calculatePickingColors(attribute) {
      var _this2 = this;

      var paths = this.state.paths;
      var value = attribute.value;


      var i = 0;
      paths.forEach(function (path, index) {
        var pickingColor = _this2.encodePickingColor(index);
        for (var ptIndex = 1; ptIndex < path.length; ptIndex++) {
          value[i++] = pickingColor[0];
          value[i++] = pickingColor[1];
          value[i++] = pickingColor[2];
        }
      });
    }
  }]);

  return PathLayer;
}(Layer);

export default PathLayer;


PathLayer.layerName = 'PathLayer';
PathLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYXllcnMvY29yZS9wYXRoLWxheWVyL3BhdGgtbGF5ZXIuanMiXSwibmFtZXMiOlsiTGF5ZXIiLCJHTCIsIk1vZGVsIiwiR2VvbWV0cnkiLCJmcDY0aWZ5IiwiZW5hYmxlNjRiaXRTdXBwb3J0IiwiQ09PUkRJTkFURV9TWVNURU0iLCJ2cyIsInZzNjQiLCJmcyIsIkRFRkFVTFRfQ09MT1IiLCJkZWZhdWx0UHJvcHMiLCJ3aWR0aFNjYWxlIiwid2lkdGhNaW5QaXhlbHMiLCJ3aWR0aE1heFBpeGVscyIsIk51bWJlciIsIk1BWF9TQUZFX0lOVEVHRVIiLCJyb3VuZGVkIiwibWl0ZXJMaW1pdCIsImZwNjQiLCJnZXRQYXRoIiwib2JqZWN0IiwicGF0aCIsImdldENvbG9yIiwiY29sb3IiLCJnZXRXaWR0aCIsIndpZHRoIiwiaXNDbG9zZWQiLCJmaXJzdFBvaW50IiwibGFzdFBvaW50IiwibGVuZ3RoIiwiUGF0aExheWVyIiwicHJvcHMiLCJtb2R1bGVzIiwiZ2wiLCJjb250ZXh0Iiwic2V0U3RhdGUiLCJtb2RlbCIsIl9nZXRNb2RlbCIsImF0dHJpYnV0ZU1hbmFnZXIiLCJzdGF0ZSIsImFkZEluc3RhbmNlZCIsImluc3RhbmNlU3RhcnRQb3NpdGlvbnMiLCJzaXplIiwidXBkYXRlIiwiY2FsY3VsYXRlU3RhcnRQb3NpdGlvbnMiLCJpbnN0YW5jZUVuZFBvc2l0aW9ucyIsImNhbGN1bGF0ZUVuZFBvc2l0aW9ucyIsImluc3RhbmNlTGVmdERlbHRhcyIsImNhbGN1bGF0ZUxlZnREZWx0YXMiLCJpbnN0YW5jZVJpZ2h0RGVsdGFzIiwiY2FsY3VsYXRlUmlnaHREZWx0YXMiLCJpbnN0YW5jZVN0cm9rZVdpZHRocyIsImFjY2Vzc29yIiwiY2FsY3VsYXRlU3Ryb2tlV2lkdGhzIiwiaW5zdGFuY2VDb2xvcnMiLCJ0eXBlIiwiVU5TSUdORURfQllURSIsImNhbGN1bGF0ZUNvbG9ycyIsImluc3RhbmNlUGlja2luZ0NvbG9ycyIsImNhbGN1bGF0ZVBpY2tpbmdDb2xvcnMiLCJvbGRQcm9wcyIsImNoYW5nZUZsYWdzIiwiaW52YWxpZGF0ZUFsbCIsInByb2plY3Rpb25Nb2RlIiwiTE5HTEFUIiwiaW5zdGFuY2VTdGFydEVuZFBvc2l0aW9uczY0eHlMb3ciLCJjYWxjdWxhdGVJbnN0YW5jZVN0YXJ0RW5kUG9zaXRpb25zNjR4eUxvdyIsInJlbW92ZSIsInVwZGF0ZUF0dHJpYnV0ZSIsImRhdGFDaGFuZ2VkIiwicGF0aHMiLCJkYXRhIiwibWFwIiwibnVtSW5zdGFuY2VzIiwicmVkdWNlIiwiY291bnQiLCJ1bmlmb3JtcyIsInJlbmRlciIsIk9iamVjdCIsImFzc2lnbiIsImpvaW50VHlwZSIsIlNFR01FTlRfSU5ESUNFUyIsIlNFR01FTlRfUE9TSVRJT05TIiwiZ2V0U2hhZGVycyIsImlkIiwiZ2VvbWV0cnkiLCJkcmF3TW9kZSIsIlRSSUFOR0xFUyIsImF0dHJpYnV0ZXMiLCJpbmRpY2VzIiwiVWludDE2QXJyYXkiLCJwb3NpdGlvbnMiLCJGbG9hdDMyQXJyYXkiLCJpc0luc3RhbmNlZCIsInNoYWRlckNhY2hlIiwiYXR0cmlidXRlIiwidmFsdWUiLCJpIiwiZm9yRWFjaCIsIm51bVNlZ21lbnRzIiwicHRJbmRleCIsInBvaW50Iiwic3RhcnRQb2ludCIsImVuZFBvaW50IiwicHJldlBvaW50IiwibmV4dFBvaW50IiwiaW5kZXgiLCJwb2ludENvbG9yIiwiaXNOYU4iLCJwaWNraW5nQ29sb3IiLCJlbmNvZGVQaWNraW5nQ29sb3IiLCJsYXllck5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFRQSxLQUFSLFFBQW9CLGNBQXBCO0FBQ0EsU0FBUUMsRUFBUixFQUFZQyxLQUFaLEVBQW1CQyxRQUFuQixRQUFrQyxTQUFsQztBQUNBLFNBQVFDLE9BQVIsRUFB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LFVBQ3pCekIsS0FEeUIsR0FDaEIsS0FBSy9CLEtBRFcsQ0FDekIrQixLQUR5QjtBQUFBLFVBRXpCMEIsS0FGeUIsR0FFaEJELFNBRmdCLENBRXpCQyxLQUZ5Qjs7O0FBSWhDLFVBQUlDLElBQUksQ0FBUjtBQUNBM0IsWUFBTTRCLE9BQU4sQ0FBYyxVQUFDN0UsSUFBRCxFQUFPcUYsS0FBUCxFQUFpQjtBQUM3QixZQUFNRyxlQUFlLE9BQUtDLGtCQUFMLENBQXdCSixLQUF4QixDQUFyQjtBQUNBLGFBQUssSUFBSU4sVUFBVSxDQUFuQixFQUFzQkEsVUFBVS9FLEtBQUtRLE1BQXJDLEVBQTZDdUUsU0FBN0MsRUFBd0Q7QUFDdERKLGdCQUFNQyxHQUFOLElBQWFZLGFBQWEsQ0FBYixDQUFiO0FBQ0FiLGdCQUFNQyxHQUFOLElBQWFZLGFBQWEsQ0FBYixDQUFiO0FBQ0FiLGdCQUFNQyxHQUFOLElBQWFZLGFBQWEsQ0FBYixDQUFiO0FBQ0Q7QUFDRixPQVBEO0FBUUQ7Ozs7RUFqUm9DOUcsSzs7ZUFBbEIrQixTOzs7QUFxUnJCQSxVQUFVaUYsU0FBVixHQUFzQixXQUF0QjtBQUNBakYsVUFBVXBCLFlBQVYsR0FBeUJBLFlBQXpCIiwiZmlsZSI6InBhdGgtbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtMYXllcn0gZnJvbSAnLi4vLi4vLi4vbGliJztcbmltcG9ydCB7R0wsIE1vZGVsLCBHZW9tZXRyeX0gZnJvbSAnbHVtYS5nbCc7XG5pbXBvcnQge2ZwNjRpZnksIGVuYWJsZTY0Yml0U3VwcG9ydH0gZnJvbSAnLi4vLi4vLi4vbGliL3V0aWxzL2ZwNjQnO1xuaW1wb3J0IHtDT09SRElOQVRFX1NZU1RFTX0gZnJvbSAnLi4vLi4vLi4vbGliJztcblxuaW1wb3J0IHZzIGZyb20gJy4vcGF0aC1sYXllci12ZXJ0ZXguZ2xzbCc7XG5pbXBvcnQgdnM2NCBmcm9tICcuL3BhdGgtbGF5ZXItdmVydGV4LTY0Lmdsc2wnO1xuaW1wb3J0IGZzIGZyb20gJy4vcGF0aC1sYXllci1mcmFnbWVudC5nbHNsJztcblxuY29uc3QgREVGQVVMVF9DT0xPUiA9IFswLCAwLCAwLCAyNTVdO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIHdpZHRoU2NhbGU6IDEsIC8vIHN0cm9rZSB3aWR0aCBpbiBtZXRlcnNcbiAgd2lkdGhNaW5QaXhlbHM6IDAsIC8vICBtaW4gc3Ryb2tlIHdpZHRoIGluIHBpeGVsc1xuICB3aWR0aE1heFBpeGVsczogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsIC8vIG1heCBzdHJva2Ugd2lkdGggaW4gcGl4ZWxzXG4gIHJvdW5kZWQ6IGZhbHNlLFxuICBtaXRlckxpbWl0OiA0LFxuICBmcDY0OiBmYWxzZSxcblxuICBnZXRQYXRoOiBvYmplY3QgPT4gb2JqZWN0LnBhdGgsXG4gIGdldENvbG9yOiBvYmplY3QgPT4gb2JqZWN0LmNvbG9yIHx8IERFRkFVTFRfQ09MT1IsXG4gIGdldFdpZHRoOiBvYmplY3QgPT4gb2JqZWN0LndpZHRoIHx8IDFcbn07XG5cbmNvbnN0IGlzQ2xvc2VkID0gcGF0aCA9PiB7XG4gIGNvbnN0IGZpcnN0UG9pbnQgPSBwYXRoWzBdO1xuICBjb25zdCBsYXN0UG9pbnQgPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV07XG4gIHJldHVybiBmaXJzdFBvaW50WzBdID09PSBsYXN0UG9pbnRbMF0gJiYgZmlyc3RQb2ludFsxXSA9PT0gbGFzdFBvaW50WzFdICYmXG4gICAgZmlyc3RQb2ludFsyXSA9PT0gbGFzdFBvaW50WzJdO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGF0aExheWVyIGV4dGVuZHMgTGF5ZXIge1xuICBnZXRTaGFkZXJzKCkge1xuICAgIHJldHVybiBlbmFibGU2NGJpdFN1cHBvcnQodGhpcy5wcm9wcykgP1xuICAgICAge3ZzOiB2czY0LCBmcywgbW9kdWxlczogWydwcm9qZWN0NjQnXX0gOlxuICAgICAge3ZzLCBmc307IC8vICdwcm9qZWN0JyBtb2R1bGUgYWRkZWQgYnkgZGVmYXVsdC5cbiAgfVxuXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICBjb25zdCB7Z2x9ID0gdGhpcy5jb250ZXh0O1xuICAgIHRoaXMuc2V0U3RhdGUoe21vZGVsOiB0aGlzLl9nZXRNb2RlbChnbCl9KTtcblxuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKHtcbiAgICAgIGluc3RhbmNlU3RhcnRQb3NpdGlvbnM6IHtzaXplOiAzLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlU3RhcnRQb3NpdGlvbnN9LFxuICAgICAgaW5zdGFuY2VFbmRQb3NpdGlvbnM6IHtzaXplOiAzLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlRW5kUG9zaXRpb25zfSxcbiAgICAgIGluc3RhbmNlTGVmdERlbHRhczoge3NpemU6IDMsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVMZWZ0RGVsdGFzfSxcbiAgICAgIGluc3RhbmNlUmlnaHREZWx0YXM6IHtzaXplOiAzLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlUmlnaHREZWx0YXN9LFxuICAgICAgaW5zdGFuY2VTdHJva2VXaWR0aHM6IHtzaXplOiAxLCBhY2Nlc3NvcjogJ2dldFdpZHRoJywgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZVN0cm9rZVdpZHRoc30sXG4gICAgICBpbnN0YW5jZUNvbG9yczoge3NpemU6IDQsIHR5cGU6IEdMLlVOU0lHTkVEX0JZVEUsIGFjY2Vzc29yOiAnZ2V0Q29sb3InLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlQ29sb3JzfSxcbiAgICAgIGluc3RhbmNlUGlja2luZ0NvbG9yczoge3NpemU6IDMsIHR5cGU6IEdMLlVOU0lHTkVEX0JZVEUsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVQaWNraW5nQ29sb3JzfVxuICAgIH0pO1xuICAgIC8qIGVzbGludC1lbmFibGUgbWF4LWxlbiAqL1xuICB9XG5cbiAgdXBkYXRlQXR0cmlidXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSkge1xuICAgIGlmIChwcm9wcy5mcDY0ICE9PSBvbGRQcm9wcy5mcDY0KSB7XG4gICAgICBjb25zdCB7YXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuICAgICAgYXR0cmlidXRlTWFuYWdlci5pbnZhbGlkYXRlQWxsKCk7XG5cbiAgICAgIGlmIChwcm9wcy5mcDY0ICYmIHByb3BzLnByb2plY3Rpb25Nb2RlID09PSBDT09SRElOQVRFX1NZU1RFTS5MTkdMQVQpIHtcbiAgICAgICAgYXR0cmlidXRlTWFuYWdlci5hZGRJbnN0YW5jZWQoe1xuICAgICAgICAgIGluc3RhbmNlU3RhcnRFbmRQb3NpdGlvbnM2NHh5TG93OiB7XG4gICAgICAgICAgICBzaXplOiA0LFxuICAgICAgICAgICAgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlU3RhcnRFbmRQb3NpdGlvbnM2NHh5TG93XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0dHJpYnV0ZU1hbmFnZXIucmVtb3ZlKFtcbiAgICAgICAgICAnaW5zdGFuY2VTdGFydEVuZFBvc2l0aW9uczY0eHlMb3cnXG4gICAgICAgIF0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVN0YXRlKHtvbGRQcm9wcywgcHJvcHMsIGNoYW5nZUZsYWdzfSkge1xuICAgIHN1cGVyLnVwZGF0ZVN0YXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSk7XG5cbiAgICBjb25zdCB7Z2V0UGF0aH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKHByb3BzLmZwNjQgIT09IG9sZFByb3BzLmZwNjQpIHtcbiAgICAgIGNvbnN0IHtnbH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgICB0aGlzLnNldFN0YXRlKHttb2RlbDogdGhpcy5fZ2V0TW9kZWwoZ2wpfSk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQXR0cmlidXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSk7XG5cbiAgICBpZiAoY2hhbmdlRmxhZ3MuZGF0YUNoYW5nZWQpIHtcbiAgICAgIC8vIHRoaXMuc3RhdGUucGF0aHMgb25seSBzdG9yZXMgcG9pbnQgcG9zaXRpb25zIGluIGVhY2ggcGF0aFxuICAgICAgY29uc3QgcGF0aHMgPSBwcm9wcy5kYXRhLm1hcChnZXRQYXRoKTtcbiAgICAgIGNvbnN0IG51bUluc3RhbmNlcyA9IHBhdGhzLnJlZHVjZSgoY291bnQsIHBhdGgpID0+IGNvdW50ICsgcGF0aC5sZW5ndGggLSAxLCAwKTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7cGF0aHMsIG51bUluc3RhbmNlc30pO1xuICAgICAgYXR0cmlidXRlTWFuYWdlci5pbnZhbGlkYXRlQWxsKCk7XG4gICAgfVxuICB9XG5cbiAgZHJhdyh7dW5pZm9ybXN9KSB7XG4gICAgY29uc3Qge1xuICAgICAgcm91bmRlZCwgbWl0ZXJMaW1pdCwgd2lkdGhTY2FsZSwgd2lkdGhNaW5QaXhlbHMsIHdpZHRoTWF4UGl4ZWxzXG4gICAgfSA9IHRoaXMucHJvcHM7XG5cbiAgICB0aGlzLnN0YXRlLm1vZGVsLnJlbmRlcihPYmplY3QuYXNzaWduKHt9LCB1bmlmb3Jtcywge1xuICAgICAgam9pbnRUeXBlOiBOdW1iZXIocm91bmRlZCksXG4gICAgICB3aWR0aFNjYWxlLFxuICAgICAgbWl0ZXJMaW1pdCxcbiAgICAgIHdpZHRoTWluUGl4ZWxzLFxuICAgICAgd2lkdGhNYXhQaXhlbHNcbiAgICB9KSk7XG4gIH1cblxuICBfZ2V0TW9kZWwoZ2wpIHtcbiAgICAvKlxuICAgICAqICAgICAgIF9cbiAgICAgKiAgICAgICAgXCItXyAxICAgICAgICAgICAgICAgICAgIDMgICAgICAgICAgICAgICAgICAgICAgIDVcbiAgICAgKiAgICAgXyAgICAgXCJvLS0tLS0tLS0tLS0tLS0tLS0tLS0tby0tLS0tLS0tLS0tLS0tLS0tLS1fLW9cbiAgICAgKiAgICAgICAtICAgLyBcIlwiLS0uLl9fICAgICAgICAgICAgICAnLiAgICAgICAgICAgICBfLi0nIC9cbiAgICAgKiAgIF8gICAgIFwiQC0gLSAtIC0gLSBcIlwiLS0uLl9fLSAtIC0gLSB4IC0gLSAtIC1fLkAnICAgIC9cbiAgICAgKiAgICBcIi1fICAvICAgICAgICAgICAgICAgICAgIFwiXCItLS4uX18gJy4gIF8sLWAgOiAgICAgL1xuICAgICAqICAgICAgIFwiby0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cIlwiLW8nICAgIDogICAgIC9cbiAgICAgKiAgICAgIDAsMiAgICAgICAgICAgICAgICAgICAgICAgICAgICA0IC8gJy4gIDogICAgIC9cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyAgICcuOiAgICAgL1xuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8gICAgIDonLiAgIC9cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8gICAgIDogICcsIC9cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyAgICAgOiAgICAgb1xuICAgICAqL1xuXG4gICAgY29uc3QgU0VHTUVOVF9JTkRJQ0VTID0gW1xuICAgICAgLy8gc3RhcnQgY29ybmVyXG4gICAgICAwLCAyLCAxLFxuICAgICAgLy8gYm9keVxuICAgICAgMSwgMiwgNCwgMSwgNCwgMyxcbiAgICAgIC8vIGVuZCBjb3JuZXJcbiAgICAgIDMsIDQsIDVcbiAgICBdO1xuXG4gICAgLy8gWzBdIHBvc2l0aW9uIG9uIHNlZ21lbnQgLSAwOiBzdGFydCwgMTogZW5kXG4gICAgLy8gWzFdIHNpZGUgb2YgcGF0aCAtIC0xOiBsZWZ0LCAwOiBjZW50ZXIsIDE6IHJpZ2h0XG4gICAgLy8gWzJdIHJvbGUgLSAwOiBvZmZzZXQgcG9pbnQgMTogam9pbnQgcG9pbnRcbiAgICBjb25zdCBTRUdNRU5UX1BPU0lUSU9OUyA9IFtcbiAgICAgIC8vIGJldmVsIHN0YXJ0IGNvcm5lclxuICAgICAgMCwgMCwgMSxcbiAgICAgIC8vIHN0YXJ0IGlubmVyIGNvcm5lclxuICAgICAgMCwgLTEsIDAsXG4gICAgICAvLyBzdGFydCBvdXRlciBjb3JuZXJcbiAgICAgIDAsIDEsIDAsXG4gICAgICAvLyBlbmQgaW5uZXIgY29ybmVyXG4gICAgICAxLCAtMSwgMCxcbiAgICAgIC8vIGVuZCBvdXRlciBjb3JuZXJcbiAgICAgIDEsIDEsIDAsXG4gICAgICAvLyBiZXZlbCBlbmQgY29ybmVyXG4gICAgICAxLCAwLCAxXG4gICAgXTtcblxuICAgIHJldHVybiBuZXcgTW9kZWwoZ2wsIE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U2hhZGVycygpLCB7XG4gICAgICBpZDogdGhpcy5wcm9wcy5pZCxcbiAgICAgIGdlb21ldHJ5OiBuZXcgR2VvbWV0cnkoe1xuICAgICAgICBkcmF3TW9kZTogR0wuVFJJQU5HTEVTLFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgaW5kaWNlczogbmV3IFVpbnQxNkFycmF5KFNFR01FTlRfSU5ESUNFUyksXG4gICAgICAgICAgcG9zaXRpb25zOiBuZXcgRmxvYXQzMkFycmF5KFNFR01FTlRfUE9TSVRJT05TKVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIGlzSW5zdGFuY2VkOiB0cnVlLFxuICAgICAgc2hhZGVyQ2FjaGU6IHRoaXMuY29udGV4dC5zaGFkZXJDYWNoZVxuICAgIH0pKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVN0YXJ0UG9zaXRpb25zKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtwYXRoc30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG5cbiAgICBsZXQgaSA9IDA7XG4gICAgcGF0aHMuZm9yRWFjaChwYXRoID0+IHtcbiAgICAgIGNvbnN0IG51bVNlZ21lbnRzID0gcGF0aC5sZW5ndGggLSAxO1xuICAgICAgZm9yIChsZXQgcHRJbmRleCA9IDA7IHB0SW5kZXggPCBudW1TZWdtZW50czsgcHRJbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHBvaW50ID0gcGF0aFtwdEluZGV4XTtcbiAgICAgICAgdmFsdWVbaSsrXSA9IHBvaW50WzBdO1xuICAgICAgICB2YWx1ZVtpKytdID0gcG9pbnRbMV07XG4gICAgICAgIHZhbHVlW2krK10gPSBwb2ludFsyXSB8fCAwO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY2FsY3VsYXRlRW5kUG9zaXRpb25zKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtwYXRoc30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG5cbiAgICBsZXQgaSA9IDA7XG4gICAgcGF0aHMuZm9yRWFjaChwYXRoID0+IHtcbiAgICAgIGZvciAobGV0IHB0SW5kZXggPSAxOyBwdEluZGV4IDwgcGF0aC5sZW5ndGg7IHB0SW5kZXgrKykge1xuICAgICAgICBjb25zdCBwb2ludCA9IHBhdGhbcHRJbmRleF07XG4gICAgICAgIHZhbHVlW2krK10gPSBwb2ludFswXTtcbiAgICAgICAgdmFsdWVbaSsrXSA9IHBvaW50WzFdO1xuICAgICAgICB2YWx1ZVtpKytdID0gcG9pbnRbMl0gfHwgMDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlU3RhcnRFbmRQb3NpdGlvbnM2NHh5TG93KGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtwYXRoc30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG5cbiAgICBsZXQgaSA9IDA7XG4gICAgcGF0aHMuZm9yRWFjaChwYXRoID0+IHtcbiAgICAgIGNvbnN0IG51bVNlZ21lbnRzID0gcGF0aC5sZW5ndGggLSAxO1xuICAgICAgZm9yIChsZXQgcHRJbmRleCA9IDA7IHB0SW5kZXggPCBudW1TZWdtZW50czsgcHRJbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHN0YXJ0UG9pbnQgPSBwYXRoW3B0SW5kZXhdO1xuICAgICAgICBjb25zdCBlbmRQb2ludCA9IHBhdGhbcHRJbmRleCArIDFdO1xuICAgICAgICB2YWx1ZVtpKytdID0gZnA2NGlmeShzdGFydFBvaW50WzBdKVsxXTtcbiAgICAgICAgdmFsdWVbaSsrXSA9IGZwNjRpZnkoc3RhcnRQb2ludFsxXSlbMV07XG4gICAgICAgIHZhbHVlW2krK10gPSBmcDY0aWZ5KGVuZFBvaW50WzBdKVsxXTtcbiAgICAgICAgdmFsdWVbaSsrXSA9IGZwNjRpZnkoZW5kUG9pbnRbMV0pWzFdO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY2FsY3VsYXRlTGVmdERlbHRhcyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7cGF0aHN9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuXG4gICAgbGV0IGkgPSAwO1xuICAgIHBhdGhzLmZvckVhY2gocGF0aCA9PiB7XG4gICAgICBjb25zdCBudW1TZWdtZW50cyA9IHBhdGgubGVuZ3RoIC0gMTtcbiAgICAgIGxldCBwcmV2UG9pbnQgPSBpc0Nsb3NlZChwYXRoKSA/IHBhdGhbcGF0aC5sZW5ndGggLSAyXSA6IHBhdGhbMF07XG5cbiAgICAgIGZvciAobGV0IHB0SW5kZXggPSAwOyBwdEluZGV4IDwgbnVtU2VnbWVudHM7IHB0SW5kZXgrKykge1xuICAgICAgICBjb25zdCBwb2ludCA9IHBhdGhbcHRJbmRleF07XG4gICAgICAgIHZhbHVlW2krK10gPSBwb2ludFswXSAtIHByZXZQb2ludFswXTtcbiAgICAgICAgdmFsdWVbaSsrXSA9IHBvaW50WzFdIC0gcHJldlBvaW50WzFdO1xuICAgICAgICB2YWx1ZVtpKytdID0gKHBvaW50WzJdIC0gcHJldlBvaW50WzJdKSB8fCAwO1xuICAgICAgICBwcmV2UG9pbnQgPSBwb2ludDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVJpZ2h0RGVsdGFzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtwYXRoc30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG5cbiAgICBsZXQgaSA9IDA7XG4gICAgcGF0aHMuZm9yRWFjaChwYXRoID0+IHtcbiAgICAgIGZvciAobGV0IHB0SW5kZXggPSAxOyBwdEluZGV4IDwgcGF0aC5sZW5ndGg7IHB0SW5kZXgrKykge1xuICAgICAgICBjb25zdCBwb2ludCA9IHBhdGhbcHRJbmRleF07XG4gICAgICAgIGxldCBuZXh0UG9pbnQgPSBwYXRoW3B0SW5kZXggKyAxXTtcbiAgICAgICAgaWYgKCFuZXh0UG9pbnQpIHtcbiAgICAgICAgICBuZXh0UG9pbnQgPSBpc0Nsb3NlZChwYXRoKSA/IHBhdGhbMV0gOiBwb2ludDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhbHVlW2krK10gPSBuZXh0UG9pbnRbMF0gLSBwb2ludFswXTtcbiAgICAgICAgdmFsdWVbaSsrXSA9IG5leHRQb2ludFsxXSAtIHBvaW50WzFdO1xuICAgICAgICB2YWx1ZVtpKytdID0gKG5leHRQb2ludFsyXSAtIHBvaW50WzJdKSB8fCAwO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY2FsY3VsYXRlU3Ryb2tlV2lkdGhzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRXaWR0aH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtwYXRoc30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG5cbiAgICBsZXQgaSA9IDA7XG4gICAgcGF0aHMuZm9yRWFjaCgocGF0aCwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHdpZHRoID0gZ2V0V2lkdGgoZGF0YVtpbmRleF0sIGluZGV4KTtcbiAgICAgIGZvciAobGV0IHB0SW5kZXggPSAxOyBwdEluZGV4IDwgcGF0aC5sZW5ndGg7IHB0SW5kZXgrKykge1xuICAgICAgICB2YWx1ZVtpKytdID0gd2lkdGg7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjYWxjdWxhdGVDb2xvcnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldENvbG9yfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3BhdGhzfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qge3ZhbHVlfSA9IGF0dHJpYnV0ZTtcblxuICAgIGxldCBpID0gMDtcbiAgICBwYXRocy5mb3JFYWNoKChwYXRoLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnRDb2xvciA9IGdldENvbG9yKGRhdGFbaW5kZXhdLCBpbmRleCk7XG4gICAgICBpZiAoaXNOYU4ocG9pbnRDb2xvclszXSkpIHtcbiAgICAgICAgcG9pbnRDb2xvclszXSA9IDI1NTtcbiAgICAgIH1cbiAgICAgIGZvciAobGV0IHB0SW5kZXggPSAxOyBwdEluZGV4IDwgcGF0aC5sZW5ndGg7IHB0SW5kZXgrKykge1xuICAgICAgICB2YWx1ZVtpKytdID0gcG9pbnRDb2xvclswXTtcbiAgICAgICAgdmFsdWVbaSsrXSA9IHBvaW50Q29sb3JbMV07XG4gICAgICAgIHZhbHVlW2krK10gPSBwb2ludENvbG9yWzJdO1xuICAgICAgICB2YWx1ZVtpKytdID0gcG9pbnRDb2xvclszXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIE92ZXJyaWRlIHRoZSBkZWZhdWx0IHBpY2tpbmcgY29sb3JzIGNhbGN1bGF0aW9uXG4gIGNhbGN1bGF0ZVBpY2tpbmdDb2xvcnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge3BhdGhzfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qge3ZhbHVlfSA9IGF0dHJpYnV0ZTtcblxuICAgIGxldCBpID0gMDtcbiAgICBwYXRocy5mb3JFYWNoKChwYXRoLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgcGlja2luZ0NvbG9yID0gdGhpcy5lbmNvZGVQaWNraW5nQ29sb3IoaW5kZXgpO1xuICAgICAgZm9yIChsZXQgcHRJbmRleCA9IDE7IHB0SW5kZXggPCBwYXRoLmxlbmd0aDsgcHRJbmRleCsrKSB7XG4gICAgICAgIHZhbHVlW2krK10gPSBwaWNraW5nQ29sb3JbMF07XG4gICAgICAgIHZhbHVlW2krK10gPSBwaWNraW5nQ29sb3JbMV07XG4gICAgICAgIHZhbHVlW2krK10gPSBwaWNraW5nQ29sb3JbMl07XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxufVxuXG5QYXRoTGF5ZXIubGF5ZXJOYW1lID0gJ1BhdGhMYXllcic7XG5QYXRoTGF5ZXIuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19