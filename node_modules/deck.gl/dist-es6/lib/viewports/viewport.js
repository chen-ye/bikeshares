var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

// TODO - replace with math.gl
import { equals as _equals } from '../math';
import mat4_scale from 'gl-mat4/scale';
import mat4_translate from 'gl-mat4/translate';
import mat4_multiply from 'gl-mat4/multiply';
import mat4_invert from 'gl-mat4/invert';
import vec4_multiply from 'gl-vec4/multiply';
import vec4_transformMat4 from 'gl-vec4/transformMat4';
import vec2_lerp from 'gl-vec2/lerp';

import assert from 'assert';

var IDENTITY = createMat4();
var DEFAULT_DISTANCE_SCALES = {
  pixelsPerMeter: [1, 1, 1],
  metersPerPixel: [1, 1, 1],
  pixelsPerDegree: [1, 1, 1],
  degreesPerPixel: [1, 1, 1]
};

var ERR_ARGUMENT = 'Illegal argument to Viewport';

var Viewport = function () {
  /**
   * @classdesc
   * Manages coordinate system transformations for deck.gl.
   *
   * Note: The Viewport is immutable in the sense that it only has accessors.
   * A new viewport instance should be created if any parameters have changed.
   */
  function Viewport() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$width = _ref.width,
        width = _ref$width === undefined ? 1 : _ref$width,
        _ref$height = _ref.height,
        height = _ref$height === undefined ? 1 : _ref$height,
        _ref$viewMatrix = _ref.viewMatrix,
        viewMatrix = _ref$viewMatrix === undefined ? IDENTITY : _ref$viewMatrix,
        _ref$projectionMatrix = _ref.projectionMatrix,
        projectionMatrix = _ref$projectionMatrix === undefined ? IDENTITY : _ref$projectionMatrix,
        _ref$distanceScales = _ref.distanceScales,
        distanceScales = _ref$distanceScales === undefined ? DEFAULT_DISTANCE_SCALES : _ref$distanceScales;

    _classCallCheck(this, Viewport);

    // Silently allow apps to send in 0,0
    this.width = width || 1;
    this.height = height || 1;
    this.scale = 1;

    this.viewMatrix = viewMatrix;
    this.projectionMatrix = projectionMatrix;
    this.distanceScales = distanceScales;

    this._initMatrices();

    this.equals = this.equals.bind(this);
    this.project = this.project.bind(this);
    this.unproject = this.unproject.bind(this);
    this.projectFlat = this.projectFlat.bind(this);
    this.unprojectFlat = this.unprojectFlat.bind(this);
    this.getMatrices = this.getMatrices.bind(this);
  }

  // Two viewports are equal if width and height are identical, and if
  // their view and projection matrices are (approximately) equal.


  _createClass(Viewport, [{
    key: 'equals',
    value: function equals(viewport) {
      if (!(viewport instanceof Viewport)) {
        return false;
      }

      return viewport.width === this.width && viewport.height === this.height && _equals(viewport.projectionMatrix, this.projectionMatrix) && _equals(viewport.viewMatrix, this.viewMatrix);
      // TODO - check distance scales?
    }

    /**
     * Projects xyz (possibly latitude and longitude) to pixel coordinates in window
     * using viewport projection parameters
     * - [longitude, latitude] to [x, y]
     * - [longitude, latitude, Z] => [x, y, z]
     * Note: By default, returns top-left coordinates for canvas/SVG type render
     *
     * @param {Array} lngLatZ - [lng, lat] or [lng, lat, Z]
     * @param {Object} opts - options
     * @param {Object} opts.topLeft=true - Whether projected coords are top left
     * @return {Array} - [x, y] or [x, y, z] in top left coords
     */

  }, {
    key: 'project',
    value: function project(xyz) {
      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$topLeft = _ref2.topLeft,
          topLeft = _ref2$topLeft === undefined ? false : _ref2$topLeft;

      var _xyz = _slicedToArray(xyz, 3),
          x0 = _xyz[0],
          y0 = _xyz[1],
          _xyz$ = _xyz[2],
          z0 = _xyz$ === undefined ? 0 : _xyz$;

      assert(Number.isFinite(x0) && Number.isFinite(y0) && Number.isFinite(z0), ERR_ARGUMENT);

      var _projectFlat2 = this.projectFlat([x0, y0]),
          _projectFlat3 = _slicedToArray(_projectFlat2, 2),
          X = _projectFlat3[0],
          Y = _projectFlat3[1];

      var v = this.transformVector(this.pixelProjectionMatrix, [X, Y, z0, 1]);

      var _v = _slicedToArray(v, 2),
          x = _v[0],
          y = _v[1];

      var y2 = topLeft ? this.height - y : y;
      return xyz.length === 2 ? [x, y2] : [x, y2, 0];
    }

    /**
     * Unproject pixel coordinates on screen onto world coordinates,
     * (possibly [lon, lat]) on map.
     * - [x, y] => [lng, lat]
     * - [x, y, z] => [lng, lat, Z]
     * @param {Array} xyz -
     * @return {Array} - [lng, lat, Z] or [X, Y, Z]
     */

  }, {
    key: 'unproject',
    value: function unproject(xyz) {
      var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref3$topLeft = _ref3.topLeft,
          topLeft = _ref3$topLeft === undefined ? false : _ref3$topLeft;

      var _xyz2 = _slicedToArray(xyz, 3),
          x = _xyz2[0],
          y = _xyz2[1],
          _xyz2$ = _xyz2[2],
          targetZ = _xyz2$ === undefined ? 0 : _xyz2$;

      var y2 = topLeft ? this.height - y : y;

      // since we don't know the correct projected z value for the point,
      // unproject two points to get a line and then find the point on that line with z=0
      var coord0 = this.transformVector(this.pixelUnprojectionMatrix, [x, y2, 0, 1]);
      var coord1 = this.transformVector(this.pixelUnprojectionMatrix, [x, y2, 1, 1]);

      var z0 = coord0[2];
      var z1 = coord1[2];

      var t = z0 === z1 ? 0 : (targetZ - z0) / (z1 - z0);
      var v = vec2_lerp([], coord0, coord1, t);

      var vUnprojected = this.unprojectFlat(v);
      return xyz.length === 2 ? vUnprojected : [vUnprojected[0], vUnprojected[1], 0];
    }
  }, {
    key: 'transformVector',
    value: function transformVector(matrix, vector) {
      var result = vec4_transformMat4([0, 0, 0, 0], vector, matrix);
      var scale = 1 / result[3];
      vec4_multiply(result, result, [scale, scale, scale, scale]);
      return result;
    }

    // NON_LINEAR PROJECTION HOOKS
    // Used for web meractor projection

    /**
     * Project [lng,lat] on sphere onto [x,y] on 512*512 Mercator Zoom 0 tile.
     * Performs the nonlinear part of the web mercator projection.
     * Remaining projection is done with 4x4 matrices which also handles
     * perspective.
     * @param {Array} lngLat - [lng, lat] coordinates
     *   Specifies a point on the sphere to project onto the map.
     * @return {Array} [x,y] coordinates.
     */

  }, {
    key: 'projectFlat',
    value: function projectFlat(_ref4) {
      var _ref5 = _slicedToArray(_ref4, 2),
          x = _ref5[0],
          y = _ref5[1];

      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.scale;

      return this._projectFlat.apply(this, arguments);
    }

    /**
     * Unproject world point [x,y] on map onto {lat, lon} on sphere
     * @param {object|Vector} xy - object with {x,y} members
     *  representing point on projected map plane
     * @return {GeoCoordinates} - object with {lat,lon} of point on sphere.
     *   Has toArray method if you need a GeoJSON Array.
     *   Per cartographic tradition, lat and lon are specified as degrees.
     */

  }, {
    key: 'unprojectFlat',
    value: function unprojectFlat(xyz) {
      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.scale;

      return this._unprojectFlat.apply(this, arguments);
    }
  }, {
    key: 'getMatrices',
    value: function getMatrices() {
      var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref6$modelMatrix = _ref6.modelMatrix,
          modelMatrix = _ref6$modelMatrix === undefined ? null : _ref6$modelMatrix;

      var modelViewProjectionMatrix = this.viewProjectionMatrix;
      var pixelProjectionMatrix = this.pixelProjectionMatrix;
      var pixelUnprojectionMatrix = this.pixelUnprojectionMatrix;

      if (modelMatrix) {
        modelViewProjectionMatrix = mat4_multiply([], this.viewProjectionMatrix, modelMatrix);
        pixelProjectionMatrix = mat4_multiply([], this.pixelProjectionMatrix, modelMatrix);
        pixelUnprojectionMatrix = mat4_invert([], pixelProjectionMatrix);
      }

      var matrices = Object.assign({
        modelViewProjectionMatrix: modelViewProjectionMatrix,
        viewProjectionMatrix: this.viewProjectionMatrix,
        viewMatrix: this.viewMatrix,
        projectionMatrix: this.projectionMatrix,

        // project/unproject between pixels and world
        pixelProjectionMatrix: pixelProjectionMatrix,
        pixelUnprojectionMatrix: pixelUnprojectionMatrix,

        width: this.width,
        height: this.height,
        scale: this.scale
      });

      return matrices;
    }
  }, {
    key: 'getDistanceScales',
    value: function getDistanceScales() {
      return this.distanceScales;
    }
  }, {
    key: 'getCameraPosition',
    value: function getCameraPosition() {
      return this.cameraPosition;
    }

    // INTERNAL METHODS

  }, {
    key: '_initMatrices',
    value: function _initMatrices() {
      // Note: As usual, matrix operations should be applied in "reverse" order
      // since vectors will be multiplied in from the right during transformation
      var vpm = createMat4();
      mat4_multiply(vpm, vpm, this.projectionMatrix);
      mat4_multiply(vpm, vpm, this.viewMatrix);
      this.viewProjectionMatrix = vpm;

      // Calculate inverse view matrix
      this.viewMatrixInverse = mat4_invert([], this.viewMatrix) || this.viewMatrix;

      // Read the translation from the inverse view matrix
      this.cameraPosition = [this.viewMatrixInverse[12], this.viewMatrixInverse[13], this.viewMatrixInverse[14]];

      this.cameraDirection = [this.viewMatrix[2], this.viewMatrix[6], this.viewMatrix[10]];

      this.cameraUp = [this.viewMatrix[1], this.viewMatrix[5], this.viewMatrix[9]];

      /*
       * Builds matrices that converts preprojected lngLats to screen pixels
       * and vice versa.
       * Note: Currently returns bottom-left coordinates!
       * Note: Starts with the GL projection matrix and adds steps to the
       *       scale and translate that matrix onto the window.
       * Note: WebGL controls clip space to screen projection with gl.viewport
       *       and does not need this step.
       */

      // matrix for conversion from location to screen coordinates
      var m = createMat4();
      mat4_scale(m, m, [this.width / 2, -this.height / 2, 1]);
      mat4_translate(m, m, [1, -1, 0]);
      mat4_multiply(m, m, this.viewProjectionMatrix);
      this.pixelProjectionMatrix = m;

      this.pixelUnprojectionMatrix = mat4_invert(createMat4(), this.pixelProjectionMatrix);
      if (!this.pixelUnprojectionMatrix) {
        throw new Error('Pixel project matrix not invertible');
      }
    }
  }, {
    key: '_projectFlat',
    value: function _projectFlat(xyz) {
      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.scale;

      return xyz;
    }
  }, {
    key: '_unprojectFlat',
    value: function _unprojectFlat(xyz) {
      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.scale;

      return xyz;
    }
  }]);

  return Viewport;
}();

