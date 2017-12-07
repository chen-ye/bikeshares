'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.getAccessToken = getAccessToken;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isBrowser = !((typeof process === 'undefined' ? 'undefined' : (0, _typeof3.default)(process)) === 'object' && String(process) === '[object process]' && !process.browser); // Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* global window, document, process */


var mapboxgl = isBrowser ? require('mapbox-gl') : null;

function noop() {}

var propTypes = {
  // Creation parameters
  // container: PropTypes.DOMElement || String

  mapboxApiAccessToken: _propTypes2.default.string, /** Mapbox API access token for Mapbox tiles/styles. */
  attributionControl: _propTypes2.default.bool, /** Show attribution control or not. */
  preserveDrawingBuffer: _propTypes2.default.bool, /** Useful when you want to export the canvas as a PNG. */
  onLoad: _propTypes2.default.func, /** The onLoad callback for the map */
  onError: _propTypes2.default.func, /** The onError callback for the map */
  reuseMaps: _propTypes2.default.bool,

  mapStyle: _propTypes2.default.string, /** The Mapbox style. A string url to a MapboxGL style */
  visible: _propTypes2.default.bool, /** Whether the map is visible */

  // Map view state
  width: _propTypes2.default.number.isRequired, /** The width of the map. */
  height: _propTypes2.default.number.isRequired, /** The height of the map. */
  longitude: _propTypes2.default.number.isRequired, /** The longitude of the center of the map. */
  latitude: _propTypes2.default.number.isRequired, /** The latitude of the center of the map. */
  zoom: _propTypes2.default.number.isRequired, /** The tile zoom level of the map. */
  bearing: _propTypes2.default.number, /** Specify the bearing of the viewport */
  pitch: _propTypes2.default.number, /** Specify the pitch of the viewport */

  // Note: Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
  altitude: _propTypes2.default.number /** Altitude of the viewport camera. Default 1.5 "screen heights" */
};

var defaultProps = {
  mapboxApiAccessToken: getAccessToken(),
  preserveDrawingBuffer: false,
  attributionControl: true,
  preventStyleDiffing: false,
  onLoad: noop,
  onError: noop,
  reuseMaps: false,

  mapStyle: 'mapbox://styles/mapbox/light-v8',
  visible: true,

  bearing: 0,
  pitch: 0,
  altitude: 1.5
};

// Try to get access token from URL, env, local storage or config
function getAccessToken() {
  var accessToken = null;

  if (typeof window !== 'undefined' && window.location) {
    var match = window.location.search.match(/access_token=([^&\/]*)/);
    accessToken = match && match[1];
  }

  if (!accessToken && typeof process !== 'undefined') {
    // Note: This depends on bundler plugins (e.g. webpack) inmporting environment correctly
    accessToken = accessToken || process.env.MapboxAccessToken; // eslint-disable-line
  }

  return accessToken || null;
}

// Helper function to merge defaultProps and check prop types
function checkPropTypes(props) {
  var component = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'component';

  // TODO - check for production (unless done by prop types package?)
  if (props.debug) {
    _propTypes2.default.checkPropTypes(propTypes, props, 'prop', component);
  }
}

// A small wrapper class for mapbox-gl
// - Provides a prop style interface (that can be trivially used by a React wrapper)
// - Makes sure mapbox doesn't crash under Node
// - Handles map reuse (to work around Mapbox resource leak issues)
// - Provides support for specifying tokens during development

