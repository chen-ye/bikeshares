export { _fitBounds as fitBounds };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// View and Projection Matrix calculations for mapbox-js style map view properties
import Viewport, { createMat4 } from './viewport';
import autobind from './autobind';
import assert from 'assert';

/* eslint-disable camelcase */
import mat4 from 'gl-mat4';
import vec2_distance from 'gl-vec2/distance';
import vec2_add from 'gl-vec2/add';
import vec2_negate from 'gl-vec2/negate';

// CONSTANTS
var PI = Math.PI;
var PI_4 = PI / 4;
var DEGREES_TO_RADIANS = PI / 180;
var RADIANS_TO_DEGREES = 180 / PI;
var TILE_SIZE = 512;
var WORLD_SCALE = TILE_SIZE;

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
  /* eslint-disable complexity */
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

    var center = projectFlat([longitude, latitude], scale);

    var distanceScales = calculateDistanceScales({ latitude: latitude, longitude: longitude, scale: scale });

    var projectionMatrix = makeProjectionMatrixFromMercatorParams({
      width: width,
      height: height,
      pitch: pitch,
      bearing: bearing,
      altitude: altitude,
      farZMultiplier: farZMultiplier
    });

    var viewMatrix = makeViewMatrixFromMercatorParams({
      width: width,
      height: height,
      longitude: longitude,
      latitude: latitude,
      zoom: zoom,
      pitch: pitch,
      bearing: bearing,
      altitude: altitude,
      distanceScales: distanceScales,
      center: center
    });

    // Save parameters
    var _this = _possibleConstructorReturn(this, (WebMercatorViewport.__proto__ || Object.getPrototypeOf(WebMercatorViewport)).call(this, { width: width, height: height, viewMatrix: viewMatrix, projectionMatrix: projectionMatrix }));

    _this.latitude = latitude;
    _this.longitude = longitude;
    _this.zoom = zoom;
    _this.pitch = pitch;
    _this.bearing = bearing;
    _this.altitude = altitude;

    _this.scale = scale;
    _this.center = center;

    _this._distanceScales = distanceScales;

    autobind(_this);
    Object.freeze(_this);
    return _this;
  }
  /* eslint-enable complexity */

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

    /**
     * Get the map center that place a given [lng, lat] coordinate at screen
     * point [x, y]
     *
     * @param {Array} lngLat - [lng,lat] coordinates
     *   Specifies a point on the sphere.
     * @param {Array} pos - [x,y] coordinates
     *   Specifies a point on the screen.
     * @return {Array} [lng,lat] new map center.
     */

  }, {
    key: 'getLocationAtPoint',
    value: function getLocationAtPoint(_ref2) {
      var lngLat = _ref2.lngLat,
          pos = _ref2.pos;

      var fromLocation = this.projectFlat(this.unproject(pos));
      var toLocation = this.projectFlat(lngLat);

      var center = this.projectFlat([this.longitude, this.latitude]);

      var translate = vec2_add([], toLocation, vec2_negate([], fromLocation));
      var newCenter = vec2_add([], center, translate);
      return this.unprojectFlat(newCenter);
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

  }, {
    key: 'getDistanceScales',
    value: function getDistanceScales() {
      return this._distanceScales;
    }

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
      var _distanceScales = this._distanceScales,
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
      var _distanceScales2 = this._distanceScales,
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

    /**
     * Returns a new viewport that fit around the given rectangle.
     * Only supports non-perspective mode.
     * @param {Array} bounds - [[lon, lat], [lon, lat]]
     * @param {Number} [options.padding] - The amount of padding in pixels to add to the given bounds.
     * @param {Array} [options.offset] - The center of the given bounds relative to the map's center,
     *    [x, y] measured in pixels.
     * @returns {WebMercatorViewport}
     */

  }, {
    key: 'fitBounds',
    value: function fitBounds(bounds) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var width = this.width,
          height = this.height;

      var _fitBounds2 = _fitBounds(Object.assign({ width: width, height: height, bounds: bounds }, options)),
          longitude = _fitBounds2.longitude,
          latitude = _fitBounds2.latitude,
          zoom = _fitBounds2.zoom;

      return new WebMercatorViewport({ width: width, height: height, longitude: longitude, latitude: latitude, zoom: zoom });
    }

    // INTERNAL METHODS

  }, {
    key: '_getParams',
    value: function _getParams() {
      return this._distanceScales;
    }
  }]);

  return WebMercatorViewport;
}(Viewport);

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


