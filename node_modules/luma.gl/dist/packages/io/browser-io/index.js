'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.browserFs = exports.loadFile = undefined;

var _browserRequest = require('./browser-request');

Object.defineProperty(exports, 'loadFile', {
  enumerable: true,
  get: function get() {
    return _browserRequest.loadFile;
  }
});

var _browserImageIo = require('./browser-image-io');

Object.keys(_browserImageIo).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _browserImageIo[key];
    }
  });
});

var _browserFs = require('./browser-fs');

var browserFs = _interopRequireWildcard(_browserFs);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.browserFs = browserFs;
//# sourceMappingURL=index.js.map