var Mapbox = function () {
  (0, _createClass3.default)(Mapbox, null, [{
    key: 'supported',
    value: function supported() {
      return mapboxgl && mapboxgl.supported();
    }
  }]);

  function Mapbox(props) {
    (0, _classCallCheck3.default)(this, Mapbox);

    if (!mapboxgl) {
      throw new Error('Mapbox not supported');
    }

    this.props = {};
    this._initialize(props);
  }

  (0, _createClass3.default)(Mapbox, [{
    key: 'finalize',
    value: function finalize() {
      if (!mapboxgl || !this._map) {
        return this;
      }

      this._destroy();
      return this;
    }
  }, {
    key: 'setProps',
    value: function setProps(props) {
      if (!mapboxgl || !this._map) {
        return this;
      }

      this._update(this.props, props);
      return this;
    }

    // Mapbox's map.resize() reads size from DOM, so DOM element must already be resized
    // In a system like React we must wait to read size until after render
    // (e.g. until "componentDidUpdate")

  }, {
    key: 'resize',
    value: function resize() {
      if (!mapboxgl || !this._map) {
        return this;
      }

      this._map.resize();
      return this;
    }

    // External apps can access map this way

  }, {
    key: 'getMap',
    value: function getMap() {
      return this._map;
    }

    // PRIVATE API

  }, {
    key: '_create',
    value: function _create(props) {
      // Reuse a saved map, if available
      if (props.reuseMaps && Mapbox.savedMap) {
        this._map = this.map = Mapbox.savedMap;
        Mapbox.savedMap = null;
        // TODO - need to call onload again, need to track with Promise?
        props.onLoad();
        console.debug('Reused existing mapbox map', this._map); // eslint-disable-line
      } else {
        this._map = this.map = new mapboxgl.Map({
          container: props.container || document.body,
          center: [props.longitude, props.latitude],
          zoom: props.zoom,
          pitch: props.pitch,
          bearing: props.bearing,
          style: props.mapStyle,
          interactive: false,
          attributionControl: props.attributionControl,
          preserveDrawingBuffer: props.preserveDrawingBuffer
        });
        // Attach optional onLoad function
        this.map.once('load', props.onLoad);
        this.map.on('error', props.onError);
        console.debug('Created new mapbox map', this._map); // eslint-disable-line
      }

      return this;
    }
  }, {
    key: '_destroy',
    value: function _destroy() {
      if (!Mapbox.savedMap) {
        Mapbox.savedMap = this._map;
      } else {
        this._map.remove();
      }
    }
  }, {
    key: '_initialize',
    value: function _initialize(props) {
      props = (0, _assign2.default)({}, defaultProps, props);
      checkPropTypes(props, 'Mapbox');

      // Make empty string pick up default prop
      this.accessToken = props.mapboxApiAccessToken || defaultProps.mapboxApiAccessToken;

      // Creation only props
      if (mapboxgl) {
        if (!this.accessToken) {
          mapboxgl.accessToken = 'no-token'; // Prevents mapbox from throwing
        } else {
          mapboxgl.accessToken = this.accessToken;
        }
      }

      this._create(props);

      // Disable outline style
      var canvas = this.map.getCanvas();
      if (canvas) {
        canvas.style.outline = 'none';
      }

      this._updateMapViewport({}, props);
      this._updateMapSize({}, props);

      this.props = props;
    }
  }, {
    key: '_update',
    value: function _update(oldProps, newProps) {
      newProps = (0, _assign2.default)({}, this.props, newProps);
      checkPropTypes(newProps, 'Mapbox');

      this._updateMapViewport(oldProps, newProps);
      this._updateMapSize(oldProps, newProps);

      this.props = newProps;
    }
  }, {
    key: '_updateMapViewport',
    value: function _updateMapViewport(oldProps, newProps) {
      var viewportChanged = newProps.latitude !== oldProps.latitude || newProps.longitude !== oldProps.longitude || newProps.zoom !== oldProps.zoom || newProps.pitch !== oldProps.pitch || newProps.bearing !== oldProps.bearing || newProps.altitude !== oldProps.altitude;

      if (viewportChanged) {
        this._map.jumpTo({
          center: [newProps.longitude, newProps.latitude],
          zoom: newProps.zoom,
          bearing: newProps.bearing,
          pitch: newProps.pitch
        });

        // TODO - jumpTo doesn't handle altitude
        if (newProps.altitude !== oldProps.altitude) {
          this._map.transform.altitude = newProps.altitude;
        }
      }
    }

    // Note: needs to be called after render (e.g. in componentDidUpdate)

  }, {
    key: '_updateMapSize',
    value: function _updateMapSize(oldProps, newProps) {
      var sizeChanged = oldProps.width !== newProps.width || oldProps.height !== newProps.height;
      if (sizeChanged) {
        this._map.resize();
      }
    }
  }]);
  return Mapbox;
}();