export default WebMercatorViewport;
function projectFlat(_ref3, scale) {
  var _ref4 = _slicedToArray(_ref3, 2),
      lng = _ref4[0],
      lat = _ref4[1];

  scale = scale * WORLD_SCALE;
  var lambda2 = lng * DEGREES_TO_RADIANS;
  var phi2 = lat * DEGREES_TO_RADIANS;
  var x = scale * (lambda2 + PI) / (2 * PI);
  var y = scale * (PI - Math.log(Math.tan(PI_4 + phi2 * 0.5))) / (2 * PI);
  return [x, y];
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
function unprojectFlat(_ref5, scale) {
  var _ref6 = _slicedToArray(_ref5, 2),
      x = _ref6[0],
      y = _ref6[1];

  scale = scale * WORLD_SCALE;
  var lambda2 = x / scale * (2 * PI) - PI;
  var phi2 = 2 * (Math.atan(Math.exp(PI - y / scale * (2 * PI))) - PI_4);
  return [lambda2 * RADIANS_TO_DEGREES, phi2 * RADIANS_TO_DEGREES];
}

/**
 * Calculate distance scales in meters around current lat/lon, both for
 * degrees and pixels.
 * In mercator projection mode, the distance scales vary significantly
 * with latitude.
 */
function calculateDistanceScales(_ref7) {
  var latitude = _ref7.latitude,
      longitude = _ref7.longitude,
      scale = _ref7.scale;

  assert(!isNaN(latitude) && !isNaN(longitude) && !isNaN(scale), ERR_ARGUMENT);
  // Approximately 111km per degree at equator
  var METERS_PER_DEGREE = 111000;

  var latCosine = Math.cos(latitude * Math.PI / 180);

  var metersPerDegree = METERS_PER_DEGREE * latCosine;

  // Calculate number of pixels occupied by one degree longitude
  // around current lat/lon
  var pixelsPerDegreeX = vec2_distance(projectFlat([longitude + 0.5, latitude], scale), projectFlat([longitude - 0.5, latitude], scale));
  // Calculate number of pixels occupied by one degree latitude
  // around current lat/lon
  var pixelsPerDegreeY = vec2_distance(projectFlat([longitude, latitude + 0.5], scale), projectFlat([longitude, latitude - 0.5], scale));

  var pixelsPerMeterX = pixelsPerDegreeX / metersPerDegree;
  var pixelsPerMeterY = pixelsPerDegreeY / metersPerDegree;
  var pixelsPerMeterZ = (pixelsPerMeterX + pixelsPerMeterY) / 2;
  // const pixelsPerMeter = [pixelsPerMeterX, pixelsPerMeterY, pixelsPerMeterZ];

  var worldSize = TILE_SIZE * scale;
  var altPixelsPerMeter = worldSize / (4e7 * latCosine);
  var pixelsPerMeter = [altPixelsPerMeter, altPixelsPerMeter, altPixelsPerMeter];
  var metersPerPixel = [1 / altPixelsPerMeter, 1 / altPixelsPerMeter, 1 / pixelsPerMeterZ];

  var pixelsPerDegree = [pixelsPerDegreeX, pixelsPerDegreeY, pixelsPerMeterZ];
  var degreesPerPixel = [1 / pixelsPerDegreeX, 1 / pixelsPerDegreeY, 1 / pixelsPerMeterZ];

  // Main results, used for converting meters to latlng deltas and scaling offsets
  return {
    pixelsPerMeter: pixelsPerMeter,
    metersPerPixel: metersPerPixel,
    pixelsPerDegree: pixelsPerDegree,
    degreesPerPixel: degreesPerPixel
  };
}

// ATTRIBUTION:
// view and projection matrix creation is intentionally kept compatible with
// mapbox-gl's implementation to ensure that seamless interoperation
// with mapbox and react-map-gl. See: https://github.com/mapbox/mapbox-gl-js

// Variable fov (in radians)
export function getFov(_ref8) {
  var height = _ref8.height,
      altitude = _ref8.altitude;

  return 2 * Math.atan(height / 2 / altitude);
}

export function getClippingPlanes(_ref9) {
  var altitude = _ref9.altitude,
      pitch = _ref9.pitch;

  // Find the distance from the center point to the center top
  // in altitude units using law of sines.
  var pitchRadians = pitch * DEGREES_TO_RADIANS;
  var halfFov = Math.atan(0.5 / altitude);
  var topHalfSurfaceDistance = Math.sin(halfFov) * altitude / Math.sin(Math.PI / 2 - pitchRadians - halfFov);

  // Calculate z value of the farthest fragment that should be rendered.
  var farZ = Math.cos(Math.PI / 2 - pitchRadians) * topHalfSurfaceDistance + altitude;

  return { farZ: farZ, nearZ: 0.1 };
}

// PROJECTION MATRIX: PROJECTS FROM CAMERA (VIEW) SPACE TO CLIPSPACE
export function makeProjectionMatrixFromMercatorParams(_ref10) {
  var width = _ref10.width,
      height = _ref10.height,
      pitch = _ref10.pitch,
      altitude = _ref10.altitude,
      _ref10$farZMultiplier = _ref10.farZMultiplier,
      farZMultiplier = _ref10$farZMultiplier === undefined ? 10 : _ref10$farZMultiplier;

  var _getClippingPlanes = getClippingPlanes({ altitude: altitude, pitch: pitch }),
      nearZ = _getClippingPlanes.nearZ,
      farZ = _getClippingPlanes.farZ;

  var fov = getFov({ height: height, altitude: altitude });

  var projectionMatrix = mat4.perspective(createMat4(), fov, // fov in radians
  width / height, // aspect ratio
  nearZ, // near plane
  farZ * farZMultiplier // far plane
  );

  return projectionMatrix;
}

function makeViewMatrixFromMercatorParams(_ref11) {
  var width = _ref11.width,
      height = _ref11.height,
      longitude = _ref11.longitude,
      latitude = _ref11.latitude,
      zoom = _ref11.zoom,
      pitch = _ref11.pitch,
      bearing = _ref11.bearing,
      altitude = _ref11.altitude,
      center = _ref11.center;

  // VIEW MATRIX: PROJECTS FROM VIRTUAL PIXELS TO CAMERA SPACE
  // Note: As usual, matrix operation orders should be read in reverse
  // since vectors will be multiplied from the right during transformation
  var vm = createMat4();

  // Move camera to altitude
  mat4.translate(vm, vm, [0, 0, -altitude]);

  // After the rotateX, z values are in pixel units. Convert them to
  // altitude units. 1 altitude unit = the screen height.
  mat4.scale(vm, vm, [1, -1, 1 / height]);

  // Rotate by bearing, and then by pitch (which tilts the view)
  mat4.rotateX(vm, vm, pitch * DEGREES_TO_RADIANS);
  mat4.rotateZ(vm, vm, -bearing * DEGREES_TO_RADIANS);
  // console.log(`VIEWPT Z ${pitch * DEGREES_TO_RADIANS} ${-bearing * DEGREES_TO_RADIANS} ${vm}`);
  mat4.translate(vm, vm, [-center[0], -center[1], 0]);
  // console.log(`VIEWPT T ${pitch * DEGREES_TO_RADIANS} ${-bearing * DEGREES_TO_RADIANS} ${vm}`);
  return vm;
}

/**
 * Returns map settings {latitude, longitude, zoom}
 * that will contain the provided corners within the provided width.
 * Only supports non-perspective mode.
 * @param {Number} width - viewport width
 * @param {Number} height - viewport height
 * @param {Array} bounds - [[lon, lat], [lon, lat]]
 * @param {Number} [padding] - The amount of padding in pixels to add to the given bounds.
 * @param {Array} [offset] - The center of the given bounds relative to the map's center,
 *    [x, y] measured in pixels.
 * @returns {Object} - latitude, longitude and zoom
 */
function _fitBounds(_ref12) {
  var width = _ref12.width,
      height = _ref12.height,
      bounds = _ref12.bounds,
      _ref12$padding = _ref12.padding,
      padding = _ref12$padding === undefined ? 0 : _ref12$padding,
      _ref12$offset = _ref12.offset,
      offset = _ref12$offset === undefined ? [0, 0] : _ref12$offset;

  var _bounds = _slicedToArray(bounds, 2),
      _bounds$ = _slicedToArray(_bounds[0], 2),
      west = _bounds$[0],
      south = _bounds$[1],
      _bounds$2 = _slicedToArray(_bounds[1], 2),
      east = _bounds$2[0],
      north = _bounds$2[1];

  var viewport = new WebMercatorViewport({
    width: width,
    height: height,
    longitude: 0,
    latitude: 0,
    zoom: 0
  });

  var nw = viewport.project([west, north]);
  var se = viewport.project([east, south]);
  var size = [Math.abs(se[0] - nw[0]), Math.abs(se[1] - nw[1])];
  var center = [(se[0] + nw[0]) / 2, (se[1] + nw[1]) / 2];

  var scaleX = (width - padding * 2 - Math.abs(offset[0]) * 2) / size[0];
  var scaleY = (height - padding * 2 - Math.abs(offset[1]) * 2) / size[1];

  var centerLngLat = viewport.unproject(center);
  var zoom = viewport.zoom + Math.log2(Math.abs(Math.min(scaleX, scaleY)));

  return {
    longitude: centerLngLat[0],
    latitude: centerLngLat[1],
    zoom: zoom
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wZXJzcGVjdGl2ZS1tZXJjYXRvci12aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJWaWV3cG9ydCIsImNyZWF0ZU1hdDQiLCJhdXRvYmluZCIsImFzc2VydCIsIm1hdDQiLCJ2ZWMyX2Rpc3RhbmNlIiwidmVjMl9hZGQiLCJ2ZWMyX25lZ2F0ZSIsIlBJIiwiTWF0aCIsIlBJXzQiLCJERUdSRUVTX1RPX1JBRElBTlMiLCJSQURJQU5TX1RPX0RFR1JFRVMiLCJUSUxFX1NJWkUiLCJXT1JMRF9TQ0FMRSIsIkRFRkFVTFRfTUFQX1NUQVRFIiwibGF0aXR1ZGUiLCJsb25naXR1ZGUiLCJ6b29tIiwicGl0Y2giLCJiZWFyaW5nIiwiYWx0aXR1ZGUiLCJFUlJfQVJHVU1FTlQiLCJXZWJNZXJjYXRvclZpZXdwb3J0Iiwid2lkdGgiLCJoZWlnaHQiLCJmYXJaTXVsdGlwbGllciIsInVuZGVmaW5lZCIsInNjYWxlIiwicG93IiwibWF4IiwiY2VudGVyIiwicHJvamVjdEZsYXQiLCJkaXN0YW5jZVNjYWxlcyIsImNhbGN1bGF0ZURpc3RhbmNlU2NhbGVzIiwicHJvamVjdGlvbk1hdHJpeCIsIm1ha2VQcm9qZWN0aW9uTWF0cml4RnJvbU1lcmNhdG9yUGFyYW1zIiwidmlld01hdHJpeCIsIm1ha2VWaWV3TWF0cml4RnJvbU1lcmNhdG9yUGFyYW1zIiwiX2Rpc3RhbmNlU2NhbGVzIiwiT2JqZWN0IiwiZnJlZXplIiwibG5nTGF0IiwieHkiLCJ1bnByb2plY3RGbGF0IiwicG9zIiwiZnJvbUxvY2F0aW9uIiwidW5wcm9qZWN0IiwidG9Mb2NhdGlvbiIsInRyYW5zbGF0ZSIsIm5ld0NlbnRlciIsInh5eiIsIngiLCJ5IiwieiIsIk51bWJlciIsImlzRmluaXRlIiwicGl4ZWxzUGVyTWV0ZXIiLCJkZWdyZWVzUGVyUGl4ZWwiLCJkZWx0YUxuZyIsImRlbHRhTGF0IiwibGVuZ3RoIiwiZGVsdGFMbmdMYXRaIiwiZGVsdGFaIiwicGl4ZWxzUGVyRGVncmVlIiwibWV0ZXJzUGVyUGl4ZWwiLCJkZWx0YVgiLCJkZWx0YVkiLCJsbmdMYXRaIiwibG5nIiwibGF0IiwiWiIsIm1ldGVyc1RvTG5nTGF0RGVsdGEiLCJib3VuZHMiLCJvcHRpb25zIiwiZml0Qm91bmRzIiwiYXNzaWduIiwibGFtYmRhMiIsInBoaTIiLCJsb2ciLCJ0YW4iLCJhdGFuIiwiZXhwIiwiaXNOYU4iLCJNRVRFUlNfUEVSX0RFR1JFRSIsImxhdENvc2luZSIsImNvcyIsIm1ldGVyc1BlckRlZ3JlZSIsInBpeGVsc1BlckRlZ3JlZVgiLCJwaXhlbHNQZXJEZWdyZWVZIiwicGl4ZWxzUGVyTWV0ZXJYIiwicGl4ZWxzUGVyTWV0ZXJZIiwicGl4ZWxzUGVyTWV0ZXJaIiwid29ybGRTaXplIiwiYWx0UGl4ZWxzUGVyTWV0ZXIiLCJnZXRGb3YiLCJnZXRDbGlwcGluZ1BsYW5lcyIsInBpdGNoUmFkaWFucyIsImhhbGZGb3YiLCJ0b3BIYWxmU3VyZmFjZURpc3RhbmNlIiwic2luIiwiZmFyWiIsIm5lYXJaIiwiZm92IiwicGVyc3BlY3RpdmUiLCJ2bSIsInJvdGF0ZVgiLCJyb3RhdGVaIiwicGFkZGluZyIsIm9mZnNldCIsIndlc3QiLCJzb3V0aCIsImVhc3QiLCJub3J0aCIsInZpZXdwb3J0IiwibnciLCJwcm9qZWN0Iiwic2UiLCJzaXplIiwiYWJzIiwic2NhbGVYIiwic2NhbGVZIiwiY2VudGVyTG5nTGF0IiwibG9nMiIsIm1pbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQSxPQUFPQSxRQUFQLElBQWtCQyxVQUFsQixRQUFtQyxZQUFuQztBQUNBLE9BQU9DLFFBQVAsTUFBcUIsWUFBckI7QUFDQSxPQUFPQyxNQUFQLE1BQW1CLFFBQW5COztBQUVBO0FBQ0EsT0FBT0MsSUFBUCxNQUFpQixTQUFqQjtBQUNBLE9BQU9DLGFBQVAsTUFBMEIsa0JBQTFCO0FBQ0EsT0FBT0MsUUFBUCxNQUFxQixhQUFyQjtBQUNBLE9BQU9DLFdBQVAsTUFBd0IsZ0JBQXhCOztBQUVBO0FBQ0EsSUFBTUMsS0FBS0Ms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QUFULElBQXNCLENBQTdDLElBQWtEUyxLQUFLLENBQUwsQ0FBakU7QUFDQSxNQUFNRyxTQUFTLENBQUNoRyxTQUFTbUYsVUFBVSxDQUFuQixHQUF1Qm5HLEtBQUs4RyxHQUFMLENBQVNWLE9BQU8sQ0FBUCxDQUFULElBQXNCLENBQTlDLElBQW1EUyxLQUFLLENBQUwsQ0FBbEU7O0FBRUEsTUFBTUksZUFBZVIsU0FBU25FLFNBQVQsQ0FBbUJoQixNQUFuQixDQUFyQjtBQUNBLE1BQU1iLE9BQU9nRyxTQUFTaEcsSUFBVCxHQUFnQlQsS0FBS2tILElBQUwsQ0FBVWxILEtBQUs4RyxHQUFMLENBQVM5RyxLQUFLbUgsR0FBTCxDQUFTSixNQUFULEVBQWlCQyxNQUFqQixDQUFULENBQVYsQ0FBN0I7O0FBRUEsU0FBTztBQUNMeEcsZUFBV3lHLGFBQWEsQ0FBYixDQUROO0FBRUwxRyxjQUFVMEcsYUFBYSxDQUFiLENBRkw7QUFHTHhHO0FBSEssR0FBUDtBQUtEIiwiZmlsZSI6InBlcnNwZWN0aXZlLW1lcmNhdG9yLXZpZXdwb3J0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVmlldyBhbmQgUHJvamVjdGlvbiBNYXRyaXggY2FsY3VsYXRpb25zIGZvciBtYXBib3gtanMgc3R5bGUgbWFwIHZpZXcgcHJvcGVydGllc1xuaW1wb3J0IFZpZXdwb3J0LCB7Y3JlYXRlTWF0NH0gZnJvbSAnLi92aWV3cG9ydCc7XG5pbXBvcnQgYXV0b2JpbmQgZnJvbSAnLi9hdXRvYmluZCc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5cbi8qIGVzbGludC1kaXNhYmxlIGNhbWVsY2FzZSAqL1xuaW1wb3J0IG1hdDQgZnJvbSAnZ2wtbWF0NCc7XG5pbXBvcnQgdmVjMl9kaXN0YW5jZSBmcm9tICdnbC12ZWMyL2Rpc3RhbmNlJztcbmltcG9ydCB2ZWMyX2FkZCBmcm9tICdnbC12ZWMyL2FkZCc7XG5pbXBvcnQgdmVjMl9uZWdhdGUgZnJvbSAnZ2wtdmVjMi9uZWdhdGUnO1xuXG4vLyBDT05TVEFOVFNcbmNvbnN0IFBJID0gTWF0aC5QSTtcbmNvbnN0IFBJXzQgPSBQSSAvIDQ7XG5jb25zdCBERUdSRUVTX1RPX1JBRElBTlMgPSBQSSAvIDE4MDtcbmNvbnN0IFJBRElBTlNfVE9fREVHUkVFUyA9IDE4MCAvIFBJO1xuY29uc3QgVElMRV9TSVpFID0gNTEyO1xuY29uc3QgV09STERfU0NBTEUgPSBUSUxFX1NJWkU7XG5cbmNvbnN0IERFRkFVTFRfTUFQX1NUQVRFID0ge1xuICBsYXRpdHVkZTogMzcsXG4gIGxvbmdpdHVkZTogLTEyMixcbiAgem9vbTogMTEsXG4gIHBpdGNoOiAwLFxuICBiZWFyaW5nOiAwLFxuICBhbHRpdHVkZTogMS41XG59O1xuXG5jb25zdCBFUlJfQVJHVU1FTlQgPSAnSWxsZWdhbCBhcmd1bWVudCB0byBXZWJNZXJjYXRvclZpZXdwb3J0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2ViTWVyY2F0b3JWaWV3cG9ydCBleHRlbmRzIFZpZXdwb3J0IHtcbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogQ3JlYXRlcyB2aWV3L3Byb2plY3Rpb24gbWF0cmljZXMgZnJvbSBtZXJjYXRvciBwYXJhbXNcbiAgICogTm90ZTogVGhlIFZpZXdwb3J0IGlzIGltbXV0YWJsZSBpbiB0aGUgc2Vuc2UgdGhhdCBpdCBvbmx5IGhhcyBhY2Nlc3NvcnMuXG4gICAqIEEgbmV3IHZpZXdwb3J0IGluc3RhbmNlIHNob3VsZCBiZSBjcmVhdGVkIGlmIGFueSBwYXJhbWV0ZXJzIGhhdmUgY2hhbmdlZC5cbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHQgLSBvcHRpb25zXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gbWVyY2F0b3I9dHJ1ZSAtIFdoZXRoZXIgdG8gdXNlIG1lcmNhdG9yIHByb2plY3Rpb25cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdC53aWR0aD0xIC0gV2lkdGggb2YgXCJ2aWV3cG9ydFwiIG9yIHdpbmRvd1xuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0LmhlaWdodD0xIC0gSGVpZ2h0IG9mIFwidmlld3BvcnRcIiBvciB3aW5kb3dcbiAgICogQHBhcmFtIHtBcnJheX0gb3B0LmNlbnRlcj1bMCwgMF0gLSBDZW50ZXIgb2Ygdmlld3BvcnRcbiAgICogICBbbG9uZ2l0dWRlLCBsYXRpdHVkZV0gb3IgW3gsIHldXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHQuc2NhbGU9MSAtIEVpdGhlciB1c2Ugc2NhbGUgb3Igem9vbVxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0LnBpdGNoPTAgLSBDYW1lcmEgYW5nbGUgaW4gZGVncmVlcyAoMCBpcyBzdHJhaWdodCBkb3duKVxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0LmJlYXJpbmc9MCAtIE1hcCByb3RhdGlvbiBpbiBkZWdyZWVzICgwIG1lYW5zIG5vcnRoIGlzIHVwKVxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0LmFsdGl0dWRlPSAtIEFsdGl0dWRlIG9mIGNhbWVyYSBpbiBzY3JlZW4gdW5pdHNcbiAgICpcbiAgICogV2ViIG1lcmNhdG9yIHByb2plY3Rpb24gc2hvcnQtaGFuZCBwYXJhbWV0ZXJzXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHQubGF0aXR1ZGUgLSBDZW50ZXIgb2Ygdmlld3BvcnQgb24gbWFwIChhbHRlcm5hdGl2ZSB0byBvcHQuY2VudGVyKVxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0LmxvbmdpdHVkZSAtIENlbnRlciBvZiB2aWV3cG9ydCBvbiBtYXAgKGFsdGVybmF0aXZlIHRvIG9wdC5jZW50ZXIpXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHQuem9vbSAtIFNjYWxlID0gTWF0aC5wb3coMix6b29tKSBvbiBtYXAgKGFsdGVybmF0aXZlIHRvIG9wdC5zY2FsZSlcblxuICAgKiBOb3RlczpcbiAgICogIC0gT25seSBvbmUgb2YgY2VudGVyIG9yIFtsYXRpdHVkZSwgbG9uZ2l0dWRlXSBjYW4gYmUgc3BlY2lmaWVkXG4gICAqICAtIFtsYXRpdHVkZSwgbG9uZ2l0dWRlXSBjYW4gb25seSBiZSBzcGVjaWZpZWQgd2hlbiBcIm1lcmNhdG9yXCIgaXMgdHJ1ZVxuICAgKiAgLSBBbHRpdHVkZSBoYXMgYSBkZWZhdWx0IHZhbHVlIHRoYXQgbWF0Y2hlcyBhc3N1bXB0aW9ucyBpbiBtYXBib3gtZ2xcbiAgICogIC0gd2lkdGggYW5kIGhlaWdodCBhcmUgZm9yY2VkIHRvIDEgaWYgc3VwcGxpZWQgYXMgMCwgdG8gYXZvaWRcbiAgICogICAgZGl2aXNpb24gYnkgemVyby4gVGhpcyBpcyBpbnRlbmRlZCB0byByZWR1Y2UgdGhlIGJ1cmRlbiBvZiBhcHBzIHRvXG4gICAqICAgIHRvIGNoZWNrIHZhbHVlcyBiZWZvcmUgaW5zdGFudGlhdGluZyBhIFZpZXdwb3J0LlxuICAgKi9cbiAgLyogZXNsaW50LWRpc2FibGUgY29tcGxleGl0eSAqL1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgLy8gTWFwIHN0YXRlXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIGxhdGl0dWRlLFxuICAgIGxvbmdpdHVkZSxcbiAgICB6b29tLFxuICAgIHBpdGNoLFxuICAgIGJlYXJpbmcsXG4gICAgYWx0aXR1ZGUsXG4gICAgZmFyWk11bHRpcGxpZXIgPSAxMFxuICB9ID0ge30pIHtcbiAgICAvLyBWaWV3cG9ydCAtIHN1cHBvcnQgdW5kZWZpbmVkIGFyZ3VtZW50c1xuICAgIHdpZHRoID0gd2lkdGggIT09IHVuZGVmaW5lZCA/IHdpZHRoIDogREVGQVVMVF9NQVBfU1RBVEUud2lkdGg7XG4gICAgaGVpZ2h0ID0gaGVpZ2h0ICE9PSB1bmRlZmluZWQgPyBoZWlnaHQgOiBERUZBVUxUX01BUF9TVEFURS5oZWlnaHQ7XG4gICAgem9vbSA9IHpvb20gIT09IHVuZGVmaW5lZCA/IHpvb20gOiBERUZBVUxUX01BUF9TVEFURS56b29tO1xuICAgIGxhdGl0dWRlID0gbGF0aXR1ZGUgIT09IHVuZGVmaW5lZCA/IGxhdGl0dWRlIDogREVGQVVMVF9NQVBfU1RBVEUubGF0aXR1ZGU7XG4gICAgbG9uZ2l0dWRlID0gbG9uZ2l0dWRlICE9PSB1bmRlZmluZWQgPyBsb25naXR1ZGUgOiBERUZBVUxUX01BUF9TVEFURS5sb25naXR1ZGU7XG4gICAgYmVhcmluZyA9IGJlYXJpbmcgIT09IHVuZGVmaW5lZCA/IGJlYXJpbmcgOiBERUZBVUxUX01BUF9TVEFURS5iZWFyaW5nO1xuICAgIHBpdGNoID0gcGl0Y2ggIT09IHVuZGVmaW5lZCA/IHBpdGNoIDogREVGQVVMVF9NQVBfU1RBVEUucGl0Y2g7XG4gICAgYWx0aXR1ZGUgPSBhbHRpdHVkZSAhPT0gdW5kZWZpbmVkID8gYWx0aXR1ZGUgOiBERUZBVUxUX01BUF9TVEFURS5hbHRpdHVkZTtcblxuICAgIC8vIFNpbGVudGx5IGFsbG93IGFwcHMgdG8gc2VuZCBpbiAwLDAgdG8gZmFjaWxpdGF0ZSBpc29tb3JwaGljIHJlbmRlciBldGNcbiAgICB3aWR0aCA9IHdpZHRoIHx8IDE7XG4gICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IDE7XG5cbiAgICBjb25zdCBzY2FsZSA9IE1hdGgucG93KDIsIHpvb20pO1xuICAgIC8vIEFsdGl0dWRlIC0gcHJldmVudCBkaXZpc2lvbiBieSAwXG4gICAgLy8gVE9ETyAtIGp1c3QgdGhyb3cgYW4gRXJyb3IgaW5zdGVhZD9cbiAgICBhbHRpdHVkZSA9IE1hdGgubWF4KDAuNzUsIGFsdGl0dWRlKTtcblxuICAgIGNvbnN0IGNlbnRlciA9IHByb2plY3RGbGF0KFtsb25naXR1ZGUsIGxhdGl0dWRlXSwgc2NhbGUpO1xuXG4gICAgY29uc3QgZGlzdGFuY2VTY2FsZXMgPSBjYWxjdWxhdGVEaXN0YW5jZVNjYWxlcyh7bGF0aXR1ZGUsIGxvbmdpdHVkZSwgc2NhbGV9KTtcblxuICAgIGNvbnN0IHByb2plY3Rpb25NYXRyaXggPSBtYWtlUHJvamVjdGlvbk1hdHJpeEZyb21NZXJjYXRvclBhcmFtcyh7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIHBpdGNoLFxuICAgICAgYmVhcmluZyxcbiAgICAgIGFsdGl0dWRlLFxuICAgICAgZmFyWk11bHRpcGxpZXJcbiAgICB9KTtcblxuICAgIGNvbnN0IHZpZXdNYXRyaXggPSBtYWtlVmlld01hdHJpeEZyb21NZXJjYXRvclBhcmFtcyh7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIGxvbmdpdHVkZSxcbiAgICAgIGxhdGl0dWRlLFxuICAgICAgem9vbSxcbiAgICAgIHBpdGNoLFxuICAgICAgYmVhcmluZyxcbiAgICAgIGFsdGl0dWRlLFxuICAgICAgZGlzdGFuY2VTY2FsZXMsXG4gICAgICBjZW50ZXJcbiAgICB9KTtcblxuICAgIHN1cGVyKHt3aWR0aCwgaGVpZ2h0LCB2aWV3TWF0cml4LCBwcm9qZWN0aW9uTWF0cml4fSk7XG5cbiAgICAvLyBTYXZlIHBhcmFtZXRlcnNcbiAgICB0aGlzLmxhdGl0dWRlID0gbGF0aXR1ZGU7XG4gICAgdGhpcy5sb25naXR1ZGUgPSBsb25naXR1ZGU7XG4gICAgdGhpcy56b29tID0gem9vbTtcbiAgICB0aGlzLnBpdGNoID0gcGl0Y2g7XG4gICAgdGhpcy5iZWFyaW5nID0gYmVhcmluZztcbiAgICB0aGlzLmFsdGl0dWRlID0gYWx0aXR1ZGU7XG5cbiAgICB0aGlzLnNjYWxlID0gc2NhbGU7XG4gICAgdGhpcy5jZW50ZXIgPSBjZW50ZXI7XG5cbiAgICB0aGlzLl9kaXN0YW5jZVNjYWxlcyA9IGRpc3RhbmNlU2NhbGVzO1xuXG4gICAgYXV0b2JpbmQodGhpcyk7XG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHkgKi9cblxuICAvKipcbiAgICogUHJvamVjdCBbbG5nLGxhdF0gb24gc3BoZXJlIG9udG8gW3gseV0gb24gNTEyKjUxMiBNZXJjYXRvciBab29tIDAgdGlsZS5cbiAgICogUGVyZm9ybXMgdGhlIG5vbmxpbmVhciBwYXJ0IG9mIHRoZSB3ZWIgbWVyY2F0b3IgcHJvamVjdGlvbi5cbiAgICogUmVtYWluaW5nIHByb2plY3Rpb24gaXMgZG9uZSB3aXRoIDR4NCBtYXRyaWNlcyB3aGljaCBhbHNvIGhhbmRsZXNcbiAgICogcGVyc3BlY3RpdmUuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXl9IGxuZ0xhdCAtIFtsbmcsIGxhdF0gY29vcmRpbmF0ZXNcbiAgICogICBTcGVjaWZpZXMgYSBwb2ludCBvbiB0aGUgc3BoZXJlIHRvIHByb2plY3Qgb250byB0aGUgbWFwLlxuICAgKiBAcmV0dXJuIHtBcnJheX0gW3gseV0gY29vcmRpbmF0ZXMuXG4gICAqL1xuICBfcHJvamVjdEZsYXQobG5nTGF0LCBzY2FsZSA9IHRoaXMuc2NhbGUpIHtcbiAgICByZXR1cm4gcHJvamVjdEZsYXQobG5nTGF0LCBzY2FsZSk7XG4gIH1cblxuICAvKipcbiAgICogVW5wcm9qZWN0IHdvcmxkIHBvaW50IFt4LHldIG9uIG1hcCBvbnRvIHtsYXQsIGxvbn0gb24gc3BoZXJlXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fFZlY3Rvcn0geHkgLSBvYmplY3Qgd2l0aCB7eCx5fSBtZW1iZXJzXG4gICAqICByZXByZXNlbnRpbmcgcG9pbnQgb24gcHJvamVjdGVkIG1hcCBwbGFuZVxuICAgKiBAcmV0dXJuIHtHZW9Db29yZGluYXRlc30gLSBvYmplY3Qgd2l0aCB7bGF0LGxvbn0gb2YgcG9pbnQgb24gc3BoZXJlLlxuICAgKiAgIEhhcyB0b0FycmF5IG1ldGhvZCBpZiB5b3UgbmVlZCBhIEdlb0pTT04gQXJyYXkuXG4gICAqICAgUGVyIGNhcnRvZ3JhcGhpYyB0cmFkaXRpb24sIGxhdCBhbmQgbG9uIGFyZSBzcGVjaWZpZWQgYXMgZGVncmVlcy5cbiAgICovXG4gIF91bnByb2plY3RGbGF0KHh5LCBzY2FsZSA9IHRoaXMuc2NhbGUpIHtcbiAgICByZXR1cm4gdW5wcm9qZWN0RmxhdCh4eSwgc2NhbGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbWFwIGNlbnRlciB0aGF0IHBsYWNlIGEgZ2l2ZW4gW2xuZywgbGF0XSBjb29yZGluYXRlIGF0IHNjcmVlblxuICAgKiBwb2ludCBbeCwgeV1cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheX0gbG5nTGF0IC0gW2xuZyxsYXRdIGNvb3JkaW5hdGVzXG4gICAqICAgU3BlY2lmaWVzIGEgcG9pbnQgb24gdGhlIHNwaGVyZS5cbiAgICogQHBhcmFtIHtBcnJheX0gcG9zIC0gW3gseV0gY29vcmRpbmF0ZXNcbiAgICogICBTcGVjaWZpZXMgYSBwb2ludCBvbiB0aGUgc2NyZWVuLlxuICAgKiBAcmV0dXJuIHtBcnJheX0gW2xuZyxsYXRdIG5ldyBtYXAgY2VudGVyLlxuICAgKi9cbiAgZ2V0TG9jYXRpb25BdFBvaW50KHtsbmdMYXQsIHBvc30pIHtcbiAgICBjb25zdCBmcm9tTG9jYXRpb24gPSB0aGlzLnByb2plY3RGbGF0KHRoaXMudW5wcm9qZWN0KHBvcykpO1xuICAgIGNvbnN0IHRvTG9jYXRpb24gPSB0aGlzLnByb2plY3RGbGF0KGxuZ0xhdCk7XG5cbiAgICBjb25zdCBjZW50ZXIgPSB0aGlzLnByb2plY3RGbGF0KFt0aGlzLmxvbmdpdHVkZSwgdGhpcy5sYXRpdHVkZV0pO1xuXG4gICAgY29uc3QgdHJhbnNsYXRlID0gdmVjMl9hZGQoW10sIHRvTG9jYXRpb24sIHZlYzJfbmVnYXRlKFtdLCBmcm9tTG9jYXRpb24pKTtcbiAgICBjb25zdCBuZXdDZW50ZXIgPSB2ZWMyX2FkZChbXSwgY2VudGVyLCB0cmFuc2xhdGUpO1xuICAgIHJldHVybiB0aGlzLnVucHJvamVjdEZsYXQobmV3Q2VudGVyKTtcbiAgfVxuXG4gIC8qXG4gIGdldExuZ0xhdEF0Vmlld3BvcnRQb3NpdGlvbihsbmdsYXQsIHh5KSB7XG4gICAgY29uc3QgYyA9IHRoaXMubG9jYXRpb25Db29yZGluYXRlKGxuZ2xhdCk7XG4gICAgY29uc3QgY29vcmRBdFBvaW50ID0gdGhpcy5wb2ludENvb3JkaW5hdGUoeHkpO1xuICAgIGNvbnN0IGNvb3JkQ2VudGVyID0gdGhpcy5wb2ludENvb3JkaW5hdGUodGhpcy5jZW50ZXJQb2ludCk7XG4gICAgY29uc3QgdHJhbnNsYXRlID0gY29vcmRBdFBvaW50Ll9zdWIoYyk7XG4gICAgdGhpcy5jZW50ZXIgPSB0aGlzLmNvb3JkaW5hdGVMb2NhdGlvbihjb29yZENlbnRlci5fc3ViKHRyYW5zbGF0ZSkpO1xuICB9XG4gICovXG5cbiAgZ2V0RGlzdGFuY2VTY2FsZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc3RhbmNlU2NhbGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgbWV0ZXIgb2Zmc2V0IHRvIGEgbG5nbGF0IG9mZnNldFxuICAgKlxuICAgKiBOb3RlOiBVc2VzIHNpbXBsZSBsaW5lYXIgYXBwcm94aW1hdGlvbiBhcm91bmQgdGhlIHZpZXdwb3J0IGNlbnRlclxuICAgKiBFcnJvciBpbmNyZWFzZXMgd2l0aCBzaXplIG9mIG9mZnNldCAocm91Z2hseSAxJSBwZXIgMTAwa20pXG4gICAqXG4gICAqIEBwYXJhbSB7W051bWJlcixOdW1iZXJdfFtOdW1iZXIsTnVtYmVyLE51bWJlcl0pIHh5eiAtIGFycmF5IG9mIG1ldGVyIGRlbHRhc1xuICAgKiBAcmV0dXJuIHtbTnVtYmVyLE51bWJlcl18W051bWJlcixOdW1iZXIsTnVtYmVyXSkgLSBhcnJheSBvZiBbbG5nLGxhdCx6XSBkZWx0YXNcbiAgICovXG4gIG1ldGVyc1RvTG5nTGF0RGVsdGEoeHl6KSB7XG4gICAgY29uc3QgW3gsIHksIHogPSAwXSA9IHh5ejtcbiAgICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKHgpICYmIE51bWJlci5pc0Zpbml0ZSh5KSAmJiBOdW1iZXIuaXNGaW5pdGUoeiksIEVSUl9BUkdVTUVOVCk7XG4gICAgY29uc3Qge3BpeGVsc1Blck1ldGVyLCBkZWdyZWVzUGVyUGl4ZWx9ID0gdGhpcy5fZGlzdGFuY2VTY2FsZXM7XG4gICAgY29uc3QgZGVsdGFMbmcgPSB4ICogcGl4ZWxzUGVyTWV0ZXJbMF0gKiBkZWdyZWVzUGVyUGl4ZWxbMF07XG4gICAgY29uc3QgZGVsdGFMYXQgPSB5ICogcGl4ZWxzUGVyTWV0ZXJbMV0gKiBkZWdyZWVzUGVyUGl4ZWxbMV07XG4gICAgcmV0dXJuIHh5ei5sZW5ndGggPT09IDIgPyBbZGVsdGFMbmcsIGRlbHRhTGF0XSA6IFtkZWx0YUxuZywgZGVsdGFMYXQsIHpdO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgbG5nbGF0IG9mZnNldCB0byBhIG1ldGVyIG9mZnNldFxuICAgKlxuICAgKiBOb3RlOiBVc2VzIHNpbXBsZSBsaW5lYXIgYXBwcm94aW1hdGlvbiBhcm91bmQgdGhlIHZpZXdwb3J0IGNlbnRlclxuICAgKiBFcnJvciBpbmNyZWFzZXMgd2l0aCBzaXplIG9mIG9mZnNldCAocm91Z2hseSAxJSBwZXIgMTAwa20pXG4gICAqXG4gICAqIEBwYXJhbSB7W051bWJlcixOdW1iZXJdfFtOdW1iZXIsTnVtYmVyLE51bWJlcl0pIGRlbHRhTG5nTGF0WiAtIGFycmF5IG9mIFtsbmcsbGF0LHpdIGRlbHRhc1xuICAgKiBAcmV0dXJuIHtbTnVtYmVyLE51bWJlcl18W051bWJlcixOdW1iZXIsTnVtYmVyXSkgLSBhcnJheSBvZiBtZXRlciBkZWx0YXNcbiAgICovXG4gIGxuZ0xhdERlbHRhVG9NZXRlcnMoZGVsdGFMbmdMYXRaKSB7XG4gICAgY29uc3QgW2RlbHRhTG5nLCBkZWx0YUxhdCwgZGVsdGFaID0gMF0gPSBkZWx0YUxuZ0xhdFo7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZShkZWx0YUxuZykgJiYgTnVtYmVyLmlzRmluaXRlKGRlbHRhTGF0KSAmJiBOdW1iZXIuaXNGaW5pdGUoZGVsdGFaKSxcbiAgICAgIEVSUl9BUkdVTUVOVCk7XG4gICAgY29uc3Qge3BpeGVsc1BlckRlZ3JlZSwgbWV0ZXJzUGVyUGl4ZWx9ID0gdGhpcy5fZGlzdGFuY2VTY2FsZXM7XG4gICAgY29uc3QgZGVsdGFYID0gZGVsdGFMbmcgKiBwaXhlbHNQZXJEZWdyZWVbMF0gKiBtZXRlcnNQZXJQaXhlbFswXTtcbiAgICBjb25zdCBkZWx0YVkgPSBkZWx0YUxhdCAqIHBpeGVsc1BlckRlZ3JlZVsxXSAqIG1ldGVyc1BlclBpeGVsWzFdO1xuICAgIHJldHVybiBkZWx0YUxuZ0xhdFoubGVuZ3RoID09PSAyID8gW2RlbHRhWCwgZGVsdGFZXSA6IFtkZWx0YVgsIGRlbHRhWSwgZGVsdGFaXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBtZXRlciBkZWx0YSB0byBhIGJhc2UgbG5nbGF0IGNvb3JkaW5hdGUsIHJldHVybmluZyBhIG5ldyBsbmdsYXQgYXJyYXlcbiAgICpcbiAgICogTm90ZTogVXNlcyBzaW1wbGUgbGluZWFyIGFwcHJveGltYXRpb24gYXJvdW5kIHRoZSB2aWV3cG9ydCBjZW50ZXJcbiAgICogRXJyb3IgaW5jcmVhc2VzIHdpdGggc2l6ZSBvZiBvZmZzZXQgKHJvdWdobHkgMSUgcGVyIDEwMGttKVxuICAgKlxuICAgKiBAcGFyYW0ge1tOdW1iZXIsTnVtYmVyXXxbTnVtYmVyLE51bWJlcixOdW1iZXJdKSBsbmdMYXRaIC0gYmFzZSBjb29yZGluYXRlXG4gICAqIEBwYXJhbSB7W051bWJlcixOdW1iZXJdfFtOdW1iZXIsTnVtYmVyLE51bWJlcl0pIHh5eiAtIGFycmF5IG9mIG1ldGVyIGRlbHRhc1xuICAgKiBAcmV0dXJuIHtbTnVtYmVyLE51bWJlcl18W051bWJlcixOdW1iZXIsTnVtYmVyXSkgYXJyYXkgb2YgW2xuZyxsYXQsel0gZGVsdGFzXG4gICAqL1xuICBhZGRNZXRlcnNUb0xuZ0xhdChsbmdMYXRaLCB4eXopIHtcbiAgICBjb25zdCBbbG5nLCBsYXQsIFogPSAwXSA9IGxuZ0xhdFo7XG4gICAgY29uc3QgW2RlbHRhTG5nLCBkZWx0YUxhdCwgZGVsdGFaID0gMF0gPSB0aGlzLm1ldGVyc1RvTG5nTGF0RGVsdGEoeHl6KTtcbiAgICByZXR1cm4gbG5nTGF0Wi5sZW5ndGggPT09IDIgP1xuICAgICAgW2xuZyArIGRlbHRhTG5nLCBsYXQgKyBkZWx0YUxhdF0gOlxuICAgICAgW2xuZyArIGRlbHRhTG5nLCBsYXQgKyBkZWx0YUxhdCwgWiArIGRlbHRhWl07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyB2aWV3cG9ydCB0aGF0IGZpdCBhcm91bmQgdGhlIGdpdmVuIHJlY3RhbmdsZS5cbiAgICogT25seSBzdXBwb3J0cyBub24tcGVyc3BlY3RpdmUgbW9kZS5cbiAgICogQHBhcmFtIHtBcnJheX0gYm91bmRzIC0gW1tsb24sIGxhdF0sIFtsb24sIGxhdF1dXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wYWRkaW5nXSAtIFRoZSBhbW91bnQgb2YgcGFkZGluZyBpbiBwaXhlbHMgdG8gYWRkIHRvIHRoZSBnaXZlbiBib3VuZHMuXG4gICAqIEBwYXJhbSB7QXJyYXl9IFtvcHRpb25zLm9mZnNldF0gLSBUaGUgY2VudGVyIG9mIHRoZSBnaXZlbiBib3VuZHMgcmVsYXRpdmUgdG8gdGhlIG1hcCdzIGNlbnRlcixcbiAgICogICAgW3gsIHldIG1lYXN1cmVkIGluIHBpeGVscy5cbiAgICogQHJldHVybnMge1dlYk1lcmNhdG9yVmlld3BvcnR9XG4gICAqL1xuICBmaXRCb3VuZHMoYm91bmRzLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSB0aGlzO1xuICAgIGNvbnN0IHtsb25naXR1ZGUsIGxhdGl0dWRlLCB6b29tfSA9IGZpdEJvdW5kcyhPYmplY3QuYXNzaWduKHt3aWR0aCwgaGVpZ2h0LCBib3VuZHN9LCBvcHRpb25zKSk7XG4gICAgcmV0dXJuIG5ldyBXZWJNZXJjYXRvclZpZXdwb3J0KHt3aWR0aCwgaGVpZ2h0LCBsb25naXR1ZGUsIGxhdGl0dWRlLCB6b29tfSk7XG4gIH1cblxuICAvLyBJTlRFUk5BTCBNRVRIT0RTXG5cbiAgX2dldFBhcmFtcygpIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzdGFuY2VTY2FsZXM7XG4gIH1cbn1cblxuLyoqXG4gKiBQcm9qZWN0IFtsbmcsbGF0XSBvbiBzcGhlcmUgb250byBbeCx5XSBvbiA1MTIqNTEyIE1lcmNhdG9yIFpvb20gMCB0aWxlLlxuICogUGVyZm9ybXMgdGhlIG5vbmxpbmVhciBwYXJ0IG9mIHRoZSB3ZWIgbWVyY2F0b3IgcHJvamVjdGlvbi5cbiAqIFJlbWFpbmluZyBwcm9qZWN0aW9uIGlzIGRvbmUgd2l0aCA0eDQgbWF0cmljZXMgd2hpY2ggYWxzbyBoYW5kbGVzXG4gKiBwZXJzcGVjdGl2ZS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBsbmdMYXQgLSBbbG5nLCBsYXRdIGNvb3JkaW5hdGVzXG4gKiAgIFNwZWNpZmllcyBhIHBvaW50IG9uIHRoZSBzcGhlcmUgdG8gcHJvamVjdCBvbnRvIHRoZSBtYXAuXG4gKiBAcmV0dXJuIHtBcnJheX0gW3gseV0gY29vcmRpbmF0ZXMuXG4gKi9cbmZ1bmN0aW9uIHByb2plY3RGbGF0KFtsbmcsIGxhdF0sIHNjYWxlKSB7XG4gIHNjYWxlID0gc2NhbGUgKiBXT1JMRF9TQ0FMRTtcbiAgY29uc3QgbGFtYmRhMiA9IGxuZyAqIERFR1JFRVNfVE9fUkFESUFOUztcbiAgY29uc3QgcGhpMiA9IGxhdCAqIERFR1JFRVNfVE9fUkFESUFOUztcbiAgY29uc3QgeCA9IHNjYWxlICogKGxhbWJkYTIgKyBQSSkgLyAoMiAqIFBJKTtcbiAgY29uc3QgeSA9IHNjYWxlICogKFBJIC0gTWF0aC5sb2coTWF0aC50YW4oUElfNCArIHBoaTIgKiAwLjUpKSkgLyAoMiAqIFBJKTtcbiAgcmV0dXJuIFt4LCB5XTtcbn1cblxuLyoqXG4gKiBVbnByb2plY3Qgd29ybGQgcG9pbnQgW3gseV0gb24gbWFwIG9udG8ge2xhdCwgbG9ufSBvbiBzcGhlcmVcbiAqXG4gKiBAcGFyYW0ge29iamVjdHxWZWN0b3J9IHh5IC0gb2JqZWN0IHdpdGgge3gseX0gbWVtYmVyc1xuICogIHJlcHJlc2VudGluZyBwb2ludCBvbiBwcm9qZWN0ZWQgbWFwIHBsYW5lXG4gKiBAcmV0dXJuIHtHZW9Db29yZGluYXRlc30gLSBvYmplY3Qgd2l0aCB7bGF0LGxvbn0gb2YgcG9pbnQgb24gc3BoZXJlLlxuICogICBIYXMgdG9BcnJheSBtZXRob2QgaWYgeW91IG5lZWQgYSBHZW9KU09OIEFycmF5LlxuICogICBQZXIgY2FydG9ncmFwaGljIHRyYWRpdGlvbiwgbGF0IGFuZCBsb24gYXJlIHNwZWNpZmllZCBhcyBkZWdyZWVzLlxuICovXG5mdW5jdGlvbiB1bnByb2plY3RGbGF0KFt4LCB5XSwgc2NhbGUpIHtcbiAgc2NhbGUgPSBzY2FsZSAqIFdPUkxEX1NDQUxFO1xuICBjb25zdCBsYW1iZGEyID0gKHggLyBzY2FsZSkgKiAoMiAqIFBJKSAtIFBJO1xuICBjb25zdCBwaGkyID0gMiAqIChNYXRoLmF0YW4oTWF0aC5leHAoUEkgLSAoeSAvIHNjYWxlKSAqICgyICogUEkpKSkgLSBQSV80KTtcbiAgcmV0dXJuIFtsYW1iZGEyICogUkFESUFOU19UT19ERUdSRUVTLCBwaGkyICogUkFESUFOU19UT19ERUdSRUVTXTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgZGlzdGFuY2Ugc2NhbGVzIGluIG1ldGVycyBhcm91bmQgY3VycmVudCBsYXQvbG9uLCBib3RoIGZvclxuICogZGVncmVlcyBhbmQgcGl4ZWxzLlxuICogSW4gbWVyY2F0b3IgcHJvamVjdGlvbiBtb2RlLCB0aGUgZGlzdGFuY2Ugc2NhbGVzIHZhcnkgc2lnbmlmaWNhbnRseVxuICogd2l0aCBsYXRpdHVkZS5cbiAqL1xuZnVuY3Rpb24gY2FsY3VsYXRlRGlzdGFuY2VTY2FsZXMoe2xhdGl0dWRlLCBsb25naXR1ZGUsIHNjYWxlfSkge1xuICBhc3NlcnQoIWlzTmFOKGxhdGl0dWRlKSAmJiAhaXNOYU4obG9uZ2l0dWRlKSAmJiAhaXNOYU4oc2NhbGUpLCBFUlJfQVJHVU1FTlQpO1xuICAvLyBBcHByb3hpbWF0ZWx5IDExMWttIHBlciBkZWdyZWUgYXQgZXF1YXRvclxuICBjb25zdCBNRVRFUlNfUEVSX0RFR1JFRSA9IDExMTAwMDtcblxuICBjb25zdCBsYXRDb3NpbmUgPSBNYXRoLmNvcyhsYXRpdHVkZSAqIE1hdGguUEkgLyAxODApO1xuXG4gIGNvbnN0IG1ldGVyc1BlckRlZ3JlZSA9IE1FVEVSU19QRVJfREVHUkVFICogbGF0Q29zaW5lO1xuXG4gIC8vIENhbGN1bGF0ZSBudW1iZXIgb2YgcGl4ZWxzIG9jY3VwaWVkIGJ5IG9uZSBkZWdyZWUgbG9uZ2l0dWRlXG4gIC8vIGFyb3VuZCBjdXJyZW50IGxhdC9sb25cbiAgY29uc3QgcGl4ZWxzUGVyRGVncmVlWCA9IHZlYzJfZGlzdGFuY2UoXG4gICAgcHJvamVjdEZsYXQoW2xvbmdpdHVkZSArIDAuNSwgbGF0aXR1ZGVdLCBzY2FsZSksXG4gICAgcHJvamVjdEZsYXQoW2xvbmdpdHVkZSAtIDAuNSwgbGF0aXR1ZGVdLCBzY2FsZSlcbiAgKTtcbiAgLy8gQ2FsY3VsYXRlIG51bWJlciBvZiBwaXhlbHMgb2NjdXBpZWQgYnkgb25lIGRlZ3JlZSBsYXRpdHVkZVxuICAvLyBhcm91bmQgY3VycmVudCBsYXQvbG9uXG4gIGNvbnN0IHBpeGVsc1BlckRlZ3JlZVkgPSB2ZWMyX2Rpc3RhbmNlKFxuICAgIHByb2plY3RGbGF0KFtsb25naXR1ZGUsIGxhdGl0dWRlICsgMC41XSwgc2NhbGUpLFxuICAgIHByb2plY3RGbGF0KFtsb25naXR1ZGUsIGxhdGl0dWRlIC0gMC41XSwgc2NhbGUpXG4gICk7XG5cbiAgY29uc3QgcGl4ZWxzUGVyTWV0ZXJYID0gcGl4ZWxzUGVyRGVncmVlWCAvIG1ldGVyc1BlckRlZ3JlZTtcbiAgY29uc3QgcGl4ZWxzUGVyTWV0ZXJZID0gcGl4ZWxzUGVyRGVncmVlWSAvIG1ldGVyc1BlckRlZ3JlZTtcbiAgY29uc3QgcGl4ZWxzUGVyTWV0ZXJaID0gKHBpeGVsc1Blck1ldGVyWCArIHBpeGVsc1Blck1ldGVyWSkgLyAyO1xuICAvLyBjb25zdCBwaXhlbHNQZXJNZXRlciA9IFtwaXhlbHNQZXJNZXRlclgsIHBpeGVsc1Blck1ldGVyWSwgcGl4ZWxzUGVyTWV0ZXJaXTtcblxuICBjb25zdCB3b3JsZFNpemUgPSBUSUxFX1NJWkUgKiBzY2FsZTtcbiAgY29uc3QgYWx0UGl4ZWxzUGVyTWV0ZXIgPSB3b3JsZFNpemUgLyAoNGU3ICogbGF0Q29zaW5lKTtcbiAgY29uc3QgcGl4ZWxzUGVyTWV0ZXIgPSBbYWx0UGl4ZWxzUGVyTWV0ZXIsIGFsdFBpeGVsc1Blck1ldGVyLCBhbHRQaXhlbHNQZXJNZXRlcl07XG4gIGNvbnN0IG1ldGVyc1BlclBpeGVsID0gWzEgLyBhbHRQaXhlbHNQZXJNZXRlciwgMSAvIGFsdFBpeGVsc1Blck1ldGVyLCAxIC8gcGl4ZWxzUGVyTWV0ZXJaXTtcblxuICBjb25zdCBwaXhlbHNQZXJEZWdyZWUgPSBbcGl4ZWxzUGVyRGVncmVlWCwgcGl4ZWxzUGVyRGVncmVlWSwgcGl4ZWxzUGVyTWV0ZXJaXTtcbiAgY29uc3QgZGVncmVlc1BlclBpeGVsID0gWzEgLyBwaXhlbHNQZXJEZWdyZWVYLCAxIC8gcGl4ZWxzUGVyRGVncmVlWSwgMSAvIHBpeGVsc1Blck1ldGVyWl07XG5cbiAgLy8gTWFpbiByZXN1bHRzLCB1c2VkIGZvciBjb252ZXJ0aW5nIG1ldGVycyB0byBsYXRsbmcgZGVsdGFzIGFuZCBzY2FsaW5nIG9mZnNldHNcbiAgcmV0dXJuIHtcbiAgICBwaXhlbHNQZXJNZXRlcixcbiAgICBtZXRlcnNQZXJQaXhlbCxcbiAgICBwaXhlbHNQZXJEZWdyZWUsXG4gICAgZGVncmVlc1BlclBpeGVsXG4gIH07XG59XG5cbi8vIEFUVFJJQlVUSU9OOlxuLy8gdmlldyBhbmQgcHJvamVjdGlvbiBtYXRyaXggY3JlYXRpb24gaXMgaW50ZW50aW9uYWxseSBrZXB0IGNvbXBhdGlibGUgd2l0aFxuLy8gbWFwYm94LWdsJ3MgaW1wbGVtZW50YXRpb24gdG8gZW5zdXJlIHRoYXQgc2VhbWxlc3MgaW50ZXJvcGVyYXRpb25cbi8vIHdpdGggbWFwYm94IGFuZCByZWFjdC1tYXAtZ2wuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanNcblxuLy8gVmFyaWFibGUgZm92IChpbiByYWRpYW5zKVxuZXhwb3J0IGZ1bmN0aW9uIGdldEZvdih7aGVpZ2h0LCBhbHRpdHVkZX0pIHtcbiAgcmV0dXJuIDIgKiBNYXRoLmF0YW4oKGhlaWdodCAvIDIpIC8gYWx0aXR1ZGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2xpcHBpbmdQbGFuZXMoe2FsdGl0dWRlLCBwaXRjaH0pIHtcbiAgLy8gRmluZCB0aGUgZGlzdGFuY2UgZnJvbSB0aGUgY2VudGVyIHBvaW50IHRvIHRoZSBjZW50ZXIgdG9wXG4gIC8vIGluIGFsdGl0dWRlIHVuaXRzIHVzaW5nIGxhdyBvZiBzaW5lcy5cbiAgY29uc3QgcGl0Y2hSYWRpYW5zID0gcGl0Y2ggKiBERUdSRUVTX1RPX1JBRElBTlM7XG4gIGNvbnN0IGhhbGZGb3YgPSBNYXRoLmF0YW4oMC41IC8gYWx0aXR1ZGUpO1xuICBjb25zdCB0b3BIYWxmU3VyZmFjZURpc3RhbmNlID1cbiAgICBNYXRoLnNpbihoYWxmRm92KSAqIGFsdGl0dWRlIC8gTWF0aC5zaW4oTWF0aC5QSSAvIDIgLSBwaXRjaFJhZGlhbnMgLSBoYWxmRm92KTtcblxuICAvLyBDYWxjdWxhdGUgeiB2YWx1ZSBvZiB0aGUgZmFydGhlc3QgZnJhZ21lbnQgdGhhdCBzaG91bGQgYmUgcmVuZGVyZWQuXG4gIGNvbnN0IGZhclogPSBNYXRoLmNvcyhNYXRoLlBJIC8gMiAtIHBpdGNoUmFkaWFucykgKiB0b3BIYWxmU3VyZmFjZURpc3RhbmNlICsgYWx0aXR1ZGU7XG5cbiAgcmV0dXJuIHtmYXJaLCBuZWFyWjogMC4xfTtcbn1cblxuLy8gUFJPSkVDVElPTiBNQVRSSVg6IFBST0pFQ1RTIEZST00gQ0FNRVJBIChWSUVXKSBTUEFDRSBUTyBDTElQU1BBQ0VcbmV4cG9ydCBmdW5jdGlvbiBtYWtlUHJvamVjdGlvbk1hdHJpeEZyb21NZXJjYXRvclBhcmFtcyh7XG4gIHdpZHRoLFxuICBoZWlnaHQsXG4gIHBpdGNoLFxuICBhbHRpdHVkZSxcbiAgZmFyWk11bHRpcGxpZXIgPSAxMFxufSkge1xuICBjb25zdCB7bmVhclosIGZhclp9ID0gZ2V0Q2xpcHBpbmdQbGFuZXMoe2FsdGl0dWRlLCBwaXRjaH0pO1xuICBjb25zdCBmb3YgPSBnZXRGb3Yoe2hlaWdodCwgYWx0aXR1ZGV9KTtcblxuICBjb25zdCBwcm9qZWN0aW9uTWF0cml4ID0gbWF0NC5wZXJzcGVjdGl2ZShcbiAgICBjcmVhdGVNYXQ0KCksXG4gICAgZm92LCAgICAgICAgICAgICAgLy8gZm92IGluIHJhZGlhbnNcbiAgICB3aWR0aCAvIGhlaWdodCwgICAvLyBhc3BlY3QgcmF0aW9cbiAgICBuZWFyWiwgICAgICAgICAgICAvLyBuZWFyIHBsYW5lXG4gICAgZmFyWiAqIGZhclpNdWx0aXBsaWVyIC8vIGZhciBwbGFuZVxuICApO1xuXG4gIHJldHVybiBwcm9qZWN0aW9uTWF0cml4O1xufVxuXG5mdW5jdGlvbiBtYWtlVmlld01hdHJpeEZyb21NZXJjYXRvclBhcmFtcyh7XG4gIHdpZHRoLFxuICBoZWlnaHQsXG4gIGxvbmdpdHVkZSxcbiAgbGF0aXR1ZGUsXG4gIHpvb20sXG4gIHBpdGNoLFxuICBiZWFyaW5nLFxuICBhbHRpdHVkZSxcbiAgY2VudGVyXG59KSB7XG4gIC8vIFZJRVcgTUFUUklYOiBQUk9KRUNUUyBGUk9NIFZJUlRVQUwgUElYRUxTIFRPIENBTUVSQSBTUEFDRVxuICAvLyBOb3RlOiBBcyB1c3VhbCwgbWF0cml4IG9wZXJhdGlvbiBvcmRlcnMgc2hvdWxkIGJlIHJlYWQgaW4gcmV2ZXJzZVxuICAvLyBzaW5jZSB2ZWN0b3JzIHdpbGwgYmUgbXVsdGlwbGllZCBmcm9tIHRoZSByaWdodCBkdXJpbmcgdHJhbnNmb3JtYXRpb25cbiAgY29uc3Qgdm0gPSBjcmVhdGVNYXQ0KCk7XG5cbiAgLy8gTW92ZSBjYW1lcmEgdG8gYWx0aXR1ZGVcbiAgbWF0NC50cmFuc2xhdGUodm0sIHZtLCBbMCwgMCwgLWFsdGl0dWRlXSk7XG5cbiAgLy8gQWZ0ZXIgdGhlIHJvdGF0ZVgsIHogdmFsdWVzIGFyZSBpbiBwaXhlbCB1bml0cy4gQ29udmVydCB0aGVtIHRvXG4gIC8vIGFsdGl0dWRlIHVuaXRzLiAxIGFsdGl0dWRlIHVuaXQgPSB0aGUgc2NyZWVuIGhlaWdodC5cbiAgbWF0NC5zY2FsZSh2bSwgdm0sIFsxLCAtMSwgMSAvIGhlaWdodF0pO1xuXG4gIC8vIFJvdGF0ZSBieSBiZWFyaW5nLCBhbmQgdGhlbiBieSBwaXRjaCAod2hpY2ggdGlsdHMgdGhlIHZpZXcpXG4gIG1hdDQucm90YXRlWCh2bSwgdm0sIHBpdGNoICogREVHUkVFU19UT19SQURJQU5TKTtcbiAgbWF0NC5yb3RhdGVaKHZtLCB2bSwgLWJlYXJpbmcgKiBERUdSRUVTX1RPX1JBRElBTlMpO1xuICAvLyBjb25zb2xlLmxvZyhgVklFV1BUIFogJHtwaXRjaCAqIERFR1JFRVNfVE9fUkFESUFOU30gJHstYmVhcmluZyAqIERFR1JFRVNfVE9fUkFESUFOU30gJHt2bX1gKTtcbiAgbWF0NC50cmFuc2xhdGUodm0sIHZtLCBbLWNlbnRlclswXSwgLWNlbnRlclsxXSwgMF0pO1xuICAvLyBjb25zb2xlLmxvZyhgVklFV1BUIFQgJHtwaXRjaCAqIERFR1JFRVNfVE9fUkFESUFOU30gJHstYmVhcmluZyAqIERFR1JFRVNfVE9fUkFESUFOU30gJHt2bX1gKTtcbiAgcmV0dXJuIHZtO1xufVxuXG4vKipcbiAqIFJldHVybnMgbWFwIHNldHRpbmdzIHtsYXRpdHVkZSwgbG9uZ2l0dWRlLCB6b29tfVxuICogdGhhdCB3aWxsIGNvbnRhaW4gdGhlIHByb3ZpZGVkIGNvcm5lcnMgd2l0aGluIHRoZSBwcm92aWRlZCB3aWR0aC5cbiAqIE9ubHkgc3VwcG9ydHMgbm9uLXBlcnNwZWN0aXZlIG1vZGUuXG4gKiBAcGFyYW0ge051bWJlcn0gd2lkdGggLSB2aWV3cG9ydCB3aWR0aFxuICogQHBhcmFtIHtOdW1iZXJ9IGhlaWdodCAtIHZpZXdwb3J0IGhlaWdodFxuICogQHBhcmFtIHtBcnJheX0gYm91bmRzIC0gW1tsb24sIGxhdF0sIFtsb24sIGxhdF1dXG4gKiBAcGFyYW0ge051bWJlcn0gW3BhZGRpbmddIC0gVGhlIGFtb3VudCBvZiBwYWRkaW5nIGluIHBpeGVscyB0byBhZGQgdG8gdGhlIGdpdmVuIGJvdW5kcy5cbiAqIEBwYXJhbSB7QXJyYXl9IFtvZmZzZXRdIC0gVGhlIGNlbnRlciBvZiB0aGUgZ2l2ZW4gYm91bmRzIHJlbGF0aXZlIHRvIHRoZSBtYXAncyBjZW50ZXIsXG4gKiAgICBbeCwgeV0gbWVhc3VyZWQgaW4gcGl4ZWxzLlxuICogQHJldHVybnMge09iamVjdH0gLSBsYXRpdHVkZSwgbG9uZ2l0dWRlIGFuZCB6b29tXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaXRCb3VuZHMoe1xuICB3aWR0aCxcbiAgaGVpZ2h0LFxuICBib3VuZHMsXG4gIC8vIG9wdGlvbnNcbiAgcGFkZGluZyA9IDAsXG4gIG9mZnNldCA9IFswLCAwXVxufSkge1xuICBjb25zdCBbW3dlc3QsIHNvdXRoXSwgW2Vhc3QsIG5vcnRoXV0gPSBib3VuZHM7XG5cbiAgY29uc3Qgdmlld3BvcnQgPSBuZXcgV2ViTWVyY2F0b3JWaWV3cG9ydCh7XG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIGxvbmdpdHVkZTogMCxcbiAgICBsYXRpdHVkZTogMCxcbiAgICB6b29tOiAwXG4gIH0pO1xuXG4gIGNvbnN0IG53ID0gdmlld3BvcnQucHJvamVjdChbd2VzdCwgbm9ydGhdKTtcbiAgY29uc3Qgc2UgPSB2aWV3cG9ydC5wcm9qZWN0KFtlYXN0LCBzb3V0aF0pO1xuICBjb25zdCBzaXplID0gW1xuICAgIE1hdGguYWJzKHNlWzBdIC0gbndbMF0pLFxuICAgIE1hdGguYWJzKHNlWzFdIC0gbndbMV0pXG4gIF07XG4gIGNvbnN0IGNlbnRlciA9IFtcbiAgICAoc2VbMF0gKyBud1swXSkgLyAyLFxuICAgIChzZVsxXSArIG53WzFdKSAvIDJcbiAgXTtcblxuICBjb25zdCBzY2FsZVggPSAod2lkdGggLSBwYWRkaW5nICogMiAtIE1hdGguYWJzKG9mZnNldFswXSkgKiAyKSAvIHNpemVbMF07XG4gIGNvbnN0IHNjYWxlWSA9IChoZWlnaHQgLSBwYWRkaW5nICogMiAtIE1hdGguYWJzKG9mZnNldFsxXSkgKiAyKSAvIHNpemVbMV07XG5cbiAgY29uc3QgY2VudGVyTG5nTGF0ID0gdmlld3BvcnQudW5wcm9qZWN0KGNlbnRlcik7XG4gIGNvbnN0IHpvb20gPSB2aWV3cG9ydC56b29tICsgTWF0aC5sb2cyKE1hdGguYWJzKE1hdGgubWluKHNjYWxlWCwgc2NhbGVZKSkpO1xuXG4gIHJldHVybiB7XG4gICAgbG9uZ2l0dWRlOiBjZW50ZXJMbmdMYXRbMF0sXG4gICAgbGF0aXR1ZGU6IGNlbnRlckxuZ0xhdFsxXSxcbiAgICB6b29tXG4gIH07XG59XG4iXX0=