var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import OrbitViewport from './orbit-viewport';
import vec3_add from 'gl-vec3/add';
import vec3_scale from 'gl-vec3/scale';
import vec3_lerp from 'gl-vec3/lerp';
import assert from 'assert';

var defaultState = {
  lookAt: [0, 0, 0],
  rotationX: 0,
  rotationY: 0,
  fov: 50,
  near: 1,
  far: 100,
  translationX: 0,
  translationY: 0,
  zoom: 1
};

var defaultConstraints = {
  minZoom: 0,
  maxZoom: Infinity
};

/* Helpers */

// Whether number is between bounds
function inRange(x, min, max) {
  return x >= min && x <= max;
}
// Constrain number between bounds
function clamp(x, min, max) {
  return x < min ? min : x > max ? max : x;
}
// Get ratio of x on domain
function interpolate(x, domain0, domain1) {
  if (domain0 === domain1) {
    return x === domain0 ? 0 : Infinity;
  }
  return (x - domain0) / (domain1 - domain0);
}

function ensureFinite(value, fallbackValue) {
  return Number.isFinite(value) ? value : fallbackValue;
}

var OrbitState = function () {
  function OrbitState(_ref) {
    var width = _ref.width,
        height = _ref.height,
        distance = _ref.distance,
        rotationX = _ref.rotationX,
        rotationY = _ref.rotationY,
        bounds = _ref.bounds,
        lookAt = _ref.lookAt,
        fov = _ref.fov,
        near = _ref.near,
        far = _ref.far,
        translationX = _ref.translationX,
        translationY = _ref.translationY,
        zoom = _ref.zoom,
        minZoom = _ref.minZoom,
        maxZoom = _ref.maxZoom,
        startPanPos = _ref.startPanPos,
        startPanTranslation = _ref.startPanTranslation,
        startRotateCenter = _ref.startRotateCenter,
        startRotateViewport = _ref.startRotateViewport,
        startZoomPos = _ref.startZoomPos,
        startZoom = _ref.startZoom;

    _classCallCheck(this, OrbitState);

    assert(Number.isFinite(width), '`width` must be supplied');
    assert(Number.isFinite(height), '`height` must be supplied');
    assert(Number.isFinite(distance), '`distance` must be supplied');

    this._viewportProps = this._applyConstraints({
      width: width,
      height: height,
      distance: distance,
      rotationX: ensureFinite(rotationX, defaultState.rotationX),
      rotationY: ensureFinite(rotationY, defaultState.rotationY),

      bounds: bounds,
      lookAt: lookAt || defaultState.lookAt,

      fov: ensureFinite(fov, defaultState.fov),
      near: ensureFinite(near, defaultState.near),
      far: ensureFinite(far, defaultState.far),
      translationX: ensureFinite(translationX, defaultState.translationX),
      translationY: ensureFinite(translationY, defaultState.translationY),
      zoom: ensureFinite(zoom, defaultState.zoom),

      minZoom: ensureFinite(minZoom, defaultConstraints.minZoom),
      maxZoom: ensureFinite(maxZoom, defaultConstraints.maxZoom)
    });

    this._interactiveState = {
      startPanPos: startPanPos,
      startPanTranslation: startPanTranslation,
      startRotateCenter: startRotateCenter,
      startRotateViewport: startRotateViewport,
      startZoomPos: startZoomPos,
      startZoom: startZoom
    };
  }

  /* Public API */

  _createClass(OrbitState, [{
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
      var _viewportProps = this._viewportProps,
          translationX = _viewportProps.translationX,
          translationY = _viewportProps.translationY;


      return this._getUpdatedOrbitState({
        startPanTranslation: [translationX, translationY],
        startPanPos: pos
      });
    }

    /**
     * Pan
     * @param {[Number, Number]} pos - position on screen where the pointer is
     */

  }, {
    key: 'pan',
    value: function pan(_ref3) {
      var pos = _ref3.pos,
          startPos = _ref3.startPos;

      var startPanPos = this._interactiveState.startPanPos || startPos;
      assert(startPanPos, '`startPanPos` props is required');

      var _ref4 = this._interactiveState.startPanTranslation || [],
          _ref5 = _slicedToArray(_ref4, 2),
          translationX = _ref5[0],
          translationY = _ref5[1];

      translationX = ensureFinite(translationX, this._viewportProps.translationX);
      translationY = ensureFinite(translationY, this._viewportProps.translationY);

      var deltaX = pos[0] - startPanPos[0];
      var deltaY = pos[1] - startPanPos[1];

      return this._getUpdatedOrbitState({
        translationX: translationX + deltaX,
        translationY: translationY - deltaY
      });
    }

    /**
     * End panning
     * Must call if `panStart()` was called
     */

  }, {
    key: 'panEnd',
    value: function panEnd() {
      return this._getUpdatedOrbitState({
        startPanTranslation: null,
        startPanPos: null
      });
    }

    /**
     * Start rotating
     * @param {[Number, Number]} pos - position on screen where the pointer grabs
     */

  }, {
    key: 'rotateStart',
    value: function rotateStart(_ref6) {
      var pos = _ref6.pos;

      // Rotation center should be the worldspace position at the center of the
      // the screen. If not found, use the last one.
      var startRotateCenter = this._getLocationAtCenter() || this._interactiveState.startRotateCenter;

      return this._getUpdatedOrbitState({
        startRotateCenter: startRotateCenter,
        startRotateViewport: this._viewportProps
      });
    }

    /**
     * Rotate
     * @param {[Number, Number]} pos - position on screen where the pointer is
     */

  }, {
    key: 'rotate',
    value: function rotate(_ref7) {
      var deltaScaleX = _ref7.deltaScaleX,
          deltaScaleY = _ref7.deltaScaleY;
      var _interactiveState = this._interactiveState,
          startRotateCenter = _interactiveState.startRotateCenter,
          startRotateViewport = _interactiveState.startRotateViewport;

      var _ref8 = startRotateViewport || {},
          rotationX = _ref8.rotationX,
          rotationY = _ref8.rotationY,
          translationX = _ref8.translationX,
          translationY = _ref8.translationY;

      rotationX = ensureFinite(rotationX, this._viewportProps.rotationX);
      rotationY = ensureFinite(rotationY, this._viewportProps.rotationY);
      translationX = ensureFinite(translationX, this._viewportProps.translationX);
      translationY = ensureFinite(translationY, this._viewportProps.translationY);

      var newRotationX = clamp(rotationX - deltaScaleY * 180, -89.999, 89.999);
      var newRotationY = (rotationY - deltaScaleX * 180) % 360;

      var newTranslationX = translationX;
      var newTranslationY = translationY;

      if (startRotateCenter) {
        // Keep rotation center at the center of the screen
        var oldViewport = new OrbitViewport(startRotateViewport);
        var oldCenterPos = oldViewport.project(startRotateCenter);

        var newViewport = new OrbitViewport(Object.assign({}, startRotateViewport, {
          rotationX: newRotationX,
          rotationY: newRotationY
        }));
        var newCenterPos = newViewport.project(startRotateCenter);

        newTranslationX += oldCenterPos[0] - newCenterPos[0];
        newTranslationY -= oldCenterPos[1] - newCenterPos[1];
      }

      return this._getUpdatedOrbitState({
        rotationX: newRotationX,
        rotationY: newRotationY,
        translationX: newTranslationX,
        translationY: newTranslationY
      });
    }

    /**
     * End rotating
     * Must call if `rotateStart()` was called
     */

  }, {
    key: 'rotateEnd',
    value: function rotateEnd() {
      return this._getUpdatedOrbitState({
        startRotateCenter: null,
        startRotateViewport: null
      });
    }

    /**
     * Start zooming
     * @param {[Number, Number]} pos - position on screen where the pointer grabs
     */

  }, {
    key: 'zoomStart',
    value: function zoomStart(_ref9) {
      var pos = _ref9.pos;

      return this._getUpdatedOrbitState({
        startZoomPos: pos,
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
    value: function zoom(_ref10) {
      var pos = _ref10.pos,
          startPos = _ref10.startPos,
          scale = _ref10.scale;
      var _viewportProps2 = this._viewportProps,
          zoom = _viewportProps2.zoom,
          minZoom = _viewportProps2.minZoom,
          maxZoom = _viewportProps2.maxZoom,
          width = _viewportProps2.width,
          height = _viewportProps2.height,
          translationX = _viewportProps2.translationX,
          translationY = _viewportProps2.translationY;


      var startZoomPos = this._interactiveState.startZoomPos || startPos || pos;

      var newZoom = clamp(zoom * scale, minZoom, maxZoom);
      var deltaX = pos[0] - startZoomPos[0];
      var deltaY = pos[1] - startZoomPos[1];

      // Zoom around the center position
      var cx = startZoomPos[0] - width / 2;
      var cy = height / 2 - startZoomPos[1];
      var newTranslationX = cx - (cx - translationX) * newZoom / zoom + deltaX;
      var newTranslationY = cy - (cy - translationY) * newZoom / zoom - deltaY;

      return this._getUpdatedOrbitState({
        zoom: newZoom,
        translationX: newTranslationX,
        translationY: newTranslationY
      });
    }

    /**
     * End zooming
     * Must call if `zoomStart()` was called
     */

  }, {
    key: 'zoomEnd',
    value: function zoomEnd() {
      return this._getUpdatedOrbitState({
        startZoomPos: null,
        startZoom: null
      });
    }

    /* Private methods */

  }, {
    key: '_getUpdatedOrbitState',
    value: function _getUpdatedOrbitState(newProps) {
      // Update _viewportProps
      return new OrbitState(Object.assign({}, this._viewportProps, this._interactiveState, newProps));
    }

    // Apply any constraints (mathematical or defined by _viewportProps) to map state

  }, {
    key: '_applyConstraints',
    value: function _applyConstraints(props) {
      // Ensure zoom is within specified range
      var maxZoom = props.maxZoom,
          minZoom = props.minZoom,
          zoom = props.zoom;

      props.zoom = zoom > maxZoom ? maxZoom : zoom;
      props.zoom = zoom < minZoom ? minZoom : zoom;

      return props;
    }

    /* Cast a ray into the screen center and take the average of all
     * intersections with the bounding box:
     *
     *                         (x=w/2)
     *                          .
     *                          .
     *   (bounding box)         .
     *           _-------------_.
     *          | "-_           :-_
     *         |     "-_        .  "-_
     *        |         "-------+-----:
     *       |.........|........C....|............. (y=h/2)
     *      |         |         .   |
     *     |         |          .  |
     *    |         |           . |
     *   |         |            .|
     *  |         |             |                      Y
     *   "-_     |             |.             Z       |
     *      "-_ |             | .              "-_   |
     *         "-------------"                    "-|_____ X
     */

  }, {
    key: '_getLocationAtCenter',
    value: function _getLocationAtCenter() {
      var _viewportProps3 = this._viewportProps,
          width = _viewportProps3.width,
          height = _viewportProps3.height,
          bounds = _viewportProps3.bounds;


      if (!bounds) {
        return null;
      }

      var viewport = new OrbitViewport(this._viewportProps);

      var C0 = viewport.unproject([width / 2, height / 2, 0]);
      var C1 = viewport.unproject([width / 2, height / 2, 1]);
      var sum = [0, 0, 0];
      var count = 0;

      [
      // depth at intersection with X = minX
      interpolate(bounds.minX, C0[0], C1[0]),
      // depth at intersection with X = maxX
      interpolate(bounds.maxX, C0[0], C1[0]),
      // depth at intersection with Y = minY
      interpolate(bounds.minY, C0[1], C1[1]),
      // depth at intersection with Y = maxY
      interpolate(bounds.maxY, C0[1], C1[1]),
      // depth at intersection with Z = minZ
      interpolate(bounds.minZ, C0[2], C1[2]),
      // depth at intersection with Z = maxZ
      interpolate(bounds.maxZ, C0[2], C1[2])].forEach(function (d) {
        // worldspace position of the intersection
        var C = vec3_lerp([], C0, C1, d);
        // check if position is on the bounding box
        if (inRange(C[0], bounds.minX, bounds.maxX) && inRange(C[1], bounds.minY, bounds.maxY) && inRange(C[2], bounds.minZ, bounds.maxZ)) {
          count++;
          vec3_add(sum, sum, C);
        }
      });

      return count > 0 ? vec3_scale([], sum, 1 / count) : null;
    }
  }]);

  return OrbitState;
}();

export default OrbitState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9vcmJpdC1jb250cm9sbGVyL29yYml0LXN0YXRlLmpzIl0sIm5hbWVzIjpbIk9yYml0Vmlld3BvcnQiLCJ2ZWMzX2FkZCIsInZlYzNfc2NhbGUiLCJ2ZWMzX2xlcnAiLCJhc3NlcnQiLCJkZWZhdWx0U3RhdGUiLCJsb29rQXQiLCJyb3RhdGlvblgiLCJyb3RhdGlvblkiLCJmb3YiLCJuZWFyIiwiZmFyIiwidHJhbnNsYXRpb25YIiwidHJhbnNsYXRpb25ZIiwiem9vbSIsImRlZmF1bHRDb25zdHJhaW50cyIsIm1pblpvb20iLCJtYXhab29tIiwiSW5maW5pdHkiLCJpblJhbmdlIiwieCIsIm1pbiIsIm1heCIsImNsYW1wIiwiaW50ZXJwb2xhdGUiLCJkb21haW4wIiwiZG9tYWluMSIsImVuc3VyZUZpbml0ZSIsInZhbHVlIiwiZmFsbGJhY2tWYWx1ZSIsIk51bWJlciIsImlzRmluaXRlIiwiT3JiaXRTdGF0ZSIsIndpZHRoIiwiaGVpZ2h0IiwiZGlzdGFuY2UiLCJib3VuZHMiLCJzdGFydFBhblBvcyIsInN0YXJ0UGFuVHJhbnNsYXRpb24iLCJzdGFydFJvdGF0ZUNlbnRlciIsInN0YXJ0Um90YXRlVmlld3BvcnQiLCJzdGFydFpvb21Qb3MiLCJzdGFydFpvb20iLCJfdmlld3BvcnRQcm9wcyIsIl9hcHBseUNvbnN0cmFpbnRzIiwiX2ludGVyYWN0aXZlU3RhdGUiLCJwb3MiLCJfZ2V0VXBkYXRlZE9yYml0U3RhdGUiLCJzdGFydFBvcyIsImRlbHRhWCIsImRlbHRhWSIsIl9nZXRMb2NhdGlvbkF0Q2VudGVyIiwiZGVsdGFTY2FsZVgiLCJkZWx0YVNjYWxlWSIsIm5ld1JvdGF0aW9uWCIsIm5ld1JvdGF0aW9uWSIsIm5ld1RyYW5zbGF0aW9uWCIsIm5ld1RyYW5zbGF0aW9uWSIsIm9sZFZpZXdwb3J0Iiwib2xkQ2VudGVyUG9zIiwicHJvamVjdCIsIm5ld1ZpZXdwb3J0IiwiT2JqZWN0IiwiYXNzaWduIiwibmV3Q2VudGVyUG9zIiwic2NhbGUiLCJuZXdab29tIiwiY3giLCJjeSIsIm5ld1Byb3BzIiwicHJvcHMiLCJ2aWV3cG9ydCIsIkMwIiwidW5wcm9qZWN0IiwiQzEiLCJzdW0iLCJjb3VudCIsIm1pblgiLCJtYXhYIiwibWluWSIsIm1heFkiLCJtaW5aIiwibWF4WiIsImZvckVhY2giLCJDIiwiZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBT0EsYUFBUCxNQUEwQixrQkFBMUI7QUFDQSxPQUFPQyxRQUFQLE1BQXFCLGFBQXJCO0FBQ0EsT0FBT0MsVUFBUCxNQUF1QixlQUF2QjtBQUNBLE9BQU9DLFNBQVAsTUFBc0IsY0FBdEI7QUFDQSxPQUFPQyxNQUFQLE1BQW1CLFFBQW5COztBQUVBLElBQU1DLGVBQWU7QUFDbkJDLFVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FEVztBQUVuQkMsYUFBVyxDQUZRO0FBR25CQyxhQUFXLENBSFE7QUFJbkJDLE9BQUssRUFKYztBQUtuQkMsUUFBTSxDQUxhO0FBTW5CQyxPQUFLLEdBTmM7QUFPbkJDLGdCQUFjLENBUEs7QUFRbkJDLGdCQUFjLENBUks7QUFTbkJDLFFBQU07QUFUYSxDQUFyQjs7QUFZQSxJQUFNQyxxQkFBcUI7QUFDekJDLFdBQVMsQ0FEZ0I7QUFFekJDLFdBQVNDO0FBRmdCLENBQTNCOztBQUtBOztBQUVBO0FBQ0EsU0FBU0MsT0FBVCxDQUFpQkMsQ0FBakIsRUFBb0JDLEdBQXBCLEVBQXlCQyxHQUF6QixFQUE4QjtBQUM1QixTQUFPRixLQUFLQyxHQUFMLElBQVlELEtBQUtFLEdBQXhCO0FBQ0Q7QUFDRDtBQUNBLFNBQVNDLEtBQVQsQ0FBZUgsQ0FBZixFQUFrQkMsR0FBbEIsRUFBdUJDLEdBQXZCLEVBQTRCO0FBQzFCLFNBQU9GLElBQUlDLEdBQUosR0FBVUEsR0FBVixHQUFpQkQsSUFBSUUsR0FBSixHQUFVQSxHQUFWLEdBQWdCRixDQUF4QztBQUNEO0FBQ0Q7QUFDQSxTQUFTSSxXQUFULENBQXFCSixDQUFyQixFQUF3Qkss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Q0EsWUFBTUMsSUFBSWpGLFVBQVUsRUFBVixFQUFjcUUsRUFBZCxFQUFrQkUsRUFBbEIsRUFBc0JXLENBQXRCLENBQVY7QUFDQTtBQUNBLFlBQUlsRSxRQUFRaUUsRUFBRSxDQUFGLENBQVIsRUFBY2hELE9BQU95QyxJQUFyQixFQUEyQnpDLE9BQU8wQyxJQUFsQyxLQUNBM0QsUUFBUWlFLEVBQUUsQ0FBRixDQUFSLEVBQWNoRCxPQUFPMkMsSUFBckIsRUFBMkIzQyxPQUFPNEMsSUFBbEMsQ0FEQSxJQUVBN0QsUUFBUWlFLEVBQUUsQ0FBRixDQUFSLEVBQWNoRCxPQUFPNkMsSUFBckIsRUFBMkI3QyxPQUFPOEMsSUFBbEMsQ0FGSixFQUU2QztBQUMzQ047QUFDQTNFLG1CQUFTMEUsR0FBVCxFQUFjQSxHQUFkLEVBQW1CUyxDQUFuQjtBQUNEO0FBQ0YsT0F2QkQ7O0FBeUJBLGFBQU9SLFFBQVEsQ0FBUixHQUFZMUUsV0FBVyxFQUFYLEVBQWV5RSxHQUFmLEVBQW9CLElBQUlDLEtBQXhCLENBQVosR0FBNkMsSUFBcEQ7QUFDRDs7Ozs7O2VBMVVrQjVDLFUiLCJmaWxlIjoib3JiaXQtc3RhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT3JiaXRWaWV3cG9ydCBmcm9tICcuL29yYml0LXZpZXdwb3J0JztcbmltcG9ydCB2ZWMzX2FkZCBmcm9tICdnbC12ZWMzL2FkZCc7XG5pbXBvcnQgdmVjM19zY2FsZSBmcm9tICdnbC12ZWMzL3NjYWxlJztcbmltcG9ydCB2ZWMzX2xlcnAgZnJvbSAnZ2wtdmVjMy9sZXJwJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgZGVmYXVsdFN0YXRlID0ge1xuICBsb29rQXQ6IFswLCAwLCAwXSxcbiAgcm90YXRpb25YOiAwLFxuICByb3RhdGlvblk6IDAsXG4gIGZvdjogNTAsXG4gIG5lYXI6IDEsXG4gIGZhcjogMTAwLFxuICB0cmFuc2xhdGlvblg6IDAsXG4gIHRyYW5zbGF0aW9uWTogMCxcbiAgem9vbTogMVxufTtcblxuY29uc3QgZGVmYXVsdENvbnN0cmFpbnRzID0ge1xuICBtaW5ab29tOiAwLFxuICBtYXhab29tOiBJbmZpbml0eVxufTtcblxuLyogSGVscGVycyAqL1xuXG4vLyBXaGV0aGVyIG51bWJlciBpcyBiZXR3ZWVuIGJvdW5kc1xuZnVuY3Rpb24gaW5SYW5nZSh4LCBtaW4sIG1heCkge1xuICByZXR1cm4geCA+PSBtaW4gJiYgeCA8PSBtYXg7XG59XG4vLyBDb25zdHJhaW4gbnVtYmVyIGJldHdlZW4gYm91bmRzXG5mdW5jdGlvbiBjbGFtcCh4LCBtaW4sIG1heCkge1xuICByZXR1cm4geCA8IG1pbiA/IG1pbiA6ICh4ID4gbWF4ID8gbWF4IDogeCk7XG59XG4vLyBHZXQgcmF0aW8gb2YgeCBvbiBkb21haW5cbmZ1bmN0aW9uIGludGVycG9sYXRlKHgsIGRvbWFpbjAsIGRvbWFpbjEpIHtcbiAgaWYgKGRvbWFpbjAgPT09IGRvbWFpbjEpIHtcbiAgICByZXR1cm4geCA9PT0gZG9tYWluMCA/IDAgOiBJbmZpbml0eTtcbiAgfVxuICByZXR1cm4gKHggLSBkb21haW4wKSAvIChkb21haW4xIC0gZG9tYWluMCk7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZUZpbml0ZSh2YWx1ZSwgZmFsbGJhY2tWYWx1ZSkge1xuICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHZhbHVlKSA/IHZhbHVlIDogZmFsbGJhY2tWYWx1ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3JiaXRTdGF0ZSB7XG5cbiAgY29uc3RydWN0b3Ioe1xuICAgIC8qIFZpZXdwb3J0IGFyZ3VtZW50cyAqL1xuICAgIHdpZHRoLCAvLyBXaWR0aCBvZiB2aWV3cG9ydFxuICAgIGhlaWdodCwgLy8gSGVpZ2h0IG9mIHZpZXdwb3J0XG4gICAgZGlzdGFuY2UsIC8vIEZyb20gZXllIHRvIHRhcmdldFxuICAgIHJvdGF0aW9uWCwgLy8gUm90YXRpb24gYXJvdW5kIHggYXhpc1xuICAgIHJvdGF0aW9uWSwgLy8gUm90YXRpb24gYXJvdW5kIHkgYXhpc1xuXG4gICAgLy8gQm91bmRpbmcgYm94IG9mIHRoZSBtb2RlbCwgaW4gdGhlIHNoYXBlIG9mIHttaW5YLCBtYXhYLCBtaW5ZLCBtYXhZLCBtaW5aLCBtYXhafVxuICAgIGJvdW5kcyxcblxuICAgIC8qIFZpZXcgbWF0cml4IGFyZ3VtZW50cyAqL1xuICAgIGxvb2tBdCwgLy8gV2hpY2ggcG9pbnQgaXMgY2FtZXJhIGxvb2tpbmcgYXQsIGRlZmF1bHQgb3JpZ2luXG5cbiAgICAvKiBQcm9qZWN0aW9uIG1hdHJpeCBhcmd1bWVudHMgKi9cbiAgICBmb3YsIC8vIEZpZWxkIG9mIHZpZXcgY292ZXJlZCBieSBjYW1lcmFcbiAgICBuZWFyLCAvLyBEaXN0YW5jZSBvZiBuZWFyIGNsaXBwaW5nIHBsYW5lXG4gICAgZmFyLCAvLyBEaXN0YW5jZSBvZiBmYXIgY2xpcHBpbmcgcGxhbmVcblxuICAgIC8qIEFmdGVyIHByb2plY3Rpb24gKi9cbiAgICB0cmFuc2xhdGlvblgsIC8vIGluIHBpeGVsc1xuICAgIHRyYW5zbGF0aW9uWSwgLy8gaW4gcGl4ZWxzXG4gICAgem9vbSxcblxuICAgIC8qIFZpZXdwb3J0IGNvbnN0cmFpbnRzICovXG4gICAgbWluWm9vbSxcbiAgICBtYXhab29tLFxuXG4gICAgLyoqIEludGVyYWN0aW9uIHN0YXRlcywgcmVxdWlyZWQgdG8gY2FsY3VsYXRlIGNoYW5nZSBkdXJpbmcgdHJhbnNmb3JtICovXG4gICAgLy8gTW9kZWwgc3RhdGUgd2hlbiB0aGUgcGFuIG9wZXJhdGlvbiBmaXJzdCBzdGFydGVkXG4gICAgc3RhcnRQYW5Qb3MsXG4gICAgc3RhcnRQYW5UcmFuc2xhdGlvbixcbiAgICAvLyBNb2RlbCBzdGF0ZSB3aGVuIHRoZSByb3RhdGUgb3BlcmF0aW9uIGZpcnN0IHN0YXJ0ZWRcbiAgICBzdGFydFJvdGF0ZUNlbnRlcixcbiAgICBzdGFydFJvdGF0ZVZpZXdwb3J0LFxuICAgIC8vIE1vZGVsIHN0YXRlIHdoZW4gdGhlIHpvb20gb3BlcmF0aW9uIGZpcnN0IHN0YXJ0ZWRcbiAgICBzdGFydFpvb21Qb3MsXG4gICAgc3RhcnRab29tXG4gIH0pIHtcbiAgICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKHdpZHRoKSwgJ2B3aWR0aGAgbXVzdCBiZSBzdXBwbGllZCcpO1xuICAgIGFzc2VydChOdW1iZXIuaXNGaW5pdGUoaGVpZ2h0KSwgJ2BoZWlnaHRgIG11c3QgYmUgc3VwcGxpZWQnKTtcbiAgICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKGRpc3RhbmNlKSwgJ2BkaXN0YW5jZWAgbXVzdCBiZSBzdXBwbGllZCcpO1xuXG4gICAgdGhpcy5fdmlld3BvcnRQcm9wcyA9IHRoaXMuX2FwcGx5Q29uc3RyYWludHMoe1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBkaXN0YW5jZSxcbiAgICAgIHJvdGF0aW9uWDogZW5zdXJlRmluaXRlKHJvdGF0aW9uWCwgZGVmYXVsdFN0YXRlLnJvdGF0aW9uWCksXG4gICAgICByb3RhdGlvblk6IGVuc3VyZUZpbml0ZShyb3RhdGlvblksIGRlZmF1bHRTdGF0ZS5yb3RhdGlvblkpLFxuXG4gICAgICBib3VuZHMsXG4gICAgICBsb29rQXQ6IGxvb2tBdCB8fCBkZWZhdWx0U3RhdGUubG9va0F0LFxuXG4gICAgICBmb3Y6IGVuc3VyZUZpbml0ZShmb3YsIGRlZmF1bHRTdGF0ZS5mb3YpLFxuICAgICAgbmVhcjogZW5zdXJlRmluaXRlKG5lYXIsIGRlZmF1bHRTdGF0ZS5uZWFyKSxcbiAgICAgIGZhcjogZW5zdXJlRmluaXRlKGZhciwgZGVmYXVsdFN0YXRlLmZhciksXG4gICAgICB0cmFuc2xhdGlvblg6IGVuc3VyZUZpbml0ZSh0cmFuc2xhdGlvblgsIGRlZmF1bHRTdGF0ZS50cmFuc2xhdGlvblgpLFxuICAgICAgdHJhbnNsYXRpb25ZOiBlbnN1cmVGaW5pdGUodHJhbnNsYXRpb25ZLCBkZWZhdWx0U3RhdGUudHJhbnNsYXRpb25ZKSxcbiAgICAgIHpvb206IGVuc3VyZUZpbml0ZSh6b29tLCBkZWZhdWx0U3RhdGUuem9vbSksXG5cbiAgICAgIG1pblpvb206IGVuc3VyZUZpbml0ZShtaW5ab29tLCBkZWZhdWx0Q29uc3RyYWludHMubWluWm9vbSksXG4gICAgICBtYXhab29tOiBlbnN1cmVGaW5pdGUobWF4Wm9vbSwgZGVmYXVsdENvbnN0cmFpbnRzLm1heFpvb20pXG4gICAgfSk7XG5cbiAgICB0aGlzLl9pbnRlcmFjdGl2ZVN0YXRlID0ge1xuICAgICAgc3RhcnRQYW5Qb3MsXG4gICAgICBzdGFydFBhblRyYW5zbGF0aW9uLFxuICAgICAgc3RhcnRSb3RhdGVDZW50ZXIsXG4gICAgICBzdGFydFJvdGF0ZVZpZXdwb3J0LFxuICAgICAgc3RhcnRab29tUG9zLFxuICAgICAgc3RhcnRab29tXG4gICAgfTtcbiAgfVxuXG4gIC8qIFB1YmxpYyBBUEkgKi9cblxuICBnZXRWaWV3cG9ydFByb3BzKCkge1xuICAgIHJldHVybiB0aGlzLl92aWV3cG9ydFByb3BzO1xuICB9XG5cbiAgZ2V0SW50ZXJhY3RpdmVTdGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBwYW5uaW5nXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBwb2ludGVyIGdyYWJzXG4gICAqL1xuICBwYW5TdGFydCh7cG9zfSkge1xuICAgIGNvbnN0IHt0cmFuc2xhdGlvblgsIHRyYW5zbGF0aW9uWX0gPSB0aGlzLl92aWV3cG9ydFByb3BzO1xuXG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRPcmJpdFN0YXRlKHtcbiAgICAgIHN0YXJ0UGFuVHJhbnNsYXRpb246IFt0cmFuc2xhdGlvblgsIHRyYW5zbGF0aW9uWV0sXG4gICAgICBzdGFydFBhblBvczogcG9zXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGFuXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBwb2ludGVyIGlzXG4gICAqL1xuICBwYW4oe3Bvcywgc3RhcnRQb3N9KSB7XG4gICAgY29uc3Qgc3RhcnRQYW5Qb3MgPSB0aGlzLl9pbnRlcmFjdGl2ZVN0YXRlLnN0YXJ0UGFuUG9zIHx8IHN0YXJ0UG9zO1xuICAgIGFzc2VydChzdGFydFBhblBvcywgJ2BzdGFydFBhblBvc2AgcHJvcHMgaXMgcmVxdWlyZWQnKTtcblxuICAgIGxldCBbdHJhbnNsYXRpb25YLCB0cmFuc2xhdGlvblldID0gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZS5zdGFydFBhblRyYW5zbGF0aW9uIHx8IFtdO1xuICAgIHRyYW5zbGF0aW9uWCA9IGVuc3VyZUZpbml0ZSh0cmFuc2xhdGlvblgsIHRoaXMuX3ZpZXdwb3J0UHJvcHMudHJhbnNsYXRpb25YKTtcbiAgICB0cmFuc2xhdGlvblkgPSBlbnN1cmVGaW5pdGUodHJhbnNsYXRpb25ZLCB0aGlzLl92aWV3cG9ydFByb3BzLnRyYW5zbGF0aW9uWSk7XG5cbiAgICBjb25zdCBkZWx0YVggPSBwb3NbMF0gLSBzdGFydFBhblBvc1swXTtcbiAgICBjb25zdCBkZWx0YVkgPSBwb3NbMV0gLSBzdGFydFBhblBvc1sxXTtcblxuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkT3JiaXRTdGF0ZSh7XG4gICAgICB0cmFuc2xhdGlvblg6IHRyYW5zbGF0aW9uWCArIGRlbHRhWCxcbiAgICAgIHRyYW5zbGF0aW9uWTogdHJhbnNsYXRpb25ZIC0gZGVsdGFZXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRW5kIHBhbm5pbmdcbiAgICogTXVzdCBjYWxsIGlmIGBwYW5TdGFydCgpYCB3YXMgY2FsbGVkXG4gICAqL1xuICBwYW5FbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRPcmJpdFN0YXRlKHtcbiAgICAgIHN0YXJ0UGFuVHJhbnNsYXRpb246IG51bGwsXG4gICAgICBzdGFydFBhblBvczogbnVsbFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHJvdGF0aW5nXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBwb2ludGVyIGdyYWJzXG4gICAqL1xuICByb3RhdGVTdGFydCh7cG9zfSkge1xuICAgIC8vIFJvdGF0aW9uIGNlbnRlciBzaG91bGQgYmUgdGhlIHdvcmxkc3BhY2UgcG9zaXRpb24gYXQgdGhlIGNlbnRlciBvZiB0aGVcbiAgICAvLyB0aGUgc2NyZWVuLiBJZiBub3QgZm91bmQsIHVzZSB0aGUgbGFzdCBvbmUuXG4gICAgY29uc3Qgc3RhcnRSb3RhdGVDZW50ZXIgPSB0aGlzLl9nZXRMb2NhdGlvbkF0Q2VudGVyKCkgfHxcbiAgICAgIHRoaXMuX2ludGVyYWN0aXZlU3RhdGUuc3RhcnRSb3RhdGVDZW50ZXI7XG5cbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE9yYml0U3RhdGUoe1xuICAgICAgc3RhcnRSb3RhdGVDZW50ZXIsXG4gICAgICBzdGFydFJvdGF0ZVZpZXdwb3J0OiB0aGlzLl92aWV3cG9ydFByb3BzXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUm90YXRlXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBwb2ludGVyIGlzXG4gICAqL1xuICByb3RhdGUoe2RlbHRhU2NhbGVYLCBkZWx0YVNjYWxlWX0pIHtcbiAgICBjb25zdCB7c3RhcnRSb3RhdGVDZW50ZXIsIHN0YXJ0Um90YXRlVmlld3BvcnR9ID0gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZTtcblxuICAgIGxldCB7cm90YXRpb25YLCByb3RhdGlvblksIHRyYW5zbGF0aW9uWCwgdHJhbnNsYXRpb25ZfSA9IHN0YXJ0Um90YXRlVmlld3BvcnQgfHwge307XG4gICAgcm90YXRpb25YID0gZW5zdXJlRmluaXRlKHJvdGF0aW9uWCwgdGhpcy5fdmlld3BvcnRQcm9wcy5yb3RhdGlvblgpO1xuICAgIHJvdGF0aW9uWSA9IGVuc3VyZUZpbml0ZShyb3RhdGlvblksIHRoaXMuX3ZpZXdwb3J0UHJvcHMucm90YXRpb25ZKTtcbiAgICB0cmFuc2xhdGlvblggPSBlbnN1cmVGaW5pdGUodHJhbnNsYXRpb25YLCB0aGlzLl92aWV3cG9ydFByb3BzLnRyYW5zbGF0aW9uWCk7XG4gICAgdHJhbnNsYXRpb25ZID0gZW5zdXJlRmluaXRlKHRyYW5zbGF0aW9uWSwgdGhpcy5fdmlld3BvcnRQcm9wcy50cmFuc2xhdGlvblkpO1xuXG4gICAgY29uc3QgbmV3Um90YXRpb25YID0gY2xhbXAocm90YXRpb25YIC0gZGVsdGFTY2FsZVkgKiAxODAsIC04OS45OTksIDg5Ljk5OSk7XG4gICAgY29uc3QgbmV3Um90YXRpb25ZID0gKHJvdGF0aW9uWSAtIGRlbHRhU2NhbGVYICogMTgwKSAlIDM2MDtcblxuICAgIGxldCBuZXdUcmFuc2xhdGlvblggPSB0cmFuc2xhdGlvblg7XG4gICAgbGV0IG5ld1RyYW5zbGF0aW9uWSA9IHRyYW5zbGF0aW9uWTtcblxuICAgIGlmIChzdGFydFJvdGF0ZUNlbnRlcikge1xuICAgICAgLy8gS2VlcCByb3RhdGlvbiBjZW50ZXIgYXQgdGhlIGNlbnRlciBvZiB0aGUgc2NyZWVuXG4gICAgICBjb25zdCBvbGRWaWV3cG9ydCA9IG5ldyBPcmJpdFZpZXdwb3J0KHN0YXJ0Um90YXRlVmlld3BvcnQpO1xuICAgICAgY29uc3Qgb2xkQ2VudGVyUG9zID0gb2xkVmlld3BvcnQucHJvamVjdChzdGFydFJvdGF0ZUNlbnRlcik7XG5cbiAgICAgIGNvbnN0IG5ld1ZpZXdwb3J0ID0gbmV3IE9yYml0Vmlld3BvcnQoT2JqZWN0LmFzc2lnbih7fSwgc3RhcnRSb3RhdGVWaWV3cG9ydCwge1xuICAgICAgICByb3RhdGlvblg6IG5ld1JvdGF0aW9uWCxcbiAgICAgICAgcm90YXRpb25ZOiBuZXdSb3RhdGlvbllcbiAgICAgIH0pKTtcbiAgICAgIGNvbnN0IG5ld0NlbnRlclBvcyA9IG5ld1ZpZXdwb3J0LnByb2plY3Qoc3RhcnRSb3RhdGVDZW50ZXIpO1xuXG4gICAgICBuZXdUcmFuc2xhdGlvblggKz0gb2xkQ2VudGVyUG9zWzBdIC0gbmV3Q2VudGVyUG9zWzBdO1xuICAgICAgbmV3VHJhbnNsYXRpb25ZIC09IG9sZENlbnRlclBvc1sxXSAtIG5ld0NlbnRlclBvc1sxXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE9yYml0U3RhdGUoe1xuICAgICAgcm90YXRpb25YOiBuZXdSb3RhdGlvblgsXG4gICAgICByb3RhdGlvblk6IG5ld1JvdGF0aW9uWSxcbiAgICAgIHRyYW5zbGF0aW9uWDogbmV3VHJhbnNsYXRpb25YLFxuICAgICAgdHJhbnNsYXRpb25ZOiBuZXdUcmFuc2xhdGlvbllcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmQgcm90YXRpbmdcbiAgICogTXVzdCBjYWxsIGlmIGByb3RhdGVTdGFydCgpYCB3YXMgY2FsbGVkXG4gICAqL1xuICByb3RhdGVFbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRPcmJpdFN0YXRlKHtcbiAgICAgIHN0YXJ0Um90YXRlQ2VudGVyOiBudWxsLFxuICAgICAgc3RhcnRSb3RhdGVWaWV3cG9ydDogbnVsbFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHpvb21pbmdcbiAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBwb3MgLSBwb3NpdGlvbiBvbiBzY3JlZW4gd2hlcmUgdGhlIHBvaW50ZXIgZ3JhYnNcbiAgICovXG4gIHpvb21TdGFydCh7cG9zfSkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkT3JiaXRTdGF0ZSh7XG4gICAgICBzdGFydFpvb21Qb3M6IHBvcyxcbiAgICAgIHN0YXJ0Wm9vbTogdGhpcy5fdmlld3BvcnRQcm9wcy56b29tXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogWm9vbVxuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IHBvcyAtIHBvc2l0aW9uIG9uIHNjcmVlbiB3aGVyZSB0aGUgY3VycmVudCBjZW50ZXIgaXNcbiAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBzdGFydFBvcyAtIHRoZSBjZW50ZXIgcG9zaXRpb24gYXRcbiAgICogICB0aGUgc3RhcnQgb2YgdGhlIG9wZXJhdGlvbi4gTXVzdCBiZSBzdXBwbGllZCBvZiBgem9vbVN0YXJ0KClgIHdhcyBub3QgY2FsbGVkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSAtIGEgbnVtYmVyIGJldHdlZW4gWzAsIDFdIHNwZWNpZnlpbmcgdGhlIGFjY3VtdWxhdGVkXG4gICAqICAgcmVsYXRpdmUgc2NhbGUuXG4gICAqL1xuICB6b29tKHtwb3MsIHN0YXJ0UG9zLCBzY2FsZX0pIHtcbiAgICBjb25zdCB7em9vbSwgbWluWm9vbSwgbWF4Wm9vbSwgd2lkdGgsIGhlaWdodCwgdHJhbnNsYXRpb25YLCB0cmFuc2xhdGlvbll9ID0gdGhpcy5fdmlld3BvcnRQcm9wcztcblxuICAgIGNvbnN0IHN0YXJ0Wm9vbVBvcyA9IHRoaXMuX2ludGVyYWN0aXZlU3RhdGUuc3RhcnRab29tUG9zIHx8IHN0YXJ0UG9zIHx8IHBvcztcblxuICAgIGNvbnN0IG5ld1pvb20gPSBjbGFtcCh6b29tICogc2NhbGUsIG1pblpvb20sIG1heFpvb20pO1xuICAgIGNvbnN0IGRlbHRhWCA9IHBvc1swXSAtIHN0YXJ0Wm9vbVBvc1swXTtcbiAgICBjb25zdCBkZWx0YVkgPSBwb3NbMV0gLSBzdGFydFpvb21Qb3NbMV07XG5cbiAgICAvLyBab29tIGFyb3VuZCB0aGUgY2VudGVyIHBvc2l0aW9uXG4gICAgY29uc3QgY3ggPSBzdGFydFpvb21Qb3NbMF0gLSB3aWR0aCAvIDI7XG4gICAgY29uc3QgY3kgPSBoZWlnaHQgLyAyIC0gc3RhcnRab29tUG9zWzFdO1xuICAgIGNvbnN0IG5ld1RyYW5zbGF0aW9uWCA9IGN4IC0gKGN4IC0gdHJhbnNsYXRpb25YKSAqIG5ld1pvb20gLyB6b29tICsgZGVsdGFYO1xuICAgIGNvbnN0IG5ld1RyYW5zbGF0aW9uWSA9IGN5IC0gKGN5IC0gdHJhbnNsYXRpb25ZKSAqIG5ld1pvb20gLyB6b29tIC0gZGVsdGFZO1xuXG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRPcmJpdFN0YXRlKHtcbiAgICAgIHpvb206IG5ld1pvb20sXG4gICAgICB0cmFuc2xhdGlvblg6IG5ld1RyYW5zbGF0aW9uWCxcbiAgICAgIHRyYW5zbGF0aW9uWTogbmV3VHJhbnNsYXRpb25ZXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRW5kIHpvb21pbmdcbiAgICogTXVzdCBjYWxsIGlmIGB6b29tU3RhcnQoKWAgd2FzIGNhbGxlZFxuICAgKi9cbiAgem9vbUVuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE9yYml0U3RhdGUoe1xuICAgICAgc3RhcnRab29tUG9zOiBudWxsLFxuICAgICAgc3RhcnRab29tOiBudWxsXG4gICAgfSk7XG4gIH1cblxuICAvKiBQcml2YXRlIG1ldGhvZHMgKi9cblxuICBfZ2V0VXBkYXRlZE9yYml0U3RhdGUobmV3UHJvcHMpIHtcbiAgICAvLyBVcGRhdGUgX3ZpZXdwb3J0UHJvcHNcbiAgICByZXR1cm4gbmV3IE9yYml0U3RhdGUoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5fdmlld3BvcnRQcm9wcywgdGhpcy5faW50ZXJhY3RpdmVTdGF0ZSwgbmV3UHJvcHMpKTtcbiAgfVxuXG4gIC8vIEFwcGx5IGFueSBjb25zdHJhaW50cyAobWF0aGVtYXRpY2FsIG9yIGRlZmluZWQgYnkgX3ZpZXdwb3J0UHJvcHMpIHRvIG1hcCBzdGF0ZVxuICBfYXBwbHlDb25zdHJhaW50cyhwcm9wcykge1xuICAgIC8vIEVuc3VyZSB6b29tIGlzIHdpdGhpbiBzcGVjaWZpZWQgcmFuZ2VcbiAgICBjb25zdCB7bWF4Wm9vbSwgbWluWm9vbSwgem9vbX0gPSBwcm9wcztcbiAgICBwcm9wcy56b29tID0gem9vbSA+IG1heFpvb20gPyBtYXhab29tIDogem9vbTtcbiAgICBwcm9wcy56b29tID0gem9vbSA8IG1pblpvb20gPyBtaW5ab29tIDogem9vbTtcblxuICAgIHJldHVybiBwcm9wcztcbiAgfVxuXG4gIC8qIENhc3QgYSByYXkgaW50byB0aGUgc2NyZWVuIGNlbnRlciBhbmQgdGFrZSB0aGUgYXZlcmFnZSBvZiBhbGxcbiAgICogaW50ZXJzZWN0aW9ucyB3aXRoIHRoZSBib3VuZGluZyBib3g6XG4gICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICh4PXcvMilcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgIC5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgIC5cbiAgICogICAoYm91bmRpbmcgYm94KSAgICAgICAgIC5cbiAgICogICAgICAgICAgIF8tLS0tLS0tLS0tLS0tXy5cbiAgICogICAgICAgICAgfCBcIi1fICAgICAgICAgICA6LV9cbiAgICogICAgICAgICB8ICAgICBcIi1fICAgICAgICAuICBcIi1fXG4gICAqICAgICAgICB8ICAgICAgICAgXCItLS0tLS0tKy0tLS0tOlxuICAgKiAgICAgICB8Li4uLi4uLi4ufC4uLi4uLi4uQy4uLi58Li4uLi4uLi4uLi4uLiAoeT1oLzIpXG4gICAqICAgICAgfCAgICAgICAgIHwgICAgICAgICAuICAgfFxuICAgKiAgICAgfCAgICAgICAgIHwgICAgICAgICAgLiAgfFxuICAgKiAgICB8ICAgICAgICAgfCAgICAgICAgICAgLiB8XG4gICAqICAgfCAgICAgICAgIHwgICAgICAgICAgICAufFxuICAgKiAgfCAgICAgICAgIHwgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICBZXG4gICAqICAgXCItXyAgICAgfCAgICAgICAgICAgICB8LiAgICAgICAgICAgICBaICAgICAgIHxcbiAgICogICAgICBcIi1fIHwgICAgICAgICAgICAgfCAuICAgICAgICAgICAgICBcIi1fICAgfFxuICAgKiAgICAgICAgIFwiLS0tLS0tLS0tLS0tLVwiICAgICAgICAgICAgICAgICAgICBcIi18X19fX18gWFxuICAgKi9cbiAgX2dldExvY2F0aW9uQXRDZW50ZXIoKSB7XG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHQsIGJvdW5kc30gPSB0aGlzLl92aWV3cG9ydFByb3BzO1xuXG4gICAgaWYgKCFib3VuZHMpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHZpZXdwb3J0ID0gbmV3IE9yYml0Vmlld3BvcnQodGhpcy5fdmlld3BvcnRQcm9wcyk7XG5cbiAgICBjb25zdCBDMCA9IHZpZXdwb3J0LnVucHJvamVjdChbd2lkdGggLyAyLCBoZWlnaHQgLyAyLCAwXSk7XG4gICAgY29uc3QgQzEgPSB2aWV3cG9ydC51bnByb2plY3QoW3dpZHRoIC8gMiwgaGVpZ2h0IC8gMiwgMV0pO1xuICAgIGNvbnN0IHN1bSA9IFswLCAwLCAwXTtcbiAgICBsZXQgY291bnQgPSAwO1xuXG4gICAgW1xuICAgICAgLy8gZGVwdGggYXQgaW50ZXJzZWN0aW9uIHdpdGggWCA9IG1pblhcbiAgICAgIGludGVycG9sYXRlKGJvdW5kcy5taW5YLCBDMFswXSwgQzFbMF0pLFxuICAgICAgLy8gZGVwdGggYXQgaW50ZXJzZWN0aW9uIHdpdGggWCA9IG1heFhcbiAgICAgIGludGVycG9sYXRlKGJvdW5kcy5tYXhYLCBDMFswXSwgQzFbMF0pLFxuICAgICAgLy8gZGVwdGggYXQgaW50ZXJzZWN0aW9uIHdpdGggWSA9IG1pbllcbiAgICAgIGludGVycG9sYXRlKGJvdW5kcy5taW5ZLCBDMFsxXSwgQzFbMV0pLFxuICAgICAgLy8gZGVwdGggYXQgaW50ZXJzZWN0aW9uIHdpdGggWSA9IG1heFlcbiAgICAgIGludGVycG9sYXRlKGJvdW5kcy5tYXhZLCBDMFsxXSwgQzFbMV0pLFxuICAgICAgLy8gZGVwdGggYXQgaW50ZXJzZWN0aW9uIHdpdGggWiA9IG1pblpcbiAgICAgIGludGVycG9sYXRlKGJvdW5kcy5taW5aLCBDMFsyXSwgQzFbMl0pLFxuICAgICAgLy8gZGVwdGggYXQgaW50ZXJzZWN0aW9uIHdpdGggWiA9IG1heFpcbiAgICAgIGludGVycG9sYXRlKGJvdW5kcy5tYXhaLCBDMFsyXSwgQzFbMl0pXG4gICAgXS5mb3JFYWNoKGQgPT4ge1xuICAgICAgLy8gd29ybGRzcGFjZSBwb3NpdGlvbiBvZiB0aGUgaW50ZXJzZWN0aW9uXG4gICAgICBjb25zdCBDID0gdmVjM19sZXJwKFtdLCBDMCwgQzEsIGQpO1xuICAgICAgLy8gY2hlY2sgaWYgcG9zaXRpb24gaXMgb24gdGhlIGJvdW5kaW5nIGJveFxuICAgICAgaWYgKGluUmFuZ2UoQ1swXSwgYm91bmRzLm1pblgsIGJvdW5kcy5tYXhYKSAmJlxuICAgICAgICAgIGluUmFuZ2UoQ1sxXSwgYm91bmRzLm1pblksIGJvdW5kcy5tYXhZKSAmJlxuICAgICAgICAgIGluUmFuZ2UoQ1syXSwgYm91bmRzLm1pblosIGJvdW5kcy5tYXhaKSkge1xuICAgICAgICBjb3VudCsrO1xuICAgICAgICB2ZWMzX2FkZChzdW0sIHN1bSwgQyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY291bnQgPiAwID8gdmVjM19zY2FsZShbXSwgc3VtLCAxIC8gY291bnQpIDogbnVsbDtcbiAgfVxufVxuIl19