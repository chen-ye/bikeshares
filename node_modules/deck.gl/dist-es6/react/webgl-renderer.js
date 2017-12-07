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

/* global window */
import React, { createElement } from 'react';
import PropTypes from 'prop-types';
import autobind from './autobind';
import { createGLContext, setParameters } from 'luma.gl';
/* global requestAnimationFrame, cancelAnimationFrame */

var propTypes = {
  id: PropTypes.string.isRequired,

  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  useDevicePixelRatio: PropTypes.bool.isRequired,
  style: PropTypes.object,

  events: PropTypes.object,
  gl: PropTypes.object,
  glOptions: PropTypes.object,
  debug: PropTypes.bool,

  onInitializationFailed: PropTypes.func,
  onRendererInitialized: PropTypes.func.isRequired,
  onRenderFrame: PropTypes.func
};

var defaultProps = {
  style: {},
  gl: null,
  glOptions: { preserveDrawingBuffer: true },
  debug: false,

  onInitializationFailed: function onInitializationFailed(error) {
    throw error;
  },
  onRendererInitialized: function onRendererInitialized() {},
  onRenderFrame: function onRenderFrame() {}
};

var WebGLRenderer = function (_React$Component) {
  _inherits(WebGLRenderer, _React$Component);

  /**
   * @classdesc
   * Small react component that uses Luma.GL to initialize a WebGL context.
   *
   * Returns a canvas, creates a basic WebGL context
   * sets up a renderloop, and registers some basic event handlers
   *
   * @class
   * @param {Object} props - see propTypes documentation
   */
  function WebGLRenderer(props) {
    _classCallCheck(this, WebGLRenderer);

    var _this = _possibleConstructorReturn(this, (WebGLRenderer.__proto__ || Object.getPrototypeOf(WebGLRenderer)).call(this, props));

    _this.state = {};
    _this._animationFrame = null;
    _this.gl = null;
    autobind(_this);
    return _this;
  }

  _createClass(WebGLRenderer, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var canvas = this.refs.overlay;
      this._initWebGL(canvas);
      this._animationLoop();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._cancelAnimationLoop();
    }

    /**
     * Initialize LumaGL library and through it WebGL
     * @param {string} canvas
     */

  }, {
    key: '_initWebGL',
    value: function _initWebGL(canvas) {
      var _props = this.props,
          debug = _props.debug,
          glOptions = _props.glOptions;

      // Create context if not supplied

      var gl = this.props.gl;
      if (!gl) {
        try {
          gl = createGLContext(Object.assign({ canvas: canvas, debug: debug }, glOptions));
        } catch (error) {
          this.props.onInitializationFailed(error);
          return;
        }
      }

      this.gl = gl;

      // Call callback last, in case it throws
      this.props.onRendererInitialized({ canvas: canvas, gl: gl });
    }

    /**
     * Main WebGL animation loop
     */

  }, {
    key: '_animationLoop',
    value: function _animationLoop() {
      this._renderFrame();
      // Keep registering ourselves for the next animation frame
      if (typeof window !== 'undefined') {
        this._animationFrame = requestAnimationFrame(this._animationLoop);
      }
    }
  }, {
    key: '_cancelAnimationLoop',
    value: function _cancelAnimationLoop() {
      if (this._animationFrame) {
        cancelAnimationFrame(this._animationFrame);
      }
    }

    // Calculate the drawing buffer size that would cover current canvas size and device pixel ratio
    // Intention is that every pixel in the drawing buffer will have a 1-to-1 mapping with
    // actual device pixels in the hardware framebuffer, allowing us to render at the full
    // resolution of the device.

  }, {
    key: '_calculateDrawingBufferSize',
    value: function _calculateDrawingBufferSize(canvas, _ref) {
      var _ref$useDevicePixelRa = _ref.useDevicePixelRatio,
          useDevicePixelRatio = _ref$useDevicePixelRa === undefined ? true : _ref$useDevicePixelRa;

      var cssToDevicePixels = useDevicePixelRatio ? window.devicePixelRatio || 1 : 1;
      // Lookup the size the browser is displaying the canvas in CSS pixels
      // and compute a size needed to make our drawingbuffer match it in
      // device pixels.
      // We have set the canvas width and hieht from props, use props instead of accessing
      // canvas.clientWidth/clientHeight for performance reasons.
      var _props2 = this.props,
          width = _props2.width,
          height = _props2.height;

      return {
        width: Math.floor(width * cssToDevicePixels),
        height: Math.floor(height * cssToDevicePixels),
        devicePixelRatio: cssToDevicePixels
      };
    }

    // Resizes canvas width and height to match with device drawing buffer

  }, {
    key: '_resizeDrawingBuffer',
    value: function _resizeDrawingBuffer(canvas, _ref2) {
      var _ref2$useDevicePixelR = _ref2.useDevicePixelRatio,
          useDevicePixelRatio = _ref2$useDevicePixelR === undefined ? true : _ref2$useDevicePixelR;

      // Resize the render buffer of the canvas to match canvas client size
      // multiplying with dpr (Optionally can be turned off)
      var newBufferSize = this._calculateDrawingBufferSize(canvas, { useDevicePixelRatio: useDevicePixelRatio });
      // Only update if the canvas size has not changed
      if (newBufferSize.width !== canvas.width || newBufferSize.height !== canvas.height) {
        // Note: canvas.width, canvas.height control the size of backing drawing buffer
        // and can be set indepently of canvas.clientWidth and canvas.clientHeight
        // which confusingly reflect canvas.style.width, canvas.style.height
        canvas.width = newBufferSize.width;
        canvas.height = newBufferSize.height;
      }
    }
  }, {
    key: '_renderFrame',
    value: function _renderFrame() {
      var _props3 = this.props,
          width = _props3.width,
          height = _props3.height,
          useDevicePixelRatio = _props3.useDevicePixelRatio;
      var gl = this.gl;

      // Check for reasons not to draw

      if (!gl || !(width > 0) || !(height > 0)) {
        return;
      }

      this._resizeDrawingBuffer(gl.canvas, { useDevicePixelRatio: useDevicePixelRatio });

      // Updates WebGL viewport to latest props
      setParameters(gl, {
        viewport: [0, 0, gl.canvas.width, gl.canvas.height]
      });

      // Call render callback
      this.props.onRenderFrame({ gl: gl });

      this.props.onAfterRender(this.refs.overlay);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props4 = this.props,
          id = _props4.id,
          width = _props4.width,
          height = _props4.height,
          style = _props4.style;

      return createElement('canvas', {
        ref: 'overlay',
        key: 'overlay',
        id: id,
        style: Object.assign({}, style, { width: width, height: height })
      });
    }
  }]);

  return WebGLRenderer;
}(React.Component);