exports.default = Mapbox;


Mapbox.propTypes = propTypes;
Mapbox.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXBib3gvbWFwYm94LmpzIl0sIm5hbWVzIjpbImdldEFjY2Vzc1Rva2VuIiwiaXNCcm93c2VyIiwicHJvY2VzcyIsIlN0cmluZyIsImJyb3dzZXIiLCJtYXBib3hnbCIsInJlcXVpcmUiLCJub29wIiwicHJvcFR5cGVzIiwibWFwYm94QXBpQWNjZXNzVG9rZW4iLCJzdHJpbmciLCJhdHRyaWJ1dGlvbkNvbnRyb2wiLCJib29sIiwicHJlc2VydmVEcmF3aW5nQnVmZmVyIiwib25Mb2FkIiwiZnVuYyIsIm9uRXJyb3IiLCJyZXVzZU1hcHMiLCJtYXBTdHlsZSIsInZpc2libGUiLCJ3aWR0aCIsIm51bWJlciIsImlzUmVxdWlyZWQiLCJoZWlnaHQiLCJsb25naXR1ZGUiLCJsYXRpdHVkZSIsInpvb20iLCJiZWFyaW5nIiwicGl0Y2giLCJhbHRpdHVkZSIsImRlZmF1bHRQcm9wcyIsInByZXZlbnRTdHlsZURpZmZpbmciLCJhY2Nlc3NUb2tlbiIsIndpbmRvdyIsImxvY2F0aW9uIiwibWF0Y2giLCJzZWFyY2giLCJlbnYiLCJNYXBib3hBY2Nlc3NUb2tlbiIsImNoZWNrUHJvcFR5cGVzIiwicHJvcHMiLCJjb21wb25lbnQiLCJkZWJ1ZyIsIk1hcGJveCIsInN1cHBvcnRlZCIsIkVycm9yIiwiX2luaXRpYWxpemUiLCJfbWFwIiwiX2Rlc3Ryb3kiLCJfdXBkYXRlIiwicmVzaXplIiwic2F2ZWRNYXAiLCJtYXAiLCJjb25zb2xlIiwiTWFwIiwiY29udGFpbmVyIiwiZG9jdW1lbnQiLCJib2R5IiwiY2VudGVyIiwic3R5bGUiLCJpbnRlcmFjdGl2ZSIsIm9uY2UiLCJvbiIsInJlbW92ZSIsIl9jcmVhdGUiLCJjYW52YXMiLCJnZXRDYW52YXMiLCJvdXRsaW5lIiwiX3VwZGF0ZU1hcFZpZXdwb3J0IiwiX3VwZGF0ZU1hcFNpemUiLCJvbGRQcm9wcyIsIm5ld1Byb3BzIiwidmlld3BvcnRDaGFuZ2VkIiwianVtcFRvIiwidHJhbnNmb3JtIiwic2l6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QjJDLFNBQVMzQyxPQUo5QixJQUtBNEMsU0FBUzFDLFFBQVQsS0FBc0J5QyxTQUFTekMsUUFOakM7O0FBUUEsVUFBSTJDLGVBQUosRUFBcUI7QUFDbkIsYUFBS3pCLElBQUwsQ0FBVTBCLE1BQVYsQ0FBaUI7QUFDZmYsa0JBQVEsQ0FBQ2EsU0FBUy9DLFNBQVYsRUFBcUIrQyxTQUFTOUMsUUFBOUIsQ0FETztBQUVmQyxnQkFBTTZDLFNBQVM3QyxJQUZBO0FBR2ZDLG1CQUFTNEMsU0FBUzVDLE9BSEg7QUFJZkMsaUJBQU8yQyxTQUFTM0M7QUFKRCxTQUFqQjs7QUFPQTtBQUNBLFlBQUkyQyxTQUFTMUMsUUFBVCxLQUFzQnlDLFNBQVN6QyxRQUFuQyxFQUE2QztBQUMzQyxlQUFLa0IsSUFBTCxDQUFVMkIsU0FBVixDQUFvQjdDLFFBQXBCLEdBQStCMEMsU0FBUzFDLFFBQXhDO0FBQ0Q7QUFDRjtBQUNGOztBQUVEOzs7O21DQUNleUMsUSxFQUFVQyxRLEVBQVU7QUFDakMsVUFBTUksY0FBY0wsU0FBU2xELEtBQVQsS0FBbUJtRCxTQUFTbkQsS0FBNUIsSUFBcUNrRCxTQUFTL0MsTUFBVCxLQUFvQmdELFNBQVNoRCxNQUF0RjtBQUNBLFVBQUlvRCxXQUFKLEVBQWlCO0FBQ2YsYUFBSzVCLElBQUwsQ0FBVUcsTUFBVjtBQUNEO0FBQ0Y7Ozs7O2tCQTlKa0JQLE07OztBQWlLckJBLE9BQU9uQyxTQUFQLEdBQW1CQSxTQUFuQjtBQUNBbUMsT0FBT2IsWUFBUCxHQUFzQkEsWUFBdEIiLCJmaWxlIjoibWFwYm94LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG5cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLyogZ2xvYmFsIHdpbmRvdywgZG9jdW1lbnQsIHByb2Nlc3MgKi9cbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5cbmNvbnN0IGlzQnJvd3NlciA9ICEoXG4gIHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJlxuICBTdHJpbmcocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJyAmJlxuICAhcHJvY2Vzcy5icm93c2VyXG4pO1xuXG5jb25zdCBtYXBib3hnbCA9IGlzQnJvd3NlciA/IHJlcXVpcmUoJ21hcGJveC1nbCcpIDogbnVsbDtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbmNvbnN0IHByb3BUeXBlcyA9IHtcbiAgLy8gQ3JlYXRpb24gcGFyYW1ldGVyc1xuICAvLyBjb250YWluZXI6IFByb3BUeXBlcy5ET01FbGVtZW50IHx8IFN0cmluZ1xuXG4gIG1hcGJveEFwaUFjY2Vzc1Rva2VuOiBQcm9wVHlwZXMuc3RyaW5nLCAvKiogTWFwYm94IEFQSSBhY2Nlc3MgdG9rZW4gZm9yIE1hcGJveCB0aWxlcy9zdHlsZXMuICovXG4gIGF0dHJpYnV0aW9uQ29udHJvbDogUHJvcFR5cGVzLmJvb2wsIC8qKiBTaG93IGF0dHJpYnV0aW9uIGNvbnRyb2wgb3Igbm90LiAqL1xuICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IFByb3BUeXBlcy5ib29sLCAvKiogVXNlZnVsIHdoZW4geW91IHdhbnQgdG8gZXhwb3J0IHRoZSBjYW52YXMgYXMgYSBQTkcuICovXG4gIG9uTG9hZDogUHJvcFR5cGVzLmZ1bmMsIC8qKiBUaGUgb25Mb2FkIGNhbGxiYWNrIGZvciB0aGUgbWFwICovXG4gIG9uRXJyb3I6IFByb3BUeXBlcy5mdW5jLCAvKiogVGhlIG9uRXJyb3IgY2FsbGJhY2sgZm9yIHRoZSBtYXAgKi9cbiAgcmV1c2VNYXBzOiBQcm9wVHlwZXMuYm9vbCxcblxuICBtYXBTdHlsZTogUHJvcFR5cGVzLnN0cmluZywgLyoqIFRoZSBNYXBib3ggc3R5bGUuIEEgc3RyaW5nIHVybCB0byBhIE1hcGJveEdMIHN0eWxlICovXG4gIHZpc2libGU6IFByb3BUeXBlcy5ib29sLCAvKiogV2hldGhlciB0aGUgbWFwIGlzIHZpc2libGUgKi9cblxuICAvLyBNYXAgdmlldyBzdGF0ZVxuICB3aWR0aDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLCAvKiogVGhlIHdpZHRoIG9mIHRoZSBtYXAuICovXG4gIGhlaWdodDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLCAvKiogVGhlIGhlaWdodCBvZiB0aGUgbWFwLiAqL1xuICBsb25naXR1ZGU6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCwgLyoqIFRoZSBsb25naXR1ZGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgbWFwLiAqL1xuICBsYXRpdHVkZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLCAvKiogVGhlIGxhdGl0dWRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIG1hcC4gKi9cbiAgem9vbTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLCAvKiogVGhlIHRpbGUgem9vbSBsZXZlbCBvZiB0aGUgbWFwLiAqL1xuICBiZWFyaW5nOiBQcm9wVHlwZXMubnVtYmVyLCAvKiogU3BlY2lmeSB0aGUgYmVhcmluZyBvZiB0aGUgdmlld3BvcnQgKi9cbiAgcGl0Y2g6IFByb3BUeXBlcy5udW1iZXIsIC8qKiBTcGVjaWZ5IHRoZSBwaXRjaCBvZiB0aGUgdmlld3BvcnQgKi9cblxuICAvLyBOb3RlOiBOb24tcHVibGljIEFQSSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LWdsLWpzL2lzc3Vlcy8xMTM3XG4gIGFsdGl0dWRlOiBQcm9wVHlwZXMubnVtYmVyIC8qKiBBbHRpdHVkZSBvZiB0aGUgdmlld3BvcnQgY2FtZXJhLiBEZWZhdWx0IDEuNSBcInNjcmVlbiBoZWlnaHRzXCIgKi9cbn07XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgbWFwYm94QXBpQWNjZXNzVG9rZW46IGdldEFjY2Vzc1Rva2VuKCksXG4gIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogZmFsc2UsXG4gIGF0dHJpYnV0aW9uQ29udHJvbDogdHJ1ZSxcbiAgcHJldmVudFN0eWxlRGlmZmluZzogZmFsc2UsXG4gIG9uTG9hZDogbm9vcCxcbiAgb25FcnJvcjogbm9vcCxcbiAgcmV1c2VNYXBzOiBmYWxzZSxcblxuICBtYXBTdHlsZTogJ21hcGJveDovL3N0eWxlcy9tYXBib3gvbGlnaHQtdjgnLFxuICB2aXNpYmxlOiB0cnVlLFxuXG4gIGJlYXJpbmc6IDAsXG4gIHBpdGNoOiAwLFxuICBhbHRpdHVkZTogMS41XG59O1xuXG4vLyBUcnkgdG8gZ2V0IGFjY2VzcyB0b2tlbiBmcm9tIFVSTCwgZW52LCBsb2NhbCBzdG9yYWdlIG9yIGNvbmZpZ1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFjY2Vzc1Rva2VuKCkge1xuICBsZXQgYWNjZXNzVG9rZW4gPSBudWxsO1xuXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cubG9jYXRpb24pIHtcbiAgICBjb25zdCBtYXRjaCA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gubWF0Y2goL2FjY2Vzc190b2tlbj0oW14mXFwvXSopLyk7XG4gICAgYWNjZXNzVG9rZW4gPSBtYXRjaCAmJiBtYXRjaFsxXTtcbiAgfVxuXG4gIGlmICghYWNjZXNzVG9rZW4gJiYgdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gTm90ZTogVGhpcyBkZXBlbmRzIG9uIGJ1bmRsZXIgcGx1Z2lucyAoZS5nLiB3ZWJwYWNrKSBpbm1wb3J0aW5nIGVudmlyb25tZW50IGNvcnJlY3RseVxuICAgIGFjY2Vzc1Rva2VuID0gYWNjZXNzVG9rZW4gfHwgcHJvY2Vzcy5lbnYuTWFwYm94QWNjZXNzVG9rZW47IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgfVxuXG4gIHJldHVybiBhY2Nlc3NUb2tlbiB8fCBudWxsO1xufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gbWVyZ2UgZGVmYXVsdFByb3BzIGFuZCBjaGVjayBwcm9wIHR5cGVzXG5mdW5jdGlvbiBjaGVja1Byb3BUeXBlcyhwcm9wcywgY29tcG9uZW50ID0gJ2NvbXBvbmVudCcpIHtcbiAgLy8gVE9ETyAtIGNoZWNrIGZvciBwcm9kdWN0aW9uICh1bmxlc3MgZG9uZSBieSBwcm9wIHR5cGVzIHBhY2thZ2U/KVxuICBpZiAocHJvcHMuZGVidWcpIHtcbiAgICBQcm9wVHlwZXMuY2hlY2tQcm9wVHlwZXMocHJvcFR5cGVzLCBwcm9wcywgJ3Byb3AnLCBjb21wb25lbnQpO1xuICB9XG59XG5cbi8vIEEgc21hbGwgd3JhcHBlciBjbGFzcyBmb3IgbWFwYm94LWdsXG4vLyAtIFByb3ZpZGVzIGEgcHJvcCBzdHlsZSBpbnRlcmZhY2UgKHRoYXQgY2FuIGJlIHRyaXZpYWxseSB1c2VkIGJ5IGEgUmVhY3Qgd3JhcHBlcilcbi8vIC0gTWFrZXMgc3VyZSBtYXBib3ggZG9lc24ndCBjcmFzaCB1bmRlciBOb2RlXG4vLyAtIEhhbmRsZXMgbWFwIHJldXNlICh0byB3b3JrIGFyb3VuZCBNYXBib3ggcmVzb3VyY2UgbGVhayBpc3N1ZXMpXG4vLyAtIFByb3ZpZGVzIHN1cHBvcnQgZm9yIHNwZWNpZnlpbmcgdG9rZW5zIGR1cmluZyBkZXZlbG9wbWVudFxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXBib3gge1xuICBzdGF0aWMgc3VwcG9ydGVkKCkge1xuICAgIHJldHVybiBtYXBib3hnbCAmJiBtYXBib3hnbC5zdXBwb3J0ZWQoKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgaWYgKCFtYXBib3hnbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNYXBib3ggbm90IHN1cHBvcnRlZCcpO1xuICAgIH1cblxuICAgIHRoaXMucHJvcHMgPSB7fTtcbiAgICB0aGlzLl9pbml0aWFsaXplKHByb3BzKTtcbiAgfVxuXG4gIGZpbmFsaXplKCkge1xuICAgIGlmICghbWFwYm94Z2wgfHwgIXRoaXMuX21hcCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5fZGVzdHJveSgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0UHJvcHMocHJvcHMpIHtcbiAgICBpZiAoIW1hcGJveGdsIHx8ICF0aGlzLl9tYXApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZSh0aGlzLnByb3BzLCBwcm9wcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBNYXBib3gncyBtYXAucmVzaXplKCkgcmVhZHMgc2l6ZSBmcm9tIERPTSwgc28gRE9NIGVsZW1lbnQgbXVzdCBhbHJlYWR5IGJlIHJlc2l6ZWRcbiAgLy8gSW4gYSBzeXN0ZW0gbGlrZSBSZWFjdCB3ZSBtdXN0IHdhaXQgdG8gcmVhZCBzaXplIHVudGlsIGFmdGVyIHJlbmRlclxuICAvLyAoZS5nLiB1bnRpbCBcImNvbXBvbmVudERpZFVwZGF0ZVwiKVxuICByZXNpemUoKSB7XG4gICAgaWYgKCFtYXBib3hnbCB8fCAhdGhpcy5fbWFwKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLl9tYXAucmVzaXplKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBFeHRlcm5hbCBhcHBzIGNhbiBhY2Nlc3MgbWFwIHRoaXMgd2F5XG4gIGdldE1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwO1xuICB9XG5cbiAgLy8gUFJJVkFURSBBUElcblxuICBfY3JlYXRlKHByb3BzKSB7XG4gICAgLy8gUmV1c2UgYSBzYXZlZCBtYXAsIGlmIGF2YWlsYWJsZVxuICAgIGlmIChwcm9wcy5yZXVzZU1hcHMgJiYgTWFwYm94LnNhdmVkTWFwKSB7XG4gICAgICB0aGlzLl9tYXAgPSB0aGlzLm1hcCA9IE1hcGJveC5zYXZlZE1hcDtcbiAgICAgIE1hcGJveC5zYXZlZE1hcCA9IG51bGw7XG4gICAgICAvLyBUT0RPIC0gbmVlZCB0byBjYWxsIG9ubG9hZCBhZ2FpbiwgbmVlZCB0byB0cmFjayB3aXRoIFByb21pc2U/XG4gICAgICBwcm9wcy5vbkxvYWQoKTtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ1JldXNlZCBleGlzdGluZyBtYXBib3ggbWFwJywgdGhpcy5fbWFwKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9tYXAgPSB0aGlzLm1hcCA9IG5ldyBtYXBib3hnbC5NYXAoe1xuICAgICAgICBjb250YWluZXI6IHByb3BzLmNvbnRhaW5lciB8fCBkb2N1bWVudC5ib2R5LFxuICAgICAgICBjZW50ZXI6IFtwcm9wcy5sb25naXR1ZGUsIHByb3BzLmxhdGl0dWRlXSxcbiAgICAgICAgem9vbTogcHJvcHMuem9vbSxcbiAgICAgICAgcGl0Y2g6IHByb3BzLnBpdGNoLFxuICAgICAgICBiZWFyaW5nOiBwcm9wcy5iZWFyaW5nLFxuICAgICAgICBzdHlsZTogcHJvcHMubWFwU3R5bGUsXG4gICAgICAgIGludGVyYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgYXR0cmlidXRpb25Db250cm9sOiBwcm9wcy5hdHRyaWJ1dGlvbkNvbnRyb2wsXG4gICAgICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogcHJvcHMucHJlc2VydmVEcmF3aW5nQnVmZmVyXG4gICAgICB9KTtcbiAgICAgIC8vIEF0dGFjaCBvcHRpb25hbCBvbkxvYWQgZnVuY3Rpb25cbiAgICAgIHRoaXMubWFwLm9uY2UoJ2xvYWQnLCBwcm9wcy5vbkxvYWQpO1xuICAgICAgdGhpcy5tYXAub24oJ2Vycm9yJywgcHJvcHMub25FcnJvcik7XG4gICAgICBjb25zb2xlLmRlYnVnKCdDcmVhdGVkIG5ldyBtYXBib3ggbWFwJywgdGhpcy5fbWFwKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2Rlc3Ryb3koKSB7XG4gICAgaWYgKCFNYXBib3guc2F2ZWRNYXApIHtcbiAgICAgIE1hcGJveC5zYXZlZE1hcCA9IHRoaXMuX21hcDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbWFwLnJlbW92ZSgpO1xuICAgIH1cbiAgfVxuXG4gIF9pbml0aWFsaXplKHByb3BzKSB7XG4gICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0UHJvcHMsIHByb3BzKTtcbiAgICBjaGVja1Byb3BUeXBlcyhwcm9wcywgJ01hcGJveCcpO1xuXG4gICAgLy8gTWFrZSBlbXB0eSBzdHJpbmcgcGljayB1cCBkZWZhdWx0IHByb3BcbiAgICB0aGlzLmFjY2Vzc1Rva2VuID0gcHJvcHMubWFwYm94QXBpQWNjZXNzVG9rZW4gfHwgZGVmYXVsdFByb3BzLm1hcGJveEFwaUFjY2Vzc1Rva2VuO1xuXG4gICAgLy8gQ3JlYXRpb24gb25seSBwcm9wc1xuICAgIGlmIChtYXBib3hnbCkge1xuICAgICAgaWYgKCF0aGlzLmFjY2Vzc1Rva2VuKSB7XG4gICAgICAgIG1hcGJveGdsLmFjY2Vzc1Rva2VuID0gJ25vLXRva2VuJzsgLy8gUHJldmVudHMgbWFwYm94IGZyb20gdGhyb3dpbmdcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcGJveGdsLmFjY2Vzc1Rva2VuID0gdGhpcy5hY2Nlc3NUb2tlbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9jcmVhdGUocHJvcHMpO1xuXG4gICAgLy8gRGlzYWJsZSBvdXRsaW5lIHN0eWxlXG4gICAgY29uc3QgY2FudmFzID0gdGhpcy5tYXAuZ2V0Q2FudmFzKCk7XG4gICAgaWYgKGNhbnZhcykge1xuICAgICAgY2FudmFzLnN0eWxlLm91dGxpbmUgPSAnbm9uZSc7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlTWFwVmlld3BvcnQoe30sIHByb3BzKTtcbiAgICB0aGlzLl91cGRhdGVNYXBTaXplKHt9LCBwcm9wcyk7XG5cbiAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gIH1cblxuICBfdXBkYXRlKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIG5ld1Byb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wcm9wcywgbmV3UHJvcHMpO1xuICAgIGNoZWNrUHJvcFR5cGVzKG5ld1Byb3BzLCAnTWFwYm94Jyk7XG5cbiAgICB0aGlzLl91cGRhdGVNYXBWaWV3cG9ydChvbGRQcm9wcywgbmV3UHJvcHMpO1xuICAgIHRoaXMuX3VwZGF0ZU1hcFNpemUob2xkUHJvcHMsIG5ld1Byb3BzKTtcblxuICAgIHRoaXMucHJvcHMgPSBuZXdQcm9wcztcbiAgfVxuXG4gIF91cGRhdGVNYXBWaWV3cG9ydChvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBjb25zdCB2aWV3cG9ydENoYW5nZWQgPVxuICAgICAgbmV3UHJvcHMubGF0aXR1ZGUgIT09IG9sZFByb3BzLmxhdGl0dWRlIHx8XG4gICAgICBuZXdQcm9wcy5sb25naXR1ZGUgIT09IG9sZFByb3BzLmxvbmdpdHVkZSB8fFxuICAgICAgbmV3UHJvcHMuem9vbSAhPT0gb2xkUHJvcHMuem9vbSB8fFxuICAgICAgbmV3UHJvcHMucGl0Y2ggIT09IG9sZFByb3BzLnBpdGNoIHx8XG4gICAgICBuZXdQcm9wcy5iZWFyaW5nICE9PSBvbGRQcm9wcy5iZWFyaW5nIHx8XG4gICAgICBuZXdQcm9wcy5hbHRpdHVkZSAhPT0gb2xkUHJvcHMuYWx0aXR1ZGU7XG5cbiAgICBpZiAodmlld3BvcnRDaGFuZ2VkKSB7XG4gICAgICB0aGlzLl9tYXAuanVtcFRvKHtcbiAgICAgICAgY2VudGVyOiBbbmV3UHJvcHMubG9uZ2l0dWRlLCBuZXdQcm9wcy5sYXRpdHVkZV0sXG4gICAgICAgIHpvb206IG5ld1Byb3BzLnpvb20sXG4gICAgICAgIGJlYXJpbmc6IG5ld1Byb3BzLmJlYXJpbmcsXG4gICAgICAgIHBpdGNoOiBuZXdQcm9wcy5waXRjaFxuICAgICAgfSk7XG5cbiAgICAgIC8vIFRPRE8gLSBqdW1wVG8gZG9lc24ndCBoYW5kbGUgYWx0aXR1ZGVcbiAgICAgIGlmIChuZXdQcm9wcy5hbHRpdHVkZSAhPT0gb2xkUHJvcHMuYWx0aXR1ZGUpIHtcbiAgICAgICAgdGhpcy5fbWFwLnRyYW5zZm9ybS5hbHRpdHVkZSA9IG5ld1Byb3BzLmFsdGl0dWRlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIE5vdGU6IG5lZWRzIHRvIGJlIGNhbGxlZCBhZnRlciByZW5kZXIgKGUuZy4gaW4gY29tcG9uZW50RGlkVXBkYXRlKVxuICBfdXBkYXRlTWFwU2l6ZShvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBjb25zdCBzaXplQ2hhbmdlZCA9IG9sZFByb3BzLndpZHRoICE9PSBuZXdQcm9wcy53aWR0aCB8fCBvbGRQcm9wcy5oZWlnaHQgIT09IG5ld1Byb3BzLmhlaWdodDtcbiAgICBpZiAoc2l6ZUNoYW5nZWQpIHtcbiAgICAgIHRoaXMuX21hcC5yZXNpemUoKTtcbiAgICB9XG4gIH1cbn1cblxuTWFwYm94LnByb3BUeXBlcyA9IHByb3BUeXBlcztcbk1hcGJveC5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG4iXX0=