'use strict';

require('../../../src/headless');

var _io = require('../../../src/io');

var _setup = require('../../setup');

var _setup2 = _interopRequireDefault(_setup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable quotes */
var PNG_BITS = 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQIW2P8z/D/PwMDAwMjjAEAQOwF/W1Dp54AAAAASUVORK5CYII=';
/* eslint-enable quotes */

var DATA_URL = 'data:image/png;base64,' + PNG_BITS;

(0, _setup2.default)('io#read-image', function (t) {
  (0, _io.loadImage)(DATA_URL).then(function (image) {
    t.equals(image.width, 2, 'width');
    t.equals(image.height, 2, 'height');
    t.end();
  });
});
//# sourceMappingURL=read-image.js.map