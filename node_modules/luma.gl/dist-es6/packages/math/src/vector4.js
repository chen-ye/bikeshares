var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import MathArray from './math-array';
import { checkNumber } from './common';

// gl-matrix is too big. Cherry-pick individual imports from stack.gl version
/* eslint-disable camelcase */
import vec4_set from 'gl-vec4/set';
import vec4_distance from 'gl-vec4/distance';
import vec4_add from 'gl-vec4/add';
import vec4_subtract from 'gl-vec4/subtract';
import vec4_multiply from 'gl-vec4/multiply';
import vec4_divide from 'gl-vec4/divide';
import vec4_scale from 'gl-vec4/scale';
import vec4_scaleAndAdd from 'gl-vec4/scaleAndAdd';
import vec4_negate from 'gl-vec4/negate';
import vec4_inverse from 'gl-vec4/inverse';
import vec4_normalize from 'gl-vec4/normalize';
import vec4_dot from 'gl-vec4/dot';
// import vec4_cross from 'gl-vec4/cross';
import vec4_lerp from 'gl-vec4/lerp';

export function validateVector4(v) {
  return v.length === 4 && Number.isFinite(v[0]) && Number.isFinite(v[1]) && Number.isFinite(v[2]) && Number.isFinite(v[3]);
}

var Vector4 = function (_MathArray) {
  _inherits(Vector4, _MathArray);

  // Creates a new, empty vec4
  function Vector4() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var w = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    _classCallCheck(this, Vector4);

    var _this = _possibleConstructorReturn(this, (Vector4.__proto__ || Object.getPrototypeOf(Vector4)).call(this));

    if (Array.isArray(x) && arguments.length === 1) {
      _this.copy(x);
    } else {
      _this.set(x, y, z, w);
    }
    return _this;
  }

  _createClass(Vector4, [{
    key: 'set',
    value: function set(x, y, z, w) {
      vec4_set(this, x, y, z, w);
      this.check();
      return this;
    }

    // Getters/setters
    /* eslint-disable no-multi-spaces, brace-style, no-return-assign */

  }, {
    key: 'distance',

    /* eslint-enable no-multi-spaces, brace-style, no-return-assign */

    value: function distance(vector) {
      return vec4_distance(vector);
    }
  }, {
    key: 'add',
    value: function add() {
      for (var _len = arguments.length, vectors = Array(_len), _key = 0; _key < _len; _key++) {
        vectors[_key] = arguments[_key];
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = vectors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var vector = _step.value;

          vec4_add(this, vector);
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

      this.check();
      return this;
    }
  }, {
    key: 'subtract',
    value: function subtract() {
      for (var _len2 = arguments.length, vectors = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        vectors[_key2] = arguments[_key2];
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = vectors[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var vector = _step2.value;

          vec4_subtract(this, vector);
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

      this.check();
      return this;
    }
  }, {
    key: 'multiply',
    value: function multiply() {
      for (var _len3 = arguments.length, vectors = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        vectors[_key3] = arguments[_key3];
      }

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = vectors[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var vector = _step3.value;

          vec4_multiply(this, vector);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      this.check();
      return this;
    }
  }, {
    key: 'divide',
    value: function divide() {
      for (var _len4 = arguments.length, vectors = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        vectors[_key4] = arguments[_key4];
      }

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = vectors[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var vector = _step4.value;

          vec4_divide(this, vector);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      this.check();
      return this;
    }
  }, {
    key: 'scale',
    value: function scale(_scale) {
      vec4_scale(this, this, _scale);
      this.check();
      return this;
    }
  }, {
    key: 'scaleAndAdd',
    value: function scaleAndAdd(vector, scale) {
      vec4_scaleAndAdd(this, this, vector, scale);
      this.check();
      return this;
    }
  }, {
    key: 'negate',
    value: function negate() {
      vec4_negate(this, this);
      this.check();
      return this;
    }
  }, {
    key: 'inverse',
    value: function inverse() {
      vec4_inverse(this, this);
      this.check();
      return this;
    }
  }, {
    key: 'normalize',
    value: function normalize() {
      vec4_normalize(this, this);
      this.check();
      return this;
    }
  }, {
    key: 'dot',
    value: function dot(vector) {
      return vec4_dot(this, vector);
    }

    // cross(scale) {
    //   vec4_cross(this, this, scale);
    //   this.check();
    //   return this;
    // }

  }, {
    key: 'lerp',
    value: function lerp(vector, coeff) {
      vec4_lerp(this, this, vector, coeff);
      this.check();
      return this;
    }

    /*
    multiply(...vectors) {
      for (const vector of vectors) {
        vec4_multiply(this, vector);
      }
      this.check();
      return this;
    }
     divide(...vectors) {
      for (const vector of vectors) {
        vec4_divide(this, vector);
      }
      this.check();
      return this;
    }
     ceil() {
      vec4_ceil(this, this);
      this.check();
      return this;
    }
     floor() {
      vec4_floor(this, this);
      this.check();
      return this;
    }
     min() {
      vec4_min(this, this);
      this.check();
      return this;
    }
     max() {
      vec4_max(this, this);
      this.check();
      return this;
    }
     hermite(scale) {
      vec4_hermite(this, this, scale);
      this.check();
      return this;
    }
     bezier(scale) {
      vec4_bezier(this, this, scale);
      this.check();
      return this;
    }
     random(scale) {
      vec4_random(this, this, scale);
      this.check();
      return this;
    }
     rotateX(origin, angle) {
      vec4_rotateX(this, this, origin, angle);
      this.check();
      return this;
    }
     rotateY(origin, angle) {
      vec4_rotateY(this, this, origin, angle);
      this.check();
      return this;
    }
     rotateZ(origin, angle) {
      vec4_rotateZ(this, this, origin, angle);
      this.check();
      return this;
    }
    */

  }, {
    key: 'ELEMENTS',
    get: function get() {
      return 4;
    }
  }, {
    key: 'x',
    get: function get() {
      return this[0];
    },
    set: function set(value) {
      return this[0] = checkNumber(value);
    }
  }, {
    key: 'y',
    get: function get() {
      return this[1];
    },
    set: function set(value) {
      return this[1] = checkNumber(value);
    }
  }, {
    key: 'z',
    get: function get() {
      return this[2];
    },
    set: function set(value) {
      return this[2] = checkNumber(value);
    }
  }, {
    key: 'w',
    get: function get() {
      return this[3];
    },
    set: function set(value) {
      return this[3] = checkNumber(value);
    }
  }]);

  return Vector4;
}(MathArray);

export default Vector4;
//# sourceMappingURL=vector4.js.map