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
import { GL, Framebuffer, Model, Geometry } from 'luma.gl';
import { Effect } from '../../lib';
import { WebMercatorViewport } from '../../../lib/viewports';

import reflectionVertex from './reflection-effect-vertex.glsl';
import reflectionFragment from './reflection-effect-fragment.glsl';

var ReflectionEffect = function (_Effect) {
  _inherits(ReflectionEffect, _Effect);

  /**
   * @classdesc
   * ReflectionEffect
   *
   * @class
   * @param reflectivity How visible reflections should be over the map, between 0 and 1
   * @param blur how blurry the reflection should be, between 0 and 1
   */

  function ReflectionEffect() {
    var reflectivity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.5;
    var blur = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.5;

    _classCallCheck(this, ReflectionEffect);

    var _this = _possibleConstructorReturn(this, (ReflectionEffect.__proto__ || Object.getPrototypeOf(ReflectionEffect)).call(this));

    _this.reflectivity = reflectivity;
    _this.blur = blur;
    _this.framebuffer = null;
    _this.setNeedsRedraw();
    return _this;
  }

  _createClass(ReflectionEffect, [{
    key: 'getShaders',
    value: function getShaders() {
      return {
        vs: reflectionVertex,
        fs: reflectionFragment,
        modules: [],
        shaderCache: this.context.shaderCache
      };
    }
  }, {
    key: 'initialize',
    value: function initialize(_ref) {
      var gl = _ref.gl,
          layerManager = _ref.layerManager;

      this.unitQuad = new Model(gl, Object.assign({}, this.getShaders(), {
        id: 'reflection-effect',
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_FAN,
          vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0])
        })
      }));
      this.framebuffer = new Framebuffer(gl, { depth: true });
    }
  }, {
    key: 'preDraw',
    value: function preDraw(_ref2) {
      var gl = _ref2.gl,
          layerManager = _ref2.layerManager;
      var viewport = layerManager.context.viewport;
      /*
       * the renderer already has a reference to this, but we don't have a reference to the renderer.
       * when we refactor the camera code, we should make sure we get a reference to the renderer so
       * that we can keep this in one place.
       */

      var dpi = typeof window !== 'undefined' && window.devicePixelRatio || 1;
      this.framebuffer.resize({ width: dpi * viewport.width, height: dpi * viewport.height });
      var pitch = viewport.pitch;
      this.framebuffer.bind();
      /* this is a huge hack around the existing viewport class.
       * TODO in the future, once we implement bona-fide cameras, we really need to fix this.
       */
      layerManager.setViewport(new WebMercatorViewport(Object.assign({}, viewport, { pitch: -180 - pitch })));
      gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

      layerManager.drawLayers({ pass: 'reflection' });
      layerManager.setViewport(viewport);
      this.framebuffer.unbind();
    }
  }, {
    key: 'draw',
    value: function draw(_ref3) {
      var gl = _ref3.gl,
          layerManager = _ref3.layerManager;

      /*
       * Render our unit quad.
       * This will cover the entire screen, but will lie behind all other geometry.
       * This quad will sample the previously generated reflection texture
       * in order to create the reflection effect
       */
      this.unitQuad.render({
        reflectionTexture: this.framebuffer.texture,
        reflectionTextureWidth: this.framebuffer.width,
        reflectionTextureHeight: this.framebuffer.height,
        reflectivity: this.reflectivity,
        blur: this.blur
      });
    }
  }, {
    key: 'finalize',
    value: function finalize(_ref4) {
      /* TODO: Free resources? */

      var gl = _ref4.gl,
          layerManager = _ref4.layerManager;
    }
  }]);

  return ReflectionEffect;
}(Effect);

