'use strict';

var _setup = require('../setup');

var _setup2 = _interopRequireDefault(_setup);

var _src = require('../../src');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TEST_DIR = _path2.default.join(__dirname, '..', 'data');
var TEST_FILE = _path2.default.join(TEST_DIR, 'test.png');

var IMAGE = {
  width: 2,
  height: 3,
  data: new Uint8Array([255, 0, 0, 255, 0, 255, 255, 255, 0, 0, 255, 255, 255, 255, 0, 255, 0, 255, 0, 255, 255, 0, 255, 255])
};

// Test that we can write and read an image, and that result is identical
(0, _setup2.default)('io#write-read-image', async function (t) {
  await (0, _src.promisify)(_mkdirp2.default)(TEST_DIR);
  var file = _fs2.default.createWriteStream(TEST_FILE);
  file.on('close', async function () {
    var result = await (0, _src.loadImage)(TEST_FILE);
    t.same(result, IMAGE);
    t.end();
  });
  (0, _src.compressImage)(IMAGE).pipe(file);
});
//# sourceMappingURL=write-read-image.js.map