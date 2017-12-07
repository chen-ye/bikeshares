var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import PerspectiveMercatorViewport from './perspective-mercator-viewport';
import assert from 'assert';

// MAPBOX LIMITS
export var MAPBOX_LIMITS = {
  minZoom: 0,
  maxZoom: 20,
  minPitch: 0,
  maxPitch: 60
};

var defaultState = {
  pitch: 0,
  bearing: 0,
  altitude: 1.5
};

/* Utils */
function mod(value, divisor) {
  var modulus = value % divisor;
  return modulus < 0 ? divisor + modulus : modulus;
}

function ensureFinite(value, fallbackValue) {
  return Number.isFinite(value) ? value : fallbackValue;
}

var MapState = function () {
  function MapState() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        width = _ref.width,
        height = _ref.height,
        latitude = _ref.latitude,
        longitude = _ref.longitude,
        zoom = _ref.zoom,
        bearing = _ref.bearing,
        pitch = _ref.pitch,
        altitude = _ref.altitude,
        maxZoom = _ref.maxZoom,
        minZoom = _ref.minZoom,
        maxPitch = _ref.maxPitch,
        minPitch = _ref.minPitch,
        startPanLngLat = _ref.startPanLngLat,
        startZoomLngLat = _ref.startZoomLngLat,
        startBearing = _ref.startBearing,
        startPitch = _ref.startPitch,
        startZoom = _ref.startZoom;

    _classCallCheck(this, MapState);

    assert(Number.isFinite(width), '`width` must be supplied');
    assert(Number.isFinite(height), '`height` must be supplied');
    assert(Number.isFinite(longitude), '`longitude` must be supplied');
    assert(Number.isFinite(latitude), '`latitude` must be supplied');
    assert(Number.isFinite(zoom), '`zoom` must be supplied');

    this._viewportProps = this._applyConstraints({
      width: width,
      height: height,
      latitude: latitude,
      longitude: longitude,
      zoom: zoom,
      bearing: ensureFinite(bearing, defaultState.bearing),
      pitch: ensureFinite(pitch, defaultState.pitch),
      altitude: ensureFinite(altitude, defaultState.altitude),
      maxZoom: ensureFinite(maxZoom, MAPBOX_LIMITS.maxZoom),
      minZoom: ensureFinite(minZoom, MAPBOX_LIMITS.minZoom),
      maxPitch: ensureFinite(maxPitch, MAPBOX_LIMITS.maxPitch),
      minPitch: ensureFinite(minPitch, MAPBOX_LIMITS.minPitch)
    });

    this._interactiveState = {
      startPanLngLat: startPanLngLat,
      startZoomLngLat: startZoomLngLat,
      startBearing: startBearing,
      startPitch: startPitch,
      startZoom: startZoom
    };
  }

  /* Public API */

  _createClass(MapState, [{
    key: 'getViewportProps',
    value: function getViewportProps() {
      return this._viewportProps;
    }
  }, {
    key: 'getInteractiveState',
    value: function getInteractiveState() {
      return this._interactiveState;
    }

    /**
     * Start panning
     * @param {[Number, Number]} pos - position on screen where the pointer grabs
     */

  }, {
    key: 'panStart',
    value: function panStart(_ref2) {
      var pos = _ref2.pos;

      return this._getUpdatedMapState({
        startPanLngLat: this._unproject(pos)
      });
    }

    /**
     * Pan
     * @param {[Number, Number]} pos - position on screen where the pointer is
     * @param {[Number, Number], optional} startPos - where the pointer grabbed at
     *   the start of the operation. Must be supplied of `panStart()` was not called
     */

  }, {
    key: 'pan',
    value: function pan(_ref3) {
      var pos = _ref3.pos,
          startPos = _ref3.startPos;

      var startPanLngLat = this._interactiveState.startPanLngLat || this._unproject(startPos);

      // take the start lnglat and put it where the mouse is down.
      assert(startPanLngLat, '`startPanLngLat` prop is required ' + 'for mouse pan behavior to calculate where to position the map.');

      var _calculateNewLngLat2 = this._calculateNewLngLat({ startPanLngLat: startPanLngLat, pos: pos }),
          _calculateNewLngLat3 = _slicedToArray(_calculateNewLngLat2, 2),
          longitude = _calculateNewLngLat3[0],
          latitude = _calculateNewLngLat3[1];

      return this._getUpdatedMapState({
        longitude: longitude,
        latitude: latitude
      });
    }

    /**
     * End panning
     * Must call if `panStart()` was called
     */

  }, {
    key: 'panEnd',
    value: function panEnd() {
      return this._getUpdatedMapState({
        startPanLngLat: null
      });
    }

    /**
     * Start rotating
     * @param {[Number, Number]} pos - position on screen where the center is
     */

  }, {
    key: 'rotateStart',
    value: function rotateStart(_ref4) {
      var pos = _ref4.pos;

      return this._getUpdatedMapState({
        startBearing: this._viewportProps.bearing,
        startPitch: this._viewportProps.pitch
      });
    }

    /**
     * Rotate
     * @param {Number} deltaScaleX - a number between [-1, 1] specifying the
     *   change to bearing.
     * @param {Number} deltaScaleY - a number between [-1, 1] specifying the
     *   change to pitch. -1 sets to minPitch and 1 sets to maxPitch.
     */

  }, {
    key: 'rotate',
    value: function rotate(_ref5) {
      var deltaScaleX = _ref5.deltaScaleX,
          deltaScaleY = _ref5.deltaScaleY;

      assert(deltaScaleX >= -1 && deltaScaleX <= 1, '`deltaScaleX` must be a number between [-1, 1]');
      assert(deltaScaleY >= -1 && deltaScaleY <= 1, '`deltaScaleY` must be a number between [-1, 1]');

      var _interactiveState = this._interactiveState,
          startBearing = _interactiveState.startBearing,
          startPitch = _interactiveState.startPitch;


      if (!Number.isFinite(startBearing)) {
        startBearing = this._viewportProps.bearing;
      }
      if (!Number.isFinite(startPitch)) {
        startPitch = this._viewportProps.pitch;
      }

      var _calculateNewPitchAnd = this._calculateNewPitchAndBearing({
        deltaScaleX: deltaScaleX,
        deltaScaleY: deltaScaleY,
        startBearing: startBearing,
        startPitch: startPitch
      }),
          pitch = _calculateNewPitchAnd.pitch,
          bearing = _calculateNewPitchAnd.bearing;

      return this._getUpdatedMapState({
        bearing: bearing,
        pitch: pitch
      });
    }

    /**
     * End rotating
     * Must call if `rotateStart()` was called
     */

  }, {
    key: 'rotateEnd',
    value: function rotateEnd() {
      return this._getUpdatedMapState({
        startBearing: null,
        startPitch: null
      });
    }

    /**
     * Start zooming
     * @param {[Number, Number]} pos - position on screen where the center is
     */

  }, {
    key: 'zoomStart',
    value: function zoomStart(_ref6) {
      var pos = _ref6.pos;

      return this._getUpdatedMapState({
        startZoomLngLat: this._unproject(pos),
        startZoom: this._viewportProps.zoom
      });
    }

    /**
     * Zoom
     * @param {[Number, Number]} pos - position on screen where the current center is
     * @param {[Number, Number]} startPos - the center position at
     *   the start of the operation. Must be supplied of `zoomStart()` was not called
     * @param {Number} scale - a number between [0, 1] specifying the accumulated
     *   relative scale.
     */

  }, {
    key: 'zoom',
    value: function zoom(_ref7) {
      var pos = _ref7.pos,
          startPos = _ref7.startPos,
          scale = _ref7.scale;

      assert(scale > 0, '`scale` must be a positive number');

      // Make sure we zoom around the current mouse position rather than map center
      var startZoomLngLat = this._interactiveState.startZoomLngLat || this._unproject(startPos) || this._unproject(pos);
      var startZoom = this._interactiveState.startZoom;


      if (!Number.isFinite(startZoom)) {
        startZoom = this._viewportProps.zoom;
      }

      // take the start lnglat and put it where the mouse is down.
      assert(startZoomLngLat, '`startZoomLngLat` prop is required ' + 'for zoom behavior to calculate where to position the map.');

      var zoom = this._calculateNewZoom({ scale: scale, startZoom: startZoom });

      var zoomedViewport = new PerspectiveMercatorViewport(Object.assign({}, this._viewportProps, { zoom: zoom }));

      var _zoomedViewport$getLo = zoomedViewport.getLocationAtPoint({ lngLat: startZoomLngLat, pos: pos }),
          _zoomedViewport$getLo2 = _slicedToArray(_zoomedViewport$getLo, 2),
          longitude = _zoomedViewport$getLo2[0],
          latitude = _zoomedViewport$getLo2[1];

      return this._getUpdatedMapState({
        zoom: zoom,
        longitude: longitude,
        latitude: latitude
      });
    }

    /**
     * End zooming
     * Must call if `zoomStart()` was called
     */

  }, {
    key: 'zoomEnd',
    value: function zoomEnd() {
      return this._getUpdatedMapState({
        startZoomLngLat: null,
        startZoom: null
      });
    }

    /* Private methods */

  }, {
    key: '_getUpdatedMapState',
    value: function _getUpdatedMapState(newProps) {
      // Update _viewportProps
      return new MapState(Object.assign({}, this._viewportProps, this._interactiveState, newProps));
    }

    // Apply any constraints (mathematical or defined by _viewportProps) to map state

  }, {
    key: '_applyConstraints',
    value: function _applyConstraints(props) {
      // Normalize degrees
      props.longitude = mod(props.longitude + 180, 360) - 180;
      props.bearing = mod(props.bearing + 180, 360) - 180;

      // Ensure zoom is within specified range
      var maxZoom = props.maxZoom,
          minZoom = props.minZoom,
          zoom = props.zoom;

      props.zoom = zoom > maxZoom ? maxZoom : zoom;
      props.zoom = zoom < minZoom ? minZoom : zoom;

      // Ensure pitch is within specified range
      var maxPitch = props.maxPitch,
          minPitch = props.minPitch,
          pitch = props.pitch;


      props.pitch = pitch > maxPitch ? maxPitch : pitch;
      props.pitch = pitch < minPitch ? minPitch : pitch;

      return props;
    }
  }, {
    key: '_unproject',
    value: function _unproject(pos) {
      var viewport = new PerspectiveMercatorViewport(this._viewportProps);
      return pos && viewport.unproject(pos, { topLeft: false });
    }

    // Calculate a new lnglat based on pixel dragging position

  }, {
    key: '_calculateNewLngLat',
    value: function _calculateNewLngLat(_ref8) {
      var startPanLngLat = _ref8.startPanLngLat,
          pos = _ref8.pos;

      var viewport = new PerspectiveMercatorViewport(this._viewportProps);
      return viewport.getLocationAtPoint({ lngLat: startPanLngLat, pos: pos });
    }

    // Calculates new zoom

  }, {
    key: '_calculateNewZoom',
    value: function _calculateNewZoom(_ref9) {
      var scale = _ref9.scale,
          startZoom = _ref9.startZoom;
      var _viewportProps = this._viewportProps,
          maxZoom = _viewportProps.maxZoom,
          minZoom = _viewportProps.minZoom;

      var zoom = startZoom + Math.log2(scale);
      zoom = zoom > maxZoom ? maxZoom : zoom;
      zoom = zoom < minZoom ? minZoom : zoom;
      return zoom;
    }

    // Calculates a new pitch and bearing from a position (coming from an event)

  }, {
    key: '_calculateNewPitchAndBearing',
    value: function _calculateNewPitchAndBearing(_ref10) {
      var deltaScaleX = _ref10.deltaScaleX,
          deltaScaleY = _ref10.deltaScaleY,
          startBearing = _ref10.startBearing,
          startPitch = _ref10.startPitch;
      var _viewportProps2 = this._viewportProps,
          minPitch = _viewportProps2.minPitch,
          maxPitch = _viewportProps2.maxPitch;


      var bearing = startBearing + 180 * deltaScaleX;
      var pitch = startPitch;
      if (deltaScaleY > 0) {
        // Gradually increase pitch
        pitch = startPitch + deltaScaleY * (maxPitch - startPitch);
      } else if (deltaScaleY < 0) {
        // Gradually decrease pitch
        pitch = startPitch - deltaScaleY * (minPitch - startPitch);
      }

      return {
        pitch: pitch,
        bearing: bearing
      };
    }
  }]);

  return MapState;
}();