// Helper, avoids low-precision 32 bit matrices from gl-matrix mat4.create()


export default Viewport;
export function createMat4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvdmlld3BvcnRzL3ZpZXdwb3J0LmpzIl0sIm5hbWVzIjpbImVxdWFscyIsIm1hdDRfc2NhbGUiLCJtYXQ0X3RyYW5zbGF0ZSIsIm1hdDRfbXVsdGlwbHkiLCJtYXQ0X2ludmVydCIsInZlYzRfbXVsdGlwbHkiLCJ2ZWM0X3RyYW5zZm9ybU1hdDQiLCJ2ZWMyX2xlcnAiLCJhc3NlcnQiLCJJREVOVElUWSIsImNyZWF0ZU1hdDQiLCJERUZBVUxUX0RJU1RBTkNFX1NDQUxFUyIsInBpeGVsc1Blck1ldGVyIiwibWV0ZXJzUGVyUGl4ZWwiLCJwaXhlbHNQZXJEZWdyZWUiLCJkZWdyZWVzUGVyUGl4ZWwiLCJFUlJfQVJHVU1FTlQiLCJWaWV3cG9ydCIsIndpZHRoIiwiaGVpZ2h0Iiwidmlld01hdHJpeCIsInByb2plY3Rpb25NYXRyaXgiLCJkaXN0YW5jZVNjYWxlcyIsInNjYWxlIiwiX2luaXRNYXRyaWNlcyIsImJpbmQiLCJwcm9qZWN0IiwidW5wcm9qZWN0IiwicHJvamVjdEZsYXQiLCJ1bnByb2plY3RGbGF0IiwiZ2V0TWF0cmljZXMiLCJ2aWV3cG9ydCIsInh5eiIsInRvcExlZnQiLCJ4MCIsInkwIiwiejAiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsIlgiLCJZIiwidiIsInRyYW5zZm9ybVZlY3RvciIsInBpeGVsUHJvamVjdGlvbk1hdHJpeCIsIngiLCJ5IiwieTIiLCJsZW5ndGgiLCJ0YXJnZXRaIiwiY29vcmQwIiwicGl4ZWxVbnByb2plY3Rpb25NYXRyaXgiLCJjb29yZDEiLCJ6MSIsInQiLCJ2VW5wcm9qZWN0ZWQiLCJtYXRyaXgiLCJ2ZWN0b3IiLCJyZXN1bHQiLCJfcHJvamVjdEZsYXQiLCJhcmd1bWVudHMiLCJfdW5wcm9qZWN0RmxhdCIsIm1vZGVsTWF0cml4IiwibW9kZWxWaWV3UHJvamVjdGlvbk1hdHJpeCIsInZpZXdQcm9qZWN0aW9uTWF0cml4IiwibWF0cmljZXMiLCJPYmplY3QiLCJhc3NpZ24iLCJjYW1lcmFQb3NpdGlvbiIsInZwbSIsInZpZXdNYXRyaXhJbnZlcnNlIiwiY2FtZXJhRGlyZWN0aW9uIiwiY2FtZXJhVXAiLCJtIiwiRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUUEsaUJBQVIsUUFBcUIsU0FBckI7QUFDQSxPQUFPQyxVQUFQLE1BQXVCLGVBQXZCO0FBQ0EsT0FBT0MsY0FBUCxNQUEyQixtQkFBM0I7QUFDQSxPQUFPQyxhQUFQLE1BQTBCLGtCQUExQjtBQUNBLE9BQU9DLFdBQVAsTUFBd0IsZ0JBQXhCO0FBQ0EsT0FBT0MsYUFBUCxNQUEwQixrQkFBMUI7QUFDQSxPQUFPQyxrQkFBUCxNQUErQix1QkFBL0I7QUFDQSxPQUFPQyxTQUFQLE1BQXNCLGNBQXRCOztBQUVBLE9BQU9DLE1BQVAsTUFBbUIsUUFBbkI7O0FBRUEsSUFBTUMsV0FBV0MsWUFBakI7QUFDQSxJQUFNQywwQkFBMEI7QUFDOUJDLGtCQUFnQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQURjO0FBRTlCQyxrQkFBZ0IsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FGYztBQUc5QkMsbUJBQWlCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBSGE7QUFJOUJDLG1CQUFpQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUDtBQUphLENBQWhDOztBQU9BLElBQU1DLGVBQWUsOEJBQXJCOztJQUVxQkMsUTtBQUNuQjs7Ozs7OztBQU9BLHNCQVFRO0FBQUEsbUZBQUosRUFBSTtBQUFBLDBCQU5OQyxLQU1NO0FBQUEsUUFOTkEsS0FNTSw4QkFORSxDQU1GO0FBQUEsMkJBTE5DLE1BS007QUFBQSxRQUxOQSxNQUtNLCtCQUxHLENBS0g7QUFBQSwrQkFITkMsVUFHTTtBQUFBLFFBSE5BLFVBR00sbUNBSE9YLFFBR1A7QUFBQSxxQ0FGTlksZ0JBRU07QUFBQSxRQUZOQSxnQkFFTSx5Q0FGYVosUUFFYjtBQUFBLG1DQUROYSxjQUNNO0FBQUEsUUFETkEsY0FDTSx1Q0FEV1gsdUJBQ1g7O0FBQUE7O0FBQ047QUFDQSxTQUFLTyxLQUFMLEdBQWFBLFNBQVMsQ0FBdEI7QUFDQSxTQUFLQyxNQUFMLEdBQWNBLFVBQVUsQ0FBeEI7QUFDQSxTQUFLSSxLQUFMLEdBQWEsQ0FBYjs7QUFFQSxTQUFLSCxVQUFMLEdBQWtCQSxVQUFsQjtBQUNBLFNBQUtDLGdCQUFMLEdBQXdCQSxnQkFBeEI7QUFDQSxTQUFLQyxjQUFMLEdBQXNCQSxjQUF0Qjs7QUFFQSxTQUFLRSxhQUFMOztBQUVBLFNBQUt4QixNQUFMLEdBQWMsS0FBS0EsTUFBTCxDQUFZeUIsSUFBWixDQUFpQixJQUFqQixDQUFkO0FBQ0EsU0FBS0MsT0FBTCxHQUFlLEtBQUtBLE9BQUwsQ0FBYUQsSUFBYixDQUFrQixJQUFsQixDQUFmO0FBQ0EsU0FBS0UsU0FBTCxHQUFpQixLQUFLQSxTQUFMLENBQWVGLElBQWYsQ0FBb0IsSUFBcEIsQ0FBakI7QUFDQSxTQUFLRyxXQUFMLEdBQW1CLEtBQUtBLFdBQUwsQ0FBaUJILElBQWpCLENBQXNCLElBQXRCLENBQW5CO0FBQ0EsU0FBS0ksYUFBTCxHQUFxQixLQUFLQSxhQUFMLENBQW1CSixJQUFuQixDQUF3QixJQUF4QixDQUFyQjtBQUNBLFNBQUtLLFdBQUwsR0FBbUIsS0FBS0EsV0FBTCxDQUFpQkwsSUFBakIsQ0FBc0IsSUFBdEIsQ0FBbkI7QUFDRDs7QUFFRDtBQUNBOzs7OzsyQkFDT00sUSxFQUFVO0FBQ2YsVUFBSSxFQUFFQSxvQkFBb0JkLFFBQXRCLENBQUosRUFBcUM7QUFDbkMsZUFBTyxLQUFQO0FBQ0Q7O0FBRUQsYUFBT2MsU0FBU2IsS0FBVCxLQUFtQixLQUFLQSxLQUF4QixJQUNMYSxTQUFTWixNQUFULEtBQW9CLEtBQUtBLE1BRHBCLElBRUxuQixRQUFPK0IsU0FBU1YsZ0JBQWhCLEVBQWtDLEtBQUtBLGdCQUF2QyxDQUZLLElBR0xyQixRQUFPK0IsU0FBU1gsVUFBaEIsRUFBNEIsS0FBS0EsVUFBakMsQ0FIRjtBQUlFO0FBQ0g7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs0QkFZUVksRyxFQUE2QjtBQUFBLHNGQUFKLEVBQUk7QUFBQSxnQ0FBdkJDLE9BQXVCO0FBQUEsVUFBdkJBLE9BQXVCLGlDQUFiLEtBQWE7O0FBQUEsZ0NBQ1ZELEdBRFU7QUFBQSxVQUM1QkUsRUFENEI7QUFBQSxVQUN4QkMsRUFEd0I7QUFBQTtBQUFBLFVBQ3BCQyxFQURvQix5QkFDZixDQURlOztBQUVuQzVCLGFBQU82QixPQUFPQyxRQUFQLENBQWdCSixFQUFoQixLQUF1QkcsT0FBT0MsUUFBUCxDQUFnQkgsRUFBaEIsQ0FBdkIsSUFBOENFLE9BQU9DLFFBQVAsQ0FBZ0JGLEVBQWhCLENBQXJELEVBQTBFcEIsWUFBMUU7O0FBRm1DLDBCQUlwQixLQUFLWSxXQUFMLENBQWlCLENBQUNNLEVBQUQsRUFBS0MsRUFBTCxDQUFqQixDQUpvQjtBQUFBO0FBQUEsVUFJNUJJLENBSjRCO0FBQUEsVUFJekJDLENBSnlCOztBQUtuQyxVQUFNQyxJQUFJLEtBQUtDLGVBQUwsQ0FBcUIsS0FBS0MscUJBQTFCLEVBQWlELENBQUNKLENBQUQsRUFBSUMsQ0FBSixFQUFPSixFQUFQLEVBQVcsQ0FBWCxDQUFqRCxDQUFWOztBQUxtQyw4QkFPcEJLLENBUG9CO0FBQUEsVUFPNUJHLENBUDRCO0FBQUEsVUFPekJDLENBUHlCOztBQVFuQyxVQUFNQyxLQUFLYixVQUFVLEtBQUtkLE1BQUwsR0FBYzBCLENBQXhCLEdBQTRCQSxDQUF2QztBQUNBLGFBQU9iLElBQUllLE1BQUosS0FBZSxDQUFmLEdBQW1CLENBQUNILENBQUQsRUFBSUUsRUFBSixDQUFuQixHQUE2QixDQUFDRixDQUFELEVBQUlFLEVBQUosRUFBUSxDQUFSLENBQXBDO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7OzhCQVFVZCxHLEVBQTZCO0FBQUEsc0ZBQUosRUFBSTtBQUFBLGdDQUF2QkMsT0FBdUI7QUFBQSxVQUF2QkEsT0FBdUIsaUNBQWIsS0FBYTs7QUFBQSxpQ0FDVEQsR0FEUztBQUFBLFVBQzlCWSxDQUQ4QjtBQUFBLFVBQzNCQyxDQUQyQjtBQUFBO0FBQUEsVUFDeEJHLE9BRHdCLDBCQUNkLENBRGM7O0FBR3JDLFVBQU1GLEtBQUtiLFVBQVUsS0FBS2QsTUFBTCxHQUFjMEIsQ0FBeEIsR0FBNEJBLENBQXZDOztBQUVBO0FBQ0E7QUFDQSxVQUFNSSxTQUFTLEtBQUtQLGVBQUwsQ0FBcUIsS0FBS1EsdUJBQTFCLEVBQW1ELENBQUNOLENBQUQsRUFBSUUsRUFBSixFQUFRLENBQVIsRUFBVyxDQUFYLENBQW5ELENBQWY7QUFDQSxVQUFNSyxTQUFTLEtBQUtULGVBQUwsQ0FBcUIsS0FBS1EsdUJBQTFCLEVBQW1ELENBQUNOLENBQUQsRUFBSUUsRUFBSixFQUFRLENBQVIsRUFBVyxDQUFYLENBQW5ELENBQWY7O0FBRUEsVUFBTVYsS0FBS2EsT0FBTyxDQUFQLENBQVg7QUFDQSxVQUFNRyxLQUFLRCxPQUFPLENBQVAsQ0FBWDs7QUFFQSxVQUFNRSxJQUFJakIsT0FBT2dCLEVBQVAsR0FBWSxDQUFaLEdBQWdCLENBQUNKLFVBQVVaLEVBQVgsS0FBa0JnQixLQUFLaEIsRUFBdkIsQ0FBMUI7QUFDQSxVQUFNSyxJQUFJbEMsVUFBVSxFQUFWLEVBQWMwQyxNQUFkLEVBQXNCRSxNQUF0QixFQUE4QkUsQ0FBOUIsQ0FBVjs7QUFFQSxVQUFNQyxlQUFlLEtBQUt6QixhQUFMLENBQW1CWSxDQUFuQixDQUFyQjtBQUNBLGFBQU9ULElBQUllLE1BQUosS0FBZSxDQUFmLEdBQW1CTyxZQUFuQixHQUFrQyxDQUFDQSxhQUFhLENBQWIsQ0FBRCxFQUFrQkEsYUFBYSxDQUFiLENBQWxCLEVBQW1DLENBQW5DLENBQXpDO0FBQ0Q7OztvQ0FFZUMsTSxFQUFRQyxNLEVBQVE7QUFDOUIsVUFBTUMsU0FBU25ELG1CQUFtQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsQ0FBbkIsRUFBaUNrRCxNQUFqQyxFQUF5Q0QsTUFBekMsQ0FBZjtBQUNBLFVBQU1oQyxRQUFRLElBQUlrQyxPQUFPLENBQVAsQ0FBbEI7QUFDQXBELG9CQUFjb0QsTUFBZCxFQUFzQkEsTUFBdEIsRUFBOEIsQ0FBQ2xDLEtBQUQsRUFBUUEsS0FBUixFQUFlQSxLQUFmLEVBQXNCQSxLQUF0QixDQUE5QjtBQUNBLGFBQU9rQyxNQUFQO0FBQ0Q7O0FBRUQ7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7O3VDQVN3QztBQUFBO0FBQUEsVUFBM0JiLENBQTJCO0FBQUEsVUFBeEJDLENBQXdCOztBQUFBLFVBQXBCdEIsS0FBb0IsdUVBQVosS0FBS0EsS0FBTzs7QUFDdEMsYUFBTyxLQUFLbUMsWUFBTCxhQUFxQkMsU0FBckIsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7Ozs7OztrQ0FRYzNCLEcsRUFBeUI7QUFBQSxVQUFwQlQsS0FBb0IsdUVBQVosS0FBS0EsS0FBTzs7QUFDckMsYUFBTyxLQUFLcUMsY0FBTCxhQUF1QkQsU0FBdkIsQ0FBUDtBQUNEOzs7a0NBRXNDO0FBQUEsc0ZBQUosRUFBSTtBQUFBLG9DQUExQkUsV0FBMEI7QUFBQSxVQUExQkEsV0FBMEIscUNBQVosSUFBWTs7QUFDckMsVUFBSUMsNEJBQTRCLEtBQUtDLG9CQUFyQztBQUNBLFVBQUlwQix3QkFBd0IsS0FBS0EscUJBQWpDO0FBQ0EsVUFBSU8sMEJBQTBCLEtBQUtBLHVCQUFuQzs7QUFFQSxVQUFJVyxXQUFKLEVBQWlCO0FBQ2ZDLG9DQUE0QjNELGNBQWMsRUFBZCxFQUFrQixLQUFLNEQsb0JBQXZCLEVBQTZDRixXQUE3QyxDQUE1QjtBQUNBbEIsZ0NBQXdCeEMsY0FBYyxFQUFkLEVBQWtCLEtBQUt3QyxxQkFBdkIsRUFBOENrQixXQUE5QyxDQUF4QjtBQUNBWCxrQ0FBMEI5QyxZQUFZLEVBQVosRUFBZ0J1QyxxQkFBaEIsQ0FBMUI7QUFDRDs7QUFFRCxVQUFNcUIsV0FBV0MsT0FBT0MsTUFBUCxDQUFjO0FBQzdCSiw0REFENkI7QUFFN0JDLDhCQUFzQixLQUFLQSxvQkFGRTtBQUc3QjNDLG9CQUFZLEtBQUtBLFVBSFk7QUFJN0JDLDBCQUFrQixLQUFLQSxnQkFKTTs7QUFNN0I7QUFDQXNCLG9EQVA2QjtBQVE3Qk8sd0RBUjZCOztBQVU3QmhDLGVBQU8sS0FBS0EsS0FWaUI7QUFXN0JDLGdCQUFRLEtBQUtBLE1BWGdCO0FBWTdCSSxlQUFPLEtBQUtBO0FBWmlCLE9BQWQsQ0FBakI7O0FBZUEsYUFBT3lDLFFBQVA7QUFDRDs7O3dDQUVtQjtBQUNsQixhQUFPLEtBQUsxQyxjQUFaO0FBQ0Q7Ozt3Q0FFbUI7QUFDbEIsYUFBTyxLQUFLNkMsY0FBWjtBQUNEOztBQUVEOzs7O29DQUVnQjtBQUNkO0FBQ0E7QUFDQSxVQUFNQyxNQUFNMUQsWUFBWjtBQUNBUCxvQkFBY2lFLEdBQWQsRUFBbUJBLEdBQW5CLEVBQXdCLEtBQUsvQyxnQkFBN0I7QUFDQWxCLG9CQUFjaUUsR0FBZCxFQUFtQkEsR0FBbkIsRUFBd0IsS0FBS2hELFVBQTdCO0FBQ0EsV0FBSzJDLG9CQUFMLEdBQTRCSyxHQUE1Qjs7QUFFQTtBQUNBLFdBQUtDLGlCQUFMLEdBQXlCakUsWUFBWSxFQUFaLEVBQWdCLEtBQUtnQixVQUFyQixLQUFvQyxLQUFLQSxVQUFsRTs7QUFFQTtBQUNBLFdBQUsrQyxjQUFMLEdBQXNCLENBQ3BCLEtBQUtFLGlCQUFMLENBQXVCLEVBQXZCLENBRG9CLEVBRXBCLEtBQUtBLGlCQUFMLENBQXVCLEVBQXZCLENBRm9CLEVBR3BCLEtBQUtBLGlCQUFMLENBQXVCLEVBQXZCLENBSG9CLENBQXRCOztBQU1BLFdBQUtDLGVBQUwsR0FBdUIsQ0FDckIsS0FBS2xELFVBQUwsQ0FBZ0IsQ0FBaEIsQ0FEcUIsRUFFckIsS0FBS0EsVUFBTCxDQUFnQixDQUFoQixDQUZxQixFQUdyQixLQUFLQSxVQUFMLENBQWdCLEVBQWhCLENBSHFCLENBQXZCOztBQU1BLFdBQUttRCxRQUFMLEdBQWdCLENBQ2QsS0FBS25ELFVBQUwsQ0FBZ0IsQ0FBaEIsQ0FEYyxFQUVkLEtBQUtBLFVBQUwsQ0FBZ0IsQ0FBaEIsQ0FGYyxFQUdkLEtBQUtBLFVBQUwsQ0FBZ0IsQ0FBaEIsQ0FIYyxDQUFoQjs7QUFNQTs7Ozs7Ozs7OztBQVVBO0FBQ0EsVUFBTW9ELElBQUk5RCxZQUFWO0FBQ0FULGlCQUFXdUUsQ0FBWCxFQUFjQSxDQUFkLEVBQWlCLENBQUMsS0FBS3RELEtBQUwsR0FBYSxDQUFkLEVBQWlCLENBQUMsS0FBS0MsTUFBTixHQUFlLENBQWhDLEVBQW1DLENBQW5DLENBQWpCO0FBQ0FqQixxQkFBZXNFLENBQWYsRUFBa0JBLENBQWxCLEVBQXFCLENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBTCxFQUFRLENBQVIsQ0FBckI7QUFDQXJFLG9CQUFjcUUsQ0FBZCxFQUFpQkEsQ0FBakIsRUFBb0IsS0FBS1Qsb0JBQXpCO0FBQ0EsV0FBS3BCLHFCQUFMLEdBQTZCNkIsQ0FBN0I7O0FBRUEsV0FBS3RCLHVCQUFMLEdBQStCOUMsWUFBWU0sWUFBWixFQUEwQixLQUFLaUMscUJBQS9CLENBQS9CO0FBQ0EsVUFBSSxDQUFDLEtBQUtPLHVCQUFWLEVBQW1DO0FBQ2pDLGNBQU0sSUFBSXVCLEtBQUosQ0FBVSxxQ0FBVixDQUFOO0FBQ0Q7QUFDRjs7O2lDQUVZekMsRyxFQUF5QjtBQUFBLFVBQXBCVCxLQUFvQix1RUFBWixLQUFLQSxLQUFPOztBQUNwQyxhQUFPUyxHQUFQO0FBQ0Q7OzttQ0FFY0EsRyxFQUF5QjtBQUFBLFVBQXBCVCxLQUFvQix1RUFBWixLQUFLQSxLQUFPOztBQUN0QyxhQUFPUyxHQUFQO0FBQ0Q7Ozs7OztBQUdIOzs7ZUE5T3FCZixRO0FBK09yQixPQUFPLFNBQVNQLFVBQVQsR0FBc0I7QUFDM0IsU0FBTyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLEVBQW1CLENBQW5CLEVBQXNCLENBQXRCLEVBQXlCLENBQXpCLEVBQTRCLENBQTVCLEVBQStCLENBQS9CLEVBQWtDLENBQWxDLEVBQXFDLENBQXJDLEVBQXdDLENBQXhDLEVBQTJDLENBQTNDLEVBQThDLENBQTlDLENBQVA7QUFDRCIsImZpbGUiOiJ2aWV3cG9ydC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vLyBUT0RPIC0gcmVwbGFjZSB3aXRoIG1hdGguZ2xcbmltcG9ydCB7ZXF1YWxzfSBmcm9tICcuLi9tYXRoJztcbmltcG9ydCBtYXQ0X3NjYWxlIGZyb20gJ2dsLW1hdDQvc2NhbGUnO1xuaW1wb3J0IG1hdDRfdHJhbnNsYXRlIGZyb20gJ2dsLW1hdDQvdHJhbnNsYXRlJztcbmltcG9ydCBtYXQ0X211bHRpcGx5IGZyb20gJ2dsLW1hdDQvbXVsdGlwbHknO1xuaW1wb3J0IG1hdDRfaW52ZXJ0IGZyb20gJ2dsLW1hdDQvaW52ZXJ0JztcbmltcG9ydCB2ZWM0X211bHRpcGx5IGZyb20gJ2dsLXZlYzQvbXVsdGlwbHknO1xuaW1wb3J0IHZlYzRfdHJhbnNmb3JtTWF0NCBmcm9tICdnbC12ZWM0L3RyYW5zZm9ybU1hdDQnO1xuaW1wb3J0IHZlYzJfbGVycCBmcm9tICdnbC12ZWMyL2xlcnAnO1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IElERU5USVRZID0gY3JlYXRlTWF0NCgpO1xuY29uc3QgREVGQVVMVF9ESVNUQU5DRV9TQ0FMRVMgPSB7XG4gIHBpeGVsc1Blck1ldGVyOiBbMSwgMSwgMV0sXG4gIG1ldGVyc1BlclBpeGVsOiBbMSwgMSwgMV0sXG4gIHBpeGVsc1BlckRlZ3JlZTogWzEsIDEsIDFdLFxuICBkZWdyZWVzUGVyUGl4ZWw6IFsxLCAxLCAxXVxufTtcblxuY29uc3QgRVJSX0FSR1VNRU5UID0gJ0lsbGVnYWwgYXJndW1lbnQgdG8gVmlld3BvcnQnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWaWV3cG9ydCB7XG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIE1hbmFnZXMgY29vcmRpbmF0ZSBzeXN0ZW0gdHJhbnNmb3JtYXRpb25zIGZvciBkZWNrLmdsLlxuICAgKlxuICAgKiBOb3RlOiBUaGUgVmlld3BvcnQgaXMgaW1tdXRhYmxlIGluIHRoZSBzZW5zZSB0aGF0IGl0IG9ubHkgaGFzIGFjY2Vzc29ycy5cbiAgICogQSBuZXcgdmlld3BvcnQgaW5zdGFuY2Ugc2hvdWxkIGJlIGNyZWF0ZWQgaWYgYW55IHBhcmFtZXRlcnMgaGF2ZSBjaGFuZ2VkLlxuICAgKi9cbiAgY29uc3RydWN0b3Ioe1xuICAgIC8vIFdpbmRvdyB3aWR0aC9oZWlnaHQgaW4gcGl4ZWxzIChmb3IgcGl4ZWwgcHJvamVjdGlvbilcbiAgICB3aWR0aCA9IDEsXG4gICAgaGVpZ2h0ID0gMSxcbiAgICAvLyBEZXNjcmlwdGlvblxuICAgIHZpZXdNYXRyaXggPSBJREVOVElUWSxcbiAgICBwcm9qZWN0aW9uTWF0cml4ID0gSURFTlRJVFksXG4gICAgZGlzdGFuY2VTY2FsZXMgPSBERUZBVUxUX0RJU1RBTkNFX1NDQUxFU1xuICB9ID0ge30pIHtcbiAgICAvLyBTaWxlbnRseSBhbGxvdyBhcHBzIHRvIHNlbmQgaW4gMCwwXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoIHx8IDE7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgfHwgMTtcbiAgICB0aGlzLnNjYWxlID0gMTtcblxuICAgIHRoaXMudmlld01hdHJpeCA9IHZpZXdNYXRyaXg7XG4gICAgdGhpcy5wcm9qZWN0aW9uTWF0cml4ID0gcHJvamVjdGlvbk1hdHJpeDtcbiAgICB0aGlzLmRpc3RhbmNlU2NhbGVzID0gZGlzdGFuY2VTY2FsZXM7XG5cbiAgICB0aGlzLl9pbml0TWF0cmljZXMoKTtcblxuICAgIHRoaXMuZXF1YWxzID0gdGhpcy5lcXVhbHMuYmluZCh0aGlzKTtcbiAgICB0aGlzLnByb2plY3QgPSB0aGlzLnByb2plY3QuYmluZCh0aGlzKTtcbiAgICB0aGlzLnVucHJvamVjdCA9IHRoaXMudW5wcm9qZWN0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5wcm9qZWN0RmxhdCA9IHRoaXMucHJvamVjdEZsYXQuYmluZCh0aGlzKTtcbiAgICB0aGlzLnVucHJvamVjdEZsYXQgPSB0aGlzLnVucHJvamVjdEZsYXQuYmluZCh0aGlzKTtcbiAgICB0aGlzLmdldE1hdHJpY2VzID0gdGhpcy5nZXRNYXRyaWNlcy5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLy8gVHdvIHZpZXdwb3J0cyBhcmUgZXF1YWwgaWYgd2lkdGggYW5kIGhlaWdodCBhcmUgaWRlbnRpY2FsLCBhbmQgaWZcbiAgLy8gdGhlaXIgdmlldyBhbmQgcHJvamVjdGlvbiBtYXRyaWNlcyBhcmUgKGFwcHJveGltYXRlbHkpIGVxdWFsLlxuICBlcXVhbHModmlld3BvcnQpIHtcbiAgICBpZiAoISh2aWV3cG9ydCBpbnN0YW5jZW9mIFZpZXdwb3J0KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB2aWV3cG9ydC53aWR0aCA9PT0gdGhpcy53aWR0aCAmJlxuICAgICAgdmlld3BvcnQuaGVpZ2h0ID09PSB0aGlzLmhlaWdodCAmJlxuICAgICAgZXF1YWxzKHZpZXdwb3J0LnByb2plY3Rpb25NYXRyaXgsIHRoaXMucHJvamVjdGlvbk1hdHJpeCkgJiZcbiAgICAgIGVxdWFscyh2aWV3cG9ydC52aWV3TWF0cml4LCB0aGlzLnZpZXdNYXRyaXgpO1xuICAgICAgLy8gVE9ETyAtIGNoZWNrIGRpc3RhbmNlIHNjYWxlcz9cbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9qZWN0cyB4eXogKHBvc3NpYmx5IGxhdGl0dWRlIGFuZCBsb25naXR1ZGUpIHRvIHBpeGVsIGNvb3JkaW5hdGVzIGluIHdpbmRvd1xuICAgKiB1c2luZyB2aWV3cG9ydCBwcm9qZWN0aW9uIHBhcmFtZXRlcnNcbiAgICogLSBbbG9uZ2l0dWRlLCBsYXRpdHVkZV0gdG8gW3gsIHldXG4gICAqIC0gW2xvbmdpdHVkZSwgbGF0aXR1ZGUsIFpdID0+IFt4LCB5LCB6XVxuICAgKiBOb3RlOiBCeSBkZWZhdWx0LCByZXR1cm5zIHRvcC1sZWZ0IGNvb3JkaW5hdGVzIGZvciBjYW52YXMvU1ZHIHR5cGUgcmVuZGVyXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXl9IGxuZ0xhdFogLSBbbG5nLCBsYXRdIG9yIFtsbmcsIGxhdCwgWl1cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMgLSBvcHRpb25zXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzLnRvcExlZnQ9dHJ1ZSAtIFdoZXRoZXIgcHJvamVjdGVkIGNvb3JkcyBhcmUgdG9wIGxlZnRcbiAgICogQHJldHVybiB7QXJyYXl9IC0gW3gsIHldIG9yIFt4LCB5LCB6XSBpbiB0b3AgbGVmdCBjb29yZHNcbiAgICovXG4gIHByb2plY3QoeHl6LCB7dG9wTGVmdCA9IGZhbHNlfSA9IHt9KSB7XG4gICAgY29uc3QgW3gwLCB5MCwgejAgPSAwXSA9IHh5ejtcbiAgICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKHgwKSAmJiBOdW1iZXIuaXNGaW5pdGUoeTApICYmIE51bWJlci5pc0Zpbml0ZSh6MCksIEVSUl9BUkdVTUVOVCk7XG5cbiAgICBjb25zdCBbWCwgWV0gPSB0aGlzLnByb2plY3RGbGF0KFt4MCwgeTBdKTtcbiAgICBjb25zdCB2ID0gdGhpcy50cmFuc2Zvcm1WZWN0b3IodGhpcy5waXhlbFByb2plY3Rpb25NYXRyaXgsIFtYLCBZLCB6MCwgMV0pO1xuXG4gICAgY29uc3QgW3gsIHldID0gdjtcbiAgICBjb25zdCB5MiA9IHRvcExlZnQgPyB0aGlzLmhlaWdodCAtIHkgOiB5O1xuICAgIHJldHVybiB4eXoubGVuZ3RoID09PSAyID8gW3gsIHkyXSA6IFt4LCB5MiwgMF07XG4gIH1cblxuICAvKipcbiAgICogVW5wcm9qZWN0IHBpeGVsIGNvb3JkaW5hdGVzIG9uIHNjcmVlbiBvbnRvIHdvcmxkIGNvb3JkaW5hdGVzLFxuICAgKiAocG9zc2libHkgW2xvbiwgbGF0XSkgb24gbWFwLlxuICAgKiAtIFt4LCB5XSA9PiBbbG5nLCBsYXRdXG4gICAqIC0gW3gsIHksIHpdID0+IFtsbmcsIGxhdCwgWl1cbiAgICogQHBhcmFtIHtBcnJheX0geHl6IC1cbiAgICogQHJldHVybiB7QXJyYXl9IC0gW2xuZywgbGF0LCBaXSBvciBbWCwgWSwgWl1cbiAgICovXG4gIHVucHJvamVjdCh4eXosIHt0b3BMZWZ0ID0gZmFsc2V9ID0ge30pIHtcbiAgICBjb25zdCBbeCwgeSwgdGFyZ2V0WiA9IDBdID0geHl6O1xuXG4gICAgY29uc3QgeTIgPSB0b3BMZWZ0ID8gdGhpcy5oZWlnaHQgLSB5IDogeTtcblxuICAgIC8vIHNpbmNlIHdlIGRvbid0IGtub3cgdGhlIGNvcnJlY3QgcHJvamVjdGVkIHogdmFsdWUgZm9yIHRoZSBwb2ludCxcbiAgICAvLyB1bnByb2plY3QgdHdvIHBvaW50cyB0byBnZXQgYSBsaW5lIGFuZCB0aGVuIGZpbmQgdGhlIHBvaW50IG9uIHRoYXQgbGluZSB3aXRoIHo9MFxuICAgIGNvbnN0IGNvb3JkMCA9IHRoaXMudHJhbnNmb3JtVmVjdG9yKHRoaXMucGl4ZWxVbnByb2plY3Rpb25NYXRyaXgsIFt4LCB5MiwgMCwgMV0pO1xuICAgIGNvbnN0IGNvb3JkMSA9IHRoaXMudHJhbnNmb3JtVmVjdG9yKHRoaXMucGl4ZWxVbnByb2plY3Rpb25NYXRyaXgsIFt4LCB5MiwgMSwgMV0pO1xuXG4gICAgY29uc3QgejAgPSBjb29yZDBbMl07XG4gICAgY29uc3QgejEgPSBjb29yZDFbMl07XG5cbiAgICBjb25zdCB0ID0gejAgPT09IHoxID8gMCA6ICh0YXJnZXRaIC0gejApIC8gKHoxIC0gejApO1xuICAgIGNvbnN0IHYgPSB2ZWMyX2xlcnAoW10sIGNvb3JkMCwgY29vcmQxLCB0KTtcblxuICAgIGNvbnN0IHZVbnByb2plY3RlZCA9IHRoaXMudW5wcm9qZWN0RmxhdCh2KTtcbiAgICByZXR1cm4geHl6Lmxlbmd0aCA9PT0gMiA/IHZVbnByb2plY3RlZCA6IFt2VW5wcm9qZWN0ZWRbMF0sIHZVbnByb2plY3RlZFsxXSwgMF07XG4gIH1cblxuICB0cmFuc2Zvcm1WZWN0b3IobWF0cml4LCB2ZWN0b3IpIHtcbiAgICBjb25zdCByZXN1bHQgPSB2ZWM0X3RyYW5zZm9ybU1hdDQoWzAsIDAsIDAsIDBdLCB2ZWN0b3IsIG1hdHJpeCk7XG4gICAgY29uc3Qgc2NhbGUgPSAxIC8gcmVzdWx0WzNdO1xuICAgIHZlYzRfbXVsdGlwbHkocmVzdWx0LCByZXN1bHQsIFtzY2FsZSwgc2NhbGUsIHNjYWxlLCBzY2FsZV0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBOT05fTElORUFSIFBST0pFQ1RJT04gSE9PS1NcbiAgLy8gVXNlZCBmb3Igd2ViIG1lcmFjdG9yIHByb2plY3Rpb25cblxuICAvKipcbiAgICogUHJvamVjdCBbbG5nLGxhdF0gb24gc3BoZXJlIG9udG8gW3gseV0gb24gNTEyKjUxMiBNZXJjYXRvciBab29tIDAgdGlsZS5cbiAgICogUGVyZm9ybXMgdGhlIG5vbmxpbmVhciBwYXJ0IG9mIHRoZSB3ZWIgbWVyY2F0b3IgcHJvamVjdGlvbi5cbiAgICogUmVtYWluaW5nIHByb2plY3Rpb24gaXMgZG9uZSB3aXRoIDR4NCBtYXRyaWNlcyB3aGljaCBhbHNvIGhhbmRsZXNcbiAgICogcGVyc3BlY3RpdmUuXG4gICAqIEBwYXJhbSB7QXJyYXl9IGxuZ0xhdCAtIFtsbmcsIGxhdF0gY29vcmRpbmF0ZXNcbiAgICogICBTcGVjaWZpZXMgYSBwb2ludCBvbiB0aGUgc3BoZXJlIHRvIHByb2plY3Qgb250byB0aGUgbWFwLlxuICAgKiBAcmV0dXJuIHtBcnJheX0gW3gseV0gY29vcmRpbmF0ZXMuXG4gICAqL1xuICBwcm9qZWN0RmxhdChbeCwgeV0sIHNjYWxlID0gdGhpcy5zY2FsZSkge1xuICAgIHJldHVybiB0aGlzLl9wcm9qZWN0RmxhdCguLi5hcmd1bWVudHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVucHJvamVjdCB3b3JsZCBwb2ludCBbeCx5XSBvbiBtYXAgb250byB7bGF0LCBsb259IG9uIHNwaGVyZVxuICAgKiBAcGFyYW0ge29iamVjdHxWZWN0b3J9IHh5IC0gb2JqZWN0IHdpdGgge3gseX0gbWVtYmVyc1xuICAgKiAgcmVwcmVzZW50aW5nIHBvaW50IG9uIHByb2plY3RlZCBtYXAgcGxhbmVcbiAgICogQHJldHVybiB7R2VvQ29vcmRpbmF0ZXN9IC0gb2JqZWN0IHdpdGgge2xhdCxsb259IG9mIHBvaW50IG9uIHNwaGVyZS5cbiAgICogICBIYXMgdG9BcnJheSBtZXRob2QgaWYgeW91IG5lZWQgYSBHZW9KU09OIEFycmF5LlxuICAgKiAgIFBlciBjYXJ0b2dyYXBoaWMgdHJhZGl0aW9uLCBsYXQgYW5kIGxvbiBhcmUgc3BlY2lmaWVkIGFzIGRlZ3JlZXMuXG4gICAqL1xuICB1bnByb2plY3RGbGF0KHh5eiwgc2NhbGUgPSB0aGlzLnNjYWxlKSB7XG4gICAgcmV0dXJuIHRoaXMuX3VucHJvamVjdEZsYXQoLi4uYXJndW1lbnRzKTtcbiAgfVxuXG4gIGdldE1hdHJpY2VzKHttb2RlbE1hdHJpeCA9IG51bGx9ID0ge30pIHtcbiAgICBsZXQgbW9kZWxWaWV3UHJvamVjdGlvbk1hdHJpeCA9IHRoaXMudmlld1Byb2plY3Rpb25NYXRyaXg7XG4gICAgbGV0IHBpeGVsUHJvamVjdGlvbk1hdHJpeCA9IHRoaXMucGl4ZWxQcm9qZWN0aW9uTWF0cml4O1xuICAgIGxldCBwaXhlbFVucHJvamVjdGlvbk1hdHJpeCA9IHRoaXMucGl4ZWxVbnByb2plY3Rpb25NYXRyaXg7XG5cbiAgICBpZiAobW9kZWxNYXRyaXgpIHtcbiAgICAgIG1vZGVsVmlld1Byb2plY3Rpb25NYXRyaXggPSBtYXQ0X211bHRpcGx5KFtdLCB0aGlzLnZpZXdQcm9qZWN0aW9uTWF0cml4LCBtb2RlbE1hdHJpeCk7XG4gICAgICBwaXhlbFByb2plY3Rpb25NYXRyaXggPSBtYXQ0X211bHRpcGx5KFtdLCB0aGlzLnBpeGVsUHJvamVjdGlvbk1hdHJpeCwgbW9kZWxNYXRyaXgpO1xuICAgICAgcGl4ZWxVbnByb2plY3Rpb25NYXRyaXggPSBtYXQ0X2ludmVydChbXSwgcGl4ZWxQcm9qZWN0aW9uTWF0cml4KTtcbiAgICB9XG5cbiAgICBjb25zdCBtYXRyaWNlcyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgbW9kZWxWaWV3UHJvamVjdGlvbk1hdHJpeCxcbiAgICAgIHZpZXdQcm9qZWN0aW9uTWF0cml4OiB0aGlzLnZpZXdQcm9qZWN0aW9uTWF0cml4LFxuICAgICAgdmlld01hdHJpeDogdGhpcy52aWV3TWF0cml4LFxuICAgICAgcHJvamVjdGlvbk1hdHJpeDogdGhpcy5wcm9qZWN0aW9uTWF0cml4LFxuXG4gICAgICAvLyBwcm9qZWN0L3VucHJvamVjdCBiZXR3ZWVuIHBpeGVscyBhbmQgd29ybGRcbiAgICAgIHBpeGVsUHJvamVjdGlvbk1hdHJpeCxcbiAgICAgIHBpeGVsVW5wcm9qZWN0aW9uTWF0cml4LFxuXG4gICAgICB3aWR0aDogdGhpcy53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICBzY2FsZTogdGhpcy5zY2FsZVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG1hdHJpY2VzO1xuICB9XG5cbiAgZ2V0RGlzdGFuY2VTY2FsZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzdGFuY2VTY2FsZXM7XG4gIH1cblxuICBnZXRDYW1lcmFQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5jYW1lcmFQb3NpdGlvbjtcbiAgfVxuXG4gIC8vIElOVEVSTkFMIE1FVEhPRFNcblxuICBfaW5pdE1hdHJpY2VzKCkge1xuICAgIC8vIE5vdGU6IEFzIHVzdWFsLCBtYXRyaXggb3BlcmF0aW9ucyBzaG91bGQgYmUgYXBwbGllZCBpbiBcInJldmVyc2VcIiBvcmRlclxuICAgIC8vIHNpbmNlIHZlY3RvcnMgd2lsbCBiZSBtdWx0aXBsaWVkIGluIGZyb20gdGhlIHJpZ2h0IGR1cmluZyB0cmFuc2Zvcm1hdGlvblxuICAgIGNvbnN0IHZwbSA9IGNyZWF0ZU1hdDQoKTtcbiAgICBtYXQ0X211bHRpcGx5KHZwbSwgdnBtLCB0aGlzLnByb2plY3Rpb25NYXRyaXgpO1xuICAgIG1hdDRfbXVsdGlwbHkodnBtLCB2cG0sIHRoaXMudmlld01hdHJpeCk7XG4gICAgdGhpcy52aWV3UHJvamVjdGlvbk1hdHJpeCA9IHZwbTtcblxuICAgIC8vIENhbGN1bGF0ZSBpbnZlcnNlIHZpZXcgbWF0cml4XG4gICAgdGhpcy52aWV3TWF0cml4SW52ZXJzZSA9IG1hdDRfaW52ZXJ0KFtdLCB0aGlzLnZpZXdNYXRyaXgpIHx8IHRoaXMudmlld01hdHJpeDtcblxuICAgIC8vIFJlYWQgdGhlIHRyYW5zbGF0aW9uIGZyb20gdGhlIGludmVyc2UgdmlldyBtYXRyaXhcbiAgICB0aGlzLmNhbWVyYVBvc2l0aW9uID0gW1xuICAgICAgdGhpcy52aWV3TWF0cml4SW52ZXJzZVsxMl0sXG4gICAgICB0aGlzLnZpZXdNYXRyaXhJbnZlcnNlWzEzXSxcbiAgICAgIHRoaXMudmlld01hdHJpeEludmVyc2VbMTRdXG4gICAgXTtcblxuICAgIHRoaXMuY2FtZXJhRGlyZWN0aW9uID0gW1xuICAgICAgdGhpcy52aWV3TWF0cml4WzJdLFxuICAgICAgdGhpcy52aWV3TWF0cml4WzZdLFxuICAgICAgdGhpcy52aWV3TWF0cml4WzEwXVxuICAgIF07XG5cbiAgICB0aGlzLmNhbWVyYVVwID0gW1xuICAgICAgdGhpcy52aWV3TWF0cml4WzFdLFxuICAgICAgdGhpcy52aWV3TWF0cml4WzVdLFxuICAgICAgdGhpcy52aWV3TWF0cml4WzldXG4gICAgXTtcblxuICAgIC8qXG4gICAgICogQnVpbGRzIG1hdHJpY2VzIHRoYXQgY29udmVydHMgcHJlcHJvamVjdGVkIGxuZ0xhdHMgdG8gc2NyZWVuIHBpeGVsc1xuICAgICAqIGFuZCB2aWNlIHZlcnNhLlxuICAgICAqIE5vdGU6IEN1cnJlbnRseSByZXR1cm5zIGJvdHRvbS1sZWZ0IGNvb3JkaW5hdGVzIVxuICAgICAqIE5vdGU6IFN0YXJ0cyB3aXRoIHRoZSBHTCBwcm9qZWN0aW9uIG1hdHJpeCBhbmQgYWRkcyBzdGVwcyB0byB0aGVcbiAgICAgKiAgICAgICBzY2FsZSBhbmQgdHJhbnNsYXRlIHRoYXQgbWF0cml4IG9udG8gdGhlIHdpbmRvdy5cbiAgICAgKiBOb3RlOiBXZWJHTCBjb250cm9scyBjbGlwIHNwYWNlIHRvIHNjcmVlbiBwcm9qZWN0aW9uIHdpdGggZ2wudmlld3BvcnRcbiAgICAgKiAgICAgICBhbmQgZG9lcyBub3QgbmVlZCB0aGlzIHN0ZXAuXG4gICAgICovXG5cbiAgICAvLyBtYXRyaXggZm9yIGNvbnZlcnNpb24gZnJvbSBsb2NhdGlvbiB0byBzY3JlZW4gY29vcmRpbmF0ZXNcbiAgICBjb25zdCBtID0gY3JlYXRlTWF0NCgpO1xuICAgIG1hdDRfc2NhbGUobSwgbSwgW3RoaXMud2lkdGggLyAyLCAtdGhpcy5oZWlnaHQgLyAyLCAxXSk7XG4gICAgbWF0NF90cmFuc2xhdGUobSwgbSwgWzEsIC0xLCAwXSk7XG4gICAgbWF0NF9tdWx0aXBseShtLCBtLCB0aGlzLnZpZXdQcm9qZWN0aW9uTWF0cml4KTtcbiAgICB0aGlzLnBpeGVsUHJvamVjdGlvbk1hdHJpeCA9IG07XG5cbiAgICB0aGlzLnBpeGVsVW5wcm9qZWN0aW9uTWF0cml4ID0gbWF0NF9pbnZlcnQoY3JlYXRlTWF0NCgpLCB0aGlzLnBpeGVsUHJvamVjdGlvbk1hdHJpeCk7XG4gICAgaWYgKCF0aGlzLnBpeGVsVW5wcm9qZWN0aW9uTWF0cml4KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BpeGVsIHByb2plY3QgbWF0cml4IG5vdCBpbnZlcnRpYmxlJyk7XG4gICAgfVxuICB9XG5cbiAgX3Byb2plY3RGbGF0KHh5eiwgc2NhbGUgPSB0aGlzLnNjYWxlKSB7XG4gICAgcmV0dXJuIHh5ejtcbiAgfVxuXG4gIF91bnByb2plY3RGbGF0KHh5eiwgc2NhbGUgPSB0aGlzLnNjYWxlKSB7XG4gICAgcmV0dXJuIHh5ejtcbiAgfVxufVxuXG4vLyBIZWxwZXIsIGF2b2lkcyBsb3ctcHJlY2lzaW9uIDMyIGJpdCBtYXRyaWNlcyBmcm9tIGdsLW1hdHJpeCBtYXQ0LmNyZWF0ZSgpXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWF0NCgpIHtcbiAgcmV0dXJuIFsxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxXTtcbn1cbiJdfQ==