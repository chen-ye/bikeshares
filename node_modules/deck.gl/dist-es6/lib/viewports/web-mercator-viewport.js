var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

// View and Projection Matrix calculations for mapbox-js style
// map view properties
import Viewport, { createMat4 } from './viewport';

import { projectFlat, unprojectFlat, calculateDistanceScales, makeProjectionMatrixFromMercatorParams, makeUncenteredViewMatrixFromMercatorParams } from '../../viewports/web-mercator-utils';

import mat4_translate from 'gl-mat4/translate';
import assert from 'assert';

var DEFAULT_MAP_STATE = {
  latitude: 37,
  longitude: -122,
  zoom: 11,
  pitch: 0,
  bearing: 0,
  altitude: 1.5
};

var ERR_ARGUMENT = 'Illegal argument to WebMercatorViewport';

var WebMercatorViewport = function (_Viewport) {
  _inherits(WebMercatorViewport, _Viewport);

  /**
   * @classdesc
   * Creates view/projection matrices from mercator params
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
    * Notes:
   *  - Only one of center or [latitude, longitude] can be specified
   *  - [latitude, longitude] can only be specified when "mercator" is true
   *  - Altitude has a default value that matches assumptions in mapbox-gl
   *  - width and height are forced to 1 if supplied as 0, to avoid
   *    division by zero. This is intended to reduce the burden of apps to
   *    to check values before instantiating a Viewport.
   */
  /* eslint-disable complexity, max-statements */
  function WebMercatorViewport() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        width = _ref.width,
        height = _ref.height,
        latitude = _ref.latitude,
        longitude = _ref.longitude,
        zoom = _ref.zoom,
        pitch = _ref.pitch,
        bearing = _ref.bearing,
        altitude = _ref.altitude,
        _ref$farZMultiplier = _ref.farZMultiplier,
        farZMultiplier = _ref$farZMultiplier === undefined ? 10 : _ref$farZMultiplier;

    _classCallCheck(this, WebMercatorViewport);

    // Viewport - support undefined arguments
    width = width !== undefined ? width : DEFAULT_MAP_STATE.width;
    height = height !== undefined ? height : DEFAULT_MAP_STATE.height;
    zoom = zoom !== undefined ? zoom : DEFAULT_MAP_STATE.zoom;
    latitude = latitude !== undefined ? latitude : DEFAULT_MAP_STATE.latitude;
    longitude = longitude !== undefined ? longitude : DEFAULT_MAP_STATE.longitude;
    bearing = bearing !== undefined ? bearing : DEFAULT_MAP_STATE.bearing;
    pitch = pitch !== undefined ? pitch : DEFAULT_MAP_STATE.pitch;
    altitude = altitude !== undefined ? altitude : DEFAULT_MAP_STATE.altitude;

    // Silently allow apps to send in 0,0 to facilitate isomorphic render etc
    width = width || 1;
    height = height || 1;

    var scale = Math.pow(2, zoom);
    // Altitude - prevent division by 0
    // TODO - just throw an Error instead?
    altitude = Math.max(0.75, altitude);

    var distanceScales = calculateDistanceScales({ latitude: latitude, longitude: longitude, scale: scale });

    var projectionMatrix = makeProjectionMatrixFromMercatorParams({
      width: width,
      height: height,
      pitch: pitch,
      bearing: bearing,
      altitude: altitude,
      farZMultiplier: farZMultiplier
    });

    // The uncentered matrix allows us two move the center addition to the
    // shader (cheap) which gives a coordinate system that has its center in
    // the layer's center position. This makes rotations and other modelMatrx
    // transforms much more useful.
    var viewMatrixUncentered = makeUncenteredViewMatrixFromMercatorParams({
      width: width,
      height: height,
      longitude: longitude,
      latitude: latitude,
      zoom: zoom,
      pitch: pitch,
      bearing: bearing,
      altitude: altitude,
      distanceScales: distanceScales
    });

    // Make a centered version of the matrix for projection modes without an offset
    var center = projectFlat([longitude, latitude], scale);

    var viewMatrix = mat4_translate(createMat4(), viewMatrixUncentered, [-center[0], -center[1], 0]);

    // Save parameters
    var _this = _possibleConstructorReturn(this, (WebMercatorViewport.__proto__ || Object.getPrototypeOf(WebMercatorViewport)).call(this, {
      width: width,
      height: height,
      viewMatrix: viewMatrix,
      projectionMatrix: projectionMatrix,
      distanceScales: distanceScales
    }));

    _this.latitude = latitude;
    _this.longitude = longitude;
    _this.zoom = zoom;
    _this.pitch = pitch;
    _this.bearing = bearing;
    _this.altitude = altitude;

    // Save calculated values
    _this.scale = scale;
    _this.center = center;
    _this.viewMatrixUncentered = viewMatrixUncentered;

    // Bind methods
    _this.metersToLngLatDelta = _this.metersToLngLatDelta.bind(_this);
    _this.lngLatDeltaToMeters = _this.lngLatDeltaToMeters.bind(_this);
    _this.addMetersToLngLat = _this.addMetersToLngLat.bind(_this);

    Object.freeze(_this);
    return _this;
  }
  /* eslint-enable complexity, max-statements */

  /**
   * Project [lng,lat] on sphere onto [x,y] on 512*512 Mercator Zoom 0 tile.
   * Performs the nonlinear part of the web mercator projection.
   * Remaining projection is done with 4x4 matrices which also handles
   * perspective.
   *
   * @param {Array} lngLat - [lng, lat] coordinates
   *   Specifies a point on the sphere to project onto the map.
   * @return {Array} [x,y] coordinates.
   */


  _createClass(WebMercatorViewport, [{
    key: '_projectFlat',
    value: function _projectFlat(lngLat) {
      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.scale;

      return projectFlat(lngLat, scale);
    }

    /**
     * Unproject world point [x,y] on map onto {lat, lon} on sphere
     *
     * @param {object|Vector} xy - object with {x,y} members
     *  representing point on projected map plane
     * @return {GeoCoordinates} - object with {lat,lon} of point on sphere.
     *   Has toArray method if you need a GeoJSON Array.
     *   Per cartographic tradition, lat and lon are specified as degrees.
     */

  }, {
    key: '_unprojectFlat',
    value: function _unprojectFlat(xy) {
      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.scale;

      return unprojectFlat(xy, scale);
    }

    /*
    getLngLatAtViewportPosition(lnglat, xy) {
      const c = this.locationCoordinate(lnglat);
      const coordAtPoint = this.pointCoordinate(xy);
      const coordCenter = this.pointCoordinate(this.centerPoint);
      const translate = coordAtPoint._sub(c);
      this.center = this.coordinateLocation(coordCenter._sub(translate));
    }
    */

    /**
     * Converts a meter offset to a lnglat offset
     *
     * Note: Uses simple linear approximation around the viewport center
     * Error increases with size of offset (roughly 1% per 100km)
     *
     * @param {[Number,Number]|[Number,Number,Number]) xyz - array of meter deltas
     * @return {[Number,Number]|[Number,Number,Number]) - array of [lng,lat,z] deltas
     */

  }, {
    key: 'metersToLngLatDelta',
    value: function metersToLngLatDelta(xyz) {
      var _xyz = _slicedToArray(xyz, 3),
          x = _xyz[0],
          y = _xyz[1],
          _xyz$ = _xyz[2],
          z = _xyz$ === undefined ? 0 : _xyz$;

      assert(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z), ERR_ARGUMENT);
      var _distanceScales = this.distanceScales,
          pixelsPerMeter = _distanceScales.pixelsPerMeter,
          degreesPerPixel = _distanceScales.degreesPerPixel;

      var deltaLng = x * pixelsPerMeter[0] * degreesPerPixel[0];
      var deltaLat = y * pixelsPerMeter[1] * degreesPerPixel[1];
      return xyz.length === 2 ? [deltaLng, deltaLat] : [deltaLng, deltaLat, z];
    }

    /**
     * Converts a lnglat offset to a meter offset
     *
     * Note: Uses simple linear approximation around the viewport center
     * Error increases with size of offset (roughly 1% per 100km)
     *
     * @param {[Number,Number]|[Number,Number,Number]) deltaLngLatZ - array of [lng,lat,z] deltas
     * @return {[Number,Number]|[Number,Number,Number]) - array of meter deltas
     */

  }, {
    key: 'lngLatDeltaToMeters',
    value: function lngLatDeltaToMeters(deltaLngLatZ) {
      var _deltaLngLatZ = _slicedToArray(deltaLngLatZ, 3),
          deltaLng = _deltaLngLatZ[0],
          deltaLat = _deltaLngLatZ[1],
          _deltaLngLatZ$ = _deltaLngLatZ[2],
          deltaZ = _deltaLngLatZ$ === undefined ? 0 : _deltaLngLatZ$;

      assert(Number.isFinite(deltaLng) && Number.isFinite(deltaLat) && Number.isFinite(deltaZ), ERR_ARGUMENT);
      var _distanceScales2 = this.distanceScales,
          pixelsPerDegree = _distanceScales2.pixelsPerDegree,
          metersPerPixel = _distanceScales2.metersPerPixel;

      var deltaX = deltaLng * pixelsPerDegree[0] * metersPerPixel[0];
      var deltaY = deltaLat * pixelsPerDegree[1] * metersPerPixel[1];
      return deltaLngLatZ.length === 2 ? [deltaX, deltaY] : [deltaX, deltaY, deltaZ];
    }

    /**
     * Add a meter delta to a base lnglat coordinate, returning a new lnglat array
     *
     * Note: Uses simple linear approximation around the viewport center
     * Error increases with size of offset (roughly 1% per 100km)
     *
     * @param {[Number,Number]|[Number,Number,Number]) lngLatZ - base coordinate
     * @param {[Number,Number]|[Number,Number,Number]) xyz - array of meter deltas
     * @return {[Number,Number]|[Number,Number,Number]) array of [lng,lat,z] deltas
     */

  }, {
    key: 'addMetersToLngLat',
    value: function addMetersToLngLat(lngLatZ, xyz) {
      var _lngLatZ = _slicedToArray(lngLatZ, 3),
          lng = _lngLatZ[0],
          lat = _lngLatZ[1],
          _lngLatZ$ = _lngLatZ[2],
          Z = _lngLatZ$ === undefined ? 0 : _lngLatZ$;

      var _metersToLngLatDelta = this.metersToLngLatDelta(xyz),
          _metersToLngLatDelta2 = _slicedToArray(_metersToLngLatDelta, 3),
          deltaLng = _metersToLngLatDelta2[0],
          deltaLat = _metersToLngLatDelta2[1],
          _metersToLngLatDelta3 = _metersToLngLatDelta2[2],
          deltaZ = _metersToLngLatDelta3 === undefined ? 0 : _metersToLngLatDelta3;

      return lngLatZ.length === 2 ? [lng + deltaLng, lat + deltaLat] : [lng + deltaLng, lat + deltaLat, Z + deltaZ];
    }
  }]);

  return WebMercatorViewport;
}(Viewport);

