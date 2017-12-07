'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compressImage = compressImage;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _through = require('through');

var _through2 = _interopRequireDefault(_through);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Returns data bytes representing a compressed image in PNG or JPG format,
 * This data can be saved using file system (f) methods or
 * used in a request.
 * @param {Image}  image - Image or Canvas
 * @param {String} opt.type='png' - png, jpg or image/png, image/jpg are valid
 * @param {String} opt.dataURI= - Whether to include a data URI header
 */
// Image loading/saving for browser
/* global document, HTMLCanvasElement, Image */

/* global process, Buffer */
function compressImage(image, type) {
  if (image instanceof HTMLCanvasElement) {
    var _canvas = image;
    return _canvas.toDataURL(type);
  }

  (0, _assert2.default)(image instanceof Image, 'getImageData accepts image or canvas');
  var canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  canvas.getContext('2d').drawImage(image, 0, 0);

  // Get raw image data
  var data = canvas.toDataURL(type || 'png').replace(/^data:image\/(png|jpg);base64,/, '');

  // Dump data into stream and return
  var result = (0, _through2.default)();
  process.nextTick(function () {
    return result.end(new Buffer(data, 'base64'));
  });
  return result;
}
//# sourceMappingURL=browser-compress-image.js.map