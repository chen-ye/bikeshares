var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import GL from './api';
import { assertWebGL2Context } from './context';
import { getGLTypeFromTypedArray, getTypedArrayFromGLType } from '../utils/typed-array-utils';
import Resource from './resource';
import assert from 'assert';

var ERR_BUFFER_PARAMS = 'Illegal or missing parameter to Buffer';

var GL_COPY_READ_BUFFER = 0x8F36;
var GL_COPY_WRITE_BUFFER = 0x8F37;
var GL_TRANSFORM_FEEDBACK_BUFFER = 0x8C8E;

export var BufferLayout = /*#__PURE__*/
/**
 * @classdesc
 * Store characteristics of a data layout
 * This data can be used when updating vertex attributes with
 * the associated buffer, freeing the application from keeping
 * track of this metadata.
 *
 * @class
 * @param {GLuint} size - number of values per element (1-4)
 * @param {GLuint} type - type of values (e.g. gl.FLOAT)
 * @param {GLbool} normalized=false - normalize integers to [-1,1] or [0,1]
 * @param {GLuint} integer=false - WebGL2 only, int-to-float conversion
 * @param {GLuint} stride=0 - supports strided arrays
 * @param {GLuint} offset=0 - supports strided arrays
 */
function BufferLayout() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      type = _ref.type,
      _ref$size = _ref.size,
      size = _ref$size === undefined ? 1 : _ref$size,
      _ref$offset = _ref.offset,
      offset = _ref$offset === undefined ? 0 : _ref$offset,
      _ref$stride = _ref.stride,
      stride = _ref$stride === undefined ? 0 : _ref$stride,
      _ref$normalized = _ref.normalized,
      normalized = _ref$normalized === undefined ? false : _ref$normalized,
      _ref$integer = _ref.integer,
      integer = _ref$integer === undefined ? false : _ref$integer,
      _ref$instanced = _ref.instanced,
      instanced = _ref$instanced === undefined ? 0 : _ref$instanced;

  _classCallCheck(this, BufferLayout);

  this.type = type;
  this.size = size;
  this.offset = offset;
  this.stride = stride;
  this.normalized = normalized;
  this.integer = integer;
  this.instanced = instanced;
};

