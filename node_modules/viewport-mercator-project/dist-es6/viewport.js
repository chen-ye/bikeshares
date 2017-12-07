var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// View and Projection Matrix management

/* eslint-disable camelcase */
import mat4_scale from 'gl-mat4/scale';
import mat4_translate from 'gl-mat4/translate';
import mat4_multiply from 'gl-mat4/multiply';
import mat4_invert from 'gl-mat4/invert';
import vec4_multiply from 'gl-vec4/multiply';
import vec4_transformMat4 from 'gl-vec4/transformMat4';
import vec2_lerp from 'gl-vec2/lerp';
import _equals from './equals';

import autobind from './autobind';
import assert from 'assert';

var IDENTITY = createMat4();

var ERR_ARGUMENT = 'Illegal argument to Viewport';

var Viewport = function () {
  /**
   * @classdesc
   * Manages coordinate system transformations for deck.gl.
   *
   * Note: The Viewport is immutable in the sense that it only has accessors.
   * A new viewport instance should be created if any parameters have changed.
   *
   * @class
   * @param {Object} opt - options
   * @param {Boolean} mercator=true - Whether to use mercator projection
   *
   * @param {Number} opt.width=1 - Width of "viewport" or window
   * @param {Number} opt.height=1 - Height of "viewport" or window
   * @param {Array} opt.center=[0, 0] - Center of viewport
   *   [longitude, latitude] or [x, y]
   * @param {Number} opt.scale=1 - Either use scale or zoom
   * @param {Number} opt.pitch=0 - Camera angle in degrees (0 is straight down)
   * @param {Number} opt.bearing=0 - Map rotation in degrees (0 means north is up)
   * @param {Number} opt.altitude= - Altitude of camera in screen units
   *
   * Web mercator projection short-hand parameters
   * @param {Number} opt.latitude - Center of viewport on map (alternative to opt.center)
   * @param {Number} opt.longitude - Center of viewport on map (alternative to opt.center)
   * @param {Number} opt.zoom - Scale = Math.pow(2,zoom) on map (alternative to opt.scale)
   */
  /* eslint-disable complexity */
  function Viewport() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$width = _ref.width,
        width = _ref$width === undefined ? 1 : _ref$width,
        _ref$height = _ref.height,
        height = _ref$height === undefined ? 1 : _ref$height,
        _ref$viewMatrix = _ref.viewMatrix,
        viewMatrix = _ref$viewMatrix === undefined ? IDENTITY : _ref$viewMatrix,
        _ref$projectionMatrix = _ref.projectionMatrix,
        projectionMatrix = _ref$projectionMatrix === undefined ? IDENTITY : _ref$projectionMatrix;

    _classCallCheck(this, Viewport);

    // Silently allow apps to send in 0,0
    this.width = width || 1;
    this.height = height || 1;
    this.scale = 1;

    this.viewMatrix = viewMatrix;
    this.projectionMatrix = projectionMatrix;

    // Note: As usual, matrix operations should be applied in "reverse" order
    // since vectors will be multiplied in from the right during transformation
    var vpm = createMat4();
    mat4_multiply(vpm, vpm, this.projectionMatrix);
    mat4_multiply(vpm, vpm, this.viewMatrix);
    this.viewProjectionMatrix = vpm;

    // Calculate matrices and scales needed for projection
    /**
     * Builds matrices that converts preprojected lngLats to screen pixels
     * and vice versa.
     * Note: Currently returns bottom-left coordinates!
     * Note: Starts with the GL projection matrix and adds steps to the
     *       scale and translate that matrix onto the window.
     * Note: WebGL controls clip space to screen projection with gl.viewport
     *       and does not need this step.
     */
    var m = createMat4();

    // matrix for conversion from location to screen coordinates
    mat4_scale(m, m, [this.width / 2, -this.height / 2, 1]);
    mat4_translate(m, m, [1, -1, 0]);

    mat4_multiply(m, m, this.viewProjectionMatrix);

    var mInverse = mat4_invert(createMat4(), m);
    if (!mInverse) {
      throw new Error('Pixel project matrix not invertible');
    }

    this.pixelProjectionMatrix = m;
    this.pixelUnprojectionMatrix = mInverse;

    autobind(this);
  }
  /* eslint-enable complexity */

  // Two viewports are equal if width and height are identical, and if
  // their view and projection matrices are (approximately) equal.


  _createClass(Viewport, [{
    key: 'equals',
    value: function equals(viewport) {
      if (!(viewport instanceof Viewport)) {
        return false;
      }

      return viewport.width === this.width && viewport.height === this.height && _equals(viewport.projectionMatrix, this.projectionMatrix) && _equals(viewport.viewMatrix, this.viewMatrix);
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

      var _projectFlat = this.projectFlat([x0, y0]),
          _projectFlat2 = _slicedToArray(_projectFlat, 2),
          X = _projectFlat2[0],
          Y = _projectFlat2[1];

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

    // TODO - replace with math.gl

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
      },

      // Subclass can add additional params
      // TODO - Fragile: better to make base Viewport class aware of all params
      this._getParams());

      return matrices;
    }

    // INTERNAL METHODS

    // Can be subclassed to add additional fields to `getMatrices`

  }, {
    key: '_getParams',
    value: function _getParams() {
      return {};
    }
  }]);

  return Viewport;
}();

