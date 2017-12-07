var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { VertexShader, FragmentShader } from '../../webgl/shader';
import assert from 'assert';

var ERR_SOURCE = 'ShaderCache expects source strings';
var ERR_CONTEXT = 'ShaderCache does not support caching across multiple contexts';

var ShaderCache = /*#__PURE__*/function () {

  /**
   * A cache of compiled shaders, keyed by shader source strings.
   * Compilation of long shaders can be time consuming.
   * By using this class, the application can ensure that each shader
   * is only compiled once.
   */
  function ShaderCache() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        gl = _ref.gl;

    _classCallCheck(this, ShaderCache);

    this.gl = gl;
    this.vertexShaders = {};
    this.fragmentShaders = {};
  }

  /**
   * Deletes shader references
   * @return {ShaderCache} - returns this for chaining
   */


  _createClass(ShaderCache, [{
    key: 'delete',
    value: function _delete() {
      // TODO - requires reference counting to avoid deleting shaders in use
      return this;
    }

    /**
     * Returns a compiled `VertexShader` object corresponding to the supplied
     * GLSL source code string, if possible from cache.
     *
     * @param {WebGLRenderingContext} gl - gl context
     * @param {String} source - Source code for shader
     * @return {VertexShader} - a compiled vertex shader
     */

  }, {
    key: 'getVertexShader',
    value: function getVertexShader(gl, source) {
      assert(typeof source === 'string', ERR_SOURCE);

      var shader = this.vertexShaders[source];
      assert(!shader || shader.gl === gl, ERR_CONTEXT);

      if (!shader) {
        shader = new VertexShader(gl, source);
        this.vertexShaders[source] = shader;
      }
      return shader;
    }

    /**
     * Returns a compiled `VertexShader` object corresponding to the supplied
     * GLSL source code string, if possible from cache.
     *
     * @param {WebGLRenderingContext} gl - gl context
     * @param {String} source - Source code for shader
     * @return {FragmentShader} - a compiled fragment shader, possibly from chache
     */

  }, {
    key: 'getFragmentShader',
    value: function getFragmentShader(gl, source) {
      assert(typeof source === 'string', ERR_SOURCE);

      var shader = this.fragmentShaders[source];
      assert(!shader || shader.gl === gl, ERR_CONTEXT);

      if (!shader) {
        shader = new FragmentShader(gl, source);
        this.fragmentShaders[source] = shader;
      }
      return shader;
    }
  }]);

  return ShaderCache;
}();

export default ShaderCache;
//# sourceMappingURL=shader-cache.js.map