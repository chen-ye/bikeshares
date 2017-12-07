'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PICKING_RES = exports.MAX_POINT_LIGHTS = exports.MAX_TEXTURES = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _math = require('../packages/math');

var _utils = require('../utils');

var _group = require('../core/group');

var _group2 = _interopRequireDefault(_group);

var _pickModels2 = require('../core/pick-models');

var _pickModels3 = _interopRequireDefault(_pickModels2);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Scene Object management and rendering
/* eslint-disable max-statements, no-try-catch */

var MAX_TEXTURES = exports.MAX_TEXTURES = 10;
var MAX_POINT_LIGHTS = exports.MAX_POINT_LIGHTS = 4;
var PICKING_RES = exports.PICKING_RES = 4;

var INVALID_ARGUMENT = 'LumaGL.Scene invalid argument';

var DEFAULT_SCENE_OPTS = {
  lights: {
    enable: false,
    // ambient light
    ambient: { r: 0.2, g: 0.2, b: 0.2 },
    // directional light
    directional: {
      direction: { x: 1, y: 1, z: 1 },
      color: { r: 0, g: 0, b: 0 }
      // point light
      // points: []
    } },
  effects: {
    fog: false
    // { near, far, color }
  },
  clearColor: true,
  clearDepth: true,
  backgroundColor: { r: 0, g: 0, b: 0, a: 1 },
  backgroundDepth: 1
};

// Scene class

var Scene = function (_Group) {
  _inherits(Scene, _Group);

  function Scene(gl, opts) {
    _classCallCheck(this, Scene);

    (0, _assert2.default)(gl, INVALID_ARGUMENT);

    opts = (0, _utils.merge)(DEFAULT_SCENE_OPTS, opts);

    var _this = _possibleConstructorReturn(this, (Scene.__proto__ || Object.getPrototypeOf(Scene)).call(this, opts));

    _this.gl = gl;
    _this.config = opts;
    _this.needsRedraw = false;
    Object.seal(_this);
    return _this;
  }

  _createClass(Scene, [{
    key: 'setNeedsRedraw',
    value: function setNeedsRedraw() {
      var redraw = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this.needsRedraw = redraw;
      return this;
    }
  }, {
    key: 'getNeedsRedraw',
    value: function getNeedsRedraw() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$clearRedrawFlags = _ref.clearRedrawFlags,
          clearRedrawFlags = _ref$clearRedrawFlags === undefined ? false : _ref$clearRedrawFlags;

      var redraw = false;
      redraw = redraw || this.needsRedraw;
      this.needsRedraw = this.needsRedraw && !clearRedrawFlags;
      this.traverse(function (model) {
        redraw = redraw || model.getNeedsRedraw({ clearRedrawFlags: clearRedrawFlags });
      });
      return redraw;
    }
  }, {
    key: 'clear',
    value: function clear() {
      var gl = this.gl;

      if (this.config.clearColor) {
        var bg = this.config.backgroundColor;
        gl.clearColor(bg.r, bg.g, bg.b, bg.a);
      }
      if (this.config.clearDepth) {
        gl.clearDepth(this.config.backgroundDepth);
      }
      if (this.config.clearColor && this.config.clearDepth) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      } else if (this.config.clearColor) {
        gl.clear(gl.COLOR_BUFFER_BIT);
      } else if (this.config.clearDepth) {
        gl.clear(gl.DEPTH_BUFFER_BIT);
      }
      return this;
    }

    // Renders all objects in the scene.

  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var uniforms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.clear();
      // Go through each model and render it.
      this.traverse(function (model) {
        if (model.display) {
          _this2.renderObject({ model: model, uniforms: uniforms });
        }
      });
      return this;
    }
  }, {
    key: 'renderObject',
    value: function renderObject(_ref2) {
      var model = _ref2.model,
          uniforms = _ref2.uniforms;

      // Setup lighting and scene effects like fog, etc.
      uniforms = Object.assign({}, this.getSceneUniforms(), uniforms);
      model.render(uniforms);
      return this;
    }
  }, {
    key: 'pickModels',
    value: function pickModels() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var x = opts.x,
          y = opts.y,
          _opts$uniforms = opts.uniforms,
          uniforms = _opts$uniforms === undefined ? {} : _opts$uniforms;

      return (0, _pickModels3.default)(this.gl, Object.assign({
        group: this,
        position: [x, y],
        uniforms: uniforms
      }, opts));
    }

    // Setup the lighting system: ambient, directional, point lights.

  }, {
    key: 'getSceneUniforms',
    value: function getSceneUniforms() {
      // Setup Lighting
      var _config$lights = this.config.lights,
          enable = _config$lights.enable,
          ambient = _config$lights.ambient,
          directional = _config$lights.directional,
          points = _config$lights.points;

      // Set light uniforms. Ambient and directional lights.

      return Object.assign({}, this.getEffectsUniforms(), { enableLights: enable }, enable && ambient ? this.getAmbientUniforms(ambient) : {}, enable && directional ? this.getDirectionalUniforms(directional) : {}, enable && points ? this.getPointUniforms(points) : {});
    }
  }, {
    key: 'getAmbientUniforms',
    value: function getAmbientUniforms(ambient) {
      return {
        ambientColor: [ambient.r, ambient.g, ambient.b]
      };
    }
  }, {
    key: 'getDirectionalUniforms',
    value: function getDirectionalUniforms(directional) {
      var color = directional.color,
          direction = directional.direction;

      // Normalize lighting direction vector

      var dir = new _math.Vector3(direction.x, direction.y, direction.z).normalize().scale(-1, -1, -1);

      return {
        directionalColor: [color.r, color.g, color.b],
        lightingDirection: [dir.x, dir.y, dir.z]
      };
    }
  }, {
    key: 'getPointUniforms',
    value: function getPointUniforms(points) {
      points = points instanceof Array ? points : [points];
      var numberPoints = points.length;
      var uniforms = { numberPoints: numberPoints };

      var pointLocations = [];
      var pointColors = [];
      var enableSpecular = [];
      var pointSpecularColors = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = points[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var point = _step.value;
          var position = point.position,
              color = point.color,
              diffuse = point.diffuse,
              specular = point.specular;

          var pointColor = color || diffuse;

          pointLocations.push(position.x, position.y, position.z);
          pointColors.push(pointColor.r, pointColor.g, pointColor.b);

          // Add specular color
          enableSpecular.push(Number(Boolean(specular)));
          if (specular) {
            pointSpecularColors.push(specular.r, specular.g, specular.b);
          } else {
            pointSpecularColors.push(0, 0, 0);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (pointLocations.length) {
        Object.assign(uniforms, {
          pointLocation: pointLocations,
          pointColor: pointColors,
          enableSpecular: enableSpecular,
          pointSpecularColor: pointSpecularColors
        });
      }

      return uniforms;
    }

    // Setup effects like fog, etc.

  }, {
    key: 'getEffectsUniforms',
    value: function getEffectsUniforms() {
      var fog = this.config.effects.fog;


      if (fog) {
        var _fog$color = fog.color,
            color = _fog$color === undefined ? { r: 0.5, g: 0.5, b: 0.5 } : _fog$color;

        return {
          hasFog: true,
          fogNear: fog.near,
          fogFar: fog.far,
          fogColor: [color.r, color.g, color.b]
        };
      }
      return { hasFog: false };
    }
  }]);

  return Scene;
}(_group2.default);

exports.default = Scene;


Scene.MAX_TEXTURES = 4;
Scene.MAX_POINT_LIGHTS = 4;
Scene.PICKING_RES = 4;
//# sourceMappingURL=scene.js.map