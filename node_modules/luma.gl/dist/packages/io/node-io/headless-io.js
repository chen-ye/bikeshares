'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compressImage = compressImage;
exports.loadImage = loadImage;

var _savePixels = require('save-pixels');

var _savePixels2 = _interopRequireDefault(_savePixels);

var _getPixels = require('get-pixels');

var _getPixels2 = _interopRequireDefault(_getPixels);

var _ndarray = require('ndarray');

var _ndarray2 = _interopRequireDefault(_ndarray);

var _fs = require('fs');

var _utils = require('../../utils');

var _init = require('../../init');

var _init2 = _interopRequireDefault(_init);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns data bytes representing a compressed image in PNG or JPG format,
 * This data can be saved using file system (f) methods or
 * used in a request.
 * @param {Image} image to save
 * @param {String} type='png' - png, jpg or image/png, image/jpg are valid
 * @param {String} opt.dataURI= - Whether to include a data URI header
 * @return {*} bytes
 */
// Use stackgl modules for DOM-less reading and writing of images
// NOTE: These are not dependencies of luma.gl.
// They need to be imported by the app.
function compressImage(image) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'png';

  return (0, _savePixels2.default)((0, _ndarray2.default)(image.data, [image.width, image.height, 4], [4, image.width * 4, 1], 0), type.replace('image/', ''));
}

var getPixelsAsync = (0, _utils.promisify)(_getPixels2.default);

function loadImage(url) {
  return getPixelsAsync(url);
}

_init2.default.globals.modules.getPixels = _getPixels2.default;
_init2.default.globals.modules.savePixels = _savePixels2.default;
_init2.default.globals.modules.ndarray = _ndarray2.default;

_init2.default.globals.nodeIO = {
  readFile: _fs.readFile,
  writeFile: _fs.writeFile,
  compressImage: compressImage,
  loadImage: loadImage
};
//# sourceMappingURL=headless-io.js.map