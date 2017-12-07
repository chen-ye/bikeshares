'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // View and Projection Matrix management

/* eslint-disable camelcase */


exports.createMat4 = createMat4;

var _scale = require('gl-mat4/scale');

var _scale2 = _interopRequireDefault(_scale);

var _translate = require('gl-mat4/translate');

var _translate2 = _interopRequireDefault(_translate);

var _multiply = require('gl-mat4/multiply');

var _multiply2 = _interopRequireDefault(_multiply);

var _invert = require('gl-mat4/invert');

var _invert2 = _interopRequireDefault(_invert);

var _multiply3 = require('gl-vec4/multiply');

var _multiply4 = _interopRequireDefault(_multiply3);

var _transformMat = require('gl-vec4/transformMat4');

var _transformMat2 = _interopRequireDefault(_transformMat);

var _lerp = require('gl-vec2/lerp');

var _lerp2 = _interopRequireDefault(_lerp);

var _equals2 = require('./equals');

var _equals3 = _interopRequireDefault(_equals2);

var _autobind = require('./autobind');

var _autobind2 = _interopRequireDefault(_autobind);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
    (0, _multiply2.default)(vpm, vpm, this.projectionMatrix);
    (0, _multiply2.default)(vpm, vpm, this.viewMatrix);
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
    (0, _scale2.default)(m, m, [this.width / 2, -this.height / 2, 1]);
    (0, _translate2.default)(m, m, [1, -1, 0]);

    (0, _multiply2.default)(m, m, this.viewProjectionMatrix);

    var mInverse = (0, _invert2.default)(createMat4(), m);
    if (!mInverse) {
      throw new Error('Pixel project matrix not invertible');
    }

    this.pixelProjectionMatrix = m;
    this.pixelUnprojectionMatrix = mInverse;

    (0, _autobind2.default)(this);
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

      return viewport.width === this.width && viewport.height === this.height && (0, _equals3.default)(viewport.projectionMatrix, this.projectionMatrix) && (0, _equals3.default)(viewport.viewMatrix, this.viewMatrix);
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

      (0, _assert2.default)(Number.isFinite(x0) && Number.isFinite(y0) && Number.isFinite(z0), ERR_ARGUMENT);

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
      var v = (0, _lerp2.default)([], coord0, coord1, t);

      var vUnprojected = this.unprojectFlat(v);
      return xyz.length === 2 ? vUnprojected : [vUnprojected[0], vUnprojected[1], 0];
    }

    // TODO - replace with math.gl

  }, {
    key: 'transformVector',
    value: function transformVector(matrix, vector) {
      var result = (0, _transformMat2.default)([0, 0, 0, 0], vector, matrix);
      var scale = 1 / result[3];
      (0, _multiply4.default)(result, result, [scale, scale, scale, scale]);
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
        modelViewProjectionMatrix = (0, _multiply2.default)([], this.viewProjectionMatrix, modelMatrix);
        pixelProjectionMatrix = (0, _multiply2.default)([], this.pixelProjectionMatrix, modelMatrix);
        pixelUnprojectionMatrix = (0, _invert2.default)([], pixelProjectionMatrix);
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


exports.default = Viewport;
function createMat4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJjcmVhdGVNYXQ0IiwiSURFTlRJVFkiLCJFUlJfQVJHVU1FTlQiLCJWaWV3cG9ydCIsIndpZHRoIiwiaGVpZ2h0Iiwidmlld01hdHJpeCIsInByb2plY3Rpb25NYXRyaXgiLCJzY2FsZSIsInZwbSIsInZpZXdQcm9qZWN0aW9uTWF0cml4IiwibSIsIm1JbnZlcnNlIiwiRXJyb3IiLCJwaXhlbFByb2plY3Rpb25NYXRyaXgiLCJwaXhlbFVucHJvamVjdGlvbk1hdHJpeCIsInZpZXdwb3J0IiwieHl6IiwidG9wTGVmdCIsIngwIiwieTAiLCJ6MCIsIk51bWJlciIsImlzRmluaXRlIiwicHJvamVjdEZsYXQiLCJYIiwiWSIsInYiLCJ0cmFuc2Zvcm1WZWN0b3IiLCJ4IiwieSIsInkyIiwibGVuZ3RoIiwidGFyZ2V0WiIsImNvb3JkMCIsImNvb3JkMSIsInoxIiwidCIsInZVbnByb2plY3RlZCIsInVucHJvamVjdEZsYXQiLCJtYXRyaXgiLCJ2ZWN0b3IiLCJyZXN1bHQiLCJfcHJvamVjdEZsYXQiLCJhcmd1bWVudHMiLCJfdW5wcm9qZWN0RmxhdCIsIm1vZGVsTWF0cml4IiwibW9kZWxWaWV3UHJvamVjdGlvbk1hdHJpeCIsIm1hdHJpY2VzIiwiT2JqZWN0IiwiYXNzaWduIiwiX2dldFBhcmFtcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7cWpCQUFBOztBQUVBOzs7UUFpUGdCQSxVLEdBQUFBLFU7O0FBaFBoQjs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNQyxXQUFXRCxZQUFqQjs7QUFFQSxJQUFNRSxlQUFlLDhCQUFyQjs7SUFFcUJDLFE7QUFDbkI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5QkE7QUFDQSxzQkFPUTtBQUFBLG1GQUFKLEVBQUk7QUFBQSwwQkFMTkMsS0FLTTtBQUFBLFFBTE5BLEtBS00sOEJBTEUsQ0FLRjtBQUFBLDJCQUpOQyxNQUlNO0FBQUEsUUFKTkEsTUFJTSwrQkFKRyxDQUlIO0FBQUEsK0JBRk5DLFVBRU07QUFBQSxRQUZOQSxVQUVNLG1DQUZPTCxRQUVQO0FBQUEscUNBRE5NLGdCQUNNO0FBQUEsUUFETkEsZ0JBQ00seUNBRGFOLFFBQ2I7O0FBQUE7O0FBQ047QUFDQSxTQUFLRyxLQUFMLEdBQWFBLFNBQVMsQ0FBdEI7QUFDQSxTQUFLQyxNQUFMLEdBQWNBLFVBQVUsQ0FBeEI7QUFDQSxTQUFLRyxLQUFMLEdBQWEsQ0FBYjs7QUFFQSxTQUFLRixVQUFMLEdBQWtCQSxVQUFsQjtBQUNBLFNBQUtDLGdCQUFMLEdBQXdCQSxnQkFBeEI7O0FBRUE7QUFDQTtBQUNBLFFBQU1FLE1BQU1ULFlBQVo7QUFDQSw0QkFBY1MsR0FBZCxFQUFtQkEsR0FBbkIsRUFBd0IsS0FBS0YsZ0JBQTdCO0FBQ0EsNEJBQWNFLEdBQWQsRUFBbUJBLEdBQW5CLEVBQXdCLEtBQUtILFVBQTdCO0FBQ0EsU0FBS0ksb0JBQUwsR0FBNEJELEdBQTVCOztBQUVBO0FBQ0E7Ozs7Ozs7OztBQVNBLFFBQU1FLElBQUlYLFlBQVY7O0FBRUE7QUFDQSx5QkFBV1csQ0FBWCxFQUFjQSxDQUFkLEVBQWlCLENBQUMsS0FBS1AsS0FBTCxHQUFhLENBQWQsRUFBaUIsQ0FBQyxLQUFLQyxNQUFOLEdBQWUsQ0FBaEMsRUFBbUMsQ0FBbkMsQ0FBakI7QUFDQSw2QkFBZU0sQ0FBZixFQUFrQkEsQ0FBbEIsRUFBcUIsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFMLEVBQVEsQ0FBUixDQUFyQjs7QUFFQSw0QkFBY0EsQ0FBZCxFQUFpQkEsQ0FBakIsRUFBb0IsS0FBS0Qsb0JBQXpCOztBQUVBLFFBQU1FLFdBQVcsc0JBQVlaLFlBQVosRUFBMEJXLENBQTFCLENBQWpCO0FBQ0EsUUFBSSxDQUFDQyxRQUFMLEVBQWU7QUFDYixZQUFNLElBQUlDLEtBQUosQ0FBVSxxQ0FBVixDQUFOO0FBQ0Q7O0FBRUQsU0FBS0MscUJBQUwsR0FBNkJILENBQTdCO0FBQ0EsU0FBS0ksdUJBQUwsR0FBK0JILFFBQS9COztBQUVBLDRCQUFTLElBQVQ7QUFDRDtBQUNEOztBQUVBO0FBQ0E7Ozs7OzJCQUNPSSxRLEVBQVU7QUFDZixVQUFJLEVBQUVBLG9CQUFvQmIsUUFBdEIsQ0FBSixFQUFxQztBQUNuQyxlQUFPLEtBQVA7QUFDRDs7QUFFRCxhQUFPYSxTQUFTWixLQUFULEtBQW1CLEtBQUtBLEtBQXhCLElBQ0xZLFNBQVNYLE1BQVQsS0FBb0IsS0FBS0EsTUFEcEIsSUFFTCxzQkFBT1csU0FBU1QsZ0JBQWhCLEVBQWtDLEtBQUtBLGdCQUF2QyxDQUZLLElBR0wsc0JBQU9TLFNBQVNWLFVBQWhCLEVBQTRCLEtBQUtBLFVBQWpDLENBSEY7QUFJRDs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7OzRCQVlRVyxHLEVBQTZCO0FBQUEsc0ZBQUosRUFBSTtBQUFBLGdDQUF2QkMsT0FBdUI7QUFBQSxVQUF2QkEsT0FBdUIsaUNBQWIsS0FBYTs7QUFBQSxnQ0FDVkQsR0FEVTtBQUFBLFVBQzVCRSxFQUQ0QjtBQUFBLFVBQ3hCQyxFQUR3QjtBQUFBO0FBQUEsVUFDcEJDLEVBRG9CLHlCQUNmLENBRGU7O0FBRW5DLDRCQUFPQyxPQUFPQyxRQUFQLENBQWdCSixFQUFoQixLQUF1QkcsT0FBT0MsUUFBUCxDQUFnQkgsRUFBaEIsQ0FBdkIsSUFBOENFLE9BQU9DLFFBQVAsQ0FBZ0JGLEVBQWhCLENBQXJELEVBQTBFbkIsWUFBMUU7O0FBRm1DLHlCQUlwQixLQUFLc0IsV0FBTCxDQUFpQixDQUFDTCxFQUFELEVBQUtDLEVBQUwsQ0FBakIsQ0FKb0I7QUFBQTtBQUFBLFVBSTVCSyxDQUo0QjtBQUFBLFVBSXpCQyxDQUp5Qjs7QUFLbkMsVUFBTUMsSUFBSSxLQUFLQyxlQUFMLENBQXFCLEtBQUtkLHFCQUExQixFQUFpRCxDQUFDVyxDQUFELEVBQUlDLENBQUosRUFBT0wsRUFBUCxFQUFXLENBQVgsQ0FBakQsQ0FBVjs7QUFMbUMsOEJBT3BCTSxDQVBvQjtBQUFBLFVBTzVCRSxDQVA0QjtBQUFBLFVBT3pCQyxDQVB5Qjs7QUFRbkMsVUFBTUMsS0FBS2IsVUFBVSxLQUFLYixNQUFMLEdBQWN5QixDQUF4QixHQUE0QkEsQ0FBdkM7QUFDQSxhQUFPYixJQUFJZSxNQUFKLEtBQWUsQ0FBZixHQUFtQixDQUFDSCxDQUFELEVBQUlFLEVBQUosQ0FBbkIsR0FBNkIsQ0FBQ0YsQ0FBRCxFQUFJRSxFQUFKLEVBQVEsQ0FBUixDQUFwQztBQUNEOztBQUVEOzs7Ozs7Ozs7Ozs4QkFRVWQsRyxFQUE2QjtBQUFBLHNGQUFKLEVBQUk7QUFBQSxnQ0FBdkJDLE9BQXVCO0FBQUEsVUFBdkJBLE9BQXVCLGlDQUFiLEtBQWE7O0FBQUEsaUNBQ1RELEdBRFM7QUFBQSxVQUM5QlksQ0FEOEI7QUFBQSxVQUMzQkMsQ0FEMkI7QUFBQTtBQUFBLFVBQ3hCRyxPQUR3QiwwQkFDZCxDQURjOztBQUdyQyxVQUFNRixLQUFLYixVQUFVLEtBQUtiLE1BQUwsR0FBY3lCLENBQXhCLEdBQTRCQSxDQUF2Qzs7QUFFQTtBQUNBO0FBQ0EsVUFBTUksU0FBUyxLQUFLTixlQUFMLENBQXFCLEtBQUtiLHVCQUExQixFQUFtRCxDQUFDYyxDQUFELEVBQUlFLEVBQUosRUFBUSxDQUFSLEVBQVcsQ0FBWCxDQUFuRCxDQUFmO0FBQ0EsVUFBTUksU0FBUyxLQUFLUCxlQUFMLENBQXFCLEtBQUtiLHVCQUExQixFQUFtRCxDQUFDYyxDQUFELEVBQUlFLEVBQUosRUFBUSxDQUFSLEVBQVcsQ0FBWCxDQUFuRCxDQUFmOztBQUVBLFVBQU1WLEtBQUthLE9BQU8sQ0FBUCxDQUFYO0FBQ0EsVUFBTUUsS0FBS0QsT0FBTyxDQUFQLENBQVg7O0FBRUEsVUFBTUUsSUFBSWhCLE9BQU9lLEVBQVAsR0FBWSxDQUFaLEdBQWdCLENBQUNILFVBQVVaLEVBQVgsS0FBa0JlLEtBQUtmLEVBQXZCLENBQTFCO0FBQ0EsVUFBTU0sSUFBSSxvQkFBVSxFQUFWLEVBQWNPLE1BQWQsRUFBc0JDLE1BQXRCLEVBQThCRSxDQUE5QixDQUFWOztBQUVBLFVBQU1DLGVBQWUsS0FBS0MsYUFBTCxDQUFtQlosQ0FBbkIsQ0FBckI7QUFDQSxhQUFPVixJQUFJZSxNQUFKLEtBQWUsQ0FBZixHQUFtQk0sWUFBbkIsR0FBa0MsQ0FBQ0EsYUFBYSxDQUFiLENBQUQsRUFBa0JBLGFBQWEsQ0FBYixDQUFsQixFQUFtQyxDQUFuQyxDQUF6QztBQUNEOztBQUVEOzs7O29DQUNnQkUsTSxFQUFRQyxNLEVBQVE7QUFDOUIsVUFBTUMsU0FBUyw0QkFBbUIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLENBQW5CLEVBQWlDRCxNQUFqQyxFQUF5Q0QsTUFBekMsQ0FBZjtBQUNBLFVBQU1oQyxRQUFRLElBQUlrQyxPQUFPLENBQVAsQ0FBbEI7QUFDQSw4QkFBY0EsTUFBZCxFQUFzQkEsTUFBdEIsRUFBOEIsQ0FBQ2xDLEtBQUQsRUFBUUEsS0FBUixFQUFlQSxLQUFmLEVBQXNCQSxLQUF0QixDQUE5QjtBQUNBLGFBQU9rQyxNQUFQO0FBQ0Q7O0FBRUQ7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7O3VDQVN3QztBQUFBO0FBQUEsVUFBM0JiLENBQTJCO0FBQUEsVUFBeEJDLENBQXdCOztBQUFBLFVBQXBCdEIsS0FBb0IsdUVBQVosS0FBS0EsS0FBTzs7QUFDdEMsYUFBTyxLQUFLbUMsWUFBTCxhQUFxQkMsU0FBckIsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7Ozs7OztrQ0FRYzNCLEcsRUFBeUI7QUFBQSxVQUFwQlQsS0FBb0IsdUVBQVosS0FBS0EsS0FBTzs7QUFDckMsYUFBTyxLQUFLcUMsY0FBTCxhQUF1QkQsU0FBdkIsQ0FBUDtBQUNEOzs7a0NBRXNDO0FBQUEsc0ZBQUosRUFBSTtBQUFBLG9DQUExQkUsV0FBMEI7QUFBQSxVQUExQkEsV0FBMEIscUNBQVosSUFBWTs7QUFDckMsVUFBSUMsNEJBQTRCLEtBQUtyQyxvQkFBckM7QUFDQSxVQUFJSSx3QkFBd0IsS0FBS0EscUJBQWpDO0FBQ0EsVUFBSUMsMEJBQTBCLEtBQUtBLHVCQUFuQzs7QUFFQSxVQUFJK0IsV0FBSixFQUFpQjtBQUNmQyxvQ0FBNEIsd0JBQWMsRUFBZCxFQUFrQixLQUFLckMsb0JBQXZCLEVBQTZDb0MsV0FBN0MsQ0FBNUI7QUFDQWhDLGdDQUF3Qix3QkFBYyxFQUFkLEVBQWtCLEtBQUtBLHFCQUF2QixFQUE4Q2dDLFdBQTlDLENBQXhCO0FBQ0EvQixrQ0FBMEIsc0JBQVksRUFBWixFQUFnQkQscUJBQWhCLENBQTFCO0FBQ0Q7O0FBRUQsVUFBTWtDLFdBQVdDLE9BQU9DLE1BQVAsQ0FBYztBQUM3QkgsNERBRDZCO0FBRTdCckMsOEJBQXNCLEtBQUtBLG9CQUZFO0FBRzdCSixvQkFBWSxLQUFLQSxVQUhZO0FBSTdCQywwQkFBa0IsS0FBS0EsZ0JBSk07O0FBTTdCO0FBQ0FPLG9EQVA2QjtBQVE3QkMsd0RBUjZCOztBQVU3QlgsZUFBTyxLQUFLQSxLQVZpQjtBQVc3QkMsZ0JBQVEsS0FBS0EsTUFYZ0I7QUFZN0JHLGVBQU8sS0FBS0E7QUFaaUIsT0FBZDs7QUFlZjtBQUNBO0FBQ0EsV0FBSzJDLFVBQUwsRUFqQmUsQ0FBakI7O0FBb0JBLGFBQU9ILFFBQVA7QUFDRDs7QUFFRDs7QUFFQTs7OztpQ0FDYTtBQUNYLGFBQU8sRUFBUDtBQUNEOzs7Ozs7QUFHSDs7O2tCQS9OcUI3QyxRO0FBZ09kLFNBQVNILFVBQVQsR0FBc0I7QUFDM0IsU0FBTyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLEVBQW1CLENBQW5CLEVBQXNCLENBQXRCLEVBQXlCLENBQXpCLEVBQTRCLENBQTVCLEVBQStCLENBQS9CLEVBQWtDLENBQWxDLEVBQXFDLENBQXJDLEVBQXdDLENBQXhDLEVBQTJDLENBQTNDLEVBQThDLENBQTlDLENBQVA7QUFDRCIsImZpbGUiOiJ2aWV3cG9ydC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFZpZXcgYW5kIFByb2plY3Rpb24gTWF0cml4IG1hbmFnZW1lbnRcblxuLyogZXNsaW50LWRpc2FibGUgY2FtZWxjYXNlICovXG5pbXBvcnQgbWF0NF9zY2FsZSBmcm9tICdnbC1tYXQ0L3NjYWxlJztcbmltcG9ydCBtYXQ0X3RyYW5zbGF0ZSBmcm9tICdnbC1tYXQ0L3RyYW5zbGF0ZSc7XG5pbXBvcnQgbWF0NF9tdWx0aXBseSBmcm9tICdnbC1tYXQ0L211bHRpcGx5JztcbmltcG9ydCBtYXQ0X2ludmVydCBmcm9tICdnbC1tYXQ0L2ludmVydCc7XG5pbXBvcnQgdmVjNF9tdWx0aXBseSBmcm9tICdnbC12ZWM0L211bHRpcGx5JztcbmltcG9ydCB2ZWM0X3RyYW5zZm9ybU1hdDQgZnJvbSAnZ2wtdmVjNC90cmFuc2Zvcm1NYXQ0JztcbmltcG9ydCB2ZWMyX2xlcnAgZnJvbSAnZ2wtdmVjMi9sZXJwJztcbmltcG9ydCBlcXVhbHMgZnJvbSAnLi9lcXVhbHMnO1xuXG5pbXBvcnQgYXV0b2JpbmQgZnJvbSAnLi9hdXRvYmluZCc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IElERU5USVRZID0gY3JlYXRlTWF0NCgpO1xuXG5jb25zdCBFUlJfQVJHVU1FTlQgPSAnSWxsZWdhbCBhcmd1bWVudCB0byBWaWV3cG9ydCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZpZXdwb3J0IHtcbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogTWFuYWdlcyBjb29yZGluYXRlIHN5c3RlbSB0cmFuc2Zvcm1hdGlvbnMgZm9yIGRlY2suZ2wuXG4gICAqXG4gICAqIE5vdGU6IFRoZSBWaWV3cG9ydCBpcyBpbW11dGFibGUgaW4gdGhlIHNlbnNlIHRoYXQgaXQgb25seSBoYXMgYWNjZXNzb3JzLlxuICAgKiBBIG5ldyB2aWV3cG9ydCBpbnN0YW5jZSBzaG91bGQgYmUgY3JlYXRlZCBpZiBhbnkgcGFyYW1ldGVycyBoYXZlIGNoYW5nZWQuXG4gICAqXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0IC0gb3B0aW9uc1xuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG1lcmNhdG9yPXRydWUgLSBXaGV0aGVyIHRvIHVzZSBtZXJjYXRvciBwcm9qZWN0aW9uXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHQud2lkdGg9MSAtIFdpZHRoIG9mIFwidmlld3BvcnRcIiBvciB3aW5kb3dcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdC5oZWlnaHQ9MSAtIEhlaWdodCBvZiBcInZpZXdwb3J0XCIgb3Igd2luZG93XG4gICAqIEBwYXJhbSB7QXJyYXl9IG9wdC5jZW50ZXI9WzAsIDBdIC0gQ2VudGVyIG9mIHZpZXdwb3J0XG4gICAqICAgW2xvbmdpdHVkZSwgbGF0aXR1ZGVdIG9yIFt4LCB5XVxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0LnNjYWxlPTEgLSBFaXRoZXIgdXNlIHNjYWxlIG9yIHpvb21cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdC5waXRjaD0wIC0gQ2FtZXJhIGFuZ2xlIGluIGRlZ3JlZXMgKDAgaXMgc3RyYWlnaHQgZG93bilcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdC5iZWFyaW5nPTAgLSBNYXAgcm90YXRpb24gaW4gZGVncmVlcyAoMCBtZWFucyBub3J0aCBpcyB1cClcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdC5hbHRpdHVkZT0gLSBBbHRpdHVkZSBvZiBjYW1lcmEgaW4gc2NyZWVuIHVuaXRzXG4gICAqXG4gICAqIFdlYiBtZXJjYXRvciBwcm9qZWN0aW9uIHNob3J0LWhhbmQgcGFyYW1ldGVyc1xuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0LmxhdGl0dWRlIC0gQ2VudGVyIG9mIHZpZXdwb3J0IG9uIG1hcCAoYWx0ZXJuYXRpdmUgdG8gb3B0LmNlbnRlcilcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdC5sb25naXR1ZGUgLSBDZW50ZXIgb2Ygdmlld3BvcnQgb24gbWFwIChhbHRlcm5hdGl2ZSB0byBvcHQuY2VudGVyKVxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0Lnpvb20gLSBTY2FsZSA9IE1hdGgucG93KDIsem9vbSkgb24gbWFwIChhbHRlcm5hdGl2ZSB0byBvcHQuc2NhbGUpXG4gICAqL1xuICAvKiBlc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5ICovXG4gIGNvbnN0cnVjdG9yKHtcbiAgICAvLyBXaW5kb3cgd2lkdGgvaGVpZ2h0IGluIHBpeGVscyAoZm9yIHBpeGVsIHByb2plY3Rpb24pXG4gICAgd2lkdGggPSAxLFxuICAgIGhlaWdodCA9IDEsXG4gICAgLy8gRGVzY1xuICAgIHZpZXdNYXRyaXggPSBJREVOVElUWSxcbiAgICBwcm9qZWN0aW9uTWF0cml4ID0gSURFTlRJVFlcbiAgfSA9IHt9KSB7XG4gICAgLy8gU2lsZW50bHkgYWxsb3cgYXBwcyB0byBzZW5kIGluIDAsMFxuICAgIHRoaXMud2lkdGggPSB3aWR0aCB8fCAxO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IDE7XG4gICAgdGhpcy5zY2FsZSA9IDE7XG5cbiAgICB0aGlzLnZpZXdNYXRyaXggPSB2aWV3TWF0cml4O1xuICAgIHRoaXMucHJvamVjdGlvbk1hdHJpeCA9IHByb2plY3Rpb25NYXRyaXg7XG5cbiAgICAvLyBOb3RlOiBBcyB1c3VhbCwgbWF0cml4IG9wZXJhdGlvbnMgc2hvdWxkIGJlIGFwcGxpZWQgaW4gXCJyZXZlcnNlXCIgb3JkZXJcbiAgICAvLyBzaW5jZSB2ZWN0b3JzIHdpbGwgYmUgbXVsdGlwbGllZCBpbiBmcm9tIHRoZSByaWdodCBkdXJpbmcgdHJhbnNmb3JtYXRpb25cbiAgICBjb25zdCB2cG0gPSBjcmVhdGVNYXQ0KCk7XG4gICAgbWF0NF9tdWx0aXBseSh2cG0sIHZwbSwgdGhpcy5wcm9qZWN0aW9uTWF0cml4KTtcbiAgICBtYXQ0X211bHRpcGx5KHZwbSwgdnBtLCB0aGlzLnZpZXdNYXRyaXgpO1xuICAgIHRoaXMudmlld1Byb2plY3Rpb25NYXRyaXggPSB2cG07XG5cbiAgICAvLyBDYWxjdWxhdGUgbWF0cmljZXMgYW5kIHNjYWxlcyBuZWVkZWQgZm9yIHByb2plY3Rpb25cbiAgICAvKipcbiAgICAgKiBCdWlsZHMgbWF0cmljZXMgdGhhdCBjb252ZXJ0cyBwcmVwcm9qZWN0ZWQgbG5nTGF0cyB0byBzY3JlZW4gcGl4ZWxzXG4gICAgICogYW5kIHZpY2UgdmVyc2EuXG4gICAgICogTm90ZTogQ3VycmVudGx5IHJldHVybnMgYm90dG9tLWxlZnQgY29vcmRpbmF0ZXMhXG4gICAgICogTm90ZTogU3RhcnRzIHdpdGggdGhlIEdMIHByb2plY3Rpb24gbWF0cml4IGFuZCBhZGRzIHN0ZXBzIHRvIHRoZVxuICAgICAqICAgICAgIHNjYWxlIGFuZCB0cmFuc2xhdGUgdGhhdCBtYXRyaXggb250byB0aGUgd2luZG93LlxuICAgICAqIE5vdGU6IFdlYkdMIGNvbnRyb2xzIGNsaXAgc3BhY2UgdG8gc2NyZWVuIHByb2plY3Rpb24gd2l0aCBnbC52aWV3cG9ydFxuICAgICAqICAgICAgIGFuZCBkb2VzIG5vdCBuZWVkIHRoaXMgc3RlcC5cbiAgICAgKi9cbiAgICBjb25zdCBtID0gY3JlYXRlTWF0NCgpO1xuXG4gICAgLy8gbWF0cml4IGZvciBjb252ZXJzaW9uIGZyb20gbG9jYXRpb24gdG8gc2NyZWVuIGNvb3JkaW5hdGVzXG4gICAgbWF0NF9zY2FsZShtLCBtLCBbdGhpcy53aWR0aCAvIDIsIC10aGlzLmhlaWdodCAvIDIsIDFdKTtcbiAgICBtYXQ0X3RyYW5zbGF0ZShtLCBtLCBbMSwgLTEsIDBdKTtcblxuICAgIG1hdDRfbXVsdGlwbHkobSwgbSwgdGhpcy52aWV3UHJvamVjdGlvbk1hdHJpeCk7XG5cbiAgICBjb25zdCBtSW52ZXJzZSA9IG1hdDRfaW52ZXJ0KGNyZWF0ZU1hdDQoKSwgbSk7XG4gICAgaWYgKCFtSW52ZXJzZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQaXhlbCBwcm9qZWN0IG1hdHJpeCBub3QgaW52ZXJ0aWJsZScpO1xuICAgIH1cblxuICAgIHRoaXMucGl4ZWxQcm9qZWN0aW9uTWF0cml4ID0gbTtcbiAgICB0aGlzLnBpeGVsVW5wcm9qZWN0aW9uTWF0cml4ID0gbUludmVyc2U7XG5cbiAgICBhdXRvYmluZCh0aGlzKTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHkgKi9cblxuICAvLyBUd28gdmlld3BvcnRzIGFyZSBlcXVhbCBpZiB3aWR0aCBhbmQgaGVpZ2h0IGFyZSBpZGVudGljYWwsIGFuZCBpZlxuICAvLyB0aGVpciB2aWV3IGFuZCBwcm9qZWN0aW9uIG1hdHJpY2VzIGFyZSAoYXBwcm94aW1hdGVseSkgZXF1YWwuXG4gIGVxdWFscyh2aWV3cG9ydCkge1xuICAgIGlmICghKHZpZXdwb3J0IGluc3RhbmNlb2YgVmlld3BvcnQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZpZXdwb3J0LndpZHRoID09PSB0aGlzLndpZHRoICYmXG4gICAgICB2aWV3cG9ydC5oZWlnaHQgPT09IHRoaXMuaGVpZ2h0ICYmXG4gICAgICBlcXVhbHModmlld3BvcnQucHJvamVjdGlvbk1hdHJpeCwgdGhpcy5wcm9qZWN0aW9uTWF0cml4KSAmJlxuICAgICAgZXF1YWxzKHZpZXdwb3J0LnZpZXdNYXRyaXgsIHRoaXMudmlld01hdHJpeCk7XG4gIH1cblxuICAvKipcbiAgICogUHJvamVjdHMgeHl6IChwb3NzaWJseSBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlKSB0byBwaXhlbCBjb29yZGluYXRlcyBpbiB3aW5kb3dcbiAgICogdXNpbmcgdmlld3BvcnQgcHJvamVjdGlvbiBwYXJhbWV0ZXJzXG4gICAqIC0gW2xvbmdpdHVkZSwgbGF0aXR1ZGVdIHRvIFt4LCB5XVxuICAgKiAtIFtsb25naXR1ZGUsIGxhdGl0dWRlLCBaXSA9PiBbeCwgeSwgel1cbiAgICogTm90ZTogQnkgZGVmYXVsdCwgcmV0dXJucyB0b3AtbGVmdCBjb29yZGluYXRlcyBmb3IgY2FudmFzL1NWRyB0eXBlIHJlbmRlclxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5fSBsbmdMYXRaIC0gW2xuZywgbGF0XSBvciBbbG5nLCBsYXQsIFpdXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIC0gb3B0aW9uc1xuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cy50b3BMZWZ0PXRydWUgLSBXaGV0aGVyIHByb2plY3RlZCBjb29yZHMgYXJlIHRvcCBsZWZ0XG4gICAqIEByZXR1cm4ge0FycmF5fSAtIFt4LCB5XSBvciBbeCwgeSwgel0gaW4gdG9wIGxlZnQgY29vcmRzXG4gICAqL1xuICBwcm9qZWN0KHh5eiwge3RvcExlZnQgPSBmYWxzZX0gPSB7fSkge1xuICAgIGNvbnN0IFt4MCwgeTAsIHowID0gMF0gPSB4eXo7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZSh4MCkgJiYgTnVtYmVyLmlzRmluaXRlKHkwKSAmJiBOdW1iZXIuaXNGaW5pdGUoejApLCBFUlJfQVJHVU1FTlQpO1xuXG4gICAgY29uc3QgW1gsIFldID0gdGhpcy5wcm9qZWN0RmxhdChbeDAsIHkwXSk7XG4gICAgY29uc3QgdiA9IHRoaXMudHJhbnNmb3JtVmVjdG9yKHRoaXMucGl4ZWxQcm9qZWN0aW9uTWF0cml4LCBbWCwgWSwgejAsIDFdKTtcblxuICAgIGNvbnN0IFt4LCB5XSA9IHY7XG4gICAgY29uc3QgeTIgPSB0b3BMZWZ0ID8gdGhpcy5oZWlnaHQgLSB5IDogeTtcbiAgICByZXR1cm4geHl6Lmxlbmd0aCA9PT0gMiA/IFt4LCB5Ml0gOiBbeCwgeTIsIDBdO1xuICB9XG5cbiAgLyoqXG4gICAqIFVucHJvamVjdCBwaXhlbCBjb29yZGluYXRlcyBvbiBzY3JlZW4gb250byB3b3JsZCBjb29yZGluYXRlcyxcbiAgICogKHBvc3NpYmx5IFtsb24sIGxhdF0pIG9uIG1hcC5cbiAgICogLSBbeCwgeV0gPT4gW2xuZywgbGF0XVxuICAgKiAtIFt4LCB5LCB6XSA9PiBbbG5nLCBsYXQsIFpdXG4gICAqIEBwYXJhbSB7QXJyYXl9IHh5eiAtXG4gICAqIEByZXR1cm4ge0FycmF5fSAtIFtsbmcsIGxhdCwgWl0gb3IgW1gsIFksIFpdXG4gICAqL1xuICB1bnByb2plY3QoeHl6LCB7dG9wTGVmdCA9IGZhbHNlfSA9IHt9KSB7XG4gICAgY29uc3QgW3gsIHksIHRhcmdldFogPSAwXSA9IHh5ejtcblxuICAgIGNvbnN0IHkyID0gdG9wTGVmdCA/IHRoaXMuaGVpZ2h0IC0geSA6IHk7XG5cbiAgICAvLyBzaW5jZSB3ZSBkb24ndCBrbm93IHRoZSBjb3JyZWN0IHByb2plY3RlZCB6IHZhbHVlIGZvciB0aGUgcG9pbnQsXG4gICAgLy8gdW5wcm9qZWN0IHR3byBwb2ludHMgdG8gZ2V0IGEgbGluZSBhbmQgdGhlbiBmaW5kIHRoZSBwb2ludCBvbiB0aGF0IGxpbmUgd2l0aCB6PTBcbiAgICBjb25zdCBjb29yZDAgPSB0aGlzLnRyYW5zZm9ybVZlY3Rvcih0aGlzLnBpeGVsVW5wcm9qZWN0aW9uTWF0cml4LCBbeCwgeTIsIDAsIDFdKTtcbiAgICBjb25zdCBjb29yZDEgPSB0aGlzLnRyYW5zZm9ybVZlY3Rvcih0aGlzLnBpeGVsVW5wcm9qZWN0aW9uTWF0cml4LCBbeCwgeTIsIDEsIDFdKTtcblxuICAgIGNvbnN0IHowID0gY29vcmQwWzJdO1xuICAgIGNvbnN0IHoxID0gY29vcmQxWzJdO1xuXG4gICAgY29uc3QgdCA9IHowID09PSB6MSA/IDAgOiAodGFyZ2V0WiAtIHowKSAvICh6MSAtIHowKTtcbiAgICBjb25zdCB2ID0gdmVjMl9sZXJwKFtdLCBjb29yZDAsIGNvb3JkMSwgdCk7XG5cbiAgICBjb25zdCB2VW5wcm9qZWN0ZWQgPSB0aGlzLnVucHJvamVjdEZsYXQodik7XG4gICAgcmV0dXJuIHh5ei5sZW5ndGggPT09IDIgPyB2VW5wcm9qZWN0ZWQgOiBbdlVucHJvamVjdGVkWzBdLCB2VW5wcm9qZWN0ZWRbMV0sIDBdO1xuICB9XG5cbiAgLy8gVE9ETyAtIHJlcGxhY2Ugd2l0aCBtYXRoLmdsXG4gIHRyYW5zZm9ybVZlY3RvcihtYXRyaXgsIHZlY3Rvcikge1xuICAgIGNvbnN0IHJlc3VsdCA9IHZlYzRfdHJhbnNmb3JtTWF0NChbMCwgMCwgMCwgMF0sIHZlY3RvciwgbWF0cml4KTtcbiAgICBjb25zdCBzY2FsZSA9IDEgLyByZXN1bHRbM107XG4gICAgdmVjNF9tdWx0aXBseShyZXN1bHQsIHJlc3VsdCwgW3NjYWxlLCBzY2FsZSwgc2NhbGUsIHNjYWxlXSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIE5PTl9MSU5FQVIgUFJPSkVDVElPTiBIT09LU1xuICAvLyBVc2VkIGZvciB3ZWIgbWVyYWN0b3IgcHJvamVjdGlvblxuXG4gIC8qKlxuICAgKiBQcm9qZWN0IFtsbmcsbGF0XSBvbiBzcGhlcmUgb250byBbeCx5XSBvbiA1MTIqNTEyIE1lcmNhdG9yIFpvb20gMCB0aWxlLlxuICAgKiBQZXJmb3JtcyB0aGUgbm9ubGluZWFyIHBhcnQgb2YgdGhlIHdlYiBtZXJjYXRvciBwcm9qZWN0aW9uLlxuICAgKiBSZW1haW5pbmcgcHJvamVjdGlvbiBpcyBkb25lIHdpdGggNHg0IG1hdHJpY2VzIHdoaWNoIGFsc28gaGFuZGxlc1xuICAgKiBwZXJzcGVjdGl2ZS5cbiAgICogQHBhcmFtIHtBcnJheX0gbG5nTGF0IC0gW2xuZywgbGF0XSBjb29yZGluYXRlc1xuICAgKiAgIFNwZWNpZmllcyBhIHBvaW50IG9uIHRoZSBzcGhlcmUgdG8gcHJvamVjdCBvbnRvIHRoZSBtYXAuXG4gICAqIEByZXR1cm4ge0FycmF5fSBbeCx5XSBjb29yZGluYXRlcy5cbiAgICovXG4gIHByb2plY3RGbGF0KFt4LCB5XSwgc2NhbGUgPSB0aGlzLnNjYWxlKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2plY3RGbGF0KC4uLmFyZ3VtZW50cyk7XG4gIH1cblxuICAvKipcbiAgICogVW5wcm9qZWN0IHdvcmxkIHBvaW50IFt4LHldIG9uIG1hcCBvbnRvIHtsYXQsIGxvbn0gb24gc3BoZXJlXG4gICAqIEBwYXJhbSB7b2JqZWN0fFZlY3Rvcn0geHkgLSBvYmplY3Qgd2l0aCB7eCx5fSBtZW1iZXJzXG4gICAqICByZXByZXNlbnRpbmcgcG9pbnQgb24gcHJvamVjdGVkIG1hcCBwbGFuZVxuICAgKiBAcmV0dXJuIHtHZW9Db29yZGluYXRlc30gLSBvYmplY3Qgd2l0aCB7bGF0LGxvbn0gb2YgcG9pbnQgb24gc3BoZXJlLlxuICAgKiAgIEhhcyB0b0FycmF5IG1ldGhvZCBpZiB5b3UgbmVlZCBhIEdlb0pTT04gQXJyYXkuXG4gICAqICAgUGVyIGNhcnRvZ3JhcGhpYyB0cmFkaXRpb24sIGxhdCBhbmQgbG9uIGFyZSBzcGVjaWZpZWQgYXMgZGVncmVlcy5cbiAgICovXG4gIHVucHJvamVjdEZsYXQoeHl6LCBzY2FsZSA9IHRoaXMuc2NhbGUpIHtcbiAgICByZXR1cm4gdGhpcy5fdW5wcm9qZWN0RmxhdCguLi5hcmd1bWVudHMpO1xuICB9XG5cbiAgZ2V0TWF0cmljZXMoe21vZGVsTWF0cml4ID0gbnVsbH0gPSB7fSkge1xuICAgIGxldCBtb2RlbFZpZXdQcm9qZWN0aW9uTWF0cml4ID0gdGhpcy52aWV3UHJvamVjdGlvbk1hdHJpeDtcbiAgICBsZXQgcGl4ZWxQcm9qZWN0aW9uTWF0cml4ID0gdGhpcy5waXhlbFByb2plY3Rpb25NYXRyaXg7XG4gICAgbGV0IHBpeGVsVW5wcm9qZWN0aW9uTWF0cml4ID0gdGhpcy5waXhlbFVucHJvamVjdGlvbk1hdHJpeDtcblxuICAgIGlmIChtb2RlbE1hdHJpeCkge1xuICAgICAgbW9kZWxWaWV3UHJvamVjdGlvbk1hdHJpeCA9IG1hdDRfbXVsdGlwbHkoW10sIHRoaXMudmlld1Byb2plY3Rpb25NYXRyaXgsIG1vZGVsTWF0cml4KTtcbiAgICAgIHBpeGVsUHJvamVjdGlvbk1hdHJpeCA9IG1hdDRfbXVsdGlwbHkoW10sIHRoaXMucGl4ZWxQcm9qZWN0aW9uTWF0cml4LCBtb2RlbE1hdHJpeCk7XG4gICAgICBwaXhlbFVucHJvamVjdGlvbk1hdHJpeCA9IG1hdDRfaW52ZXJ0KFtdLCBwaXhlbFByb2plY3Rpb25NYXRyaXgpO1xuICAgIH1cblxuICAgIGNvbnN0IG1hdHJpY2VzID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBtb2RlbFZpZXdQcm9qZWN0aW9uTWF0cml4LFxuICAgICAgdmlld1Byb2plY3Rpb25NYXRyaXg6IHRoaXMudmlld1Byb2plY3Rpb25NYXRyaXgsXG4gICAgICB2aWV3TWF0cml4OiB0aGlzLnZpZXdNYXRyaXgsXG4gICAgICBwcm9qZWN0aW9uTWF0cml4OiB0aGlzLnByb2plY3Rpb25NYXRyaXgsXG5cbiAgICAgIC8vIHByb2plY3QvdW5wcm9qZWN0IGJldHdlZW4gcGl4ZWxzIGFuZCB3b3JsZFxuICAgICAgcGl4ZWxQcm9qZWN0aW9uTWF0cml4LFxuICAgICAgcGl4ZWxVbnByb2plY3Rpb25NYXRyaXgsXG5cbiAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgIHNjYWxlOiB0aGlzLnNjYWxlXG4gICAgfSxcblxuICAgICAgLy8gU3ViY2xhc3MgY2FuIGFkZCBhZGRpdGlvbmFsIHBhcmFtc1xuICAgICAgLy8gVE9ETyAtIEZyYWdpbGU6IGJldHRlciB0byBtYWtlIGJhc2UgVmlld3BvcnQgY2xhc3MgYXdhcmUgb2YgYWxsIHBhcmFtc1xuICAgICAgdGhpcy5fZ2V0UGFyYW1zKClcbiAgICApO1xuXG4gICAgcmV0dXJuIG1hdHJpY2VzO1xuICB9XG5cbiAgLy8gSU5URVJOQUwgTUVUSE9EU1xuXG4gIC8vIENhbiBiZSBzdWJjbGFzc2VkIHRvIGFkZCBhZGRpdGlvbmFsIGZpZWxkcyB0byBgZ2V0TWF0cmljZXNgXG4gIF9nZXRQYXJhbXMoKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG59XG5cbi8vIEhlbHBlciwgYXZvaWRzIGxvdy1wcmVjaXNpb24gMzIgYml0IG1hdHJpY2VzIGZyb20gbWF0NC5jcmVhdGUoKVxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1hdDQoKSB7XG4gIHJldHVybiBbMSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMV07XG59XG4iXX0=