export default WebGLRenderer;


WebGLRenderer.propTypes = propTypes;
WebGLRenderer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZWFjdC93ZWJnbC1yZW5kZXJlci5qcyJdLCJuYW1lcyI6WyJSZWFjdCIsImNyZWF0ZUVsZW1lbnQiLCJQcm9wVHlwZXMiLCJhdXRvYmluZCIsImNyZWF0ZUdMQ29udGV4dCIsInNldFBhcmFtZXRlcnMiLCJwcm9wVHlwZXMiLCJpZCIsInN0cmluZyIsImlzUmVxdWlyZWQiLCJ3aWR0aCIsIm51bWJlciIsImhlaWdodCIsInVzZURldmljZVBpeGVsUmF0aW8iLCJib29sIiwic3R5bGUiLCJvYmplY3QiLCJldmVudHMiLCJnbCIsImdsT3B0aW9ucyIsImRlYnVnIiwib25Jbml0aWFsaXphdGlvbkZhaWxlZCIsImZ1bmMiLCJvblJlbmRlcmVySW5pdGlhbGl6ZWQiLCJvblJlbmRlckZyYW1lIiwiZGVmYXVsdFByb3BzIiwicHJlc2VydmVEcmF3aW5nQnVmZmVyIiwiZXJyb3IiLCJXZWJHTFJlbmRlcmVyIiwicHJvcHMiLCJzdGF0ZSIsIl9hbmltYXRpb25GcmFtZSIsImNhbnZhcyIsInJlZnMiLCJvdmVybGF5IiwiX2luaXRXZWJHTCIsIl9hbmltYXRpb25Mb29wIiwiX2NhbmNlbEFuaW1hdGlvbkxvb3AiLCJPYmplY3QiLCJhc3NpZ24iLCJfcmVuZGVyRnJhbWUiLCJ3aW5kb3ciLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsImNzc1RvRGV2aWNlUGl4ZWxzIiwiZGV2aWNlUGl4ZWxSYXRpbyIsIk1hdGgiLCJmbG9vciIsIm5ld0J1ZmZlclNpemUiLCJfY2FsY3VsYXRlRHJhd2luZ0J1ZmZlclNpemUiLCJfcmVzaXplRHJhd2luZ0J1ZmZlciIsInZpZXdwb3J0Iiwib25BZnRlclJlbmRlciIsInJlZiIsImtleSIsIkNvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8qIGdsb2JhbCB3aW5kb3cgKi9cbmltcG9ydCBSZWFjdCwge2NyZWF0ZUVsZW1lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgYXV0b2JpbmQgZnJvbSAnLi9hdXRvYmluZCc7XG5pbXBvcnQge2NyZWF0ZUdMQ29udGV4dCwgc2V0UGFyYW1ldGVyc30gZnJvbSAnbHVtYS5nbCc7XG4vKiBnbG9iYWwgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLCBjYW5jZWxBbmltYXRpb25GcmFtZSAqL1xuXG5jb25zdCBwcm9wVHlwZXMgPSB7XG4gIGlkOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cbiAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIHVzZURldmljZVBpeGVsUmF0aW86IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gIHN0eWxlOiBQcm9wVHlwZXMub2JqZWN0LFxuXG4gIGV2ZW50czogUHJvcFR5cGVzLm9iamVjdCxcbiAgZ2w6IFByb3BUeXBlcy5vYmplY3QsXG4gIGdsT3B0aW9uczogUHJvcFR5cGVzLm9iamVjdCxcbiAgZGVidWc6IFByb3BUeXBlcy5ib29sLFxuXG4gIG9uSW5pdGlhbGl6YXRpb25GYWlsZWQ6IFByb3BUeXBlcy5mdW5jLFxuICBvblJlbmRlcmVySW5pdGlhbGl6ZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIG9uUmVuZGVyRnJhbWU6IFByb3BUeXBlcy5mdW5jXG59O1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIHN0eWxlOiB7fSxcbiAgZ2w6IG51bGwsXG4gIGdsT3B0aW9uczoge3ByZXNlcnZlRHJhd2luZ0J1ZmZlcjogdHJ1ZX0sXG4gIGRlYnVnOiBmYWxzZSxcblxuICBvbkluaXRpYWxpemF0aW9uRmFpbGVkOiBlcnJvciA9PiB7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH0sXG4gIG9uUmVuZGVyZXJJbml0aWFsaXplZDogKCkgPT4ge30sXG4gIG9uUmVuZGVyRnJhbWU6ICgpID0+IHt9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXZWJHTFJlbmRlcmVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogU21hbGwgcmVhY3QgY29tcG9uZW50IHRoYXQgdXNlcyBMdW1hLkdMIHRvIGluaXRpYWxpemUgYSBXZWJHTCBjb250ZXh0LlxuICAgKlxuICAgKiBSZXR1cm5zIGEgY2FudmFzLCBjcmVhdGVzIGEgYmFzaWMgV2ViR0wgY29udGV4dFxuICAgKiBzZXRzIHVwIGEgcmVuZGVybG9vcCwgYW5kIHJlZ2lzdGVycyBzb21lIGJhc2ljIGV2ZW50IGhhbmRsZXJzXG4gICAqXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcHMgLSBzZWUgcHJvcFR5cGVzIGRvY3VtZW50YXRpb25cbiAgICovXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICB0aGlzLl9hbmltYXRpb25GcmFtZSA9IG51bGw7XG4gICAgdGhpcy5nbCA9IG51bGw7XG4gICAgYXV0b2JpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCBjYW52YXMgPSB0aGlzLnJlZnMub3ZlcmxheTtcbiAgICB0aGlzLl9pbml0V2ViR0woY2FudmFzKTtcbiAgICB0aGlzLl9hbmltYXRpb25Mb29wKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLl9jYW5jZWxBbmltYXRpb25Mb29wKCk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBMdW1hR0wgbGlicmFyeSBhbmQgdGhyb3VnaCBpdCBXZWJHTFxuICAgKiBAcGFyYW0ge3N0cmluZ30gY2FudmFzXG4gICAqL1xuICBfaW5pdFdlYkdMKGNhbnZhcykge1xuICAgIGNvbnN0IHtkZWJ1ZywgZ2xPcHRpb25zfSA9IHRoaXMucHJvcHM7XG5cbiAgICAvLyBDcmVhdGUgY29udGV4dCBpZiBub3Qgc3VwcGxpZWRcbiAgICBsZXQgZ2wgPSB0aGlzLnByb3BzLmdsO1xuICAgIGlmICghZ2wpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGdsID0gY3JlYXRlR0xDb250ZXh0KE9iamVjdC5hc3NpZ24oe2NhbnZhcywgZGVidWd9LCBnbE9wdGlvbnMpKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25Jbml0aWFsaXphdGlvbkZhaWxlZChlcnJvcik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmdsID0gZ2w7XG5cbiAgICAvLyBDYWxsIGNhbGxiYWNrIGxhc3QsIGluIGNhc2UgaXQgdGhyb3dzXG4gICAgdGhpcy5wcm9wcy5vblJlbmRlcmVySW5pdGlhbGl6ZWQoe2NhbnZhcywgZ2x9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYWluIFdlYkdMIGFuaW1hdGlvbiBsb29wXG4gICAqL1xuICBfYW5pbWF0aW9uTG9vcCgpIHtcbiAgICB0aGlzLl9yZW5kZXJGcmFtZSgpO1xuICAgIC8vIEtlZXAgcmVnaXN0ZXJpbmcgb3Vyc2VsdmVzIGZvciB0aGUgbmV4dCBhbmltYXRpb24gZnJhbWVcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuX2FuaW1hdGlvbkZyYW1lID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX2FuaW1hdGlvbkxvb3ApO1xuICAgIH1cbiAgfVxuXG4gIF9jYW5jZWxBbmltYXRpb25Mb29wKCkge1xuICAgIGlmICh0aGlzLl9hbmltYXRpb25GcmFtZSkge1xuICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fYW5pbWF0aW9uRnJhbWUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIENhbGN1bGF0ZSB0aGUgZHJhd2luZyBidWZmZXIgc2l6ZSB0aGF0IHdvdWxkIGNvdmVyIGN1cnJlbnQgY2FudmFzIHNpemUgYW5kIGRldmljZSBwaXhlbCByYXRpb1xuICAvLyBJbnRlbnRpb24gaXMgdGhhdCBldmVyeSBwaXhlbCBpbiB0aGUgZHJhd2luZyBidWZmZXIgd2lsbCBoYXZlIGEgMS10by0xIG1hcHBpbmcgd2l0aFxuICAvLyBhY3R1YWwgZGV2aWNlIHBpeGVscyBpbiB0aGUgaGFyZHdhcmUgZnJhbWVidWZmZXIsIGFsbG93aW5nIHVzIHRvIHJlbmRlciBhdCB0aGUgZnVsbFxuICAvLyByZXNvbHV0aW9uIG9mIHRoZSBkZXZpY2UuXG4gIF9jYWxjdWxhdGVEcmF3aW5nQnVmZmVyU2l6ZShjYW52YXMsIHt1c2VEZXZpY2VQaXhlbFJhdGlvID0gdHJ1ZX0pIHtcbiAgICBjb25zdCBjc3NUb0RldmljZVBpeGVscyA9IHVzZURldmljZVBpeGVsUmF0aW8gPyB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxIDogMTtcbiAgICAvLyBMb29rdXAgdGhlIHNpemUgdGhlIGJyb3dzZXIgaXMgZGlzcGxheWluZyB0aGUgY2FudmFzIGluIENTUyBwaXhlbHNcbiAgICAvLyBhbmQgY29tcHV0ZSBhIHNpemUgbmVlZGVkIHRvIG1ha2Ugb3VyIGRyYXdpbmdidWZmZXIgbWF0Y2ggaXQgaW5cbiAgICAvLyBkZXZpY2UgcGl4ZWxzLlxuICAgIC8vIFdlIGhhdmUgc2V0IHRoZSBjYW52YXMgd2lkdGggYW5kIGhpZWh0IGZyb20gcHJvcHMsIHVzZSBwcm9wcyBpbnN0ZWFkIG9mIGFjY2Vzc2luZ1xuICAgIC8vIGNhbnZhcy5jbGllbnRXaWR0aC9jbGllbnRIZWlnaHQgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMuXG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHR9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IE1hdGguZmxvb3Iod2lkdGggKiBjc3NUb0RldmljZVBpeGVscyksXG4gICAgICBoZWlnaHQ6IE1hdGguZmxvb3IoaGVpZ2h0ICogY3NzVG9EZXZpY2VQaXhlbHMpLFxuICAgICAgZGV2aWNlUGl4ZWxSYXRpbzogY3NzVG9EZXZpY2VQaXhlbHNcbiAgICB9O1xuICB9XG5cbiAgLy8gUmVzaXplcyBjYW52YXMgd2lkdGggYW5kIGhlaWdodCB0byBtYXRjaCB3aXRoIGRldmljZSBkcmF3aW5nIGJ1ZmZlclxuICBfcmVzaXplRHJhd2luZ0J1ZmZlcihjYW52YXMsIHt1c2VEZXZpY2VQaXhlbFJhdGlvID0gdHJ1ZX0pIHtcbiAgICAvLyBSZXNpemUgdGhlIHJlbmRlciBidWZmZXIgb2YgdGhlIGNhbnZhcyB0byBtYXRjaCBjYW52YXMgY2xpZW50IHNpemVcbiAgICAvLyBtdWx0aXBseWluZyB3aXRoIGRwciAoT3B0aW9uYWxseSBjYW4gYmUgdHVybmVkIG9mZilcbiAgICBjb25zdCBuZXdCdWZmZXJTaXplID0gdGhpcy5fY2FsY3VsYXRlRHJhd2luZ0J1ZmZlclNpemUoY2FudmFzLCB7dXNlRGV2aWNlUGl4ZWxSYXRpb30pO1xuICAgIC8vIE9ubHkgdXBkYXRlIGlmIHRoZSBjYW52YXMgc2l6ZSBoYXMgbm90IGNoYW5nZWRcbiAgICBpZiAobmV3QnVmZmVyU2l6ZS53aWR0aCAhPT0gY2FudmFzLndpZHRoIHx8IG5ld0J1ZmZlclNpemUuaGVpZ2h0ICE9PSBjYW52YXMuaGVpZ2h0KSB7XG4gICAgICAvLyBOb3RlOiBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQgY29udHJvbCB0aGUgc2l6ZSBvZiBiYWNraW5nIGRyYXdpbmcgYnVmZmVyXG4gICAgICAvLyBhbmQgY2FuIGJlIHNldCBpbmRlcGVudGx5IG9mIGNhbnZhcy5jbGllbnRXaWR0aCBhbmQgY2FudmFzLmNsaWVudEhlaWdodFxuICAgICAgLy8gd2hpY2ggY29uZnVzaW5nbHkgcmVmbGVjdCBjYW52YXMuc3R5bGUud2lkdGgsIGNhbnZhcy5zdHlsZS5oZWlnaHRcbiAgICAgIGNhbnZhcy53aWR0aCA9IG5ld0J1ZmZlclNpemUud2lkdGg7XG4gICAgICBjYW52YXMuaGVpZ2h0ID0gbmV3QnVmZmVyU2l6ZS5oZWlnaHQ7XG4gICAgfVxuICB9XG5cbiAgX3JlbmRlckZyYW1lKCkge1xuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0LCB1c2VEZXZpY2VQaXhlbFJhdGlvfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge2dsfSA9IHRoaXM7XG5cbiAgICAvLyBDaGVjayBmb3IgcmVhc29ucyBub3QgdG8gZHJhd1xuICAgIGlmICghZ2wgfHwgISh3aWR0aCA+IDApIHx8ICEoaGVpZ2h0ID4gMCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9yZXNpemVEcmF3aW5nQnVmZmVyKGdsLmNhbnZhcywge3VzZURldmljZVBpeGVsUmF0aW99KTtcblxuICAgIC8vIFVwZGF0ZXMgV2ViR0wgdmlld3BvcnQgdG8gbGF0ZXN0IHByb3BzXG4gICAgc2V0UGFyYW1ldGVycyhnbCwge1xuICAgICAgdmlld3BvcnQ6IFswLCAwLCBnbC5jYW52YXMud2lkdGgsIGdsLmNhbnZhcy5oZWlnaHRdXG4gICAgfSk7XG5cbiAgICAvLyBDYWxsIHJlbmRlciBjYWxsYmFja1xuICAgIHRoaXMucHJvcHMub25SZW5kZXJGcmFtZSh7Z2x9KTtcblxuICAgIHRoaXMucHJvcHMub25BZnRlclJlbmRlcih0aGlzLnJlZnMub3ZlcmxheSk7XG5cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7aWQsIHdpZHRoLCBoZWlnaHQsIHN0eWxlfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycsIHtcbiAgICAgIHJlZjogJ292ZXJsYXknLFxuICAgICAga2V5OiAnb3ZlcmxheScsXG4gICAgICBpZCxcbiAgICAgIHN0eWxlOiBPYmplY3QuYXNzaWduKHt9LCBzdHlsZSwge3dpZHRoLCBoZWlnaHR9KVxuICAgIH0pO1xuICB9XG59XG5cbldlYkdMUmVuZGVyZXIucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuV2ViR0xSZW5kZXJlci5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG4iXX0=