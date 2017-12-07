'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.postProcessImage = postProcessImage;

var _webgl = require('../webgl');

var _models = require('../models');

var _camera = require('./camera');

var _scene = require('./scene');

var _scene2 = _interopRequireDefault(_scene);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// length given a 45 fov angle, and 0.2 distance to camera
var length = 0.16568542494923805; // media has utility functions for image, video and audio manipulation (and
// maybe others like device, etc).

/* eslint-disable */ // TODO - this file needs cleanup

var camera = new _camera.PerspectiveCamera({
  fov: 45,
  aspect: 1,
  near: 0.1,
  far: 500,
  position: [0, 0, 0.2]
});

// post process an image by setting it to a texture with a specified fragment
// and vertex shader.
function postProcessImage() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      program = _ref.program,
      fromTexture = _ref.fromTexture,
      toFrameBuffer = _ref.toFrameBuffer,
      toScreen = _ref.toScreen,
      width = _ref.width,
      height = _ref.height,
      _ref$viewportX = _ref.viewportX,
      viewportX = _ref$viewportX === undefined ? 0 : _ref$viewportX,
      _ref$viewportY = _ref.viewportY,
      viewportY = _ref$viewportY === undefined ? 0 : _ref$viewportY,
      _ref$aspectRatio = _ref.aspectRatio,
      aspectRatio = _ref$aspectRatio === undefined ? Math.max(height / width, width / height) : _ref$aspectRatio;

  var textures = opt.fromTexture ? (0, _utils.splat)(opt.fromTexture) : [];
  var framebuffer = opt.toFrameBuffer;
  var screen = !!opt.toScreen;
  var width = opt.width || app.canvas.width;
  var height = opt.height || app.canvas.height;
  var x = opt.viewportX;
  var y = opt.viewportY;

  var plane = new _models.Plane(gl, {
    program: program,
    type: 'x,y',
    xlen: length,
    ylen: length,
    offset: 0
  });
  plane.textures = textures;
  plane.program = program;

  camera.aspect = opt.aspectRatio;
  camera.update();

  var scene = new _scene2.default(app, program, camera);
  scene.program = program;

  if (!scene.models.length) {
    scene.add(plane);
  }

  var fbo = new FrameBuffer(framebuffer, {
    width: width,
    height: height,
    bindToTexture: {
      parameters: [{
        name: 'TEXTURE_MAG_FILTER',
        value: 'LINEAR'
      }, {
        name: 'TEXTURE_MIN_FILTER',
        value: 'LINEAR',
        mipmap: false
      }]
    },
    bindToRenderBuffer: false
  });

  fbo.bind();
  gl.viewport(x, y, width, height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  program.setUniforms(opt.uniforms || {});
  scene.renderToTexture(framebuffer);
  app.setFrameBuffer(framebuffer, false);

  if (screen) {
    program.use();
    gl.viewport(x, y, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    program.setUniforms(opt.uniforms || {});
    scene.render();
  }

  return this;
}
//# sourceMappingURL=media.js.map