export default MapState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9tYXAtY29udHJvbGxlci9tYXAtc3RhdGUuanMiXSwibmFtZXMiOlsiUGVyc3BlY3RpdmVNZXJjYXRvclZpZXdwb3J0IiwiYXNzZXJ0IiwiTUFQQk9YX0xJTUlUUyIsIm1pblpvb20iLCJtYXhab29tIiwibWluUGl0Y2giLCJtYXhQaXRjaCIsImRlZmF1bHRTdGF0ZSIsInBpdGNoIiwiYmVhcmluZyIsImFsdGl0dWRlIiwibW9kIiwidmFsdWUiLCJkaXZpc29yIiwibW9kdWx1cyIsImVuc3VyZUZpbml0ZSIsImZhbGxiYWNrVmFsdWUiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsIk1hcFN0YXRlIiwid2lkdGgiLCJoZWlnaHQiLCJsYXRpdHVkZSIsImxvbmdpdHVkZSIsInpvb20iLCJzdGFydFBhbkxuZ0xhdCIsInN0YXJ0Wm9vbUxuZ0xhdCIsInN0YXJ0QmVhcmluZyIsInN0YXJ0UGl0Y2giLCJzdGFydFpvb20iLCJfdmlld3BvcnRQcm9wcyIsIl9hcHBseUNvbnN0cmFpbnRzIiwiX2ludGVyYWN0aXZlU3RhdGUiLCJwb3MiLCJfZ2V0VXBkYXRlZE1hcFN0YXRlIiwiX3VucHJvamVjdCIsInN0YXJ0UG9zIiwiX2NhbGN1bGF0ZU5ld0xuZ0xhdCIsImRlbHRhU2NhbGVYIiwiZGVsdGFTY2FsZVkiLCJfY2FsY3VsYXRlTmV3UGl0Y2hBbmRCZWFyaW5nIiwic2NhbGUiLCJfY2FsY3VsYXRlTmV3Wm9vbSIsInpvb21lZFZpZXdwb3J0IiwiT2JqZWN0IiwiYXNzaWduIiwiZ2V0TG9jYXRpb25BdFBvaW50IiwibG5nTGF0IiwibmV3UHJvcHMiLCJwcm9wcyIsInZpZXdwb3J0IiwidW5wcm9qZWN0IiwidG9wTGVmdCIsIk1hdGgiLCJsb2cyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPQSwyQkFBUCxNQUF3QyxpQ0FBeEM7QUFDQSxPQUFPQyxNQUFQLE1BQW1CLFFBQW5COztBQUVBO0FBQ0EsT0FBTyxJQUFNQyxnQkFB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QUFiQSxVQUFhO0FBQUEsNEJBQ3BELEtBQUtFLGNBRCtDO0FBQUEsVUFDMUV6QixRQUQwRSxtQkFDMUVBLFFBRDBFO0FBQUEsVUFDaEVDLFFBRGdFLG1CQUNoRUEsUUFEZ0U7OztBQUdqRixVQUFNRyxVQUFVa0IsZUFBZSxNQUFNVyxXQUFyQztBQUNBLFVBQUk5QixRQUFRb0IsVUFBWjtBQUNBLFVBQUlXLGNBQWMsQ0FBbEIsRUFBcUI7QUFDbkI7QUFDQS9CLGdCQUFRb0IsYUFBYVcsZUFBZWpDLFdBQVdzQixVQUExQixDQUFyQjtBQUNELE9BSEQsTUFHTyxJQUFJVyxjQUFjLENBQWxCLEVBQXFCO0FBQzFCO0FBQ0EvQixnQkFBUW9CLGFBQWFXLGVBQWVsQyxXQUFXdUIsVUFBMUIsQ0FBckI7QUFDRDs7QUFFRCxhQUFPO0FBQ0xwQixvQkFESztBQUVMQztBQUZLLE9BQVA7QUFJRDs7Ozs7O2VBbFRrQlUsUSIsImZpbGUiOiJtYXAtc3RhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUGVyc3BlY3RpdmVNZXJjYXRvclZpZXdwb3J0IGZyb20gJy4vcGVyc3BlY3RpdmUtbWVyY2F0b3Itdmlld3BvcnQnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG4vLyBNQVBCT1ggTElNSVRTXG5leHBvcnQgY29uc3QgTUFQQk9YX0xJTUlUUyA9IHtcbiAgbWluWm9vbTogMCxcbiAgbWF4Wm9vbTogMjAsXG4gIG1pblBpdGNoOiAwLFxuICBtYXhQaXRjaDogNjBcbn07XG5cbmNvbnN0IGRlZmF1bHRTdGF0ZSA9IHtcbiAgcGl0Y2g6IDAsXG4gIGJlYXJpbmc6IDAsXG4gIGFsdGl0dWRlOiAxLjVcbn07XG5cbi8qIFV0aWxzICovXG5mdW5jdGlvbiBtb2QodmFsdWUsIGRpdmlzb3IpIHtcbiAgY29uc3QgbW9kdWx1cyA9IHZhbHVlICUgZGl2aXNvcjtcbiAgcmV0dXJuIG1vZHVsdXMgPCAwID8gZGl2aXNvciArIG1vZHVsdXMgOiBtb2R1bHVzO1xufVxuXG5mdW5jdGlvbiBlbnN1cmVGaW5pdGUodmFsdWUsIGZhbGxiYWNrVmFsdWUpIHtcbiAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgPyB2YWx1ZSA6IGZhbGxiYWNrVmFsdWU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcFN0YXRlIHtcblxuICBjb25zdHJ1Y3Rvcih7XG4gICAgLyoqIE1hcGJveCB2aWV3cG9ydCBwcm9wZXJ0aWVzICovXG4gICAgLyoqIFRoZSB3aWR0aCBvZiB0aGUgdmlld3BvcnQgKi9cbiAgICB3aWR0aCxcbiAgICAvKiogVGhlIGhlaWdodCBvZiB0aGUgdmlld3BvcnQgKi9cbiAgICBoZWlnaHQsXG4gICAgLyoqIFRoZSBsYXRpdHVkZSBhdCB0aGUgY2VudGVyIG9mIHRoZSB2aWV3cG9ydCAqL1xuICAgIGxhdGl0dWRlLFxuICAgIC8qKiBUaGUgbG9uZ2l0dWRlIGF0IHRoZSBjZW50ZXIgb2YgdGhlIHZpZXdwb3J0ICovXG4gICAgbG9uZ2l0dWRlLFxuICAgIC8qKiBUaGUgdGlsZSB6b29tIGxldmVsIG9mIHRoZSBtYXAuICovXG4gICAgem9vbSxcbiAgICAvKiogVGhlIGJlYXJpbmcgb2YgdGhlIHZpZXdwb3J0IGluIGRlZ3JlZXMgKi9cbiAgICBiZWFyaW5nLFxuICAgIC8qKiBUaGUgcGl0Y2ggb2YgdGhlIHZpZXdwb3J0IGluIGRlZ3JlZXMgKi9cbiAgICBwaXRjaCxcbiAgICAvKipcbiAgICAqIFNwZWNpZnkgdGhlIGFsdGl0dWRlIG9mIHRoZSB2aWV3cG9ydCBjYW1lcmFcbiAgICAqIFVuaXQ6IG1hcCBoZWlnaHRzLCBkZWZhdWx0IDEuNVxuICAgICogTm9uLXB1YmxpYyBBUEksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9pc3N1ZXMvMTEzN1xuICAgICovXG4gICAgYWx0aXR1ZGUsXG5cbiAgICAvKiogVmlld3BvcnQgY29uc3RyYWludHMgKi9cbiAgICBtYXhab29tLFxuICAgIG1pblpvb20sXG4gICAgbWF4UGl0Y2gsXG4gICAgbWluUGl0Y2gsXG5cbiAgICAvKiogSW50ZXJhY3Rpb24gc3RhdGVzLCByZXF1aXJlZCB0byBjYWxjdWxhdGUgY2hhbmdlIGR1cmluZyB0cmFuc2Zvcm0gKi9cbiAgICAvKiBUaGUgcG9pbnQgb24gbWFwIGJlaW5nIGdyYWJiZWQgd2hlbiB0aGUgb3BlcmF0aW9uIGZpcnN0IHN0YXJ0ZWQgKi9cbiAgICBzdGFydFBhbkxuZ0xhdCxcbiAgICAvKiBDZW50ZXIgb2YgdGhlIHpvb20gd2hlbiB0aGUgb3BlcmF0aW9uIGZpcnN0IHN0YXJ0ZWQgKi9cbiAgICBzdGFydFpvb21MbmdMYXQsXG4gICAgLyoqIEJlYXJpbmcgd2hlbiBjdXJyZW50IHBlcnNwZWN0aXZlIHJvdGF0ZSBvcGVyYXRpb24gc3RhcnRlZCAqL1xuICAgIHN0YXJ0QmVhcmluZyxcbiAgICAvKiogUGl0Y2ggd2hlbiBjdXJyZW50IHBlcnNwZWN0aXZlIHJvdGF0ZSBvcGVyYXRpb24gc3RhcnRlZCAqL1xuICAgIHN0YXJ0UGl0Y2gsXG4gICAgLyoqIFpvb20gd2hlbiBjdXJyZW50IHpvb20gb3BlcmF0aW9uIHN0YXJ0ZWQgKi9cbiAgICBzdGFydFpvb21cbiAgfSA9IHt9KSB7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZSh3aWR0aCksICdgd2lkdGhgIG11c3QgYmUgc3VwcGxpZWQnKTtcbiAgICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKGhlaWdodCksICdgaGVpZ2h0YCBtdXN0IGJlIHN1cHBsaWVkJyk7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZShsb25naXR1ZGUpLCAnYGxvbmdpdHVkZWAgbXVzdCBiZSBzdXBwbGllZCcpO1xuICAgIGFzc2VydChOdW1iZXIuaXNGaW5pdGUobGF0aXR1ZGUpLCAnYGxhdGl0dWRlYCBtdXN0IGJlIHN1cHBsaWVkJyk7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZSh6b29tKSwgJ2B6b29tYCBtdXN0IGJlIHN1cHBsaWVkJyk7XG5cbiAgICB0aGlzLl92aWV3cG9ydFByb3BzID0gdGhpcy5fYXBwbHlDb25zdHJhaW50cyh7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIGxhdGl0dWRlLFxuICAgICAgbG9uZ2l0dWRlLFxuICAgICAgem9vbSxcbiAgICAgIGJlYXJpbmc6IGVuc3VyZUZpbml0ZShiZWFyaW5nLCBkZWZhdWx0U3RhdGUuYmVhcmluZyksXG4gICAgICBwaXRjaDogZW5zdXJlRmluaXRlKHBpdGNoLCBkZWZhdWx0U3RhdGUucGl0Y2gpLFxuICAgICAgYWx0aXR1ZGU6IGVuc3VyZUZpbml0ZShhbHRpdHVkZSwgZGVmYXVsdFN0YXRlLmFsdGl0dWRlKSxcbiAgICAgIG1heFpvb206IGVuc3VyZUZpbml0ZShtYXhab29tLCBNQVBCT1hfTElNSVRTLm1heFpvb20pLFxuICAgICAgbWluWm9vbTogZW5zdXJlRmluaXRlKG1pblpvb20sIE1BUEJPWF9MSU1JVFMubWluWm9vbSksXG4gICAgICBtYXhQaXRjaDogZW5zdXJlRmluaXRlKG1heFBpdGNoLCBNQVBCT1hfTElNSVRTLm1heFBpdGNoKSxcbiAgICAgIG1pblBpdGNoOiBlbnN1cmVGaW5pdGUobWluUGl0Y2gsIE1BUEJPWF9MSU1JVFMubWluUGl0Y2gpXG4gICAgfSk7XG5cbiAgICB0aGlzLl9pbnRlcmFjdGl2ZVN0YXRlID0ge1xuICAgICAgc3RhcnRQYW5MbmdMYXQsXG4gICAgICBzdGFydFpvb21MbmdMYXQsXG4gICAgICBzdGFydEJlYXJpbmcsXG4gICAgICBzdGFydFBpdGNoLFxuICAgICAgc3RhcnRab29tXG4gICAgfTtcbiAgfVxuXG4gIC8qIFB1YmxpYyBBUEkgKi9cblxuICBnZXRWaWV3cG9ydFByb3BzKCkge1xuICAgIHJldHVybiB0aGlzLl92aWV3cG9ydFByb3BzO1xuICB9XG5cbiAgZ2V0SW50ZXJhY3RpdmVTdGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBwYW5uaW5nXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBwb2ludGVyIGdyYWJzXG4gICAqL1xuICBwYW5TdGFydCh7cG9zfSkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgc3RhcnRQYW5MbmdMYXQ6IHRoaXMuX3VucHJvamVjdChwb3MpXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGFuXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBwb2ludGVyIGlzXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXSwgb3B0aW9uYWx9IHN0YXJ0UG9zIC0gd2hlcmUgdGhlIHBvaW50ZXIgZ3JhYmJlZCBhdFxuICAgKiAgIHRoZSBzdGFydCBvZiB0aGUgb3BlcmF0aW9uLiBNdXN0IGJlIHN1cHBsaWVkIG9mIGBwYW5TdGFydCgpYCB3YXMgbm90IGNhbGxlZFxuICAgKi9cbiAgcGFuKHtwb3MsIHN0YXJ0UG9zfSkge1xuICAgIGNvbnN0IHN0YXJ0UGFuTG5nTGF0ID0gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZS5zdGFydFBhbkxuZ0xhdCB8fCB0aGlzLl91bnByb2plY3Qoc3RhcnRQb3MpO1xuXG4gICAgLy8gdGFrZSB0aGUgc3RhcnQgbG5nbGF0IGFuZCBwdXQgaXQgd2hlcmUgdGhlIG1vdXNlIGlzIGRvd24uXG4gICAgYXNzZXJ0KHN0YXJ0UGFuTG5nTGF0LCAnYHN0YXJ0UGFuTG5nTGF0YCBwcm9wIGlzIHJlcXVpcmVkICcgK1xuICAgICAgJ2ZvciBtb3VzZSBwYW4gYmVoYXZpb3IgdG8gY2FsY3VsYXRlIHdoZXJlIHRvIHBvc2l0aW9uIHRoZSBtYXAuJyk7XG5cbiAgICBjb25zdCBbbG9uZ2l0dWRlLCBsYXRpdHVkZV0gPSB0aGlzLl9jYWxjdWxhdGVOZXdMbmdMYXQoe3N0YXJ0UGFuTG5nTGF0LCBwb3N9KTtcblxuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgbG9uZ2l0dWRlLFxuICAgICAgbGF0aXR1ZGVcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmQgcGFubmluZ1xuICAgKiBNdXN0IGNhbGwgaWYgYHBhblN0YXJ0KClgIHdhcyBjYWxsZWRcbiAgICovXG4gIHBhbkVuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE1hcFN0YXRlKHtcbiAgICAgIHN0YXJ0UGFuTG5nTGF0OiBudWxsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgcm90YXRpbmdcbiAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBwb3MgLSBwb3NpdGlvbiBvbiBzY3JlZW4gd2hlcmUgdGhlIGNlbnRlciBpc1xuICAgKi9cbiAgcm90YXRlU3RhcnQoe3Bvc30pIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE1hcFN0YXRlKHtcbiAgICAgIHN0YXJ0QmVhcmluZzogdGhpcy5fdmlld3BvcnRQcm9wcy5iZWFyaW5nLFxuICAgICAgc3RhcnRQaXRjaDogdGhpcy5fdmlld3BvcnRQcm9wcy5waXRjaFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJvdGF0ZVxuICAgKiBAcGFyYW0ge051bWJlcn0gZGVsdGFTY2FsZVggLSBhIG51bWJlciBiZXR3ZWVuIFstMSwgMV0gc3BlY2lmeWluZyB0aGVcbiAgICogICBjaGFuZ2UgdG8gYmVhcmluZy5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbHRhU2NhbGVZIC0gYSBudW1iZXIgYmV0d2VlbiBbLTEsIDFdIHNwZWNpZnlpbmcgdGhlXG4gICAqICAgY2hhbmdlIHRvIHBpdGNoLiAtMSBzZXRzIHRvIG1pblBpdGNoIGFuZCAxIHNldHMgdG8gbWF4UGl0Y2guXG4gICAqL1xuICByb3RhdGUoe2RlbHRhU2NhbGVYLCBkZWx0YVNjYWxlWX0pIHtcbiAgICBhc3NlcnQoZGVsdGFTY2FsZVggPj0gLTEgJiYgZGVsdGFTY2FsZVggPD0gMSxcbiAgICAgICdgZGVsdGFTY2FsZVhgIG11c3QgYmUgYSBudW1iZXIgYmV0d2VlbiBbLTEsIDFdJyk7XG4gICAgYXNzZXJ0KGRlbHRhU2NhbGVZID49IC0xICYmIGRlbHRhU2NhbGVZIDw9IDEsXG4gICAgICAnYGRlbHRhU2NhbGVZYCBtdXN0IGJlIGEgbnVtYmVyIGJldHdlZW4gWy0xLCAxXScpO1xuXG4gICAgbGV0IHtzdGFydEJlYXJpbmcsIHN0YXJ0UGl0Y2h9ID0gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZTtcblxuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHN0YXJ0QmVhcmluZykpIHtcbiAgICAgIHN0YXJ0QmVhcmluZyA9IHRoaXMuX3ZpZXdwb3J0UHJvcHMuYmVhcmluZztcbiAgICB9XG4gICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoc3RhcnRQaXRjaCkpIHtcbiAgICAgIHN0YXJ0UGl0Y2ggPSB0aGlzLl92aWV3cG9ydFByb3BzLnBpdGNoO1xuICAgIH1cblxuICAgIGNvbnN0IHtwaXRjaCwgYmVhcmluZ30gPSB0aGlzLl9jYWxjdWxhdGVOZXdQaXRjaEFuZEJlYXJpbmcoe1xuICAgICAgZGVsdGFTY2FsZVgsXG4gICAgICBkZWx0YVNjYWxlWSxcbiAgICAgIHN0YXJ0QmVhcmluZyxcbiAgICAgIHN0YXJ0UGl0Y2hcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgYmVhcmluZyxcbiAgICAgIHBpdGNoXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRW5kIHJvdGF0aW5nXG4gICAqIE11c3QgY2FsbCBpZiBgcm90YXRlU3RhcnQoKWAgd2FzIGNhbGxlZFxuICAgKi9cbiAgcm90YXRlRW5kKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgc3RhcnRCZWFyaW5nOiBudWxsLFxuICAgICAgc3RhcnRQaXRjaDogbnVsbFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHpvb21pbmdcbiAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBwb3MgLSBwb3NpdGlvbiBvbiBzY3JlZW4gd2hlcmUgdGhlIGNlbnRlciBpc1xuICAgKi9cbiAgem9vbVN0YXJ0KHtwb3N9KSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRNYXBTdGF0ZSh7XG4gICAgICBzdGFydFpvb21MbmdMYXQ6IHRoaXMuX3VucHJvamVjdChwb3MpLFxuICAgICAgc3RhcnRab29tOiB0aGlzLl92aWV3cG9ydFByb3BzLnpvb21cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBab29tXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBjdXJyZW50IGNlbnRlciBpc1xuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IHN0YXJ0UG9zIC0gdGhlIGNlbnRlciBwb3NpdGlvbiBhdFxuICAgKiAgIHRoZSBzdGFydCBvZiB0aGUgb3BlcmF0aW9uLiBNdXN0IGJlIHN1cHBsaWVkIG9mIGB6b29tU3RhcnQoKWAgd2FzIG5vdCBjYWxsZWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIC0gYSBudW1iZXIgYmV0d2VlbiBbMCwgMV0gc3BlY2lmeWluZyB0aGUgYWNjdW11bGF0ZWRcbiAgICogICByZWxhdGl2ZSBzY2FsZS5cbiAgICovXG4gIHpvb20oe3Bvcywgc3RhcnRQb3MsIHNjYWxlfSkge1xuICAgIGFzc2VydChzY2FsZSA+IDAsICdgc2NhbGVgIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcblxuICAgIC8vIE1ha2Ugc3VyZSB3ZSB6b29tIGFyb3VuZCB0aGUgY3VycmVudCBtb3VzZSBwb3NpdGlvbiByYXRoZXIgdGhhbiBtYXAgY2VudGVyXG4gICAgY29uc3Qgc3RhcnRab29tTG5nTGF0ID0gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZS5zdGFydFpvb21MbmdMYXQgfHxcbiAgICAgIHRoaXMuX3VucHJvamVjdChzdGFydFBvcykgfHwgdGhpcy5fdW5wcm9qZWN0KHBvcyk7XG4gICAgbGV0IHtzdGFydFpvb219ID0gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZTtcblxuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHN0YXJ0Wm9vbSkpIHtcbiAgICAgIHN0YXJ0Wm9vbSA9IHRoaXMuX3ZpZXdwb3J0UHJvcHMuem9vbTtcbiAgICB9XG5cbiAgICAvLyB0YWtlIHRoZSBzdGFydCBsbmdsYXQgYW5kIHB1dCBpdCB3aGVyZSB0aGUgbW91c2UgaXMgZG93bi5cbiAgICBhc3NlcnQoc3RhcnRab29tTG5nTGF0LCAnYHN0YXJ0Wm9vbUxuZ0xhdGAgcHJvcCBpcyByZXF1aXJlZCAnICtcbiAgICAgICdmb3Igem9vbSBiZWhhdmlvciB0byBjYWxjdWxhdGUgd2hlcmUgdG8gcG9zaXRpb24gdGhlIG1hcC4nKTtcblxuICAgIGNvbnN0IHpvb20gPSB0aGlzLl9jYWxjdWxhdGVOZXdab29tKHtzY2FsZSwgc3RhcnRab29tfSk7XG5cbiAgICBjb25zdCB6b29tZWRWaWV3cG9ydCA9IG5ldyBQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnQoXG4gICAgICBPYmplY3QuYXNzaWduKHt9LCB0aGlzLl92aWV3cG9ydFByb3BzLCB7em9vbX0pXG4gICAgKTtcbiAgICBjb25zdCBbbG9uZ2l0dWRlLCBsYXRpdHVkZV0gPSB6b29tZWRWaWV3cG9ydC5nZXRMb2NhdGlvbkF0UG9pbnQoe2xuZ0xhdDogc3RhcnRab29tTG5nTGF0LCBwb3N9KTtcblxuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgem9vbSxcbiAgICAgIGxvbmdpdHVkZSxcbiAgICAgIGxhdGl0dWRlXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRW5kIHpvb21pbmdcbiAgICogTXVzdCBjYWxsIGlmIGB6b29tU3RhcnQoKWAgd2FzIGNhbGxlZFxuICAgKi9cbiAgem9vbUVuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE1hcFN0YXRlKHtcbiAgICAgIHN0YXJ0Wm9vbUxuZ0xhdDogbnVsbCxcbiAgICAgIHN0YXJ0Wm9vbTogbnVsbFxuICAgIH0pO1xuICB9XG5cbiAgLyogUHJpdmF0ZSBtZXRob2RzICovXG5cbiAgX2dldFVwZGF0ZWRNYXBTdGF0ZShuZXdQcm9wcykge1xuICAgIC8vIFVwZGF0ZSBfdmlld3BvcnRQcm9wc1xuICAgIHJldHVybiBuZXcgTWFwU3RhdGUoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5fdmlld3BvcnRQcm9wcywgdGhpcy5faW50ZXJhY3RpdmVTdGF0ZSwgbmV3UHJvcHMpKTtcbiAgfVxuXG4gIC8vIEFwcGx5IGFueSBjb25zdHJhaW50cyAobWF0aGVtYXRpY2FsIG9yIGRlZmluZWQgYnkgX3ZpZXdwb3J0UHJvcHMpIHRvIG1hcCBzdGF0ZVxuICBfYXBwbHlDb25zdHJhaW50cyhwcm9wcykge1xuICAgIC8vIE5vcm1hbGl6ZSBkZWdyZWVzXG4gICAgcHJvcHMubG9uZ2l0dWRlID0gbW9kKHByb3BzLmxvbmdpdHVkZSArIDE4MCwgMzYwKSAtIDE4MDtcbiAgICBwcm9wcy5iZWFyaW5nID0gbW9kKHByb3BzLmJlYXJpbmcgKyAxODAsIDM2MCkgLSAxODA7XG5cbiAgICAvLyBFbnN1cmUgem9vbSBpcyB3aXRoaW4gc3BlY2lmaWVkIHJhbmdlXG4gICAgY29uc3Qge21heFpvb20sIG1pblpvb20sIHpvb219ID0gcHJvcHM7XG4gICAgcHJvcHMuem9vbSA9IHpvb20gPiBtYXhab29tID8gbWF4Wm9vbSA6IHpvb207XG4gICAgcHJvcHMuem9vbSA9IHpvb20gPCBtaW5ab29tID8gbWluWm9vbSA6IHpvb207XG5cbiAgICAvLyBFbnN1cmUgcGl0Y2ggaXMgd2l0aGluIHNwZWNpZmllZCByYW5nZVxuICAgIGNvbnN0IHttYXhQaXRjaCwgbWluUGl0Y2gsIHBpdGNofSA9IHByb3BzO1xuXG4gICAgcHJvcHMucGl0Y2ggPSBwaXRjaCA+IG1heFBpdGNoID8gbWF4UGl0Y2ggOiBwaXRjaDtcbiAgICBwcm9wcy5waXRjaCA9IHBpdGNoIDwgbWluUGl0Y2ggPyBtaW5QaXRjaCA6IHBpdGNoO1xuXG4gICAgcmV0dXJuIHByb3BzO1xuICB9XG5cbiAgX3VucHJvamVjdChwb3MpIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IG5ldyBQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnQodGhpcy5fdmlld3BvcnRQcm9wcyk7XG4gICAgcmV0dXJuIHBvcyAmJiB2aWV3cG9ydC51bnByb2plY3QocG9zLCB7dG9wTGVmdDogZmFsc2V9KTtcbiAgfVxuXG4gIC8vIENhbGN1bGF0ZSBhIG5ldyBsbmdsYXQgYmFzZWQgb24gcGl4ZWwgZHJhZ2dpbmcgcG9zaXRpb25cbiAgX2NhbGN1bGF0ZU5ld0xuZ0xhdCh7c3RhcnRQYW5MbmdMYXQsIHBvc30pIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IG5ldyBQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnQodGhpcy5fdmlld3BvcnRQcm9wcyk7XG4gICAgcmV0dXJuIHZpZXdwb3J0LmdldExvY2F0aW9uQXRQb2ludCh7bG5nTGF0OiBzdGFydFBhbkxuZ0xhdCwgcG9zfSk7XG4gIH1cblxuICAvLyBDYWxjdWxhdGVzIG5ldyB6b29tXG4gIF9jYWxjdWxhdGVOZXdab29tKHtzY2FsZSwgc3RhcnRab29tfSkge1xuICAgIGNvbnN0IHttYXhab29tLCBtaW5ab29tfSA9IHRoaXMuX3ZpZXdwb3J0UHJvcHM7XG4gICAgbGV0IHpvb20gPSBzdGFydFpvb20gKyBNYXRoLmxvZzIoc2NhbGUpO1xuICAgIHpvb20gPSB6b29tID4gbWF4Wm9vbSA/IG1heFpvb20gOiB6b29tO1xuICAgIHpvb20gPSB6b29tIDwgbWluWm9vbSA/IG1pblpvb20gOiB6b29tO1xuICAgIHJldHVybiB6b29tO1xuICB9XG5cbiAgLy8gQ2FsY3VsYXRlcyBhIG5ldyBwaXRjaCBhbmQgYmVhcmluZyBmcm9tIGEgcG9zaXRpb24gKGNvbWluZyBmcm9tIGFuIGV2ZW50KVxuICBfY2FsY3VsYXRlTmV3UGl0Y2hBbmRCZWFyaW5nKHtkZWx0YVNjYWxlWCwgZGVsdGFTY2FsZVksIHN0YXJ0QmVhcmluZywgc3RhcnRQaXRjaH0pIHtcbiAgICBjb25zdCB7bWluUGl0Y2gsIG1heFBpdGNofSA9IHRoaXMuX3ZpZXdwb3J0UHJvcHM7XG5cbiAgICBjb25zdCBiZWFyaW5nID0gc3RhcnRCZWFyaW5nICsgMTgwICogZGVsdGFTY2FsZVg7XG4gICAgbGV0IHBpdGNoID0gc3RhcnRQaXRjaDtcbiAgICBpZiAoZGVsdGFTY2FsZVkgPiAwKSB7XG4gICAgICAvLyBHcmFkdWFsbHkgaW5jcmVhc2UgcGl0Y2hcbiAgICAgIHBpdGNoID0gc3RhcnRQaXRjaCArIGRlbHRhU2NhbGVZICogKG1heFBpdGNoIC0gc3RhcnRQaXRjaCk7XG4gICAgfSBlbHNlIGlmIChkZWx0YVNjYWxlWSA8IDApIHtcbiAgICAgIC8vIEdyYWR1YWxseSBkZWNyZWFzZSBwaXRjaFxuICAgICAgcGl0Y2ggPSBzdGFydFBpdGNoIC0gZGVsdGFTY2FsZVkgKiAobWluUGl0Y2ggLSBzdGFydFBpdGNoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcGl0Y2gsXG4gICAgICBiZWFyaW5nXG4gICAgfTtcbiAgfVxuXG59XG4iXX0=