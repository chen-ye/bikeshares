'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = formatGLSLCompilerError;

var _api = require('../api');

var _api2 = _interopRequireDefault(_api);

var _glslShaderName = require('glsl-shader-name');

var _glslShaderName2 = _interopRequireDefault(_glslShaderName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Formats a GLSL shader compiler error and generates a string
 * showing the source code around the error.
 *
 * From https://github.com/wwwtyro/gl-format-compiler-error (public domain)
 *
 * @param {String} errLog - error log from gl.getShaderInfoLog
 * @param {String} src - original shader source code
 * @param {Number} shaderType - shader type (GL constant)
 * @return {String} - Formatted strings has the error marked inline with src.
 */
/* eslint-disable no-continue, max-statements */
function formatGLSLCompilerError(errLog, src, shaderType) {
  var errorStrings = errLog.split(/\r?\n/);
  var errors = {};

  // Parse the error - note: browser and driver dependent
  for (var i = 0; i < errorStrings.length; i++) {
    var errorString = errorStrings[i];
    if (errorString.length <= 1) {
      continue;
    }
    var lineNo = parseInt(errorString.split(':')[2], 10);
    if (isNaN(lineNo)) {
      return 'Could not parse GLSL compiler error: ' + errLog;
    }
    errors[lineNo] = errorString;
  }

  // Format the error inline with the code
  var message = '';
  var lines = addLineNumbers(src).split(/\r?\n/);

  for (var _i = 0; _i < lines.length; _i++) {
    var line = lines[_i];
    if (!errors[_i + 3] && !errors[_i + 2] && !errors[_i + 1]) {
      continue;
    }
    message += line + '\n';
    if (errors[_i + 1]) {
      var e = errors[_i + 1];
      e = e.substr(e.split(':', 3).join(':').length + 1).trim();
      message += '^^^ ' + e + '\n\n';
    }
  }

  var name = (0, _glslShaderName2.default)(src) || 'unknown name (see npm glsl-shader-name)';
  var type = getShaderTypeName(shaderType);
  return 'GLSL error in ' + type + ' shader ' + name + '\n' + message;
}

/**
 * Prepends line numbers to each line of a string.
 * The line numbers will be left-padded with spaces to ensure an
 * aligned layout when rendered using monospace fonts.
 *
 * Adapted from https://github.com/Jam3/add-line-numbers, MIT license
 *
 * @param {String} string - multi-line string to add line numbers to
 * @param {Number} start=1 - number of spaces to add
 * @param {String} delim =': ' - injected between line number and original line
 * @return {String} string - The original string with line numbers added
 */
function addLineNumbers(string) {
  var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var delim = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ': ';

  var lines = string.split(/\r?\n/);
  var maxDigits = String(lines.length + start - 1).length;
  return lines.map(function (line, i) {
    var lineNumber = i + start;
    var digits = String(lineNumber).length;
    var prefix = padLeft(lineNumber, maxDigits - digits);
    return prefix + delim + line;
  }).join('\n');
}

/**
 * Pads a string with a number of spaces (space characters) to the left
 * @param {String} string - string to pad
 * @param {Number} digits - number of spaces to add
 * @return {String} string - The padded string
 */
function padLeft(string, digits) {
  var result = '';
  for (var i = 0; i < digits; ++i) {
    result += ' ';
  }
  return '' + result + string;
}

function getShaderTypeName(type) {
  switch (type) {
    case _api2.default.FRAGMENT_SHADER:
      return 'fragment';
    case _api2.default.VERTEX_SHADER:
      return 'vertex';
    default:
      return 'unknown type';
  }
}
//# sourceMappingURL=format-glsl-error.js.map