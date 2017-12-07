export { _fitBounds as fitBounds };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// View and Projection Matrix calculations for mapbox-js style map view properties
import { WebMercatorViewport } from 'deck.gl';

/* eslint-disable camelcase */
import vec2_add from 'gl-vec2/add';
import vec2_negate from 'gl-vec2/negate';

var PerspectiveMercatorViewport = function (_WebMercatorViewport) {
  _inherits(PerspectiveMercatorViewport, _WebMercatorViewport);

  function PerspectiveMercatorViewport() {
    _classCallCheck(this, PerspectiveMercatorViewport);

    return _possibleConstructorReturn(this, (PerspectiveMercatorViewport.__proto__ || Object.getPrototypeOf(PerspectiveMercatorViewport)).apply(this, arguments));
  }

  _createClass(PerspectiveMercatorViewport, [{
    key: 'getLocationAtPoint',

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
    value: function getLocationAtPoint(_ref) {
      var lngLat = _ref.lngLat,
          pos = _ref.pos;

      var fromLocation = this.projectFlat(this.unproject(pos));
      var toLocation = this.projectFlat(lngLat);

      var center = this.projectFlat([this.longitude, this.latitude]);

      var translate = vec2_add([], toLocation, vec2_negate([], fromLocation));
      var newCenter = vec2_add([], center, translate);
      return this.unprojectFlat(newCenter);
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

      return new PerspectiveMercatorViewport({ width: width, height: height, longitude: longitude, latitude: latitude, zoom: zoom });
    }
  }]);

  return PerspectiveMercatorViewport;
}(WebMercatorViewport);

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