var Buffer = /*#__PURE__*/function (_Resource) {
  _inherits(Buffer, _Resource);

  function Buffer(gl) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Buffer);

    // In WebGL1, we need to make sure we use GL.ELEMENT_ARRAY_BUFFER when
    // initializing element buffers, otherwise the buffer type will be locked
    // to a generic (non-element) buffer.
    // In WebGL2, we can use GL_COPY_READ_BUFFER which avoids locking the type here
    var _this = _possibleConstructorReturn(this, (Buffer.__proto__ || Object.getPrototypeOf(Buffer)).call(this, gl, opts));

    _this.target = opts.target || (_this.gl.webgl2 ? GL_COPY_READ_BUFFER : GL.ARRAY_BUFFER);
    _this.index = null;
    _this.setData(opts);
    Object.seal(_this);
    return _this;
  }

  // Stores the layout of data with the buffer, makes it easy to e.g. set it as an attribute later


  _createClass(Buffer, [{
    key: 'setDataLayout',
    value: function setDataLayout(_ref2) {
      var layout = _ref2.layout,
          type = _ref2.type,
          _ref2$size = _ref2.size,
          size = _ref2$size === undefined ? 1 : _ref2$size,
          _ref2$offset = _ref2.offset,
          offset = _ref2$offset === undefined ? 0 : _ref2$offset,
          _ref2$stride = _ref2.stride,
          stride = _ref2$stride === undefined ? 0 : _ref2$stride,
          _ref2$normalized = _ref2.normalized,
          normalized = _ref2$normalized === undefined ? false : _ref2$normalized,
          _ref2$integer = _ref2.integer,
          integer = _ref2$integer === undefined ? false : _ref2$integer,
          _ref2$instanced = _ref2.instanced,
          instanced = _ref2$instanced === undefined ? 0 : _ref2$instanced;

      this.layout = layout || new BufferLayout({
        type: type || this.type, // Use autodeduced type if available
        size: size,
        offset: offset,
        stride: stride,
        normalized: normalized,
        integer: integer,
        instanced: instanced
      });
      return this;
    }

    // Creates and initializes the buffer object's data store.

  }, {
    key: 'initialize',
    value: function initialize() {
      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          data = _ref3.data,
          bytes = _ref3.bytes,
          _ref3$usage = _ref3.usage,
          usage = _ref3$usage === undefined ? GL.STATIC_DRAW : _ref3$usage,
          layout = _ref3.layout,
          type = _ref3.type,
          _ref3$size = _ref3.size,
          size = _ref3$size === undefined ? 1 : _ref3$size,
          _ref3$offset = _ref3.offset,
          offset = _ref3$offset === undefined ? 0 : _ref3$offset,
          _ref3$stride = _ref3.stride,
          stride = _ref3$stride === undefined ? 0 : _ref3$stride,
          _ref3$normalized = _ref3.normalized,
          normalized = _ref3$normalized === undefined ? false : _ref3$normalized,
          _ref3$integer = _ref3.integer,
          integer = _ref3$integer === undefined ? false : _ref3$integer,
          _ref3$instanced = _ref3.instanced,
          instanced = _ref3$instanced === undefined ? 0 : _ref3$instanced;

      var opts = arguments[0];

      if (!data) {
        type = type || GL.FLOAT;

        // Workaround needed for Safari (#291):
        // gl.bufferData with size (second argument) equal to 0 crashes.
        // hence create zero sized array.
        if (!bytes || bytes === 0) {
          bytes = 0;
          data = new Float32Array(0);
        }
      } else {
        type = type || getGLTypeFromTypedArray(data);
        bytes = data.byteLength;
        assert(type, ERR_BUFFER_PARAMS);
      }

      this.bytes = bytes;
      this.bytesUsed = bytes;
      this.data = data;
      this.type = type;
      this.usage = usage;

      // Call after type is set
      this.setDataLayout(Object.assign(opts));

      // Create the buffer - binding it here for the first time locks the type
      // In WebGL2, use GL_COPY_WRITE_BUFFER to avoid locking the type
      var target = this.gl.webgl2 ? GL_COPY_WRITE_BUFFER : this.target;
      this.gl.bindBuffer(target, this.handle);
      this.gl.bufferData(target, data || bytes, usage);
      this.gl.bindBuffer(target, null);

      return this;
    }

    // DEPRECATED - Can we change to call `subData`?

  }, {
    key: 'setData',
    value: function setData(options) {
      return this.initialize(options);
    }

    // Updates a subset of a buffer object's data store.

  }, {
    key: 'subData',
    value: function subData() {
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          data = _ref4.data,
          _ref4$offset = _ref4.offset,
          offset = _ref4$offset === undefined ? 0 : _ref4$offset,
          _ref4$srcOffset = _ref4.srcOffset,
          srcOffset = _ref4$srcOffset === undefined ? 0 : _ref4$srcOffset,
          length = _ref4.length;

      assert(data, ERR_BUFFER_PARAMS);

      // Create the buffer - binding it here for the first time locks the type
      // In WebGL2, use GL_COPY_WRITE_BUFFER to avoid locking the type
      var target = this.gl.webgl2 ? GL_COPY_WRITE_BUFFER : this.target;
      this.gl.bindBuffer(target, this.handle);
      // WebGL2: subData supports additional srcOffset and length parameters
      if (srcOffset !== 0 || length !== undefined) {
        assertWebGL2Context(this.gl);
        this.gl.bufferSubData(this.target, offset, data, srcOffset, length || 0);
      } else {
        this.gl.bufferSubData(target, offset, data);
      }
      this.gl.bindBuffer(target, null);
      return this;
    }

    // WEBGL2 ONLY: Copies part of the data of another buffer into this buffer

  }, {
    key: 'copyData',
    value: function copyData(_ref5) {
      var sourceBuffer = _ref5.sourceBuffer,
          _ref5$readOffset = _ref5.readOffset,
          readOffset = _ref5$readOffset === undefined ? 0 : _ref5$readOffset,
          _ref5$writeOffset = _ref5.writeOffset,
          writeOffset = _ref5$writeOffset === undefined ? 0 : _ref5$writeOffset,
          size = _ref5.size;

      assertWebGL2Context(this.gl);

      // Use GL_COPY_READ_BUFFER+GL_COPY_WRITE_BUFFER avoid disturbing other targets and locking type
      this.gl.bindBuffer(GL_COPY_READ_BUFFER, sourceBuffer.handle);
      this.gl.bindBuffer(GL_COPY_WRITE_BUFFER, this.handle);

      this.gl.copyBufferSubData(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, readOffset, writeOffset, size);

      this.gl.bindBuffer(GL_COPY_READ_BUFFER, null);
      this.gl.bindBuffer(GL_COPY_WRITE_BUFFER, null);

      return this;
    }

    // WEBGL2 ONLY: Reads data from buffer into an ArrayBufferView or SharedArrayBuffer.

  }, {
    key: 'getData',
    value: function getData() {
      var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref6$dstData = _ref6.dstData,
          dstData = _ref6$dstData === undefined ? null : _ref6$dstData,
          _ref6$srcByteOffset = _ref6.srcByteOffset,
          srcByteOffset = _ref6$srcByteOffset === undefined ? 0 : _ref6$srcByteOffset,
          _ref6$dstOffset = _ref6.dstOffset,
          dstOffset = _ref6$dstOffset === undefined ? 0 : _ref6$dstOffset,
          _ref6$length = _ref6.length,
          length = _ref6$length === undefined ? 0 : _ref6$length;

      assertWebGL2Context(this.gl);

      var ArrayType = getTypedArrayFromGLType(this.type, { clamped: false });
      var sourceAvailableElementCount = this._getAvailableElementCount(srcByteOffset);
      var dstAvailableElementCount = void 0;
      var dstElementCount = void 0;
      var dstElementOffset = dstOffset;
      if (dstData) {
        dstElementCount = dstData.length;
        dstAvailableElementCount = dstElementCount - dstElementOffset;
      } else {
        // Allocate ArrayBufferView with enough size to copy all eligible data.
        dstAvailableElementCount = Math.min(sourceAvailableElementCount, length || sourceAvailableElementCount);
        dstElementCount = dstElementOffset + dstAvailableElementCount;
      }

      var copyElementCount = Math.min(sourceAvailableElementCount, dstAvailableElementCount);
      length = length || copyElementCount;
      assert(length <= copyElementCount, 'Invalid srcByteOffset, dstOffset and length combination');
      dstData = dstData || new ArrayType(dstElementCount);
      // Use GL_COPY_READ_BUFFER to avoid disturbing other targets and locking type
      this.gl.bindBuffer(GL_COPY_READ_BUFFER, this.handle);
      this.gl.getBufferSubData(GL_COPY_READ_BUFFER, srcByteOffset, dstData, dstOffset, length);
      this.gl.bindBuffer(GL_COPY_READ_BUFFER, null);
      return dstData;
    }

    /**
     * Binds a buffer to a given binding point (target).
     *   GL_TRANSFORM_FEEDBACK_BUFFER and GL.UNIFORM_BUFFER take an index, and optionally a range.
     *
     * @param {Glenum} target - target for the bind operation.
     *
     * @param {GLuint} index= - the index of the target.
     *   - GL_TRANSFORM_FEEDBACK_BUFFER and GL.UNIFORM_BUFFER need an index to affect state
     * @param {GLuint} offset=0 - the index of the target.
     *   - GL.UNIFORM_BUFFER: `offset` must be aligned to GL.UNIFORM_BUFFER_OFFSET_ALIGNMENT.
     * @param {GLuint} size= - the index of the target.
     *   - GL.UNIFORM_BUFFER: `size` must be a minimum of GL.UNIFORM_BLOCK_SIZE_DATA.
     * @returns {Buffer} - Returns itself for chaining.
     */

  }, {
    key: 'bind',
    value: function bind() {
      var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref7$target = _ref7.target,
          target = _ref7$target === undefined ? this.target : _ref7$target,
          _ref7$index = _ref7.index,
          index = _ref7$index === undefined ? this.index : _ref7$index,
          _ref7$offset = _ref7.offset,
          offset = _ref7$offset === undefined ? 0 : _ref7$offset,
          size = _ref7.size;

      // NOTE: While GL_TRANSFORM_FEEDBACK_BUFFER and GL.UNIFORM_BUFFER could
      // be used as direct binding points, they will not affect transform feedback or
      // uniform buffer state. Instead indexed bindings need to be made.
      var type = target === GL.UNIFORM_BUFFER || target === GL_TRANSFORM_FEEDBACK_BUFFER ? size !== undefined ? 'ranged' : ' indexed' : 'non-indexed';

      switch (type) {
        case 'non-indexed':
          this.gl.bindBuffer(target, this.handle);
          break;
        case 'indexed':
          assertWebGL2Context(this.gl);
          assert(offset === 0, ERR_BUFFER_PARAMS); // Make sure offset wasn't supplied
          this.gl.bindBufferBase(target, index, this.handle);
          break;
        case 'ranged':
          assertWebGL2Context(this.gl);
          this.gl.bindBufferRange(target, index, this.handle, offset, size);
          break;
        default:
          throw new Error(ERR_BUFFER_PARAMS);
      }

      return this;
    }
  }, {
    key: 'unbind',
    value: function unbind() {
      var _ref8 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref8$target = _ref8.target,
          target = _ref8$target === undefined ? this.target : _ref8$target,
          _ref8$index = _ref8.index,
          index = _ref8$index === undefined ? this.index : _ref8$index;

      var isIndexedBuffer = target === GL.UNIFORM_BUFFER || target === GL_TRANSFORM_FEEDBACK_BUFFER;
      if (isIndexedBuffer) {
        this.gl.bindBufferBase(target, index, null);
      } else {
        this.gl.bindBuffer(target, null);
      }
      return this;
    }

    // TODO - is this the right place?
    // gl.TRANSFORM_FEEDBACK_BUFFER_BINDING: Returns a WebGLBuffer.
    // gl.TRANSFORM_FEEDBACK_BUFFER_SIZE: Returns a GLsizeiptr.
    // gl.TRANSFORM_FEEDBACK_BUFFER_START: Returns a GLintptr.
    // gl.UNIFORM_BUFFER_BINDING: Returns a WebGLBuffer.
    // gl.UNIFORM_BUFFER_SIZE: Returns a GLsizeiptr.
    // gl.UNIFORM_BUFFER_START: Returns a GLintptr.

  }, {
    key: 'getIndexedParameter',
    value: function getIndexedParameter(binding, index) {
      // Create the buffer - if binding it here for the first time, this locks the type
      // In WebGL2, use GL_COPY_READ_BUFFER to avoid locking the type
      var target = this.gl.webgl2 ? GL_COPY_READ_BUFFER : this.target;
      this.gl.bindBuffer(target, index);
      return this.gl.getIndexedParameter(binding, index);
    }

    // RESOURCE METHODS

  }, {
    key: '_createHandle',
    value: function _createHandle() {
      return this.gl.createBuffer();
    }
  }, {
    key: '_deleteHandle',
    value: function _deleteHandle() {
      this.gl.deleteBuffer(this.handle);
    }
  }, {
    key: '_getParameter',
    value: function _getParameter(pname) {
      this.gl.bindBuffer(this.target, this.handle);
      var value = this.gl.getBufferParameter(this.target, pname);
      this.gl.bindBuffer(this.target, null);
      return value;
    }
  }, {
    key: '_getAvailableElementCount',
    value: function _getAvailableElementCount(srcByteOffset) {
      var ArrayType = getTypedArrayFromGLType(this.type, { clamped: false });
      var sourceElementCount = this.bytes / ArrayType.BYTES_PER_ELEMENT;
      var sourceElementOffset = srcByteOffset / ArrayType.BYTES_PER_ELEMENT;
      return sourceElementCount - sourceElementOffset;
    }
  }]);

  return Buffer;
}(Resource);

export default Buffer;
//# sourceMappingURL=buffer.js.map