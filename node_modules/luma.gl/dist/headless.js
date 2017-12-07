'use strict';

var _init = require('./init');

var _init2 = _interopRequireDefault(_init);

var _isBrowser = require('./utils/is-browser');

var _isBrowser2 = _interopRequireDefault(_isBrowser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!_isBrowser2.default) {
  _init2.default.globals.headlessGL = require('gl');
  _init2.default.globals.headlessTypes = require('gl/wrap');
  if (!_init2.default.globals.headlessTypes.WebGLRenderingContext) {
    throw new Error('Could not access headless WebGL type definitions');
  }
}

// Make sure luma.gl initializes with valid types
require('./webgl/api/types');

// Now import standard luma.gl package
// module.exports = require('./index');
//# sourceMappingURL=headless.js.map