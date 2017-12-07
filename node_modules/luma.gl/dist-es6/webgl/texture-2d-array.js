var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// import GL from './api';
import { isWebGL2 } from './context';
// import {isWebGl2Context, assertWebGL2Context, withParameters} from './context';
import Texture from '../webgl/texture';
// import Buffer from './buffer';

var Texture2DArray = /*#__PURE__*/function (_Texture) {
  _inherits(Texture2DArray, _Texture);

  _createClass(Texture2DArray, null, [{
    key: 'isSupported',
    value: function isSupported(gl) {
      return isWebGL2(gl);
    }
  }]);

  function Texture2DArray(gl) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Texture2DArray);

    var _this = _possibleConstructorReturn(this, (Texture2DArray.__proto__ || Object.getPrototypeOf(Texture2DArray)).call(this, gl, opts));

    throw new Error('Texture2DArray not yet implemented');
    return _this;
  }

  return Texture2DArray;
}(Texture);

export default Texture2DArray;
//# sourceMappingURL=texture-2d-array.js.map