'use strict';

require('babel-polyfill');

require('./index');

var _addons = require('./addons');

var addons = _interopRequireWildcard(_addons);

var _globals = require('./globals');

var _globals2 = _interopRequireDefault(_globals);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/* Generate pre-bundled script that can be used in browser without browserify */
/* global window */
_globals2.default.addons = addons;

// Export all LumaGL objects as members of global lumagl variable
if (typeof window !== 'undefined') {
  window.LumaGL = _globals2.default;
}
//# sourceMappingURL=bundle.js.map