// Helper, avoids low-precision 32 bit matrices from mat4.create()


export default Viewport;
export function createMat4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJtYXQ0X3NjYWxlIiwibWF0NF90cmFuc2xhdGUiLCJtYXQ0X211bHRpcGx5IiwibWF0NF9pbnZlcnQiLCJ2ZWM0X211bHRpcGx5IiwidmVjNF90cmFuc2Zvcm1NYXQ0IiwidmVjMl9sZXJwIiwiZXF1YWxzIiwiYXV0b2JpbmQiLCJhc3NlcnQiLCJJREVOVElUWSIsImNyZWF0ZU1hdDQiLCJFUlJfQVJHVU1FTlQiLCJWaWV3cG9ydCIsIndpZHRoIiwiaGVpZ2h0Iiwidmlld01hdHJpeCIsInByb2plY3Rpb25NYXRyaXgiLCJzY2FsZSIsInZwbSIsInZpZXdQcm9qZWN0aW9uTWF0cml4IiwibSIsIm1JbnZlcnNlIiwiRXJyb3IiLCJwaXhlbFByb2plY3Rpb25NYXRyaXgiLCJwaXhlbFVucHJvamVjdGlvbk1hdHJpeCIsInZpZXdwb3J0IiwieHl6IiwidG9wTGVmdCIsIngwIiwieTAiLCJ6MCIsIk51bWJlciIsImlzRmluaXRlIiwicHJvamVjdEZsYXQiLCJYIiwiWSIsInYiLCJ0cmFuc2Zvcm1WZWN0b3IiLCJ4IiwieSIsInkyIiwibGVuZ3RoIiwidGFyZ2V0WiIsImNvb3JkMCIsImNvb3JkMSIsInoxIiwidCIsInZVbnByb2plY3RlZCIsInVucHJvamVjdEZsYXQiLCJtYXRyaXgiLCJ2ZWN0b3IiLCJyZXN1bHQiLCJfcHJvamVjdEZsYXQiLCJhcmd1bWVudHMiLCJfdW5wcm9qZWN0RmxhdCIsIm1vZGVsTWF0cml4IiwibW9kZWxWaWV3UHJvamVjdGlvbk1hdHJpeCIsIm1hdHJpY2VzIiwiT2JqZWN0IiwiYXNzaWduIiwiX2dldFBhcmFtcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7O0FBRUE7QUFDQSxPQUFPQSxVQUFQLE1BQXVCLGVBQXZCO0FBQ0EsT0FBT0MsY0FBUCxNQUEyQixtQkFBM0I7QUFDQSxPQUFPQyxhQUFQLE1BQTBCLGtCQUExQjtBQUNBLE9BQU9DLFdBQVAsTUFBd0IsZ0JBQXhCO0FB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TyxTQUFTRixVQUFULEdBQXNCO0FBQzNCLFNBQU8sQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixFQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUF5QixDQUF6QixFQUE0QixDQUE1QixFQUErQixDQUEvQixFQUFrQyxDQUFsQyxFQUFxQyxDQUFyQyxFQUF3QyxDQUF4QyxFQUEyQyxDQUEzQyxFQUE4QyxDQUE5QyxDQUFQO0FBQ0QiLCJmaWxlIjoidmlld3BvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBWaWV3IGFuZCBQcm9qZWN0aW9uIE1hdHJpeCBtYW5hZ2VtZW50XG5cbi8qIGVzbGludC1kaXNhYmxlIGNhbWVsY2FzZSAqL1xuaW1wb3J0IG1hdDRfc2NhbGUgZnJvbSAnZ2wtbWF0NC9zY2FsZSc7XG5pbXBvcnQgbWF0NF90cmFuc2xhdGUgZnJvbSAnZ2wtbWF0NC90cmFuc2xhdGUnO1xuaW1wb3J0IG1hdDRfbXVsdGlwbHkgZnJvbSAnZ2wtbWF0NC9tdWx0aXBseSc7XG5pbXBvcnQgbWF0NF9pbnZlcnQgZnJvbSAnZ2wtbWF0NC9pbnZlcnQnO1xuaW1wb3J0IHZlYzRfbXVsdGlwbHkgZnJvbSAnZ2wtdmVjNC9tdWx0aXBseSc7XG5pbXBvcnQgdmVjNF90cmFuc2Zvcm1NYXQ0IGZyb20gJ2dsLXZlYzQvdHJhbnNmb3JtTWF0NCc7XG5pbXBvcnQgdmVjMl9sZXJwIGZyb20gJ2dsLXZlYzIvbGVycCc7XG5pbXBvcnQgZXF1YWxzIGZyb20gJy4vZXF1YWxzJztcblxuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4vYXV0b2JpbmQnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBJREVOVElUWSA9IGNyZWF0ZU1hdDQoKTtcblxuY29uc3QgRVJSX0FSR1VNRU5UID0gJ0lsbGVnYWwgYXJndW1lbnQgdG8gVmlld3BvcnQnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWaWV3cG9ydCB7XG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIE1hbmFnZXMgY29vcmRpbmF0ZSBzeXN0ZW0gdHJhbnNmb3JtYXRpb25zIGZvciBkZWNrLmdsLlxuICAgKlxuICAgKiBOb3RlOiBUaGUgVmlld3BvcnQgaXMgaW1tdXRhYmxlIGluIHRoZSBzZW5zZSB0aGF0IGl0IG9ubHkgaGFzIGFjY2Vzc29ycy5cbiAgICogQSBuZXcgdmlld3BvcnQgaW5zdGFuY2Ugc2hvdWxkIGJlIGNyZWF0ZWQgaWYgYW55IHBhcmFtZXRlcnMgaGF2ZSBjaGFuZ2VkLlxuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdCAtIG9wdGlvbnNcbiAgICogQHBhcmFtIHtCb29sZWFufSBtZXJjYXRvcj10cnVlIC0gV2hldGhlciB0byB1c2UgbWVyY2F0b3IgcHJvamVjdGlvblxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0LndpZHRoPTEgLSBXaWR0aCBvZiBcInZpZXdwb3J0XCIgb3Igd2luZG93XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHQuaGVpZ2h0PTEgLSBIZWlnaHQgb2YgXCJ2aWV3cG9ydFwiIG9yIHdpbmRvd1xuICAgKiBAcGFyYW0ge0FycmF5fSBvcHQuY2VudGVyPVswLCAwXSAtIENlbnRlciBvZiB2aWV3cG9ydFxuICAgKiAgIFtsb25naXR1ZGUsIGxhdGl0dWRlXSBvciBbeCwgeV1cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdC5zY2FsZT0xIC0gRWl0aGVyIHVzZSBzY2FsZSBvciB6b29tXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHQucGl0Y2g9MCAtIENhbWVyYSBhbmdsZSBpbiBkZWdyZWVzICgwIGlzIHN0cmFpZ2h0IGRvd24pXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHQuYmVhcmluZz0wIC0gTWFwIHJvdGF0aW9uIGluIGRlZ3JlZXMgKDAgbWVhbnMgbm9ydGggaXMgdXApXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHQuYWx0aXR1ZGU9IC0gQWx0aXR1ZGUgb2YgY2FtZXJhIGluIHNjcmVlbiB1bml0c1xuICAgKlxuICAgKiBXZWIgbWVyY2F0b3IgcHJvamVjdGlvbiBzaG9ydC1oYW5kIHBhcmFtZXRlcnNcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdC5sYXRpdHVkZSAtIENlbnRlciBvZiB2aWV3cG9ydCBvbiBtYXAgKGFsdGVybmF0aXZlIHRvIG9wdC5jZW50ZXIpXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHQubG9uZ2l0dWRlIC0gQ2VudGVyIG9mIHZpZXdwb3J0IG9uIG1hcCAoYWx0ZXJuYXRpdmUgdG8gb3B0LmNlbnRlcilcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdC56b29tIC0gU2NhbGUgPSBNYXRoLnBvdygyLHpvb20pIG9uIG1hcCAoYWx0ZXJuYXRpdmUgdG8gb3B0LnNjYWxlKVxuICAgKi9cbiAgLyogZXNsaW50LWRpc2FibGUgY29tcGxleGl0eSAqL1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgLy8gV2luZG93IHdpZHRoL2hlaWdodCBpbiBwaXhlbHMgKGZvciBwaXhlbCBwcm9qZWN0aW9uKVxuICAgIHdpZHRoID0gMSxcbiAgICBoZWlnaHQgPSAxLFxuICAgIC8vIERlc2NcbiAgICB2aWV3TWF0cml4ID0gSURFTlRJVFksXG4gICAgcHJvamVjdGlvbk1hdHJpeCA9IElERU5USVRZXG4gIH0gPSB7fSkge1xuICAgIC8vIFNpbGVudGx5IGFsbG93IGFwcHMgdG8gc2VuZCBpbiAwLDBcbiAgICB0aGlzLndpZHRoID0gd2lkdGggfHwgMTtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodCB8fCAxO1xuICAgIHRoaXMuc2NhbGUgPSAxO1xuXG4gICAgdGhpcy52aWV3TWF0cml4ID0gdmlld01hdHJpeDtcbiAgICB0aGlzLnByb2plY3Rpb25NYXRyaXggPSBwcm9qZWN0aW9uTWF0cml4O1xuXG4gICAgLy8gTm90ZTogQXMgdXN1YWwsIG1hdHJpeCBvcGVyYXRpb25zIHNob3VsZCBiZSBhcHBsaWVkIGluIFwicmV2ZXJzZVwiIG9yZGVyXG4gICAgLy8gc2luY2UgdmVjdG9ycyB3aWxsIGJlIG11bHRpcGxpZWQgaW4gZnJvbSB0aGUgcmlnaHQgZHVyaW5nIHRyYW5zZm9ybWF0aW9uXG4gICAgY29uc3QgdnBtID0gY3JlYXRlTWF0NCgpO1xuICAgIG1hdDRfbXVsdGlwbHkodnBtLCB2cG0sIHRoaXMucHJvamVjdGlvbk1hdHJpeCk7XG4gICAgbWF0NF9tdWx0aXBseSh2cG0sIHZwbSwgdGhpcy52aWV3TWF0cml4KTtcbiAgICB0aGlzLnZpZXdQcm9qZWN0aW9uTWF0cml4ID0gdnBtO1xuXG4gICAgLy8gQ2FsY3VsYXRlIG1hdHJpY2VzIGFuZCBzY2FsZXMgbmVlZGVkIGZvciBwcm9qZWN0aW9uXG4gICAgLyoqXG4gICAgICogQnVpbGRzIG1hdHJpY2VzIHRoYXQgY29udmVydHMgcHJlcHJvamVjdGVkIGxuZ0xhdHMgdG8gc2NyZWVuIHBpeGVsc1xuICAgICAqIGFuZCB2aWNlIHZlcnNhLlxuICAgICAqIE5vdGU6IEN1cnJlbnRseSByZXR1cm5zIGJvdHRvbS1sZWZ0IGNvb3JkaW5hdGVzIVxuICAgICAqIE5vdGU6IFN0YXJ0cyB3aXRoIHRoZSBHTCBwcm9qZWN0aW9uIG1hdHJpeCBhbmQgYWRkcyBzdGVwcyB0byB0aGVcbiAgICAgKiAgICAgICBzY2FsZSBhbmQgdHJhbnNsYXRlIHRoYXQgbWF0cml4IG9udG8gdGhlIHdpbmRvdy5cbiAgICAgKiBOb3RlOiBXZWJHTCBjb250cm9scyBjbGlwIHNwYWNlIHRvIHNjcmVlbiBwcm9qZWN0aW9uIHdpdGggZ2wudmlld3BvcnRcbiAgICAgKiAgICAgICBhbmQgZG9lcyBub3QgbmVlZCB0aGlzIHN0ZXAuXG4gICAgICovXG4gICAgY29uc3QgbSA9IGNyZWF0ZU1hdDQoKTtcblxuICAgIC8vIG1hdHJpeCBmb3IgY29udmVyc2lvbiBmcm9tIGxvY2F0aW9uIHRvIHNjcmVlbiBjb29yZGluYXRlc1xuICAgIG1hdDRfc2NhbGUobSwgbSwgW3RoaXMud2lkdGggLyAyLCAtdGhpcy5oZWlnaHQgLyAyLCAxXSk7XG4gICAgbWF0NF90cmFuc2xhdGUobSwgbSwgWzEsIC0xLCAwXSk7XG5cbiAgICBtYXQ0X211bHRpcGx5KG0sIG0sIHRoaXMudmlld1Byb2plY3Rpb25NYXRyaXgpO1xuXG4gICAgY29uc3QgbUludmVyc2UgPSBtYXQ0X2ludmVydChjcmVhdGVNYXQ0KCksIG0pO1xuICAgIGlmICghbUludmVyc2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGl4ZWwgcHJvamVjdCBtYXRyaXggbm90IGludmVydGlibGUnKTtcbiAgICB9XG5cbiAgICB0aGlzLnBpeGVsUHJvamVjdGlvbk1hdHJpeCA9IG07XG4gICAgdGhpcy5waXhlbFVucHJvamVjdGlvbk1hdHJpeCA9IG1JbnZlcnNlO1xuXG4gICAgYXV0b2JpbmQodGhpcyk7XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBjb21wbGV4aXR5ICovXG5cbiAgLy8gVHdvIHZpZXdwb3J0cyBhcmUgZXF1YWwgaWYgd2lkdGggYW5kIGhlaWdodCBhcmUgaWRlbnRpY2FsLCBhbmQgaWZcbiAgLy8gdGhlaXIgdmlldyBhbmQgcHJvamVjdGlvbiBtYXRyaWNlcyBhcmUgKGFwcHJveGltYXRlbHkpIGVxdWFsLlxuICBlcXVhbHModmlld3BvcnQpIHtcbiAgICBpZiAoISh2aWV3cG9ydCBpbnN0YW5jZW9mIFZpZXdwb3J0KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB2aWV3cG9ydC53aWR0aCA9PT0gdGhpcy53aWR0aCAmJlxuICAgICAgdmlld3BvcnQuaGVpZ2h0ID09PSB0aGlzLmhlaWdodCAmJlxuICAgICAgZXF1YWxzKHZpZXdwb3J0LnByb2plY3Rpb25NYXRyaXgsIHRoaXMucHJvamVjdGlvbk1hdHJpeCkgJiZcbiAgICAgIGVxdWFscyh2aWV3cG9ydC52aWV3TWF0cml4LCB0aGlzLnZpZXdNYXRyaXgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2plY3RzIHh5eiAocG9zc2libHkgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZSkgdG8gcGl4ZWwgY29vcmRpbmF0ZXMgaW4gd2luZG93XG4gICAqIHVzaW5nIHZpZXdwb3J0IHByb2plY3Rpb24gcGFyYW1ldGVyc1xuICAgKiAtIFtsb25naXR1ZGUsIGxhdGl0dWRlXSB0byBbeCwgeV1cbiAgICogLSBbbG9uZ2l0dWRlLCBsYXRpdHVkZSwgWl0gPT4gW3gsIHksIHpdXG4gICAqIE5vdGU6IEJ5IGRlZmF1bHQsIHJldHVybnMgdG9wLWxlZnQgY29vcmRpbmF0ZXMgZm9yIGNhbnZhcy9TVkcgdHlwZSByZW5kZXJcbiAgICpcbiAgICogQHBhcmFtIHtBcnJheX0gbG5nTGF0WiAtIFtsbmcsIGxhdF0gb3IgW2xuZywgbGF0LCBaXVxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cyAtIG9wdGlvbnNcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMudG9wTGVmdD10cnVlIC0gV2hldGhlciBwcm9qZWN0ZWQgY29vcmRzIGFyZSB0b3AgbGVmdFxuICAgKiBAcmV0dXJuIHtBcnJheX0gLSBbeCwgeV0gb3IgW3gsIHksIHpdIGluIHRvcCBsZWZ0IGNvb3Jkc1xuICAgKi9cbiAgcHJvamVjdCh4eXosIHt0b3BMZWZ0ID0gZmFsc2V9ID0ge30pIHtcbiAgICBjb25zdCBbeDAsIHkwLCB6MCA9IDBdID0geHl6O1xuICAgIGFzc2VydChOdW1iZXIuaXNGaW5pdGUoeDApICYmIE51bWJlci5pc0Zpbml0ZSh5MCkgJiYgTnVtYmVyLmlzRmluaXRlKHowKSwgRVJSX0FSR1VNRU5UKTtcblxuICAgIGNvbnN0IFtYLCBZXSA9IHRoaXMucHJvamVjdEZsYXQoW3gwLCB5MF0pO1xuICAgIGNvbnN0IHYgPSB0aGlzLnRyYW5zZm9ybVZlY3Rvcih0aGlzLnBpeGVsUHJvamVjdGlvbk1hdHJpeCwgW1gsIFksIHowLCAxXSk7XG5cbiAgICBjb25zdCBbeCwgeV0gPSB2O1xuICAgIGNvbnN0IHkyID0gdG9wTGVmdCA/IHRoaXMuaGVpZ2h0IC0geSA6IHk7XG4gICAgcmV0dXJuIHh5ei5sZW5ndGggPT09IDIgPyBbeCwgeTJdIDogW3gsIHkyLCAwXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbnByb2plY3QgcGl4ZWwgY29vcmRpbmF0ZXMgb24gc2NyZWVuIG9udG8gd29ybGQgY29vcmRpbmF0ZXMsXG4gICAqIChwb3NzaWJseSBbbG9uLCBsYXRdKSBvbiBtYXAuXG4gICAqIC0gW3gsIHldID0+IFtsbmcsIGxhdF1cbiAgICogLSBbeCwgeSwgel0gPT4gW2xuZywgbGF0LCBaXVxuICAgKiBAcGFyYW0ge0FycmF5fSB4eXogLVxuICAgKiBAcmV0dXJuIHtBcnJheX0gLSBbbG5nLCBsYXQsIFpdIG9yIFtYLCBZLCBaXVxuICAgKi9cbiAgdW5wcm9qZWN0KHh5eiwge3RvcExlZnQgPSBmYWxzZX0gPSB7fSkge1xuICAgIGNvbnN0IFt4LCB5LCB0YXJnZXRaID0gMF0gPSB4eXo7XG5cbiAgICBjb25zdCB5MiA9IHRvcExlZnQgPyB0aGlzLmhlaWdodCAtIHkgOiB5O1xuXG4gICAgLy8gc2luY2Ugd2UgZG9uJ3Qga25vdyB0aGUgY29ycmVjdCBwcm9qZWN0ZWQgeiB2YWx1ZSBmb3IgdGhlIHBvaW50LFxuICAgIC8vIHVucHJvamVjdCB0d28gcG9pbnRzIHRvIGdldCBhIGxpbmUgYW5kIHRoZW4gZmluZCB0aGUgcG9pbnQgb24gdGhhdCBsaW5lIHdpdGggej0wXG4gICAgY29uc3QgY29vcmQwID0gdGhpcy50cmFuc2Zvcm1WZWN0b3IodGhpcy5waXhlbFVucHJvamVjdGlvbk1hdHJpeCwgW3gsIHkyLCAwLCAxXSk7XG4gICAgY29uc3QgY29vcmQxID0gdGhpcy50cmFuc2Zvcm1WZWN0b3IodGhpcy5waXhlbFVucHJvamVjdGlvbk1hdHJpeCwgW3gsIHkyLCAxLCAxXSk7XG5cbiAgICBjb25zdCB6MCA9IGNvb3JkMFsyXTtcbiAgICBjb25zdCB6MSA9IGNvb3JkMVsyXTtcblxuICAgIGNvbnN0IHQgPSB6MCA9PT0gejEgPyAwIDogKHRhcmdldFogLSB6MCkgLyAoejEgLSB6MCk7XG4gICAgY29uc3QgdiA9IHZlYzJfbGVycChbXSwgY29vcmQwLCBjb29yZDEsIHQpO1xuXG4gICAgY29uc3QgdlVucHJvamVjdGVkID0gdGhpcy51bnByb2plY3RGbGF0KHYpO1xuICAgIHJldHVybiB4eXoubGVuZ3RoID09PSAyID8gdlVucHJvamVjdGVkIDogW3ZVbnByb2plY3RlZFswXSwgdlVucHJvamVjdGVkWzFdLCAwXTtcbiAgfVxuXG4gIC8vIFRPRE8gLSByZXBsYWNlIHdpdGggbWF0aC5nbFxuICB0cmFuc2Zvcm1WZWN0b3IobWF0cml4LCB2ZWN0b3IpIHtcbiAgICBjb25zdCByZXN1bHQgPSB2ZWM0X3RyYW5zZm9ybU1hdDQoWzAsIDAsIDAsIDBdLCB2ZWN0b3IsIG1hdHJpeCk7XG4gICAgY29uc3Qgc2NhbGUgPSAxIC8gcmVzdWx0WzNdO1xuICAgIHZlYzRfbXVsdGlwbHkocmVzdWx0LCByZXN1bHQsIFtzY2FsZSwgc2NhbGUsIHNjYWxlLCBzY2FsZV0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBOT05fTElORUFSIFBST0pFQ1RJT04gSE9PS1NcbiAgLy8gVXNlZCBmb3Igd2ViIG1lcmFjdG9yIHByb2plY3Rpb25cblxuICAvKipcbiAgICogUHJvamVjdCBbbG5nLGxhdF0gb24gc3BoZXJlIG9udG8gW3gseV0gb24gNTEyKjUxMiBNZXJjYXRvciBab29tIDAgdGlsZS5cbiAgICogUGVyZm9ybXMgdGhlIG5vbmxpbmVhciBwYXJ0IG9mIHRoZSB3ZWIgbWVyY2F0b3IgcHJvamVjdGlvbi5cbiAgICogUmVtYWluaW5nIHByb2plY3Rpb24gaXMgZG9uZSB3aXRoIDR4NCBtYXRyaWNlcyB3aGljaCBhbHNvIGhhbmRsZXNcbiAgICogcGVyc3BlY3RpdmUuXG4gICAqIEBwYXJhbSB7QXJyYXl9IGxuZ0xhdCAtIFtsbmcsIGxhdF0gY29vcmRpbmF0ZXNcbiAgICogICBTcGVjaWZpZXMgYSBwb2ludCBvbiB0aGUgc3BoZXJlIHRvIHByb2plY3Qgb250byB0aGUgbWFwLlxuICAgKiBAcmV0dXJuIHtBcnJheX0gW3gseV0gY29vcmRpbmF0ZXMuXG4gICAqL1xuICBwcm9qZWN0RmxhdChbeCwgeV0sIHNjYWxlID0gdGhpcy5zY2FsZSkge1xuICAgIHJldHVybiB0aGlzLl9wcm9qZWN0RmxhdCguLi5hcmd1bWVudHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVucHJvamVjdCB3b3JsZCBwb2ludCBbeCx5XSBvbiBtYXAgb250byB7bGF0LCBsb259IG9uIHNwaGVyZVxuICAgKiBAcGFyYW0ge29iamVjdHxWZWN0b3J9IHh5IC0gb2JqZWN0IHdpdGgge3gseX0gbWVtYmVyc1xuICAgKiAgcmVwcmVzZW50aW5nIHBvaW50IG9uIHByb2plY3RlZCBtYXAgcGxhbmVcbiAgICogQHJldHVybiB7R2VvQ29vcmRpbmF0ZXN9IC0gb2JqZWN0IHdpdGgge2xhdCxsb259IG9mIHBvaW50IG9uIHNwaGVyZS5cbiAgICogICBIYXMgdG9BcnJheSBtZXRob2QgaWYgeW91IG5lZWQgYSBHZW9KU09OIEFycmF5LlxuICAgKiAgIFBlciBjYXJ0b2dyYXBoaWMgdHJhZGl0aW9uLCBsYXQgYW5kIGxvbiBhcmUgc3BlY2lmaWVkIGFzIGRlZ3JlZXMuXG4gICAqL1xuICB1bnByb2plY3RGbGF0KHh5eiwgc2NhbGUgPSB0aGlzLnNjYWxlKSB7XG4gICAgcmV0dXJuIHRoaXMuX3VucHJvamVjdEZsYXQoLi4uYXJndW1lbnRzKTtcbiAgfVxuXG4gIGdldE1hdHJpY2VzKHttb2RlbE1hdHJpeCA9IG51bGx9ID0ge30pIHtcbiAgICBsZXQgbW9kZWxWaWV3UHJvamVjdGlvbk1hdHJpeCA9IHRoaXMudmlld1Byb2plY3Rpb25NYXRyaXg7XG4gICAgbGV0IHBpeGVsUHJvamVjdGlvbk1hdHJpeCA9IHRoaXMucGl4ZWxQcm9qZWN0aW9uTWF0cml4O1xuICAgIGxldCBwaXhlbFVucHJvamVjdGlvbk1hdHJpeCA9IHRoaXMucGl4ZWxVbnByb2plY3Rpb25NYXRyaXg7XG5cbiAgICBpZiAobW9kZWxNYXRyaXgpIHtcbiAgICAgIG1vZGVsVmlld1Byb2plY3Rpb25NYXRyaXggPSBtYXQ0X211bHRpcGx5KFtdLCB0aGlzLnZpZXdQcm9qZWN0aW9uTWF0cml4LCBtb2RlbE1hdHJpeCk7XG4gICAgICBwaXhlbFByb2plY3Rpb25NYXRyaXggPSBtYXQ0X211bHRpcGx5KFtdLCB0aGlzLnBpeGVsUHJvamVjdGlvbk1hdHJpeCwgbW9kZWxNYXRyaXgpO1xuICAgICAgcGl4ZWxVbnByb2plY3Rpb25NYXRyaXggPSBtYXQ0X2ludmVydChbXSwgcGl4ZWxQcm9qZWN0aW9uTWF0cml4KTtcbiAgICB9XG5cbiAgICBjb25zdCBtYXRyaWNlcyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgbW9kZWxWaWV3UHJvamVjdGlvbk1hdHJpeCxcbiAgICAgIHZpZXdQcm9qZWN0aW9uTWF0cml4OiB0aGlzLnZpZXdQcm9qZWN0aW9uTWF0cml4LFxuICAgICAgdmlld01hdHJpeDogdGhpcy52aWV3TWF0cml4LFxuICAgICAgcHJvamVjdGlvbk1hdHJpeDogdGhpcy5wcm9qZWN0aW9uTWF0cml4LFxuXG4gICAgICAvLyBwcm9qZWN0L3VucHJvamVjdCBiZXR3ZWVuIHBpeGVscyBhbmQgd29ybGRcbiAgICAgIHBpeGVsUHJvamVjdGlvbk1hdHJpeCxcbiAgICAgIHBpeGVsVW5wcm9qZWN0aW9uTWF0cml4LFxuXG4gICAgICB3aWR0aDogdGhpcy53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICBzY2FsZTogdGhpcy5zY2FsZVxuICAgIH0sXG5cbiAgICAgIC8vIFN1YmNsYXNzIGNhbiBhZGQgYWRkaXRpb25hbCBwYXJhbXNcbiAgICAgIC8vIFRPRE8gLSBGcmFnaWxlOiBiZXR0ZXIgdG8gbWFrZSBiYXNlIFZpZXdwb3J0IGNsYXNzIGF3YXJlIG9mIGFsbCBwYXJhbXNcbiAgICAgIHRoaXMuX2dldFBhcmFtcygpXG4gICAgKTtcblxuICAgIHJldHVybiBtYXRyaWNlcztcbiAgfVxuXG4gIC8vIElOVEVSTkFMIE1FVEhPRFNcblxuICAvLyBDYW4gYmUgc3ViY2xhc3NlZCB0byBhZGQgYWRkaXRpb25hbCBmaWVsZHMgdG8gYGdldE1hdHJpY2VzYFxuICBfZ2V0UGFyYW1zKCkge1xuICAgIHJldHVybiB7fTtcbiAgfVxufVxuXG4vLyBIZWxwZXIsIGF2b2lkcyBsb3ctcHJlY2lzaW9uIDMyIGJpdCBtYXRyaWNlcyBmcm9tIG1hdDQuY3JlYXRlKClcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNYXQ0KCkge1xuICByZXR1cm4gWzEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDFdO1xufVxuIl19