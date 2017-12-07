function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { Model } from '../core';
import { IcoSphereGeometry } from '../geometry';

var IcoSphere = /*#__PURE__*/function (_Model) {
  _inherits(IcoSphere, _Model);

  function IcoSphere(gl) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, IcoSphere);

    return _possibleConstructorReturn(this, (IcoSphere.__proto__ || Object.getPrototypeOf(IcoSphere)).call(this, gl, Object.assign({}, opts, { geometry: new IcoSphereGeometry(opts) })));
  }

  return IcoSphere;
}(Model);

export default IcoSphere;
//# sourceMappingURL=ico-sphere.js.map