export default ReflectionEffect;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9leHBlcmltZW50YWwvZWZmZWN0cy9yZWZsZWN0aW9uLWVmZmVjdC9yZWZsZWN0aW9uLWVmZmVjdC5qcyJdLCJuYW1lcyI6WyJHTCIsIkZyYW1lYnVmZmVyIiwiTW9kZWwiLCJHZW9tZXRyeSIsIkVmZmVjdCIsIldlYk1lcmNhdG9yVmlld3BvcnQiLCJyZWZsZWN0aW9uVmVydGV4IiwicmVmbGVjdGlvbkZyYWdtZW50IiwiUmVmbGVjdGlvbkVmZmVjdCIsInJlZmxlY3Rpdml0eSIsImJsdXIiLCJmcmFtZWJ1ZmZlciIsInNldE5lZWRzUmVkcmF3IiwidnMiLCJmcyIsIm1vZHVsZXMiLCJzaGFkZXJDYWNoZSIsImNvbnRleHQiLCJnbCIsImxheWVyTWFuYWdlciIsInVuaXRRdWFkIiwiT2JqZWN0IiwiYXNzaWduIiwiZ2V0U2hhZGVycyIsImlkIiwiZ2VvbWV0cnkiLCJkcmF3TW9kZSIsIlRSSUFOR0xFX0ZBTiIsInZlcnRpY2VzIiwiRmxvYXQzMkFycmF5IiwiZGVwdGgiLCJ2aWV3cG9ydCIsImRwaSIsIndpbmRvdyIsImRldmljZVBpeGVsUmF0aW8iLCJyZXNpemUiLCJ3aWR0aCIsImhlaWdodCIsInBpdGNoIiwiYmluZCIsInNldFZpZXdwb3J0IiwiY2xlYXIiLCJDT0xPUl9CVUZGRVJfQklUIiwiREVQVEhfQlVGRkVSX0JJVCIsImRyYXdMYXllcnMiLCJwYXNzIiwidW5iaW5kIiwicmVuZGVyIiwicmVmbGVjdGlvblRleHR1cmUiLCJ0ZXh0dXJlIiwicmVmbGVjdGlvblRleHR1cmVXaWR0aCIsInJlZmxlY3Rpb25UZXh0dXJlSGVpZ2h0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUUEsRUFBUixFQUFZQyxXQUFaLEVBQXlCQyxLQUF6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TCxDQUFjMkIsTUFBZCxDQUFxQjtBQUNuQkMsMkJBQW1CLEtBQUtyQyxXQUFMLENBQWlCc0MsT0FEakI7QUFFbkJDLGdDQUF3QixLQUFLdkMsV0FBTCxDQUFpQnlCLEtBRnRCO0FBR25CZSxpQ0FBeUIsS0FBS3hDLFdBQUwsQ0FBaUIwQixNQUh2QjtBQUluQjVCLHNCQUFjLEtBQUtBLFlBSkE7QUFLbkJDLGNBQU0sS0FBS0E7QUFMUSxPQUFyQjtBQU9EOzs7b0NBRTRCO0FBQzNCOztBQUQyQixVQUFuQlEsRUFBbUIsU0FBbkJBLEVBQW1CO0FBQUEsVUFBZkMsWUFBZSxTQUFmQSxZQUFlO0FBRTVCOzs7O0VBbEYyQ2YsTTs7ZUFBekJJLGdCIiwiZmlsZSI6InJlZmxlY3Rpb24tZWZmZWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8qIGdsb2JhbCB3aW5kb3cgKi9cbmltcG9ydCB7R0wsIEZyYW1lYnVmZmVyLCBNb2RlbCwgR2VvbWV0cnl9IGZyb20gJ2x1bWEuZ2wnO1xuaW1wb3J0IHtFZmZlY3R9IGZyb20gJy4uLy4uL2xpYic7XG5pbXBvcnQge1dlYk1lcmNhdG9yVmlld3BvcnR9IGZyb20gJy4uLy4uLy4uL2xpYi92aWV3cG9ydHMnO1xuXG5pbXBvcnQgcmVmbGVjdGlvblZlcnRleCBmcm9tICcuL3JlZmxlY3Rpb24tZWZmZWN0LXZlcnRleC5nbHNsJztcbmltcG9ydCByZWZsZWN0aW9uRnJhZ21lbnQgZnJvbSAnLi9yZWZsZWN0aW9uLWVmZmVjdC1mcmFnbWVudC5nbHNsJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVmbGVjdGlvbkVmZmVjdCBleHRlbmRzIEVmZmVjdCB7XG5cbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogUmVmbGVjdGlvbkVmZmVjdFxuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHJlZmxlY3Rpdml0eSBIb3cgdmlzaWJsZSByZWZsZWN0aW9ucyBzaG91bGQgYmUgb3ZlciB0aGUgbWFwLCBiZXR3ZWVuIDAgYW5kIDFcbiAgICogQHBhcmFtIGJsdXIgaG93IGJsdXJyeSB0aGUgcmVmbGVjdGlvbiBzaG91bGQgYmUsIGJldHdlZW4gMCBhbmQgMVxuICAgKi9cblxuICBjb25zdHJ1Y3RvcihyZWZsZWN0aXZpdHkgPSAwLjUsIGJsdXIgPSAwLjUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucmVmbGVjdGl2aXR5ID0gcmVmbGVjdGl2aXR5O1xuICAgIHRoaXMuYmx1ciA9IGJsdXI7XG4gICAgdGhpcy5mcmFtZWJ1ZmZlciA9IG51bGw7XG4gICAgdGhpcy5zZXROZWVkc1JlZHJhdygpO1xuICB9XG5cbiAgZ2V0U2hhZGVycygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdnM6IHJlZmxlY3Rpb25WZXJ0ZXgsXG4gICAgICBmczogcmVmbGVjdGlvbkZyYWdtZW50LFxuICAgICAgbW9kdWxlczogW10sXG4gICAgICBzaGFkZXJDYWNoZTogdGhpcy5jb250ZXh0LnNoYWRlckNhY2hlXG4gICAgfTtcbiAgfVxuXG4gIGluaXRpYWxpemUoe2dsLCBsYXllck1hbmFnZXJ9KSB7XG4gICAgdGhpcy51bml0UXVhZCA9IG5ldyBNb2RlbChnbCwgT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTaGFkZXJzKCksIHtcbiAgICAgIGlkOiAncmVmbGVjdGlvbi1lZmZlY3QnLFxuICAgICAgZ2VvbWV0cnk6IG5ldyBHZW9tZXRyeSh7XG4gICAgICAgIGRyYXdNb2RlOiBHTC5UUklBTkdMRV9GQU4sXG4gICAgICAgIHZlcnRpY2VzOiBuZXcgRmxvYXQzMkFycmF5KFswLCAwLCAwLCAxLCAwLCAwLCAxLCAxLCAwLCAwLCAxLCAwXSlcbiAgICAgIH0pXG4gICAgfSkpO1xuICAgIHRoaXMuZnJhbWVidWZmZXIgPSBuZXcgRnJhbWVidWZmZXIoZ2wsIHtkZXB0aDogdHJ1ZX0pO1xuXG4gIH1cblxuICBwcmVEcmF3KHtnbCwgbGF5ZXJNYW5hZ2VyfSkge1xuICAgIGNvbnN0IHt2aWV3cG9ydH0gPSBsYXllck1hbmFnZXIuY29udGV4dDtcbiAgICAvKlxuICAgICAqIHRoZSByZW5kZXJlciBhbHJlYWR5IGhhcyBhIHJlZmVyZW5jZSB0byB0aGlzLCBidXQgd2UgZG9uJ3QgaGF2ZSBhIHJlZmVyZW5jZSB0byB0aGUgcmVuZGVyZXIuXG4gICAgICogd2hlbiB3ZSByZWZhY3RvciB0aGUgY2FtZXJhIGNvZGUsIHdlIHNob3VsZCBtYWtlIHN1cmUgd2UgZ2V0IGEgcmVmZXJlbmNlIHRvIHRoZSByZW5kZXJlciBzb1xuICAgICAqIHRoYXQgd2UgY2FuIGtlZXAgdGhpcyBpbiBvbmUgcGxhY2UuXG4gICAgICovXG4gICAgY29uc3QgZHBpID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKSB8fCAxO1xuICAgIHRoaXMuZnJhbWVidWZmZXIucmVzaXplKHt3aWR0aDogZHBpICogdmlld3BvcnQud2lkdGgsIGhlaWdodDogZHBpICogdmlld3BvcnQuaGVpZ2h0fSk7XG4gICAgY29uc3QgcGl0Y2ggPSB2aWV3cG9ydC5waXRjaDtcbiAgICB0aGlzLmZyYW1lYnVmZmVyLmJpbmQoKTtcbiAgICAvKiB0aGlzIGlzIGEgaHVnZSBoYWNrIGFyb3VuZCB0aGUgZXhpc3Rpbmcgdmlld3BvcnQgY2xhc3MuXG4gICAgICogVE9ETyBpbiB0aGUgZnV0dXJlLCBvbmNlIHdlIGltcGxlbWVudCBib25hLWZpZGUgY2FtZXJhcywgd2UgcmVhbGx5IG5lZWQgdG8gZml4IHRoaXMuXG4gICAgICovXG4gICAgbGF5ZXJNYW5hZ2VyLnNldFZpZXdwb3J0KFxuICAgICAgbmV3IFdlYk1lcmNhdG9yVmlld3BvcnQoT2JqZWN0LmFzc2lnbih7fSwgdmlld3BvcnQsIHtwaXRjaDogLTE4MCAtIHBpdGNofSkpXG4gICAgKTtcbiAgICBnbC5jbGVhcihHTC5DT0xPUl9CVUZGRVJfQklUIHwgR0wuREVQVEhfQlVGRkVSX0JJVCk7XG5cbiAgICBsYXllck1hbmFnZXIuZHJhd0xheWVycyh7cGFzczogJ3JlZmxlY3Rpb24nfSk7XG4gICAgbGF5ZXJNYW5hZ2VyLnNldFZpZXdwb3J0KHZpZXdwb3J0KTtcbiAgICB0aGlzLmZyYW1lYnVmZmVyLnVuYmluZCgpO1xuICB9XG5cbiAgZHJhdyh7Z2wsIGxheWVyTWFuYWdlcn0pIHtcbiAgICAvKlxuICAgICAqIFJlbmRlciBvdXIgdW5pdCBxdWFkLlxuICAgICAqIFRoaXMgd2lsbCBjb3ZlciB0aGUgZW50aXJlIHNjcmVlbiwgYnV0IHdpbGwgbGllIGJlaGluZCBhbGwgb3RoZXIgZ2VvbWV0cnkuXG4gICAgICogVGhpcyBxdWFkIHdpbGwgc2FtcGxlIHRoZSBwcmV2aW91c2x5IGdlbmVyYXRlZCByZWZsZWN0aW9uIHRleHR1cmVcbiAgICAgKiBpbiBvcmRlciB0byBjcmVhdGUgdGhlIHJlZmxlY3Rpb24gZWZmZWN0XG4gICAgICovXG4gICAgdGhpcy51bml0UXVhZC5yZW5kZXIoe1xuICAgICAgcmVmbGVjdGlvblRleHR1cmU6IHRoaXMuZnJhbWVidWZmZXIudGV4dHVyZSxcbiAgICAgIHJlZmxlY3Rpb25UZXh0dXJlV2lkdGg6IHRoaXMuZnJhbWVidWZmZXIud2lkdGgsXG4gICAgICByZWZsZWN0aW9uVGV4dHVyZUhlaWdodDogdGhpcy5mcmFtZWJ1ZmZlci5oZWlnaHQsXG4gICAgICByZWZsZWN0aXZpdHk6IHRoaXMucmVmbGVjdGl2aXR5LFxuICAgICAgYmx1cjogdGhpcy5ibHVyXG4gICAgfSk7XG4gIH1cblxuICBmaW5hbGl6ZSh7Z2wsIGxheWVyTWFuYWdlcn0pIHtcbiAgICAvKiBUT0RPOiBGcmVlIHJlc291cmNlcz8gKi9cbiAgfVxufVxuIl19