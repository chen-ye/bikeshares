'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _context = require('./context');

var _resource = require('./resource');

var _resource2 = _interopRequireDefault(_resource);

var _queryManager = require('./helpers/query-manager');

var _queryManager2 = _interopRequireDefault(_queryManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FenceSync = /*#__PURE__*/function (_Resource) {
  _inherits(FenceSync, _Resource);

  /*
   * @class
   * @param {WebGL2RenderingContext} gl
   */
  function FenceSync(gl, opts) {
    _classCallCheck(this, FenceSync);

    (0, _context.assertWebGL2Context)(gl);

    // query manager needs a promise field
    var _this = _possibleConstructorReturn(this, (FenceSync.__proto__ || Object.getPrototypeOf(FenceSync)).call(this, gl, opts));

    _this.promise = null;
    Object.seal(_this);
    return _this;
  }

  /**
   * The method is a no-op in the absence of the possibility of
   * synchronizing between multiple GL contexts.
   * Prevent commands from being added to GPU command queue.
   * Note: commands can still be buffered in driver.
   *
   * @param {GLbitfield} flags
   * @param {GLint64} timeout
   * @return {Sync} status
   */


  _createClass(FenceSync, [{
    key: 'wait',
    value: function wait() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$flags = _ref.flags,
          flags = _ref$flags === undefined ? 0 : _ref$flags,
          _ref$timeout = _ref.timeout,
          timeout = _ref$timeout === undefined ? _api2.default.TIMEOUT_IGNORED : _ref$timeout;

      this.gl.waitSync(this.handle, flags, timeout);
      return this;
    }

    /**
     * Block all CPU operations until fence is signalled
     * @param {GLbitfield} flags
     * @param {GLint64} timeout
     * @return {GLenum} result
     */

  }, {
    key: 'clientWait',
    value: function clientWait(_ref2) {
      var _ref2$flags = _ref2.flags,
          flags = _ref2$flags === undefined ? _api2.default.SYNC_FLUSH_COMMANDS_BIT : _ref2$flags,
          timeout = _ref2.timeout;

      var result = this.gl.clientWaitSync(this.handle, flags, timeout);
      // TODO - map to boolean?
      switch (result) {
        case _api2.default.ALREADY_SIGNALED:
          // Indicates that sync object was signaled when this method was called.
          break;
        case _api2.default.TIMEOUT_EXPIRED:
          // Indicates that timeout time passed, sync object did not become signaled
          break;
        case _api2.default.CONDITION_SATISFIED:
          // Indicates that sync object was signaled before timeout expired.
          break;
        case _api2.default.WAIT_FAILED:
          // Indicates that an error occurred during execution.
          break;
        default:
      }
      return result;
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      _queryManager2.default.cancelQuery(this);
    }
  }, {
    key: 'isSignaled',
    value: function isSignaled() {
      return this.getParameter(_api2.default.SYNC_STATUS) === _api2.default.SIGNALED;
    }

    // TODO - Query manager needs these?

  }, {
    key: 'isResultAvailable',
    value: function isResultAvailable() {
      return this.isSignaled();
    }
  }, {
    key: 'getResult',
    value: function getResult() {
      return this.isSignaled();
    }
  }, {
    key: 'getParameter',
    value: function getParameter(pname) {
      return this.gl.getSyncParameter(this.handle, pname);
    }

    // PRIVATE METHODS

  }, {
    key: '_createHandle',
    value: function _createHandle() {
      return this.gl.fenceSync(_api2.default.SYNC_GPU_COMMANDS_COMPLETE, 0);
    }
  }, {
    key: '_deleteHandle',
    value: function _deleteHandle() {
      _queryManager2.default.deleteQuery(this);
      this.gl.deleteSync(this.handle);
    }
  }]);

  return FenceSync;
}(_resource2.default);

exports.default = FenceSync;
//# sourceMappingURL=fence-sync.js.map