export default WebMercatorViewport;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvdmlld3BvcnRzL3dlYi1tZXJjYXRvci12aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJWaWV3cG9ydCIsImNyZWF0ZU1hdDQiLCJwcm9qZWN0RmxhdCIsInVucHJvamVjdEZsYXQiLCJjYWxjdWxhdGVEaXN0YW5jZVNjYWxlcyIsIm1ha2VQcm9qZWN0aW9uTWF0cml4RnJvbU1lcmNhdG9yUGFyYW1zIiwibWFrZVVuY2VudGVyZWRWaWV3TWF0cml4RnJvbU1lcmNhdG9yUGFyYW1zIiwibWF0NF90cmFuc2xhdGUiLCJhc3NlcnQiLCJERUZBVUxUX01BUF9TVEFURSIsImxhdGl0dWRlIiwibG9uZ2l0dWRlIiwiem9vbSIsInBpdGNoIiwiYmVhcmluZyIsImFsdGl0dWRlIiwiRVJSX0FSR1VNRU5UIiwiV2ViTWVyY2F0b3JWaWV3cG9ydCIsIndpZHRoIiwiaGVpZ2h0IiwiZmFyWk11bHRpcGxpZXIiLCJ1bmRlZmluZWQiLCJzY2FsZSIsIk1hdGgiLCJwb3ciLCJtYXgiLCJkaXN0YW5jZVNjYWxlcyIsInByb2plY3Rpb25NYXRyaXgiLCJ2aWV3TWF0cml4VW5jZW50ZXJlZCIsImNlbnRlciIsInZpZXdNYXRyaXgiLCJtZXRlcnNUb0xuZ0xhdERlbHRhIiwiYmluZCIsImxuZ0xhdERlbHRhVG9NZXRlcnMiLCJhZGRNZXRlcnNUb0xuZ0xhdCIsIk9iamVjdCIsImZyZWV6ZSIsImxuZ0xhdCIsInh5IiwieHl6IiwieCIsInkiLCJ6IiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJwaXhlbHNQZXJNZXRlciIsImRlZ3JlZXNQZXJQaXhlbCIsImRlbHRhTG5nIiwiZGVsdGFMYXQiLCJsZW5ndGgiLCJkZWx0YUxuZ0xhdFoiLCJkZWx0YVoiLCJwaXhlbHNQZXJEZWdyZWUiLCJtZXRlcnNQZXJQaXhlbCIsImRlbHRhWCIsImRlbHRhWSIsImxuZ0xhdFoiLCJsbmciLCJsYXQiLCJaIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FB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WUFERjtBQUZnQyw2QkFJVSxLQUFLVSxjQUpmO0FBQUEsVUFJekIwQixlQUp5QixvQkFJekJBLGVBSnlCO0FBQUEsVUFJUkMsY0FKUSxvQkFJUkEsY0FKUTs7QUFLaEMsVUFBTUMsU0FBU1AsV0FBV0ssZ0JBQWdCLENBQWhCLENBQVgsR0FBZ0NDLGVBQWUsQ0FBZixDQUEvQztBQUNBLFVBQU1FLFNBQVNQLFdBQVdJLGdCQUFnQixDQUFoQixDQUFYLEdBQWdDQyxlQUFlLENBQWYsQ0FBL0M7QUFDQSxhQUFPSCxhQUFhRCxNQUFiLEtBQXdCLENBQXhCLEdBQTRCLENBQUNLLE1BQUQsRUFBU0MsTUFBVCxDQUE1QixHQUErQyxDQUFDRCxNQUFELEVBQVNDLE1BQVQsRUFBaUJKLE1BQWpCLENBQXREO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7c0NBVWtCSyxPLEVBQVNqQixHLEVBQUs7QUFBQSxvQ0FDSmlCLE9BREk7QUFBQSxVQUN2QkMsR0FEdUI7QUFBQSxVQUNsQkMsR0FEa0I7QUFBQTtBQUFBLFVBQ2JDLENBRGEsNkJBQ1QsQ0FEUzs7QUFBQSxpQ0FFVyxLQUFLNUIsbUJBQUwsQ0FBeUJRLEdBQXpCLENBRlg7QUFBQTtBQUFBLFVBRXZCUSxRQUZ1QjtBQUFBLFVBRWJDLFFBRmE7QUFBQTtBQUFBLFVBRUhHLE1BRkcseUNBRU0sQ0FGTjs7QUFHOUIsYUFBT0ssUUFBUVAsTUFBUixLQUFtQixDQUFuQixHQUNMLENBQUNRLE1BQU1WLFFBQVAsRUFBaUJXLE1BQU1WLFFBQXZCLENBREssR0FFTCxDQUFDUyxNQUFNVixRQUFQLEVBQWlCVyxNQUFNVixRQUF2QixFQUFpQ1csSUFBSVIsTUFBckMsQ0FGRjtBQUdEOzs7O0VBMU44Q25ELFE7O2VBQTVCaUIsbUIiLCJmaWxlIjoid2ViLW1lcmNhdG9yLXZpZXdwb3J0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8vIFZpZXcgYW5kIFByb2plY3Rpb24gTWF0cml4IGNhbGN1bGF0aW9ucyBmb3IgbWFwYm94LWpzIHN0eWxlXG4vLyBtYXAgdmlldyBwcm9wZXJ0aWVzXG5pbXBvcnQgVmlld3BvcnQsIHtjcmVhdGVNYXQ0fSBmcm9tICcuL3ZpZXdwb3J0JztcblxuaW1wb3J0IHtcbiAgcHJvamVjdEZsYXQsIHVucHJvamVjdEZsYXQsXG4gIGNhbGN1bGF0ZURpc3RhbmNlU2NhbGVzLFxuICBtYWtlUHJvamVjdGlvbk1hdHJpeEZyb21NZXJjYXRvclBhcmFtcywgbWFrZVVuY2VudGVyZWRWaWV3TWF0cml4RnJvbU1lcmNhdG9yUGFyYW1zXG59IGZyb20gJy4uLy4uL3ZpZXdwb3J0cy93ZWItbWVyY2F0b3ItdXRpbHMnO1xuXG5pbXBvcnQgbWF0NF90cmFuc2xhdGUgZnJvbSAnZ2wtbWF0NC90cmFuc2xhdGUnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBERUZBVUxUX01BUF9TVEFURSA9IHtcbiAgbGF0aXR1ZGU6IDM3LFxuICBsb25naXR1ZGU6IC0xMjIsXG4gIHpvb206IDExLFxuICBwaXRjaDogMCxcbiAgYmVhcmluZzogMCxcbiAgYWx0aXR1ZGU6IDEuNVxufTtcblxuY29uc3QgRVJSX0FSR1VNRU5UID0gJ0lsbGVnYWwgYXJndW1lbnQgdG8gV2ViTWVyY2F0b3JWaWV3cG9ydCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdlYk1lcmNhdG9yVmlld3BvcnQgZXh0ZW5kcyBWaWV3cG9ydCB7XG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIENyZWF0ZXMgdmlldy9wcm9qZWN0aW9uIG1hdHJpY2VzIGZyb20gbWVyY2F0b3IgcGFyYW1zXG4gICAqIE5vdGU6IFRoZSBWaWV3cG9ydCBpcyBpbW11dGFibGUgaW4gdGhlIHNlbnNlIHRoYXQgaXQgb25seSBoYXMgYWNjZXNzb3JzLlxuICAgKiBBIG5ldyB2aWV3cG9ydCBpbnN0YW5jZSBzaG91bGQgYmUgY3JlYXRlZCBpZiBhbnkgcGFyYW1ldGVycyBoYXZlIGNoYW5nZWQuXG4gICAqXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0IC0gb3B0aW9uc1xuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG1lcmNhdG9yPXRydWUgLSBXaGV0aGVyIHRvIHVzZSBtZXJjYXRvciBwcm9qZWN0aW9uXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHQud2lkdGg9MSAtIFdpZHRoIG9mIFwidmlld3BvcnRcIiBvciB3aW5kb3dcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdC5oZWlnaHQ9MSAtIEhlaWdodCBvZiBcInZpZXdwb3J0XCIgb3Igd2luZG93XG4gICAqIEBwYXJhbSB7QXJyYXl9IG9wdC5jZW50ZXI9WzAsIDBdIC0gQ2VudGVyIG9mIHZpZXdwb3J0XG4gICAqICAgW2xvbmdpdHVkZSwgbGF0aXR1ZGVdIG9yIFt4LCB5XVxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0LnNjYWxlPTEgLSBFaXRoZXIgdXNlIHNjYWxlIG9yIHpvb21cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdC5waXRjaD0wIC0gQ2FtZXJhIGFuZ2xlIGluIGRlZ3JlZXMgKDAgaXMgc3RyYWlnaHQgZG93bilcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdC5iZWFyaW5nPTAgLSBNYXAgcm90YXRpb24gaW4gZGVncmVlcyAoMCBtZWFucyBub3J0aCBpcyB1cClcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdC5hbHRpdHVkZT0gLSBBbHRpdHVkZSBvZiBjYW1lcmEgaW4gc2NyZWVuIHVuaXRzXG4gICAqXG4gICAqIFdlYiBtZXJjYXRvciBwcm9qZWN0aW9uIHNob3J0LWhhbmQgcGFyYW1ldGVyc1xuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0LmxhdGl0dWRlIC0gQ2VudGVyIG9mIHZpZXdwb3J0IG9uIG1hcCAoYWx0ZXJuYXRpdmUgdG8gb3B0LmNlbnRlcilcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdC5sb25naXR1ZGUgLSBDZW50ZXIgb2Ygdmlld3BvcnQgb24gbWFwIChhbHRlcm5hdGl2ZSB0byBvcHQuY2VudGVyKVxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0Lnpvb20gLSBTY2FsZSA9IE1hdGgucG93KDIsem9vbSkgb24gbWFwIChhbHRlcm5hdGl2ZSB0byBvcHQuc2NhbGUpXG5cbiAgICogTm90ZXM6XG4gICAqICAtIE9ubHkgb25lIG9mIGNlbnRlciBvciBbbGF0aXR1ZGUsIGxvbmdpdHVkZV0gY2FuIGJlIHNwZWNpZmllZFxuICAgKiAgLSBbbGF0aXR1ZGUsIGxvbmdpdHVkZV0gY2FuIG9ubHkgYmUgc3BlY2lmaWVkIHdoZW4gXCJtZXJjYXRvclwiIGlzIHRydWVcbiAgICogIC0gQWx0aXR1ZGUgaGFzIGEgZGVmYXVsdCB2YWx1ZSB0aGF0IG1hdGNoZXMgYXNzdW1wdGlvbnMgaW4gbWFwYm94LWdsXG4gICAqICAtIHdpZHRoIGFuZCBoZWlnaHQgYXJlIGZvcmNlZCB0byAxIGlmIHN1cHBsaWVkIGFzIDAsIHRvIGF2b2lkXG4gICAqICAgIGRpdmlzaW9uIGJ5IHplcm8uIFRoaXMgaXMgaW50ZW5kZWQgdG8gcmVkdWNlIHRoZSBidXJkZW4gb2YgYXBwcyB0b1xuICAgKiAgICB0byBjaGVjayB2YWx1ZXMgYmVmb3JlIGluc3RhbnRpYXRpbmcgYSBWaWV3cG9ydC5cbiAgICovXG4gIC8qIGVzbGludC1kaXNhYmxlIGNvbXBsZXhpdHksIG1heC1zdGF0ZW1lbnRzICovXG4gIGNvbnN0cnVjdG9yKHtcbiAgICAvLyBNYXAgc3RhdGVcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgbGF0aXR1ZGUsXG4gICAgbG9uZ2l0dWRlLFxuICAgIHpvb20sXG4gICAgcGl0Y2gsXG4gICAgYmVhcmluZyxcbiAgICBhbHRpdHVkZSxcbiAgICBmYXJaTXVsdGlwbGllciA9IDEwXG4gIH0gPSB7fSkge1xuICAgIC8vIFZpZXdwb3J0IC0gc3VwcG9ydCB1bmRlZmluZWQgYXJndW1lbnRzXG4gICAgd2lkdGggPSB3aWR0aCAhPT0gdW5kZWZpbmVkID8gd2lkdGggOiBERUZBVUxUX01BUF9TVEFURS53aWR0aDtcbiAgICBoZWlnaHQgPSBoZWlnaHQgIT09IHVuZGVmaW5lZCA/IGhlaWdodCA6IERFRkFVTFRfTUFQX1NUQVRFLmhlaWdodDtcbiAgICB6b29tID0gem9vbSAhPT0gdW5kZWZpbmVkID8gem9vbSA6IERFRkFVTFRfTUFQX1NUQVRFLnpvb207XG4gICAgbGF0aXR1ZGUgPSBsYXRpdHVkZSAhPT0gdW5kZWZpbmVkID8gbGF0aXR1ZGUgOiBERUZBVUxUX01BUF9TVEFURS5sYXRpdHVkZTtcbiAgICBsb25naXR1ZGUgPSBsb25naXR1ZGUgIT09IHVuZGVmaW5lZCA/IGxvbmdpdHVkZSA6IERFRkFVTFRfTUFQX1NUQVRFLmxvbmdpdHVkZTtcbiAgICBiZWFyaW5nID0gYmVhcmluZyAhPT0gdW5kZWZpbmVkID8gYmVhcmluZyA6IERFRkFVTFRfTUFQX1NUQVRFLmJlYXJpbmc7XG4gICAgcGl0Y2ggPSBwaXRjaCAhPT0gdW5kZWZpbmVkID8gcGl0Y2ggOiBERUZBVUxUX01BUF9TVEFURS5waXRjaDtcbiAgICBhbHRpdHVkZSA9IGFsdGl0dWRlICE9PSB1bmRlZmluZWQgPyBhbHRpdHVkZSA6IERFRkFVTFRfTUFQX1NUQVRFLmFsdGl0dWRlO1xuXG4gICAgLy8gU2lsZW50bHkgYWxsb3cgYXBwcyB0byBzZW5kIGluIDAsMCB0byBmYWNpbGl0YXRlIGlzb21vcnBoaWMgcmVuZGVyIGV0Y1xuICAgIHdpZHRoID0gd2lkdGggfHwgMTtcbiAgICBoZWlnaHQgPSBoZWlnaHQgfHwgMTtcblxuICAgIGNvbnN0IHNjYWxlID0gTWF0aC5wb3coMiwgem9vbSk7XG4gICAgLy8gQWx0aXR1ZGUgLSBwcmV2ZW50IGRpdmlzaW9uIGJ5IDBcbiAgICAvLyBUT0RPIC0ganVzdCB0aHJvdyBhbiBFcnJvciBpbnN0ZWFkP1xuICAgIGFsdGl0dWRlID0gTWF0aC5tYXgoMC43NSwgYWx0aXR1ZGUpO1xuXG4gICAgY29uc3QgZGlzdGFuY2VTY2FsZXMgPSBjYWxjdWxhdGVEaXN0YW5jZVNjYWxlcyh7bGF0aXR1ZGUsIGxvbmdpdHVkZSwgc2NhbGV9KTtcblxuICAgIGNvbnN0IHByb2plY3Rpb25NYXRyaXggPSBtYWtlUHJvamVjdGlvbk1hdHJpeEZyb21NZXJjYXRvclBhcmFtcyh7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIHBpdGNoLFxuICAgICAgYmVhcmluZyxcbiAgICAgIGFsdGl0dWRlLFxuICAgICAgZmFyWk11bHRpcGxpZXJcbiAgICB9KTtcblxuICAgIC8vIFRoZSB1bmNlbnRlcmVkIG1hdHJpeCBhbGxvd3MgdXMgdHdvIG1vdmUgdGhlIGNlbnRlciBhZGRpdGlvbiB0byB0aGVcbiAgICAvLyBzaGFkZXIgKGNoZWFwKSB3aGljaCBnaXZlcyBhIGNvb3JkaW5hdGUgc3lzdGVtIHRoYXQgaGFzIGl0cyBjZW50ZXIgaW5cbiAgICAvLyB0aGUgbGF5ZXIncyBjZW50ZXIgcG9zaXRpb24uIFRoaXMgbWFrZXMgcm90YXRpb25zIGFuZCBvdGhlciBtb2RlbE1hdHJ4XG4gICAgLy8gdHJhbnNmb3JtcyBtdWNoIG1vcmUgdXNlZnVsLlxuICAgIGNvbnN0IHZpZXdNYXRyaXhVbmNlbnRlcmVkID0gbWFrZVVuY2VudGVyZWRWaWV3TWF0cml4RnJvbU1lcmNhdG9yUGFyYW1zKHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgbG9uZ2l0dWRlLFxuICAgICAgbGF0aXR1ZGUsXG4gICAgICB6b29tLFxuICAgICAgcGl0Y2gsXG4gICAgICBiZWFyaW5nLFxuICAgICAgYWx0aXR1ZGUsXG4gICAgICBkaXN0YW5jZVNjYWxlc1xuICAgIH0pO1xuXG4gICAgLy8gTWFrZSBhIGNlbnRlcmVkIHZlcnNpb24gb2YgdGhlIG1hdHJpeCBmb3IgcHJvamVjdGlvbiBtb2RlcyB3aXRob3V0IGFuIG9mZnNldFxuICAgIGNvbnN0IGNlbnRlciA9IHByb2plY3RGbGF0KFtsb25naXR1ZGUsIGxhdGl0dWRlXSwgc2NhbGUpO1xuXG4gICAgY29uc3Qgdmlld01hdHJpeCA9IG1hdDRfdHJhbnNsYXRlKFxuICAgICAgY3JlYXRlTWF0NCgpLCB2aWV3TWF0cml4VW5jZW50ZXJlZCwgWy1jZW50ZXJbMF0sIC1jZW50ZXJbMV0sIDBdKTtcblxuICAgIHN1cGVyKHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgdmlld01hdHJpeCxcbiAgICAgIHByb2plY3Rpb25NYXRyaXgsXG4gICAgICBkaXN0YW5jZVNjYWxlc1xuICAgIH0pO1xuXG4gICAgLy8gU2F2ZSBwYXJhbWV0ZXJzXG4gICAgdGhpcy5sYXRpdHVkZSA9IGxhdGl0dWRlO1xuICAgIHRoaXMubG9uZ2l0dWRlID0gbG9uZ2l0dWRlO1xuICAgIHRoaXMuem9vbSA9IHpvb207XG4gICAgdGhpcy5waXRjaCA9IHBpdGNoO1xuICAgIHRoaXMuYmVhcmluZyA9IGJlYXJpbmc7XG4gICAgdGhpcy5hbHRpdHVkZSA9IGFsdGl0dWRlO1xuXG4gICAgLy8gU2F2ZSBjYWxjdWxhdGVkIHZhbHVlc1xuICAgIHRoaXMuc2NhbGUgPSBzY2FsZTtcbiAgICB0aGlzLmNlbnRlciA9IGNlbnRlcjtcbiAgICB0aGlzLnZpZXdNYXRyaXhVbmNlbnRlcmVkID0gdmlld01hdHJpeFVuY2VudGVyZWQ7XG5cbiAgICAvLyBCaW5kIG1ldGhvZHNcbiAgICB0aGlzLm1ldGVyc1RvTG5nTGF0RGVsdGEgPSB0aGlzLm1ldGVyc1RvTG5nTGF0RGVsdGEuYmluZCh0aGlzKTtcbiAgICB0aGlzLmxuZ0xhdERlbHRhVG9NZXRlcnMgPSB0aGlzLmxuZ0xhdERlbHRhVG9NZXRlcnMuYmluZCh0aGlzKTtcbiAgICB0aGlzLmFkZE1ldGVyc1RvTG5nTGF0ID0gdGhpcy5hZGRNZXRlcnNUb0xuZ0xhdC5iaW5kKHRoaXMpO1xuXG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHksIG1heC1zdGF0ZW1lbnRzICovXG5cbiAgLyoqXG4gICAqIFByb2plY3QgW2xuZyxsYXRdIG9uIHNwaGVyZSBvbnRvIFt4LHldIG9uIDUxMio1MTIgTWVyY2F0b3IgWm9vbSAwIHRpbGUuXG4gICAqIFBlcmZvcm1zIHRoZSBub25saW5lYXIgcGFydCBvZiB0aGUgd2ViIG1lcmNhdG9yIHByb2plY3Rpb24uXG4gICAqIFJlbWFpbmluZyBwcm9qZWN0aW9uIGlzIGRvbmUgd2l0aCA0eDQgbWF0cmljZXMgd2hpY2ggYWxzbyBoYW5kbGVzXG4gICAqIHBlcnNwZWN0aXZlLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5fSBsbmdMYXQgLSBbbG5nLCBsYXRdIGNvb3JkaW5hdGVzXG4gICAqICAgU3BlY2lmaWVzIGEgcG9pbnQgb24gdGhlIHNwaGVyZSB0byBwcm9qZWN0IG9udG8gdGhlIG1hcC5cbiAgICogQHJldHVybiB7QXJyYXl9IFt4LHldIGNvb3JkaW5hdGVzLlxuICAgKi9cbiAgX3Byb2plY3RGbGF0KGxuZ0xhdCwgc2NhbGUgPSB0aGlzLnNjYWxlKSB7XG4gICAgcmV0dXJuIHByb2plY3RGbGF0KGxuZ0xhdCwgc2NhbGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVucHJvamVjdCB3b3JsZCBwb2ludCBbeCx5XSBvbiBtYXAgb250byB7bGF0LCBsb259IG9uIHNwaGVyZVxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdHxWZWN0b3J9IHh5IC0gb2JqZWN0IHdpdGgge3gseX0gbWVtYmVyc1xuICAgKiAgcmVwcmVzZW50aW5nIHBvaW50IG9uIHByb2plY3RlZCBtYXAgcGxhbmVcbiAgICogQHJldHVybiB7R2VvQ29vcmRpbmF0ZXN9IC0gb2JqZWN0IHdpdGgge2xhdCxsb259IG9mIHBvaW50IG9uIHNwaGVyZS5cbiAgICogICBIYXMgdG9BcnJheSBtZXRob2QgaWYgeW91IG5lZWQgYSBHZW9KU09OIEFycmF5LlxuICAgKiAgIFBlciBjYXJ0b2dyYXBoaWMgdHJhZGl0aW9uLCBsYXQgYW5kIGxvbiBhcmUgc3BlY2lmaWVkIGFzIGRlZ3JlZXMuXG4gICAqL1xuICBfdW5wcm9qZWN0RmxhdCh4eSwgc2NhbGUgPSB0aGlzLnNjYWxlKSB7XG4gICAgcmV0dXJuIHVucHJvamVjdEZsYXQoeHksIHNjYWxlKTtcbiAgfVxuXG4gIC8qXG4gIGdldExuZ0xhdEF0Vmlld3BvcnRQb3NpdGlvbihsbmdsYXQsIHh5KSB7XG4gICAgY29uc3QgYyA9IHRoaXMubG9jYXRpb25Db29yZGluYXRlKGxuZ2xhdCk7XG4gICAgY29uc3QgY29vcmRBdFBvaW50ID0gdGhpcy5wb2ludENvb3JkaW5hdGUoeHkpO1xuICAgIGNvbnN0IGNvb3JkQ2VudGVyID0gdGhpcy5wb2ludENvb3JkaW5hdGUodGhpcy5jZW50ZXJQb2ludCk7XG4gICAgY29uc3QgdHJhbnNsYXRlID0gY29vcmRBdFBvaW50Ll9zdWIoYyk7XG4gICAgdGhpcy5jZW50ZXIgPSB0aGlzLmNvb3JkaW5hdGVMb2NhdGlvbihjb29yZENlbnRlci5fc3ViKHRyYW5zbGF0ZSkpO1xuICB9XG4gICovXG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgbWV0ZXIgb2Zmc2V0IHRvIGEgbG5nbGF0IG9mZnNldFxuICAgKlxuICAgKiBOb3RlOiBVc2VzIHNpbXBsZSBsaW5lYXIgYXBwcm94aW1hdGlvbiBhcm91bmQgdGhlIHZpZXdwb3J0IGNlbnRlclxuICAgKiBFcnJvciBpbmNyZWFzZXMgd2l0aCBzaXplIG9mIG9mZnNldCAocm91Z2hseSAxJSBwZXIgMTAwa20pXG4gICAqXG4gICAqIEBwYXJhbSB7W051bWJlcixOdW1iZXJdfFtOdW1iZXIsTnVtYmVyLE51bWJlcl0pIHh5eiAtIGFycmF5IG9mIG1ldGVyIGRlbHRhc1xuICAgKiBAcmV0dXJuIHtbTnVtYmVyLE51bWJlcl18W051bWJlcixOdW1iZXIsTnVtYmVyXSkgLSBhcnJheSBvZiBbbG5nLGxhdCx6XSBkZWx0YXNcbiAgICovXG4gIG1ldGVyc1RvTG5nTGF0RGVsdGEoeHl6KSB7XG4gICAgY29uc3QgW3gsIHksIHogPSAwXSA9IHh5ejtcbiAgICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKHgpICYmIE51bWJlci5pc0Zpbml0ZSh5KSAmJiBOdW1iZXIuaXNGaW5pdGUoeiksIEVSUl9BUkdVTUVOVCk7XG4gICAgY29uc3Qge3BpeGVsc1Blck1ldGVyLCBkZWdyZWVzUGVyUGl4ZWx9ID0gdGhpcy5kaXN0YW5jZVNjYWxlcztcbiAgICBjb25zdCBkZWx0YUxuZyA9IHggKiBwaXhlbHNQZXJNZXRlclswXSAqIGRlZ3JlZXNQZXJQaXhlbFswXTtcbiAgICBjb25zdCBkZWx0YUxhdCA9IHkgKiBwaXhlbHNQZXJNZXRlclsxXSAqIGRlZ3JlZXNQZXJQaXhlbFsxXTtcbiAgICByZXR1cm4geHl6Lmxlbmd0aCA9PT0gMiA/IFtkZWx0YUxuZywgZGVsdGFMYXRdIDogW2RlbHRhTG5nLCBkZWx0YUxhdCwgel07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSBsbmdsYXQgb2Zmc2V0IHRvIGEgbWV0ZXIgb2Zmc2V0XG4gICAqXG4gICAqIE5vdGU6IFVzZXMgc2ltcGxlIGxpbmVhciBhcHByb3hpbWF0aW9uIGFyb3VuZCB0aGUgdmlld3BvcnQgY2VudGVyXG4gICAqIEVycm9yIGluY3JlYXNlcyB3aXRoIHNpemUgb2Ygb2Zmc2V0IChyb3VnaGx5IDElIHBlciAxMDBrbSlcbiAgICpcbiAgICogQHBhcmFtIHtbTnVtYmVyLE51bWJlcl18W051bWJlcixOdW1iZXIsTnVtYmVyXSkgZGVsdGFMbmdMYXRaIC0gYXJyYXkgb2YgW2xuZyxsYXQsel0gZGVsdGFzXG4gICAqIEByZXR1cm4ge1tOdW1iZXIsTnVtYmVyXXxbTnVtYmVyLE51bWJlcixOdW1iZXJdKSAtIGFycmF5IG9mIG1ldGVyIGRlbHRhc1xuICAgKi9cbiAgbG5nTGF0RGVsdGFUb01ldGVycyhkZWx0YUxuZ0xhdFopIHtcbiAgICBjb25zdCBbZGVsdGFMbmcsIGRlbHRhTGF0LCBkZWx0YVogPSAwXSA9IGRlbHRhTG5nTGF0WjtcbiAgICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKGRlbHRhTG5nKSAmJiBOdW1iZXIuaXNGaW5pdGUoZGVsdGFMYXQpICYmIE51bWJlci5pc0Zpbml0ZShkZWx0YVopLFxuICAgICAgRVJSX0FSR1VNRU5UKTtcbiAgICBjb25zdCB7cGl4ZWxzUGVyRGVncmVlLCBtZXRlcnNQZXJQaXhlbH0gPSB0aGlzLmRpc3RhbmNlU2NhbGVzO1xuICAgIGNvbnN0IGRlbHRhWCA9IGRlbHRhTG5nICogcGl4ZWxzUGVyRGVncmVlWzBdICogbWV0ZXJzUGVyUGl4ZWxbMF07XG4gICAgY29uc3QgZGVsdGFZID0gZGVsdGFMYXQgKiBwaXhlbHNQZXJEZWdyZWVbMV0gKiBtZXRlcnNQZXJQaXhlbFsxXTtcbiAgICByZXR1cm4gZGVsdGFMbmdMYXRaLmxlbmd0aCA9PT0gMiA/IFtkZWx0YVgsIGRlbHRhWV0gOiBbZGVsdGFYLCBkZWx0YVksIGRlbHRhWl07XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgbWV0ZXIgZGVsdGEgdG8gYSBiYXNlIGxuZ2xhdCBjb29yZGluYXRlLCByZXR1cm5pbmcgYSBuZXcgbG5nbGF0IGFycmF5XG4gICAqXG4gICAqIE5vdGU6IFVzZXMgc2ltcGxlIGxpbmVhciBhcHByb3hpbWF0aW9uIGFyb3VuZCB0aGUgdmlld3BvcnQgY2VudGVyXG4gICAqIEVycm9yIGluY3JlYXNlcyB3aXRoIHNpemUgb2Ygb2Zmc2V0IChyb3VnaGx5IDElIHBlciAxMDBrbSlcbiAgICpcbiAgICogQHBhcmFtIHtbTnVtYmVyLE51bWJlcl18W051bWJlcixOdW1iZXIsTnVtYmVyXSkgbG5nTGF0WiAtIGJhc2UgY29vcmRpbmF0ZVxuICAgKiBAcGFyYW0ge1tOdW1iZXIsTnVtYmVyXXxbTnVtYmVyLE51bWJlcixOdW1iZXJdKSB4eXogLSBhcnJheSBvZiBtZXRlciBkZWx0YXNcbiAgICogQHJldHVybiB7W051bWJlcixOdW1iZXJdfFtOdW1iZXIsTnVtYmVyLE51bWJlcl0pIGFycmF5IG9mIFtsbmcsbGF0LHpdIGRlbHRhc1xuICAgKi9cbiAgYWRkTWV0ZXJzVG9MbmdMYXQobG5nTGF0WiwgeHl6KSB7XG4gICAgY29uc3QgW2xuZywgbGF0LCBaID0gMF0gPSBsbmdMYXRaO1xuICAgIGNvbnN0IFtkZWx0YUxuZywgZGVsdGFMYXQsIGRlbHRhWiA9IDBdID0gdGhpcy5tZXRlcnNUb0xuZ0xhdERlbHRhKHh5eik7XG4gICAgcmV0dXJuIGxuZ0xhdFoubGVuZ3RoID09PSAyID9cbiAgICAgIFtsbmcgKyBkZWx0YUxuZywgbGF0ICsgZGVsdGFMYXRdIDpcbiAgICAgIFtsbmcgKyBkZWx0YUxuZywgbGF0ICsgZGVsdGFMYXQsIFogKyBkZWx0YVpdO1xuICB9XG59XG4iXX0=