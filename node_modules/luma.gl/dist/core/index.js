'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _animationLoop = require('./animation-loop');

Object.defineProperty(exports, 'AnimationLoop', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_animationLoop).default;
  }
});
Object.defineProperty(exports, 'requestAnimationFrame', {
  enumerable: true,
  get: function get() {
    return _animationLoop.requestAnimationFrame;
  }
});
Object.defineProperty(exports, 'cancelAnimationFrame', {
  enumerable: true,
  get: function get() {
    return _animationLoop.cancelAnimationFrame;
  }
});

var _model = require('./model');

Object.defineProperty(exports, 'Model', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_model).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=index.js.map