'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.requestFile = requestFile;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Supports loading (requesting) assets with XHR (XmlHttpRequest)
/* eslint-disable guard-for-in, complexity, no-try-catch */

/* global XMLHttpRequest */
function noop() {}

var XHR_STATES = {
  UNINITIALIZED: 0,
  LOADING: 1,
  LOADED: 2,
  INTERACTIVE: 3,
  COMPLETED: 4
};

var XHR = function () {
  function XHR(_ref) {
    var url = _ref.url,
        _ref$path = _ref.path,
        path = _ref$path === undefined ? null : _ref$path,
        _ref$method = _ref.method,
        method = _ref$method === undefined ? 'GET' : _ref$method,
        _ref$asynchronous = _ref.asynchronous,
        asynchronous = _ref$asynchronous === undefined ? true : _ref$asynchronous,
        _ref$noCache = _ref.noCache,
        noCache = _ref$noCache === undefined ? false : _ref$noCache,
        _ref$sendAsBinary = _ref.sendAsBinary,
        sendAsBinary = _ref$sendAsBinary === undefined ? false : _ref$sendAsBinary,
        _ref$responseType = _ref.responseType,
        responseType = _ref$responseType === undefined ? false : _ref$responseType,
        _ref$onProgress = _ref.onProgress,
        onProgress = _ref$onProgress === undefined ? noop : _ref$onProgress,
        _ref$onError = _ref.onError,
        onError = _ref$onError === undefined ? noop : _ref$onError,
        _ref$onAbort = _ref.onAbort,
        onAbort = _ref$onAbort === undefined ? noop : _ref$onAbort,
        _ref$onComplete = _ref.onComplete,
        onComplete = _ref$onComplete === undefined ? noop : _ref$onComplete;

    _classCallCheck(this, XHR);

    this.url = path ? path.join(path, url) : url;
    this.method = method;
    this.async = asynchronous;
    this.noCache = noCache;
    this.sendAsBinary = sendAsBinary;
    this.responseType = responseType;

    this.req = new XMLHttpRequest();

    this.req.onload = function (e) {
      return onComplete(e);
    };
    this.req.onerror = function (e) {
      return onError(e);
    };
    this.req.onabort = function (e) {
      return onAbort(e);
    };
    this.req.onprogress = function (e) {
      if (e.lengthComputable) {
        onProgress(e, Math.round(e.loaded / e.total * 100));
      } else {
        onProgress(e, -1);
      }
    };
  }

  _createClass(XHR, [{
    key: 'setRequestHeader',
    value: function setRequestHeader(header, value) {
      this.req.setRequestHeader(header, value);
      return this;
    }

    // /* eslint-disable max-statements */

  }, {
    key: 'sendAsync',
    value: function sendAsync() {
      var _this = this;

      var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.body || null;

      return new Promise(function (resolve, reject) {
        try {
          var req = _this.req,
              method = _this.method,
              noCache = _this.noCache,
              sendAsBinary = _this.sendAsBinary,
              responseType = _this.responseType;


          var url = noCache ? _this.url + (_this.url.indexOf('?') >= 0 ? '&' : '?') + Date.now() : _this.url;

          req.open(method, url, _this.async);

          if (responseType) {
            req.responseType = responseType;
          }

          if (_this.async) {
            req.onreadystatechange = function (e) {
              if (req.readyState === XHR_STATES.COMPLETED) {
                if (req.status === 200) {
                  resolve(req.responseType ? req.response : req.responseText);
                } else {
                  reject(new Error(req.status + ': ' + url));
                }
              }
            };
          }

          if (sendAsBinary) {
            req.sendAsBinary(body);
          } else {
            req.send(body);
          }

          if (!_this.async) {
            if (req.status === 200) {
              resolve(req.responseType ? req.response : req.responseText);
            } else {
              reject(new Error(req.status + ': ' + url));
            }
          }
        } catch (error) {
          reject(error);
        }
      });
    }
    /* eslint-enable max-statements */

  }]);

  return XHR;
}();

function requestFile(opts) {
  var xhr = new XHR(opts);
  return xhr.sendAsync();
}
//# sourceMappingURL=browser-request-file.js.map