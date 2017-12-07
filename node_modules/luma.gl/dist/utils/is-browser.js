'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// This function is needed in initialization stages,
// make sure it can be imported in isolation
/* global process */

var isNode = exports.isNode = (typeof process === 'undefined' ? 'undefined' : _typeof(process)) === 'object' && String(process) === '[object process]' && !process.browser;

var isBrowser = exports.isBrowser = !isNode;

exports.default = isBrowser;
//# sourceMappingURL=is-browser.js.map