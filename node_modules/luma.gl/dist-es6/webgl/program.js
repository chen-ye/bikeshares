var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable no-inline-comments */
import GL from './api';
import { assertWebGL2Context, isWebGL2 } from './context';
import VertexArray from './vertex-array';
import Resource from './resource';
import Texture from './texture';
import { getTransformFeedbackMode } from './transform-feedback';
import { parseUniformName, getUniformSetter } from './uniforms';
import { VertexShader, FragmentShader } from './shader';
import { log, uid } from '../utils';
import assert from 'assert';

// const GL_TRANSFORM_FEEDBACK_BUFFER_MODE = 0x8C7F;
// const GL_TRANSFORM_FEEDBACK_VARYINGS = 0x8C83;
// MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS : 0x8C80,
// TRANSFORM_FEEDBACK_BUFFER_START: 0x8C84,
// TRANSFORM_FEEDBACK_BUFFER_SIZE : 0x8C85,
// TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN: 0x8C88,
// MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS: 0x8C8A,
// MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: 0x8C8B,
// INTERLEAVED_ATTRIBS: 0x8C8C,
// SEPARATE_ATTRIBS : 0x8C8D,

var Program = /*#__PURE__*/function (_Resource) {
  _inherits(Program, _Resource);

  /*
   * @classdesc
   * Handles creation of programs, mapping of attributes and uniforms
   *
   * @class
   * @param {WebGLRenderingContext} gl - gl context
   * @param {Object} opts - options
   * @param {String} opts.vs - Vertex shader source
   * @param {String} opts.fs - Fragment shader source
   * @param {String} opts.id= - Id
   */
  function Program(gl) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Program);

    var _this = _possibleConstructorReturn(this, (Program.__proto__ || Object.getPrototypeOf(Program)).call(this, gl, opts));

    _this.initialize(opts);
    _this.vertexAttributes = VertexArray.getDefaultArray(gl);
    Object.seal(_this);

    // If program is not named, name it after shader names
    if (!opts.id) {
      var programName = _this.vs.getName() || _this.fs.getName();
      programName = programName.replace(/shader/i, '');
      programName = programName ? programName + '-program' : 'program';
      // TODO - this.id will already have been initialized
      _this.id = uid(programName);
    }
    return _this;
  }

  _createClass(Program, [{
    key: 'initialize',
    value: function initialize() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          vs = _ref.vs,
          fs = _ref.fs,
          defaultUniforms = _ref.defaultUniforms,
          varyings = _ref.varyings,
          _ref$bufferMode = _ref.bufferMode,
          bufferMode = _ref$bufferMode === undefined ? GL.SEPARATE_ATTRIBS : _ref$bufferMode;

      // Create shaders if needed
      this.vs = typeof vs === 'string' ? new VertexShader(this.gl, vs) : vs;
      this.fs = typeof fs === 'string' ? new FragmentShader(this.gl, fs) : fs;

      assert(this.vs instanceof VertexShader, 'Program: bad vertex shader');
      assert(this.fs instanceof FragmentShader, 'Program: bad fragment shader');

      this.defaultUniforms = defaultUniforms;

      // Setup varyings if supplied
      if (varyings) {
        assertWebGL2Context(this.gl);
        this.gl.transformFeedbackVaryings(this.handle, varyings, bufferMode);
        this.varyings = getVaryingMap(varyings, bufferMode);
      }

      this._compileAndLink();

      // determine attribute locations (i.e. indices)
      this._attributeLocations = this._getAttributeLocations();
      this._attributeCount = this.getAttributeCount();
      this._warn = [];
      this._filledLocations = {};

      // prepare uniform setters
      this._uniformSetters = this._getUniformSetters();
      this._uniformCount = this.getUniformCount();
      this._textureIndexCounter = 0;

      return this;
    }
  }, {
    key: 'use',
    value: function use() {
      this.gl.useProgram(this.handle);
      return this;
    }

    // A good thing about webGL is that there are so many ways to draw things,
    // e.g. depending on whether data is indexed and/or isInstanced.
    // This function unifies those into a single call with simple parameters
    // that have sane defaults.

  }, {
    key: 'draw',
    value: function draw(_ref2) {
      var _this2 = this;

      var _ref2$drawMode = _ref2.drawMode,
          drawMode = _ref2$drawMode === undefined ? GL.TRIANGLES : _ref2$drawMode,
          vertexCount = _ref2.vertexCount,
          _ref2$offset = _ref2.offset,
          offset = _ref2$offset === undefined ? 0 : _ref2$offset,
          start = _ref2.start,
          end = _ref2.end,
          _ref2$isIndexed = _ref2.isIndexed,
          isIndexed = _ref2$isIndexed === undefined ? false : _ref2$isIndexed,
          _ref2$indexType = _ref2.indexType,
          indexType = _ref2$indexType === undefined ? GL.UNSIGNED_SHORT : _ref2$indexType,
          _ref2$isInstanced = _ref2.isInstanced,
          isInstanced = _ref2$isInstanced === undefined ? false : _ref2$isInstanced,
          _ref2$instanceCount = _ref2.instanceCount,
          instanceCount = _ref2$instanceCount === undefined ? 0 : _ref2$instanceCount,
          _ref2$vertexArray = _ref2.vertexArray,
          vertexArray = _ref2$vertexArray === undefined ? null : _ref2$vertexArray,
          _ref2$transformFeedba = _ref2.transformFeedback,
          transformFeedback = _ref2$transformFeedba === undefined ? null : _ref2$transformFeedba,
          _ref2$uniforms = _ref2.uniforms,
          uniforms = _ref2$uniforms === undefined ? {} : _ref2$uniforms,
          _ref2$samplers = _ref2.samplers,
          samplers = _ref2$samplers === undefined ? {} : _ref2$samplers,
          _ref2$parameters = _ref2.parameters,
          parameters = _ref2$parameters === undefined ? {} : _ref2$parameters,
          settings = _ref2.settings;

      if (settings) {
        log.deprecated('settings', 'parameters');
        parameters = settings;
      }

      vertexArray = vertexArray || VertexArray.getDefaultArray(this.gl);
      vertexArray.bind(function () {

        _this2.gl.useProgram(_this2.handle);

        if (transformFeedback) {
          if (parameters[GL.RASTERIZER_DISCARD]) {
            // bypass fragment shader
            _this2.gl.enable(GL.RASTERIZER_DISCARD);
          }

          var primitiveMode = getTransformFeedbackMode({ drawMode: drawMode });
          transformFeedback.begin(primitiveMode);
        }

        _this2.setUniforms(uniforms, samplers);

        // TODO - Use polyfilled WebGL2RenderingContext instead of ANGLE extension
        if (isIndexed && isInstanced) {
          _this2.ext.drawElementsInstanced(drawMode, vertexCount, indexType, offset, instanceCount);
        } else if (isIndexed && isWebGL2(_this2.gl) && !isNaN(start) && !isNaN(end)) {
          _this2.gl.drawElementsRange(drawMode, start, end, vertexCount, indexType, offset);
        } else if (isIndexed) {
          _this2.gl.drawElements(drawMode, vertexCount, indexType, offset);
        } else if (isInstanced) {
          _this2.ext.drawArraysInstanced(drawMode, offset, vertexCount, instanceCount);
        } else {
          _this2.gl.drawArrays(drawMode, offset, vertexCount);
        }

        // this.gl.useProgram(null);

        if (transformFeedback) {
          transformFeedback.end();

          if (parameters[GL.RASTERIZER_DISCARD]) {
            // resume fragment shader
            _this2.gl.disable(GL.RASTERIZER_DISCARD);
          }
        }
      });

      return this;
    }

    /**
     * Attach a map of Buffers values to a program
     * Only attributes with names actually present in the linked program
     * will be updated. Other supplied buffers will be ignored.
     *
     * @param {Object} buffers - An object map with attribute names being keys
     *  and values are expected to be instances of Buffer.
     * @returns {Program} Returns itself for chaining.
     */
    /* eslint-disable max-statements */

  }, {
    key: 'setBuffers',
    value: function setBuffers(buffers) {
      var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref3$clear = _ref3.clear,
          clear = _ref3$clear === undefined ? true : _ref3$clear,
          _ref3$check = _ref3.check,
          check = _ref3$check === undefined ? true : _ref3$check,
          _ref3$drawParams = _ref3.drawParams,
          drawParams = _ref3$drawParams === undefined ? {} : _ref3$drawParams;

      if (clear) {
        this._filledLocations = {};
      }

      // indexing is autodetected - buffer with target gl.ELEMENT_ARRAY_BUFFER
      // index type is saved for drawElement calls
      drawParams.isInstanced = false;
      drawParams.isIndexed = false;
      drawParams.indexType = null;

      var _sortBuffersByLocatio = this._sortBuffersByLocation(buffers),
          locations = _sortBuffersByLocatio.locations,
          elements = _sortBuffersByLocatio.elements;

      // Process locations in order


      for (var location = 0; location < locations.length; ++location) {
        var bufferName = locations[location];
        var buffer = buffers[bufferName];
        // DISABLE MISSING ATTRIBUTE
        if (!buffer) {
          this.vertexAttributes.disable(location);
        } else {
          var divisor = buffer.layout.instanced ? 1 : 0;
          this.vertexAttributes.enable(location);
          this.vertexAttributes.setBuffer({ location: location, buffer: buffer });
          this.vertexAttributes.setDivisor(location, divisor);
          drawParams.isInstanced = buffer.layout.instanced > 0;
          this._filledLocations[bufferName] = true;
        }
      }

      // SET ELEMENTS ARRAY BUFFER
      if (elements) {
        var _buffer = buffers[elements];
        _buffer.bind();
        drawParams.isIndexed = true;
        drawParams.indexType = _buffer.layout.type;
      }

      if (check) {
        this._checkBuffers();
      }

      return this;
    }
    /* eslint-enable max-statements */

    /*
     * @returns {Program} Returns itself for chaining.
     */

  }, {
    key: 'unsetBuffers',
    value: function unsetBuffers() {
      var length = this._attributeCount;
      for (var i = 1; i < length; ++i) {
        // this.vertexAttributes.setDivisor(i, 0);
        this.vertexAttributes.disable(i);
      }

      // Clear elements buffer
      this.gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);
      return this;
    }

    /**
     * Apply a set of uniform values to a program
     * Only uniforms with names actually present in the linked program
     * will be updated.
     * other uniforms will be ignored
     *
     * @param {Object} uniformMap - An object with names being keys
     * @returns {Program} - returns itself for chaining.
     */
    /* eslint-disable max-depth */

  }, {
    key: 'setUniforms',
    value: function setUniforms(uniforms) {
      var samplers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      for (var uniformName in uniforms) {
        var uniform = uniforms[uniformName];
        var uniformSetter = this._uniformSetters[uniformName];
        var sampler = samplers[uniformName];

        if (uniformSetter) {
          if (uniform instanceof Texture) {
            if (uniformSetter.textureIndex === undefined) {
              uniformSetter.textureIndex = this._textureIndexCounter++;
            }

            // Bind texture to index
            var texture = uniform;
            var textureIndex = uniformSetter.textureIndex;


            texture.bind(textureIndex);

            // Bind a sampler (if supplied) to index
            if (sampler) {
              sampler.bind(textureIndex);
            }

            // Set the uniform sampler to the texture index
            uniformSetter(textureIndex);
          } else {
            // Just set the value
            uniformSetter(uniform);
          }
        }
      }

      return this;
    }
    /* eslint-enable max-depth */

    // setTransformFeedbackBuffers(buffers) {
    //   for (const buffer of buffers) {
    //     buffer.bindBase()
    //   }
    // }

    /**
     * ATTRIBUTES API
     * (Locations are numeric indices)
     * @return {Number} count
     */

  }, {
    key: 'getAttributeCount',
    value: function getAttributeCount() {
      return this._getParameter(GL.ACTIVE_ATTRIBUTES);
    }

    /**
     * Returns location (index) of a name
     * @param {String} attributeName - name of an attribute
     *   (matches name in a linked shader)
     * @returns {Number} - // array of actual attribute names from shader linking
     */

  }, {
    key: 'getAttributeLocation',
    value: function getAttributeLocation(attributeName) {
      return this.gl.getAttribLocation(this.handle, attributeName);
    }

    /**
     * Returns an object with info about attribute at index "location"/
     * @param {int} location - index of an attribute
     * @returns {WebGLActiveInfo} - info about an active attribute
     *   fields: {name, size, type}
     */

  }, {
    key: 'getAttributeInfo',
    value: function getAttributeInfo(location) {
      return this.gl.getActiveAttrib(this.handle, location);
    }

    /**
     * UNIFORMS API
     * (Locations are numeric indices)
     * @return {Number} count
     */

  }, {
    key: 'getUniformCount',
    value: function getUniformCount() {
      return this._getParameter(GL.ACTIVE_UNIFORMS);
    }

    /*
     * @returns {WebGLActiveInfo} - object with {name, size, type}
     */

  }, {
    key: 'getUniformInfo',
    value: function getUniformInfo(index) {
      return this.gl.getActiveUniform(this.handle, index);
    }

    /*
     * @returns {WebGLUniformLocation} - opaque object representing location
     * of uniform, used by setter methods
     */

  }, {
    key: 'getUniformLocation',
    value: function getUniformLocation(name) {
      return this.gl.getUniformLocation(this.handle, name);
    }
  }, {
    key: 'getUniformValue',
    value: function getUniformValue(location) {
      return this.gl.getUniform(this.handle, location);
    }

    // WebGL2
    /**
     * @param {GLuint} index
     * @return {WebGLActiveInfo} - object with {name, size, type}
     */

  }, {
    key: 'getVarying',
    value: function getVarying(program, index) {
      var result = this.gl.getTransformFeedbackVarying(program, index);
      return result;
    }

    // Retrieves the assigned color number binding for the user-defined varying
    // out variable name for program. program must have previously been linked.

  }, {
    key: 'getFragDataLocation',
    value: function getFragDataLocation(varyingName) {
      assertWebGL2Context(this.gl);
      return this.gl.getFragDataLocation(this.handle, varyingName);
    }

    // @returns {WebGLShader[]} - array of attached WebGLShader objects

  }, {
    key: 'getAttachedShaders',
    value: function getAttachedShaders() {
      return this.gl.getAttachedShaders(this.handle);
    }

    // PRIVATE METHODS

  }, {
    key: '_compileAndLink',
    value: function _compileAndLink() {
      var gl = this.gl;

      gl.attachShader(this.handle, this.vs.handle);
      gl.attachShader(this.handle, this.fs.handle);
      gl.linkProgram(this.handle);

      // Avoid checking program linking error in production
      if (gl.debug || log.priority > 0) {
        gl.validateProgram(this.handle);
        var linked = gl.getProgramParameter(this.handle, gl.LINK_STATUS);
        if (!linked) {
          throw new Error('Error linking ' + gl.getProgramInfoLog(this.handle));
        }
      }
    }
  }, {
    key: '_checkBuffers',
    value: function _checkBuffers() {
      for (var attributeName in this._attributeLocations) {
        if (!this._filledLocations[attributeName] && !this._warn[attributeName]) {
          var location = this._attributeLocations[attributeName];
          // throw new Error(`Program ${this.id}: ` +
          //   `Attribute ${location}:${attributeName} not supplied`);
          log.warn(0, 'Program ' + this.id + ': Attribute ' + location + ':' + attributeName + ' not supplied');
          this._warn[attributeName] = true;
        }
      }
      return this;
    }
  }, {
    key: '_sortBuffersByLocation',
    value: function _sortBuffersByLocation(buffers) {
      var elements = null;
      var locations = new Array(this._attributeCount);

      for (var bufferName in buffers) {
        var buffer = buffers[bufferName];
        var location = this._attributeLocations[bufferName];
        if (location === undefined) {
          if (buffer.target === GL.ELEMENT_ARRAY_BUFFER && elements) {
            throw new Error(this._print(bufferName) + ' duplicate GL.ELEMENT_ARRAY_BUFFER');
          } else if (buffer.target === GL.ELEMENT_ARRAY_BUFFER) {
            elements = bufferName;
          } else if (!this._warn[bufferName]) {
            log.warn(2, this._print(bufferName) + ' not used');
            this._warn[bufferName] = true;
          }
        } else {
          if (buffer.target === GL.ELEMENT_ARRAY_BUFFER) {
            throw new Error(this._print(bufferName) + ':' + location + ' ' + 'has both location and type gl.ELEMENT_ARRAY_BUFFER');
          }
          locations[location] = bufferName;
        }
      }
      return { locations: locations, elements: elements };
    }

    // Check that all active attributes are enabled

  }, {
    key: '_areAllAttributesEnabled',
    value: function _areAllAttributesEnabled() {
      var length = this._attributeCount;
      for (var i = 0; i < length; ++i) {
        if (!this.vertexAttributes.isEnabled(i)) {
          return false;
        }
      }
      return true;
    }

    // determine attribute locations (maps attribute name to index)

  }, {
    key: '_getAttributeLocations',
    value: function _getAttributeLocations() {
      var attributeLocations = {};
      var length = this.getAttributeCount();
      for (var location = 0; location < length; location++) {
        var name = this.getAttributeInfo(location).name;
        attributeLocations[name] = this.getAttributeLocation(name);
      }
      return attributeLocations;
    }

    // create uniform setters
    // Map of uniform names to setter functions

  }, {
    key: '_getUniformSetters',
    value: function _getUniformSetters() {
      var gl = this.gl;

      var uniformSetters = {};
      var length = this.getUniformCount();
      for (var i = 0; i < length; i++) {
        var info = this.getUniformInfo(i);
        var parsedName = parseUniformName(info.name);
        var location = this.getUniformLocation(parsedName.name);
        uniformSetters[parsedName.name] = getUniformSetter(gl, location, info, parsedName.isArray);
      }
      return uniformSetters;
    }
  }, {
    key: '_print',
    value: function _print(bufferName) {
      return 'Program ' + this.id + ': Attribute ' + bufferName;
    }
  }, {
    key: '_createHandle',
    value: function _createHandle() {
      return this.gl.createProgram();
    }
  }, {
    key: '_deleteHandle',
    value: function _deleteHandle() {
      this.gl.deleteProgram(this.handle);
    }
  }, {
    key: '_getOptionsFromHandle',
    value: function _getOptionsFromHandle(handle) {
      var shaderHandles = this.gl.getAttachedShaders(handle);
      var opts = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = shaderHandles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var shaderHandle = _step.value;

          var type = this.gl.getShaderParameter(this.handle, GL.SHADER_TYPE);
          switch (type) {
            case GL.VERTEX_SHADER:
              opts.vs = new VertexShader({ handle: shaderHandle });
              break;
            case GL.FRAGMENT_SHADER:
              opts.fs = new FragmentShader({ handle: shaderHandle });
              break;
            default:
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return opts;
    }
  }, {
    key: '_getParameter',
    value: function _getParameter(pname) {
      return this.gl.getProgramParameter(this.handle, pname);
    }
  }]);

  return Program;
}(Resource);

// create uniform setters
// Map of uniform names to setter functions


export default Program;
export function getUniformDescriptors(gl, program) {
  var uniformDescriptors = {};
  var length = program.getUniformCount();
  for (var i = 0; i < length; i++) {
    var info = program.getUniformInfo(i);
    var location = program.getUniformLocation(info.name);
    var descriptor = getUniformSetter(gl, location, info);
    uniformDescriptors[descriptor.name] = descriptor;
  }
  return uniformDescriptors;
}

// Get a map of buffer indices
export function getVaryingMap(varyings, bufferMode) {
  var varyingMap = {};
  var index = 0;
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = varyings[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var varying = _step2.value;

      if (bufferMode === GL.SEPARATE_ATTRIBS) {
        varyingMap[varyings] = { index: index };
        index++;
      } else if (varying === 'gl_NextBuffer') {
        index++;
      } else {
        // Add a "safe" offset as fallback unless app specifies it
        // Could query
        varyingMap[varyings] = { index: index, offset: 16 };
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return varyingMap;
}
//# sourceMappingURL=program.js.map