export default PerspectiveMercatorViewport;
function _fitBounds(_ref2) {
  var width = _ref2.width,
      height = _ref2.height,
      bounds = _ref2.bounds,
      _ref2$padding = _ref2.padding,
      padding = _ref2$padding === undefined ? 0 : _ref2$padding,
      _ref2$offset = _ref2.offset,
      offset = _ref2$offset === undefined ? [0, 0] : _ref2$offset;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9tYXAtY29udHJvbGxlci9wZXJzcGVjdGl2ZS1tZXJjYXRvci12aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJXZWJNZXJjYXRvclZpZXdwb3J0IiwidmVjMl9hZGQiLCJ2ZWMyX25lZ2F0ZSIsIlBlcnNwZWN0aXZlTWVyY2F0b3JWaWV3cG9ydCIsImxuZ0xhdCIsInBvcyIsImZyb21Mb2NhdGlvbiIsInByb2plY3RGbGF0IiwidW5wcm9qZWN0IiwidG9Mb2NhdGlvbiIsImNlbnRlciIsImxvbmdpdHVkZSIsImxhdGl0dWRlIiwidHJhbnNsYXRlIiwibmV3Q2VudGVyIiwidW5wcm9qZWN0RmxhdCIsImJvdW5kcyIsIm9wdGlvbnMiLCJ3aWR0aCIsImhlaWdodCIsImZpdEJvdW5kcyIsIk9iamVjdCIsImFzc2lnbiIsInpvb20iLCJwYWRkaW5nIiwib2Zmc2V0Iiwid2VzdCIsInNvdXRoIiwiZWFzdCIsIm5vcnRoIiwidmlld3BvcnQiLCJudyIsInByb2plY3QiLCJzZSIsInNpemUiLCJNYXRoIiwiYWJzIiwic2NhbGVYIiwic2NhbGVZIiwiY2VudGVyTG5nTGF0IiwibG9nMiIsIm1pbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQSxTQUFRQSxtQkFBUixRQUFrQyxTQUFsQzs7QUFFQTtBQUNBLE9BQU9DLFFBQVAsTUFBcUIsYUFBckI7QUFDQSxPQUFPQyxXQUFQLE1BQXdCLGdCQUF4Qjs7SUFFcUJDLDJCOzs7Ozs7Ozs7Ozs7QUFDbkI7Ozs7Ozs7Ozs7NkNBVWtDO0FBQUEsVUFBZEMsTUFBYyxRQUFkQSxNQUFjO0FBQUEsVUFBTkMsR0FBTSxRQUFOQSxHQUFNOztBQUNoQyxVQUFNQyxlQUFlLEtBQUtDLFdBQUwsQ0FBaUIsS0FBS0MsU0FBTCxDQUFlSCxHQUFmLENBQWpCLENBQXJCO0FBQ0EsVUFBTUksYUFBYSxLQUFLRixXQUFMLENBQWlCSCxNQUFqQixDQUFuQjs7QUFFQSxVQUFNTSxTQUFTLEtB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QUVBLE1BQU1LLGVBQWVULFNBQVN0QixTQUFULENBQW1CRSxNQUFuQixDQUFyQjtBQUNBLE1BQU1hLE9BQU9PLFNBQVNQLElBQVQsR0FBZ0JZLEtBQUtLLElBQUwsQ0FBVUwsS0FBS0MsR0FBTCxDQUFTRCxLQUFLTSxHQUFMLENBQVNKLE1BQVQsRUFBaUJDLE1BQWpCLENBQVQsQ0FBVixDQUE3Qjs7QUFFQSxTQUFPO0FBQ0wzQixlQUFXNEIsYUFBYSxDQUFiLENBRE47QUFFTDNCLGNBQVUyQixhQUFhLENBQWIsQ0FGTDtBQUdMaEI7QUFISyxHQUFQO0FBS0QiLCJmaWxlIjoicGVyc3BlY3RpdmUtbWVyY2F0b3Itdmlld3BvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBWaWV3IGFuZCBQcm9qZWN0aW9uIE1hdHJpeCBjYWxjdWxhdGlvbnMgZm9yIG1hcGJveC1qcyBzdHlsZSBtYXAgdmlldyBwcm9wZXJ0aWVzXG5pbXBvcnQge1dlYk1lcmNhdG9yVmlld3BvcnR9IGZyb20gJ2RlY2suZ2wnO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBjYW1lbGNhc2UgKi9cbmltcG9ydCB2ZWMyX2FkZCBmcm9tICdnbC12ZWMyL2FkZCc7XG5pbXBvcnQgdmVjMl9uZWdhdGUgZnJvbSAnZ2wtdmVjMi9uZWdhdGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnQgZXh0ZW5kcyBXZWJNZXJjYXRvclZpZXdwb3J0IHtcbiAgLyoqXG4gICAqIEdldCB0aGUgbWFwIGNlbnRlciB0aGF0IHBsYWNlIGEgZ2l2ZW4gW2xuZywgbGF0XSBjb29yZGluYXRlIGF0IHNjcmVlblxuICAgKiBwb2ludCBbeCwgeV1cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheX0gbG5nTGF0IC0gW2xuZyxsYXRdIGNvb3JkaW5hdGVzXG4gICAqICAgU3BlY2lmaWVzIGEgcG9pbnQgb24gdGhlIHNwaGVyZS5cbiAgICogQHBhcmFtIHtBcnJheX0gcG9zIC0gW3gseV0gY29vcmRpbmF0ZXNcbiAgICogICBTcGVjaWZpZXMgYSBwb2ludCBvbiB0aGUgc2NyZWVuLlxuICAgKiBAcmV0dXJuIHtBcnJheX0gW2xuZyxsYXRdIG5ldyBtYXAgY2VudGVyLlxuICAgKi9cbiAgZ2V0TG9jYXRpb25BdFBvaW50KHtsbmdMYXQsIHBvc30pIHtcbiAgICBjb25zdCBmcm9tTG9jYXRpb24gPSB0aGlzLnByb2plY3RGbGF0KHRoaXMudW5wcm9qZWN0KHBvcykpO1xuICAgIGNvbnN0IHRvTG9jYXRpb24gPSB0aGlzLnByb2plY3RGbGF0KGxuZ0xhdCk7XG5cbiAgICBjb25zdCBjZW50ZXIgPSB0aGlzLnByb2plY3RGbGF0KFt0aGlzLmxvbmdpdHVkZSwgdGhpcy5sYXRpdHVkZV0pO1xuXG4gICAgY29uc3QgdHJhbnNsYXRlID0gdmVjMl9hZGQoW10sIHRvTG9jYXRpb24sIHZlYzJfbmVnYXRlKFtdLCBmcm9tTG9jYXRpb24pKTtcbiAgICBjb25zdCBuZXdDZW50ZXIgPSB2ZWMyX2FkZChbXSwgY2VudGVyLCB0cmFuc2xhdGUpO1xuICAgIHJldHVybiB0aGlzLnVucHJvamVjdEZsYXQobmV3Q2VudGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IHZpZXdwb3J0IHRoYXQgZml0IGFyb3VuZCB0aGUgZ2l2ZW4gcmVjdGFuZ2xlLlxuICAgKiBPbmx5IHN1cHBvcnRzIG5vbi1wZXJzcGVjdGl2ZSBtb2RlLlxuICAgKiBAcGFyYW0ge0FycmF5fSBib3VuZHMgLSBbW2xvbiwgbGF0XSwgW2xvbiwgbGF0XV1cbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBhZGRpbmddIC0gVGhlIGFtb3VudCBvZiBwYWRkaW5nIGluIHBpeGVscyB0byBhZGQgdG8gdGhlIGdpdmVuIGJvdW5kcy5cbiAgICogQHBhcmFtIHtBcnJheX0gW29wdGlvbnMub2Zmc2V0XSAtIFRoZSBjZW50ZXIgb2YgdGhlIGdpdmVuIGJvdW5kcyByZWxhdGl2ZSB0byB0aGUgbWFwJ3MgY2VudGVyLFxuICAgKiAgICBbeCwgeV0gbWVhc3VyZWQgaW4gcGl4ZWxzLlxuICAgKiBAcmV0dXJucyB7V2ViTWVyY2F0b3JWaWV3cG9ydH1cbiAgICovXG4gIGZpdEJvdW5kcyhib3VuZHMsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0fSA9IHRoaXM7XG4gICAgY29uc3Qge2xvbmdpdHVkZSwgbGF0aXR1ZGUsIHpvb219ID0gZml0Qm91bmRzKE9iamVjdC5hc3NpZ24oe3dpZHRoLCBoZWlnaHQsIGJvdW5kc30sIG9wdGlvbnMpKTtcbiAgICByZXR1cm4gbmV3IFBlcnNwZWN0aXZlTWVyY2F0b3JWaWV3cG9ydCh7d2lkdGgsIGhlaWdodCwgbG9uZ2l0dWRlLCBsYXRpdHVkZSwgem9vbX0pO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBtYXAgc2V0dGluZ3Mge2xhdGl0dWRlLCBsb25naXR1ZGUsIHpvb219XG4gKiB0aGF0IHdpbGwgY29udGFpbiB0aGUgcHJvdmlkZWQgY29ybmVycyB3aXRoaW4gdGhlIHByb3ZpZGVkIHdpZHRoLlxuICogT25seSBzdXBwb3J0cyBub24tcGVyc3BlY3RpdmUgbW9kZS5cbiAqIEBwYXJhbSB7TnVtYmVyfSB3aWR0aCAtIHZpZXdwb3J0IHdpZHRoXG4gKiBAcGFyYW0ge051bWJlcn0gaGVpZ2h0IC0gdmlld3BvcnQgaGVpZ2h0XG4gKiBAcGFyYW0ge0FycmF5fSBib3VuZHMgLSBbW2xvbiwgbGF0XSwgW2xvbiwgbGF0XV1cbiAqIEBwYXJhbSB7TnVtYmVyfSBbcGFkZGluZ10gLSBUaGUgYW1vdW50IG9mIHBhZGRpbmcgaW4gcGl4ZWxzIHRvIGFkZCB0byB0aGUgZ2l2ZW4gYm91bmRzLlxuICogQHBhcmFtIHtBcnJheX0gW29mZnNldF0gLSBUaGUgY2VudGVyIG9mIHRoZSBnaXZlbiBib3VuZHMgcmVsYXRpdmUgdG8gdGhlIG1hcCdzIGNlbnRlcixcbiAqICAgIFt4LCB5XSBtZWFzdXJlZCBpbiBwaXhlbHMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSAtIGxhdGl0dWRlLCBsb25naXR1ZGUgYW5kIHpvb21cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpdEJvdW5kcyh7XG4gIHdpZHRoLFxuICBoZWlnaHQsXG4gIGJvdW5kcyxcbiAgLy8gb3B0aW9uc1xuICBwYWRkaW5nID0gMCxcbiAgb2Zmc2V0ID0gWzAsIDBdXG59KSB7XG4gIGNvbnN0IFtbd2VzdCwgc291dGhdLCBbZWFzdCwgbm9ydGhdXSA9IGJvdW5kcztcblxuICBjb25zdCB2aWV3cG9ydCA9IG5ldyBXZWJNZXJjYXRvclZpZXdwb3J0KHtcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgbG9uZ2l0dWRlOiAwLFxuICAgIGxhdGl0dWRlOiAwLFxuICAgIHpvb206IDBcbiAgfSk7XG5cbiAgY29uc3QgbncgPSB2aWV3cG9ydC5wcm9qZWN0KFt3ZXN0LCBub3J0aF0pO1xuICBjb25zdCBzZSA9IHZpZXdwb3J0LnByb2plY3QoW2Vhc3QsIHNvdXRoXSk7XG4gIGNvbnN0IHNpemUgPSBbXG4gICAgTWF0aC5hYnMoc2VbMF0gLSBud1swXSksXG4gICAgTWF0aC5hYnMoc2VbMV0gLSBud1sxXSlcbiAgXTtcbiAgY29uc3QgY2VudGVyID0gW1xuICAgIChzZVswXSArIG53WzBdKSAvIDIsXG4gICAgKHNlWzFdICsgbndbMV0pIC8gMlxuICBdO1xuXG4gIGNvbnN0IHNjYWxlWCA9ICh3aWR0aCAtIHBhZGRpbmcgKiAyIC0gTWF0aC5hYnMob2Zmc2V0WzBdKSAqIDIpIC8gc2l6ZVswXTtcbiAgY29uc3Qgc2NhbGVZID0gKGhlaWdodCAtIHBhZGRpbmcgKiAyIC0gTWF0aC5hYnMob2Zmc2V0WzFdKSAqIDIpIC8gc2l6ZVsxXTtcblxuICBjb25zdCBjZW50ZXJMbmdMYXQgPSB2aWV3cG9ydC51bnByb2plY3QoY2VudGVyKTtcbiAgY29uc3Qgem9vbSA9IHZpZXdwb3J0Lnpvb20gKyBNYXRoLmxvZzIoTWF0aC5hYnMoTWF0aC5taW4oc2NhbGVYLCBzY2FsZVkpKSk7XG5cbiAgcmV0dXJuIHtcbiAgICBsb25naXR1ZGU6IGNlbnRlckxuZ0xhdFswXSxcbiAgICBsYXRpdHVkZTogY2VudGVyTG5nTGF0WzFdLFxuICAgIHpvb21cbiAgfTtcbn1cbiJdfQ==