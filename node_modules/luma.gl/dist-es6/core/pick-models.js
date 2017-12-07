var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/* global window */
import { clear, isWebGL } from '../webgl';
import Group from './group';
import assert from 'assert';

var ILLEGAL_ARG = 'Illegal argument to pick';

function getDevicePixelRatio() {
  return typeof window !== 'undefined' ? window.devicePixelRatio : 1;
}

export default function pickModels(gl, _ref) {
  var models = _ref.models,
      position = _ref.position,
      _ref$uniforms = _ref.uniforms,
      uniforms = _ref$uniforms === undefined ? {} : _ref$uniforms,
      _ref$parameters = _ref.parameters,
      parameters = _ref$parameters === undefined ? {} : _ref$parameters,
      settings = _ref.settings,
      _ref$useDevicePixelRa = _ref.useDevicePixelRatio,
      useDevicePixelRatio = _ref$useDevicePixelRa === undefined ? true : _ref$useDevicePixelRa,
      framebuffer = _ref.framebuffer;

  assert(isWebGL(gl), ILLEGAL_ARG);
  assert(framebuffer, ILLEGAL_ARG);
  assert(position, ILLEGAL_ARG);

  var _position = _slicedToArray(position, 2),
      x = _position[0],
      y = _position[1];

  // Match our picking framebuffer with the size of the canvas drawing buffer


  framebuffer.resize({ width: gl.canvas.width, height: gl.canvas.height });

  // Compensate for devicePixelRatio
  // Note: this assumes the canvas framebuffer has been matched
  var dpr = useDevicePixelRatio ? getDevicePixelRatio() : 1;
  // Reverse the y coordinate
  var deviceX = x * dpr;
  var deviceY = gl.canvas.height - y * dpr;

  // return withParameters(gl, {
  //   // framebuffer,
  //   // // We are only interested in one pixel, no need to render anything else
  //   // scissorTest: {x: deviceX, y: deviceY, w: 1, h: 1}
  // }, () => {
  var group = new Group({ children: models });
  return group.traverseReverse(function (model) {

    if (model.isPickable()) {
      // Clear the frame buffer
      clear(gl, { framebuffer: framebuffer, color: true, depth: true });

      // Render picking colors
      /* eslint-disable camelcase */
      model.setUniforms({ picking_uActive: 1 });
      model.draw({ uniforms: uniforms, parameters: parameters, settings: settings, framebuffer: framebuffer });
      model.setUniforms({ picking_uActive: 0 });

      // Sample Read color in the central pixel, to be mapped as a picking color
      var color = framebuffer.readPixels({
        x: deviceX,
        y: deviceY,
        width: 1,
        height: 1,
        format: gl.RGBA,
        type: gl.UNSIGNED_BYTE });

      var isPicked = color[0] !== 0 || color[1] !== 0 || color[2] !== 0;

      // Add the information to the stack
      if (isPicked) {
        return {
          model: model,
          color: color,
          x: x,
          y: y,
          deviceX: deviceX,
          deviceY: deviceY
        };
      }
    }

    return null;
  });
  // });
}
//# sourceMappingURL=pick-models.js.map