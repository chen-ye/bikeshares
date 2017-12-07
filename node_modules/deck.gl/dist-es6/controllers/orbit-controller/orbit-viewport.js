var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { Viewport } from 'deck.gl';

import mat4_multiply from 'gl-mat4/multiply';
import mat4_lookAt from 'gl-mat4/lookAt';
import mat4_scale from 'gl-mat4/scale';
import mat4_perspective from 'gl-mat4/perspective';
import mat4_translate from 'gl-mat4/translate';
import vec3_add from 'gl-vec3/add';
import vec3_rotateX from 'gl-vec3/rotateX';
import vec3_rotateY from 'gl-vec3/rotateY';

var DEGREES_TO_RADIANS = Math.PI / 180;

// Helper, avoids low-precision 32 bit matrices from gl-matrix mat4.create()
export function createMat4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

/*
 * A deck.gl Viewport class used by OrbitController
 * Adds zoom and pixel translation on top of the PerspectiveViewport
 */

var OrbitViewport = function (_Viewport) {
  _inherits(OrbitViewport, _Viewport);

  function OrbitViewport(_ref) {
    var width = _ref.width,
        height = _ref.height,
        distance = _ref.distance,
        _ref$rotationX = _ref.rotationX,
        rotationX = _ref$rotationX === undefined ? 0 : _ref$rotationX,
        _ref$rotationY = _ref.rotationY,
        rotationY = _ref$rotationY === undefined ? 0 : _ref$rotationY,
        _ref$lookAt = _ref.lookAt,
        lookAt = _ref$lookAt === undefined ? [0, 0, 0] : _ref$lookAt,
        _ref$up = _ref.up,
        up = _ref$up === undefined ? [0, 1, 0] : _ref$up,
        _ref$fov = _ref.fov,
        fov = _ref$fov === undefined ? 75 : _ref$fov,
        _ref$near = _ref.near,
        near = _ref$near === undefined ? 1 : _ref$near,
        _ref$far = _ref.far,
        far = _ref$far === undefined ? 100 : _ref$far,
        _ref$translationX = _ref.translationX,
        translationX = _ref$translationX === undefined ? 0 : _ref$translationX,
        _ref$translationY = _ref.translationY,
        translationY = _ref$translationY === undefined ? 0 : _ref$translationY,
        _ref$zoom = _ref.zoom,
        zoom = _ref$zoom === undefined ? 1 : _ref$zoom;

    _classCallCheck(this, OrbitViewport);

    var eye = vec3_add([], lookAt, [0, 0, distance]);
    vec3_rotateX(eye, eye, lookAt, rotationX / 180 * Math.PI);
    vec3_rotateY(eye, eye, lookAt, rotationY / 180 * Math.PI);

    var fovyRadians = fov * DEGREES_TO_RADIANS;
    var aspect = width / height;
    var perspectiveMatrix = mat4_perspective([], fovyRadians, aspect, near, far);
    var transformMatrix = createMat4();
    mat4_translate(transformMatrix, transformMatrix, [translationX / width * 2, translationY / height * 2, 0]);
    mat4_scale(transformMatrix, transformMatrix, [zoom, zoom, 1]);

    var _this = _possibleConstructorReturn(this, (OrbitViewport.__proto__ || Object.getPrototypeOf(OrbitViewport)).call(this, {
      viewMatrix: mat4_lookAt([], eye, lookAt, up),
      projectionMatrix: mat4_multiply(transformMatrix, transformMatrix, perspectiveMatrix),
      width: width,
      height: height
    }));

    _this.width = width;
    _this.height = height;
    _this.distance = distance;
    _this.rotationX = rotationX;
    _this.rotationY = rotationY;
    _this.lookAt = lookAt;
    _this.up = up;
    _this.fov = fov;
    _this.near = near;
    _this.far = far;
    _this.translationX = translationX;
    _this.translationY = translationY;
    _this.zoom = zoom;
    return _this;
  }

  _createClass(OrbitViewport, [{
    key: 'project',
    value: function project(xyz) {
      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$topLeft = _ref2.topLeft,
          topLeft = _ref2$topLeft === undefined ? false : _ref2$topLeft;

      var v = this.transformVector(this.pixelProjectionMatrix, [].concat(_toConsumableArray(xyz), [1]));

      var _v = _slicedToArray(v, 3),
          x = _v[0],
          y = _v[1],
          z = _v[2];

      var y2 = topLeft ? this.height - y : y;
      return [x, y2, z];
    }
  }, {
    key: 'unproject',
    value: function unproject(xyz) {
      var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref3$topLeft = _ref3.topLeft,
          topLeft = _ref3$topLeft === undefined ? false : _ref3$topLeft;

      var _xyz = _slicedToArray(xyz, 3),
          x = _xyz[0],
          y = _xyz[1],
          z = _xyz[2];

      var y2 = topLeft ? this.height - y : y;

      return this.transformVector(this.pixelUnprojectionMatrix, [x, y2, z, 1]);
    }

    /** Move camera to get a bounding box fit in the viewport.
     * @param {Array} bounds - [[minX, minY, minZ], [maxX, maxY, maxZ]]
     * @returns a new OrbitViewport object
     */

  }, {
    key: 'fitBounds',
    value: function fitBounds(_ref4) {
      var _ref5 = _slicedToArray(_ref4, 2),
          min = _ref5[0],
          max = _ref5[1];

      var width = this.width,
          height = this.height,
          rotationX = this.rotationX,
          rotationY = this.rotationY,
          up = this.up,
          fov = this.fov,
          near = this.near,
          far = this.far,
          translationX = this.translationX,
          translationY = this.translationY,
          zoom = this.zoom;

      var size = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
      var newDistance = size / Math.tan(fov / 180 * Math.PI / 2);

      return new OrbitViewport({
        width: width,
        height: height,
        rotationX: rotationX,
        rotationY: rotationY,
        up: up,
        fov: fov,
        near: near,
        far: far,
        translationX: translationX,
        translationY: translationY,
        zoom: zoom,
        lookAt: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2],
        distance: newDistance
      });
    }
  }]);

  return OrbitViewport;
}(Viewport);

export default OrbitViewport;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9vcmJpdC1jb250cm9sbGVyL29yYml0LXZpZXdwb3J0LmpzIl0sIm5hbWVzIjpbIlZpZXdwb3J0IiwibWF0NF9tdWx0aXBseSIsIm1hdDRfbG9va0F0IiwibWF0NF9zY2FsZSIsIm1hdDRfcGVyc3BlY3RpdmUiLCJtYXQ0X3RyYW5zbGF0ZSIsInZlYzNfYWRkIiwidmVjM19yb3RhdGVYIiwidmVjM19yb3RhdGVZIiwiREVHUkVFU19UT19SQURJQU5TIiwiTWF0aCIsIlBJIiwiY3JlYXRlTWF0NCIsIk9yYml0Vmlld3BvcnQiLCJ3aWR0aCIsImhlaWdodCIsImRpc3RhbmNlIiwicm90YXRpb25YIiwicm90YXRpb25ZIiwibG9va0F0IiwidXAiLCJmb3YiLCJuZWFyIiwiZmFyIiwidHJhbnNsYXRpb25YIiwidHJhbnNsYXRpb25ZIiwiem9vbSIsImV5ZSIsImZvdnlSYWRpYW5zIiwiYXNwZWN0IiwicGVyc3BlY3RpdmVNYXRyaXgiLCJ0cmFuc2Zvcm1NYXRyaXgiLCJ2aWV3TWF0cml4IiwicHJvamVjdGlvbk1hdHJpeCIsInh5eiIsInRvcExlZnQiLCJ2IiwidHJhbnNmb3JtVmVjdG9yIiwicGl4ZWxQcm9qZWN0aW9uTWF0cml4IiwieCIsInkiLCJ6IiwieTIiLCJwaXhlbFVucHJvamVjdGlvbk1hdHJpeCIsIm1pbiIsIm1heCIsInNpemUiLCJuZXdEaXN0YW5jZSIsInRhbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsU0FBUUEsUUFBUixRQUF1QixTQUF2Qjs7QUFFQSxPQUFPQyxhQUFQLE1BQTBCLGtCQUExQjtBQUNBLE9BQU9DLFdBQVAsTUFBd0IsZ0JBQXhCO0FBQ0EsT0FBT0MsVUFBUCxNQUF1QixlQUF2QjtBQUNBLE9BQU9DLGdCQUFQLE1BQTZCLHFCQUE3QjtBQUNBLE9BQU9DLGNBQVAsTUFBMkIsbUJBQTNCO0FBQ0EsT0FBT0MsUUFBUCxNQUFxQixhQUFyQjtBQUNBLE9BQU9DLFlBQVAsTUFBeUIsaUJBQXpCO0FBQ0EsT0FBT0MsWUFBUCxNQUF5QixpQkFBekI7O0FBRUEsSUFBTUMscUJBQXFCQyxLQUFLQyxFQUFMLEdBQVUsR0FBckM7O0FBRUE7QUFDQSxPQUFPLFNBQVNDLFVBQVQsR0FBc0I7QUFDM0IsU0FBTyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLEVBQW1CLENBQW5CLEVBQXNCLENBQXRCLEVBQXlCLENBQXpCLEVBQTRCLENBQTVCLEVBQStCLENBQS9CLEVBQWtDLENBQWxDLEVBQXFDLENBQXJDLEVBQXdDLENBQXhDLEVBQTJDLENBQTNDLEVBQThDLENBQTlDLENBQVA7QUFDRDs7QUFFRDs7Ozs7SUFJcUJDLGE7OztBQUNuQiwrQkFtQkc7QUFBQSxRQWpCREMsS0FpQkMsUUFqQkRBLEtBaUJDO0FBQUEsUUFoQkRDLE1BZ0JDLFFBaEJEQSxNQWdCQztBQUFBLFFBZERDLFFBY0MsUUFkREEsUUFjQztBQUFBLDhCQWJEQyxTQWFDO0FBQUEsUUFiREEsU0FhQyxrQ0FiVyxDQWFYO0FBQUEsOEJBWkRDLFNBWUM7QUFBQSxRQVpEQSxTQVlDLGtDQVpXLENBWVg7QUFBQSwyQkFYREMsTUFXQztBQUFBLFFBWERBLE1BV0MsK0JBWFEsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FXUjtBQUFBLHVCQVZEQyxFQVVDO0FBQUEsUUFWREEsRUFVQywyQkFWSSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQVVKO0FBQUEsd0JBUkRDLEdBUUM7QUFBQSxRQVJEQSxHQVFDLDRCQVJLLEVBUUw7QUFBQSx5QkFQREMsSUFPQztBQUFBLFFBUERBLElBT0MsNkJBUE0sQ0FPTjtBQUFBLHdCQU5EQyxHQU1DO0FBQUEsUUFOREEsR0FNQyw0QkFOSyxHQU1MO0FBQUEsaUNBSERDLFlBR0M7QUFBQSxRQUhEQSxZQUdDLHFDQUhjLENBR2Q7QUFBQSxpQ0FGREMsWUFFQztBQUFBLFFBRkRBLFlBRUMscUNBRmMsQ0FFZDtBQUFBLHlCQUREQyxJQUNDO0FBQUEsUUFEREEsSUFDQyw2QkFETSxDQUNOOztBQUFBOztBQUNELFFBQU1DLE1BQU1yQixTQUFTLEVBQVQsRUFBYWEsTUFBYixFQUFxQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU9ILFFBQVAsQ0FBckIsQ0FBWjtBQUNBVCxpQkFBYW9CLEdBQWIsRUFBa0JBLEdBQWxCLEVBQXVCUixNQUF2QixFQUErQkYsWUFBWSxHQUFaLEdBQWtCUCxLQUFLQyxFQUF0RDtBQUNBSCxpQkFBYW1CLEdBQWIsRUFBa0JBLEdBQWxCLEVBQXVCUixNQUF2QixFQUErQkQsWUFBWSxHQUFaLEdBQWtCUixLQUFLQyxFQUF0RDs7QUFFQSxRQUFNaUIsY0FBY1AsTUFBTVosa0JBQTFCO0FBQ0EsUUFBTW9CLFNBQVNmLFFBQVFDLE1BQXZCO0FBQ0EsUUFBTWUsb0JBQW9CMUIsaUJBQWlCLEVBQWpCLEVBQXFCd0IsV0FBckIsRUFBa0NDLE1BQWxDLEVBQTBDUCxJQUExQyxFQUFnREMsR0FBaEQsQ0FBMUI7QUFDQSxRQUFNUSxrQkFBa0JuQixZQUF4QjtBQUNBUCxtQkFBZTBCLGVBQWYsRUFBZ0NBLGVBQWhDLEVBQ0UsQ0FBQ1AsZUFBZVYsS0FBZixHQUF1QixDQUF4QixFQUEyQlcsZUFBZVYsTUFBZixHQUF3QixDQUFuRCxFQUFzRCxDQUF0RCxDQURGO0FBRUFaLGVBQVc0QixlQUFYLEVBQTRCQSxlQUE1QixFQUE2QyxDQUFDTCxJQUFELEVBQU9BLElBQVAsRUFBYSxDQUFiLENBQTdDOztBQVhDLDhIQWFLO0FBQ0pNLGtCQUFZOUIsWUFBWSxFQUFaLEVBQWdCeUIsR0FBaEIsRUFBcUJSLE1BQXJCLEVBQTZCQyxFQUE3QixDQURSO0FBRUphLHdCQUFrQmhDLGNBQWM4QixlQUFkLEVBQStCQSxlQUEvQixFQUFnREQsaUJBQWhELENBRmQ7QUFHSmhCLGtCQUhJO0FBSUpDO0FBSkksS0FiTDs7QUFvQkQsVUFBS0QsS0FBTCxHQUFhQSxLQUFiO0FBQ0EsVUFBS0MsTUFBTCxHQUFjQSxNQUFkO0FBQ0EsVUFBS0MsUUFBTCxHQUFnQkEsUUFBaEI7QUFDQSxVQUFLQyxTQUFMLEdBQWlCQSxTQUFqQjtBQUNBLFVBQUtDLFNBQUwsR0FBaUJBLFNBQWpCO0FBQ0EsVUFBS0MsTUFBTCxHQUFjQSxNQUFkO0FBQ0EsVUFBS0MsRUFBTCxHQUFVQSxFQUFWO0FBQ0EsVUFBS0MsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsVUFBS0MsSUFBTCxHQUFZQSxJQUFaO0FBQ0EsVUFBS0MsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsVUFBS0MsWUFBTCxHQUFvQkEsWUFBcEI7QUFDQSxVQUFLQyxZQUFMLEdBQW9CQSxZQUFwQjtBQUNBLFVBQUtDLElBQUwsR0FBWUEsSUFBWjtBQWhDQztBQWlDRjs7Ozs0QkFFT1EsRyxFQUE2QjtBQUFBLHNGQUFKLEVBQUk7QUFBQSxnQ0FBdkJDLE9BQXVCO0FBQUEsVUFBdkJBLE9BQXVCLGlDQUFiLEtBQWE7O0FBQ25DLFVBQU1DLElBQUksS0FBS0MsZUFBTCxDQUFxQixLQUFLQyxxQkFBMUIsK0JBQXFESixHQUFyRCxJQUEwRCxDQUExRCxHQUFWOztBQURtQyw4QkFHakJFLENBSGlCO0FBQUEsVUFHNUJHLENBSDRCO0FBQUEsVUFHekJDLENBSHlCO0FBQUEsVUFHdEJDLENBSHNCOztBQUluQyxVQUFNQyxLQUFLUCxVQUFVLEtBQUtwQixNQUFMLEdBQWN5QixDQUF4QixHQUE0QkEsQ0FBdkM7QUFDQSxhQUFPLENBQUNELENBQUQsRUFBSUcsRUFBSixFQUFRRCxDQUFSLENBQVA7QUFDRDs7OzhCQUVTUCxHLEVBQTZCO0FBQUEsc0ZBQUosRUFBSTtBQUFBLGdDQUF2QkMsT0FBdUI7QUFBQSxVQUF2QkEsT0FBdUIsaUNBQWIsS0FBYTs7QUFBQSxnQ0FDbkJELEdBRG1CO0FBQUEsVUFDOUJLLENBRDhCO0FBQUEsVUFDM0JDLENBRDJCO0FBQUEsVUFDeEJDLENBRHdCOztBQUVyQyxVQUFNQyxLQUFLUCxVQUFVLEtBQUtwQixNQUFMLEdBQWN5QixDQUF4QixHQUE0QkEsQ0FBdkM7O0FBRUEsYUFBTyxLQUFLSCxlQUFMLENBQXFCLEtBQUtNLHVCQUExQixFQUFtRCxDQUFDSixDQUFELEVBQUlHLEVBQUosRUFBUUQsQ0FBUixFQUFXLENBQVgsQ0FBbkQsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7O3FDQUlzQjtBQUFBO0FBQUEsVUFBWEcsR0FBVztBQUFBLFVBQU5DLEdBQU07O0FBQUEsVUFFbEIvQixLQUZrQixHQWFoQixJQWJnQixDQUVsQkEsS0FGa0I7QUFBQSxVQUdsQkMsTUFIa0IsR0FhaEIsSUFiZ0IsQ0FHbEJBLE1BSGtCO0FBQUEsVUFJbEJFLFNBSmtCLEdBYWhCLElBYmdCLENBSWxCQSxTQUprQjtBQUFBLFVBS2xCQyxTQUxrQixHQWFoQixJQWJnQixDQUtsQkEsU0FMa0I7QUFBQSxVQU1sQkUsRUFOa0IsR0FhaEIsSUFiZ0IsQ0FNbEJBLEVBTmtCO0FBQUEsVUFPbEJDLEdBUGtCLEdBYWhCLElBYmdCLENBT2xCQSxHQVBrQjtBQUFBLFVBUWxCQyxJQVJrQixHQWFoQixJQWJnQixDQVFsQkEsSUFSa0I7QUFBQSxVQVNsQkMsR0FUa0IsR0FhaEIsSUFiZ0IsQ0FTbEJBLEdBVGtCO0FBQUEsVUFVbEJDLFlBVmtCLEdBYWhCLElBYmdCLENBVWxCQSxZQVZrQjtBQUFBLFVBV2xCQyxZQVhrQixHQWFoQixJQWJnQixDQVdsQkEsWUFYa0I7QUFBQSxVQVlsQkMsSUFaa0IsR0FhaEIsSUFiZ0IsQ0FZbEJBLElBWmtCOztBQWNwQixVQUFNb0IsT0FBT3BDLEtBQUttQyxHQUFMLENBQVNBLElBQUksQ0FBSixJQUFTRCxJQUFJLENBQUosQ0FBbEIsRUFBMEJDLElBQUksQ0FBSixJQUFTRCxJQUFJLENBQUosQ0FBbkMsRUFBMkNDLElBQUksQ0FBSixJQUFTRCxJQUFJLENBQUosQ0FBcEQsQ0FBYjtBQUNBLFVBQU1HLGNBQWNELE9BQU9wQyxLQUFLc0MsR0FBTCxDQUFTM0IsTUFBTSxHQUFOLEdBQVlYLEtBQUtDLEVBQWpCLEdBQXNCLENBQS9CLENBQTNCOztBQUVBLGFBQU8sSUFBSUUsYUFBSixDQUFrQjtBQUN2QkMsb0JBRHVCO0FBRXZCQyxzQkFGdUI7QUFHdkJFLDRCQUh1QjtBQUl2QkMsNEJBSnVCO0FBS3ZCRSxjQUx1QjtBQU12QkMsZ0JBTnVCO0FBT3ZCQyxrQkFQdUI7QUFRdkJDLGdCQVJ1QjtBQVN2QkMsa0NBVHVCO0FBVXZCQyxrQ0FWdUI7QUFXdkJDLGtCQVh1QjtBQVl2QlAsZ0JBQVEsQ0FDTixDQUFDeUIsSUFBSSxDQUFKLElBQVNDLElBQUksQ0FBSixDQUFWLElBQW9CLENBRGQsRUFFTixDQUFDRCxJQUFJLENBQUosSUFBU0MsSUFBSSxDQUFKLENBQVYsSUFBb0IsQ0FGZCxFQUdOLENBQUNELElBQUksQ0FBSixJQUFTQyxJQUFJLENBQUosQ0FBVixJQUFvQixDQUhkLENBWmU7QUFpQnZCN0Isa0JBQVUrQjtBQWpCYSxPQUFsQixDQUFQO0FBbUJEOzs7O0VBOUd3Qy9DLFE7O2VBQXRCYSxhIiwiZmlsZSI6Im9yYml0LXZpZXdwb3J0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtWaWV3cG9ydH0gZnJvbSAnZGVjay5nbCc7XG5cbmltcG9ydCBtYXQ0X211bHRpcGx5IGZyb20gJ2dsLW1hdDQvbXVsdGlwbHknO1xuaW1wb3J0IG1hdDRfbG9va0F0IGZyb20gJ2dsLW1hdDQvbG9va0F0JztcbmltcG9ydCBtYXQ0X3NjYWxlIGZyb20gJ2dsLW1hdDQvc2NhbGUnO1xuaW1wb3J0IG1hdDRfcGVyc3BlY3RpdmUgZnJvbSAnZ2wtbWF0NC9wZXJzcGVjdGl2ZSc7XG5pbXBvcnQgbWF0NF90cmFuc2xhdGUgZnJvbSAnZ2wtbWF0NC90cmFuc2xhdGUnO1xuaW1wb3J0IHZlYzNfYWRkIGZyb20gJ2dsLXZlYzMvYWRkJztcbmltcG9ydCB2ZWMzX3JvdGF0ZVggZnJvbSAnZ2wtdmVjMy9yb3RhdGVYJztcbmltcG9ydCB2ZWMzX3JvdGF0ZVkgZnJvbSAnZ2wtdmVjMy9yb3RhdGVZJztcblxuY29uc3QgREVHUkVFU19UT19SQURJQU5TID0gTWF0aC5QSSAvIDE4MDtcblxuLy8gSGVscGVyLCBhdm9pZHMgbG93LXByZWNpc2lvbiAzMiBiaXQgbWF0cmljZXMgZnJvbSBnbC1tYXRyaXggbWF0NC5jcmVhdGUoKVxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1hdDQoKSB7XG4gIHJldHVybiBbMSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMV07XG59XG5cbi8qXG4gKiBBIGRlY2suZ2wgVmlld3BvcnQgY2xhc3MgdXNlZCBieSBPcmJpdENvbnRyb2xsZXJcbiAqIEFkZHMgem9vbSBhbmQgcGl4ZWwgdHJhbnNsYXRpb24gb24gdG9wIG9mIHRoZSBQZXJzcGVjdGl2ZVZpZXdwb3J0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9yYml0Vmlld3BvcnQgZXh0ZW5kcyBWaWV3cG9ydCB7XG4gIGNvbnN0cnVjdG9yKHtcbiAgICAvLyB2aWV3cG9ydCBhcmd1bWVudHNcbiAgICB3aWR0aCwgLy8gV2lkdGggb2Ygdmlld3BvcnRcbiAgICBoZWlnaHQsIC8vIEhlaWdodCBvZiB2aWV3cG9ydFxuICAgIC8vIHZpZXcgbWF0cml4IGFyZ3VtZW50c1xuICAgIGRpc3RhbmNlLCAvLyBGcm9tIGV5ZSBwb3NpdGlvbiB0byBsb29rQXRcbiAgICByb3RhdGlvblggPSAwLFxuICAgIHJvdGF0aW9uWSA9IDAsXG4gICAgbG9va0F0ID0gWzAsIDAsIDBdLCAvLyBXaGljaCBwb2ludCBpcyBjYW1lcmEgbG9va2luZyBhdCwgZGVmYXVsdCBvcmlnaW5cbiAgICB1cCA9IFswLCAxLCAwXSwgLy8gRGVmaW5lcyB1cCBkaXJlY3Rpb24sIGRlZmF1bHQgcG9zaXRpdmUgeSBheGlzXG4gICAgLy8gcHJvamVjdGlvbiBtYXRyaXggYXJndW1lbnRzXG4gICAgZm92ID0gNzUsIC8vIEZpZWxkIG9mIHZpZXcgY292ZXJlZCBieSBjYW1lcmFcbiAgICBuZWFyID0gMSwgLy8gRGlzdGFuY2Ugb2YgbmVhciBjbGlwcGluZyBwbGFuZVxuICAgIGZhciA9IDEwMCwgLy8gRGlzdGFuY2Ugb2YgZmFyIGNsaXBwaW5nIHBsYW5lXG5cbiAgICAvLyBhZnRlciBwcm9qZWN0aW9uXG4gICAgdHJhbnNsYXRpb25YID0gMCwgLy8gaW4gcGl4ZWxzXG4gICAgdHJhbnNsYXRpb25ZID0gMCwgLy8gaW4gcGl4ZWxzXG4gICAgem9vbSA9IDFcbiAgfSkge1xuICAgIGNvbnN0IGV5ZSA9IHZlYzNfYWRkKFtdLCBsb29rQXQsIFswLCAwLCBkaXN0YW5jZV0pO1xuICAgIHZlYzNfcm90YXRlWChleWUsIGV5ZSwgbG9va0F0LCByb3RhdGlvblggLyAxODAgKiBNYXRoLlBJKTtcbiAgICB2ZWMzX3JvdGF0ZVkoZXllLCBleWUsIGxvb2tBdCwgcm90YXRpb25ZIC8gMTgwICogTWF0aC5QSSk7XG5cbiAgICBjb25zdCBmb3Z5UmFkaWFucyA9IGZvdiAqIERFR1JFRVNfVE9fUkFESUFOUztcbiAgICBjb25zdCBhc3BlY3QgPSB3aWR0aCAvIGhlaWdodDtcbiAgICBjb25zdCBwZXJzcGVjdGl2ZU1hdHJpeCA9IG1hdDRfcGVyc3BlY3RpdmUoW10sIGZvdnlSYWRpYW5zLCBhc3BlY3QsIG5lYXIsIGZhcik7XG4gICAgY29uc3QgdHJhbnNmb3JtTWF0cml4ID0gY3JlYXRlTWF0NCgpO1xuICAgIG1hdDRfdHJhbnNsYXRlKHRyYW5zZm9ybU1hdHJpeCwgdHJhbnNmb3JtTWF0cml4LFxuICAgICAgW3RyYW5zbGF0aW9uWCAvIHdpZHRoICogMiwgdHJhbnNsYXRpb25ZIC8gaGVpZ2h0ICogMiwgMF0pO1xuICAgIG1hdDRfc2NhbGUodHJhbnNmb3JtTWF0cml4LCB0cmFuc2Zvcm1NYXRyaXgsIFt6b29tLCB6b29tLCAxXSk7XG5cbiAgICBzdXBlcih7XG4gICAgICB2aWV3TWF0cml4OiBtYXQ0X2xvb2tBdChbXSwgZXllLCBsb29rQXQsIHVwKSxcbiAgICAgIHByb2plY3Rpb25NYXRyaXg6IG1hdDRfbXVsdGlwbHkodHJhbnNmb3JtTWF0cml4LCB0cmFuc2Zvcm1NYXRyaXgsIHBlcnNwZWN0aXZlTWF0cml4KSxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0XG4gICAgfSk7XG5cbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5kaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgIHRoaXMucm90YXRpb25YID0gcm90YXRpb25YO1xuICAgIHRoaXMucm90YXRpb25ZID0gcm90YXRpb25ZO1xuICAgIHRoaXMubG9va0F0ID0gbG9va0F0O1xuICAgIHRoaXMudXAgPSB1cDtcbiAgICB0aGlzLmZvdiA9IGZvdjtcbiAgICB0aGlzLm5lYXIgPSBuZWFyO1xuICAgIHRoaXMuZmFyID0gZmFyO1xuICAgIHRoaXMudHJhbnNsYXRpb25YID0gdHJhbnNsYXRpb25YO1xuICAgIHRoaXMudHJhbnNsYXRpb25ZID0gdHJhbnNsYXRpb25ZO1xuICAgIHRoaXMuem9vbSA9IHpvb207XG4gIH1cblxuICBwcm9qZWN0KHh5eiwge3RvcExlZnQgPSBmYWxzZX0gPSB7fSkge1xuICAgIGNvbnN0IHYgPSB0aGlzLnRyYW5zZm9ybVZlY3Rvcih0aGlzLnBpeGVsUHJvamVjdGlvbk1hdHJpeCwgWy4uLnh5eiwgMV0pO1xuXG4gICAgY29uc3QgW3gsIHksIHpdID0gdjtcbiAgICBjb25zdCB5MiA9IHRvcExlZnQgPyB0aGlzLmhlaWdodCAtIHkgOiB5O1xuICAgIHJldHVybiBbeCwgeTIsIHpdO1xuICB9XG5cbiAgdW5wcm9qZWN0KHh5eiwge3RvcExlZnQgPSBmYWxzZX0gPSB7fSkge1xuICAgIGNvbnN0IFt4LCB5LCB6XSA9IHh5ejtcbiAgICBjb25zdCB5MiA9IHRvcExlZnQgPyB0aGlzLmhlaWdodCAtIHkgOiB5O1xuXG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtVmVjdG9yKHRoaXMucGl4ZWxVbnByb2plY3Rpb25NYXRyaXgsIFt4LCB5MiwgeiwgMV0pO1xuICB9XG5cbiAgLyoqIE1vdmUgY2FtZXJhIHRvIGdldCBhIGJvdW5kaW5nIGJveCBmaXQgaW4gdGhlIHZpZXdwb3J0LlxuICAgKiBAcGFyYW0ge0FycmF5fSBib3VuZHMgLSBbW21pblgsIG1pblksIG1pblpdLCBbbWF4WCwgbWF4WSwgbWF4Wl1dXG4gICAqIEByZXR1cm5zIGEgbmV3IE9yYml0Vmlld3BvcnQgb2JqZWN0XG4gICAqL1xuICBmaXRCb3VuZHMoW21pbiwgbWF4XSkge1xuICAgIGNvbnN0IHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgcm90YXRpb25YLFxuICAgICAgcm90YXRpb25ZLFxuICAgICAgdXAsXG4gICAgICBmb3YsXG4gICAgICBuZWFyLFxuICAgICAgZmFyLFxuICAgICAgdHJhbnNsYXRpb25YLFxuICAgICAgdHJhbnNsYXRpb25ZLFxuICAgICAgem9vbVxuICAgIH0gPSB0aGlzO1xuICAgIGNvbnN0IHNpemUgPSBNYXRoLm1heChtYXhbMF0gLSBtaW5bMF0sIG1heFsxXSAtIG1pblsxXSwgbWF4WzJdIC0gbWluWzJdKTtcbiAgICBjb25zdCBuZXdEaXN0YW5jZSA9IHNpemUgLyBNYXRoLnRhbihmb3YgLyAxODAgKiBNYXRoLlBJIC8gMik7XG5cbiAgICByZXR1cm4gbmV3IE9yYml0Vmlld3BvcnQoe1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICByb3RhdGlvblgsXG4gICAgICByb3RhdGlvblksXG4gICAgICB1cCxcbiAgICAgIGZvdixcbiAgICAgIG5lYXIsXG4gICAgICBmYXIsXG4gICAgICB0cmFuc2xhdGlvblgsXG4gICAgICB0cmFuc2xhdGlvblksXG4gICAgICB6b29tLFxuICAgICAgbG9va0F0OiBbXG4gICAgICAgIChtaW5bMF0gKyBtYXhbMF0pIC8gMixcbiAgICAgICAgKG1pblsxXSArIG1heFsxXSkgLyAyLFxuICAgICAgICAobWluWzJdICsgbWF4WzJdKSAvIDJcbiAgICAgIF0sXG4gICAgICBkaXN0YW5jZTogbmV3RGlzdGFuY2VcbiAgICB9KTtcbiAgfVxufVxuIl19