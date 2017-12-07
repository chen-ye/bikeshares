var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import MathArray from './math-array';
import { checkNumber } from './common';
import Vector2, { validateVector2 } from './vector2';
import Vector3, { validateVector3 } from './vector3';
import Vector4, { validateVector4 } from './vector4';
import assert from 'assert';

// gl-matrix is too big. Cherry-pick individual imports from stack.gl version
/* eslint-disable camelcase */
import mat4_determinant from 'gl-mat4/determinant';
import mat4_fromQuat from 'gl-mat4/fromQuat';
import mat4_frustum from 'gl-mat4/frustum';
import mat4_lookAt from 'gl-mat4/lookAt';
import mat4_ortho from 'gl-mat4/ortho';
import mat4_perspective from 'gl-mat4/perspective';
import mat4_transpose from 'gl-mat4/transpose';
import mat4_invert from 'gl-mat4/invert';
import mat4_multiply from 'gl-mat4/multiply';
import mat4_rotateX from 'gl-mat4/rotateX';
import mat4_rotateY from 'gl-mat4/rotateY';
import mat4_rotateZ from 'gl-mat4/rotateZ';
import mat4_rotate from 'gl-mat4/rotateZ';
import mat4_scale from 'gl-mat4/scale';
import mat4_translate from 'gl-mat4/translate';
import vec2_transformMat4 from 'gl-vec2/transformMat4';
import vec3_transformMat4 from 'gl-vec3/transformMat4';
import vec4_transformMat4 from 'gl-vec4/transformMat4';

var IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

export function validateMatrix4(m) {
  return m.length === 16 && Number.isFinite(m[0]) && Number.isFinite(m[1]) && Number.isFinite(m[2]) && Number.isFinite(m[3]) && Number.isFinite(m[4]) && Number.isFinite(m[5]) && Number.isFinite(m[6]) && Number.isFinite(m[7]) && Number.isFinite(m[8]) && Number.isFinite(m[9]) && Number.isFinite(m[10]) && Number.isFinite(m[11]) && Number.isFinite(m[12]) && Number.isFinite(m[13]) && Number.isFinite(m[14]) && Number.isFinite(m[15]);
}

var Matrix4 = function (_MathArray) {
  _inherits(Matrix4, _MathArray);

  function Matrix4() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, Matrix4);

    var _this = _possibleConstructorReturn(this, (Matrix4.__proto__ || Object.getPrototypeOf(Matrix4)).call(this));

    if (Array.isArray(args[0]) && arguments.length === 1) {
      _this.copy(args[0]);
    } else {
      _this.identity();
    }
    return _this;
  }

  _createClass(Matrix4, [{
    key: 'setRowMajor',


    /* eslint-disable max-params */
    value: function setRowMajor() {
      var m00 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var m10 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var m20 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var m30 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      var m01 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
      var m11 = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;
      var m21 = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
      var m31 = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 0;
      var m02 = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : 0;
      var m12 = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : 0;
      var m22 = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : 1;
      var m32 = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : 0;
      var m03 = arguments.length > 12 && arguments[12] !== undefined ? arguments[12] : 0;
      var m13 = arguments.length > 13 && arguments[13] !== undefined ? arguments[13] : 0;
      var m23 = arguments.length > 14 && arguments[14] !== undefined ? arguments[14] : 0;
      var m33 = arguments.length > 15 && arguments[15] !== undefined ? arguments[15] : 1;

      return this.set(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
    }
  }, {
    key: 'setColumnMajor',
    value: function setColumnMajor() {
      var m00 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var m01 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var m02 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var m03 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      var m10 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
      var m11 = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;
      var m12 = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
      var m13 = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 0;
      var m20 = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : 0;
      var m21 = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : 0;
      var m22 = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : 1;
      var m23 = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : 0;
      var m30 = arguments.length > 12 && arguments[12] !== undefined ? arguments[12] : 0;
      var m31 = arguments.length > 13 && arguments[13] !== undefined ? arguments[13] : 0;
      var m32 = arguments.length > 14 && arguments[14] !== undefined ? arguments[14] : 0;
      var m33 = arguments.length > 15 && arguments[15] !== undefined ? arguments[15] : 1;

      return this.set(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
    }
  }, {
    key: 'set',
    value: function set(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
      this[0] = m00;
      this[1] = m01;
      this[2] = m02;
      this[3] = m03;
      this[4] = m10;
      this[5] = m11;
      this[6] = m12;
      this[7] = m13;
      this[8] = m20;
      this[9] = m21;
      this[10] = m22;
      this[11] = m23;
      this[12] = m30;
      this[13] = m31;
      this[14] = m32;
      this[15] = m33;
      this.check();
      return this;
    }
    /* eslint-enable max-params */

    // toString() {
    //   if (config.printRowMajor) {
    //     mat4_str(this);
    //   } else {
    //     mat4_str(this);
    //   }
    // }

    // Row major setters and getters
    /* eslint-disable no-multi-spaces, brace-style, no-return-assign */

  }, {
    key: 'determinant',

    /* eslint-enable no-multi-spaces, brace-style, no-return-assign */

    // Accessors

    value: function determinant() {
      return mat4_determinant(this);
    }

    // Constructors

  }, {
    key: 'identity',
    value: function identity() {
      for (var i = 0; i < IDENTITY.length; ++i) {
        this[i] = IDENTITY[i];
      }
      this.check();
      return this;
    }

    // Calculates a 4x4 matrix from the given quaternion
    // q quat  Quaternion to create matrix from

  }, {
    key: 'fromQuaternion',
    value: function fromQuaternion(q) {
      mat4_fromQuat(this, q);
      this.check();
      return this;
    }

    // Generates a frustum matrix with the given bounds
    // left  Number  Left bound of the frustum
    // right Number  Right bound of the frustum
    // bottom  Number  Bottom bound of the frustum
    // top Number  Top bound of the frustum
    // near  Number  Near bound of the frustum
    // far Number  Far bound of the frustum

  }, {
    key: 'frustum',
    value: function frustum(_ref) {
      var left = _ref.left,
          right = _ref.right,
          bottom = _ref.bottom,
          top = _ref.top,
          near = _ref.near,
          far = _ref.far;

      mat4_frustum(this, left, right, bottom, top, near, far);
      this.check();
      return this;
    }

    // Generates a look-at matrix with the given eye position, focal point,
    // and up axis
    // eye vec3  Position of the viewer
    // center  vec3  Point the viewer is looking at
    // up  vec3  vec3 pointing up

  }, {
    key: 'lookAt',
    value: function lookAt() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          eye = _ref2.eye,
          _ref2$center = _ref2.center,
          center = _ref2$center === undefined ? [0, 0, 0] : _ref2$center,
          _ref2$up = _ref2.up,
          up = _ref2$up === undefined ? [0, 1, 0] : _ref2$up;

      mat4_lookAt(this, eye, center, up);
      this.check();
      return this;
    }

    // Generates a orthogonal projection matrix with the given bounds
    // left  number  Left bound of the frustum
    // right number  Right bound of the frustum
    // bottom  number  Bottom bound of the frustum
    // top number  Top bound of the frustum
    // near  number  Near bound of the frustum
    // far number  Far bound of the frustum

  }, {
    key: 'ortho',
    value: function ortho(_ref3) {
      var left = _ref3.left,
          right = _ref3.right,
          bottom = _ref3.bottom,
          top = _ref3.top,
          _ref3$near = _ref3.near,
          near = _ref3$near === undefined ? 0.1 : _ref3$near,
          _ref3$far = _ref3.far,
          far = _ref3$far === undefined ? 500 : _ref3$far;

      mat4_ortho(this, left, right, bottom, top, near, far);
      this.check();
      return this;
    }

    // Generates a perspective projection matrix with the given bounds
    // fovy  number  Vertical field of view in radians
    // aspect  number  Aspect ratio. typically viewport width/height
    // near  number  Near bound of the frustum
    // far number  Far bound of the frustum

  }, {
    key: 'perspective',
    value: function perspective() {
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref4$fov = _ref4.fov,
          fov = _ref4$fov === undefined ? 45 * Math.PI / 180 : _ref4$fov,
          _ref4$aspect = _ref4.aspect,
          aspect = _ref4$aspect === undefined ? 1 : _ref4$aspect,
          _ref4$near = _ref4.near,
          near = _ref4$near === undefined ? 0.1 : _ref4$near,
          _ref4$far = _ref4.far,
          far = _ref4$far === undefined ? 500 : _ref4$far;

      if (fov > Math.PI * 2) {
        throw Error('radians');
      }
      mat4_perspective(this, fov, aspect, near, far);
      this.check();
      return this;
    }

    // Modifiers

  }, {
    key: 'transpose',
    value: function transpose() {
      mat4_transpose(this, this);
      this.check();
      return this;
    }
  }, {
    key: 'invert',
    value: function invert() {
      mat4_invert(this, this);
      this.check();
      return this;
    }

    // Operations

  }, {
    key: 'multiplyLeft',
    value: function multiplyLeft(a) {
      mat4_multiply(this, a, this);
      this.check();
      return this;
    }
  }, {
    key: 'multiplyRight',
    value: function multiplyRight(a) {
      mat4_multiply(this, this, a);
      this.check();
      return this;
    }

    // Rotates a matrix by the given angle around the X axis

  }, {
    key: 'rotateX',
    value: function rotateX(radians) {
      mat4_rotateX(this, this, radians);
      this.check();
      return this;
    }

    // Rotates a matrix by the given angle around the Y axis.

  }, {
    key: 'rotateY',
    value: function rotateY(radians) {
      mat4_rotateY(this, this, radians);
      this.check();
      return this;
    }

    // Rotates a matrix by the given angle around the Z axis.

  }, {
    key: 'rotateZ',
    value: function rotateZ(radians) {
      mat4_rotateZ(this, this, radians);
      this.check();
      return this;
    }
  }, {
    key: 'rotateXYZ',
    value: function rotateXYZ(_ref5) {
      var _ref6 = _slicedToArray(_ref5, 3),
          rx = _ref6[0],
          ry = _ref6[1],
          rz = _ref6[2];

      return this.rotateX(rx).rotateY(ry).rotateZ(rz);
    }
  }, {
    key: 'rotateAxis',
    value: function rotateAxis(radians, axis) {
      mat4_rotate(this, this, radians, axis);
      this.check();
      return this;
    }
  }, {
    key: 'scale',
    value: function scale(vec) {
      mat4_scale(this, this, vec);
      this.check();
      return this;
    }
  }, {
    key: 'translate',
    value: function translate(vec) {
      mat4_translate(this, this, vec);
      this.check();
      return this;
    }
  }, {
    key: 'transformVector2',
    value: function transformVector2(vector, out) {
      out = out || new Vector2();
      vec2_transformMat4(out, vector, this);
      assert(validateVector2(out));
      return out;
    }
  }, {
    key: 'transformVector3',
    value: function transformVector3(vector) {
      var out = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vector3();

      out = out || new Vector3();
      vec3_transformMat4(out, vector, this);
      assert(validateVector3(out));
      return out;
    }
  }, {
    key: 'transformVector4',
    value: function transformVector4(vector) {
      var out = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vector4();

      out = out || new Vector4();
      vec4_transformMat4(out, vector, this);
      assert(validateVector4(out));
      return out;
    }

    // Transforms any 2, 3 or 4 element vector
    // returns a newly minted Vector2, Vector3 or Vector4

  }, {
    key: 'transformVector',
    value: function transformVector(vector, out) {
      switch (vector.length) {
        case 2:
          return this.transformVector2(vector, out);
        case 3:
          return this.transformVector3(vector, out);
        case 4:
          return this.transformVector4(vector, out);
        default:
          throw new Error('Illegal vector');
      }
    }
  }, {
    key: 'ELEMENTS',
    get: function get() {
      return 16;
    }
  }, {
    key: 'm00',
    get: function get() {
      return this[0];
    },
    set: function set(value) {
      return this[0] = checkNumber(value);
    }
  }, {
    key: 'm01',
    get: function get() {
      return this[4];
    },
    set: function set(value) {
      return this[4] = checkNumber(value);
    }
  }, {
    key: 'm02',
    get: function get() {
      return this[8];
    },
    set: function set(value) {
      return this[8] = checkNumber(value);
    }
  }, {
    key: 'm03',
    get: function get() {
      return this[12];
    },
    set: function set(value) {
      return this[12] = checkNumber(value);
    }
  }, {
    key: 'm10',
    get: function get() {
      return this[1];
    },
    set: function set(value) {
      return this[1] = checkNumber(value);
    }
  }, {
    key: 'm11',
    get: function get() {
      return this[5];
    },
    set: function set(value) {
      return this[5] = checkNumber(value);
    }
  }, {
    key: 'm12',
    get: function get() {
      return this[9];
    },
    set: function set(value) {
      return this[9] = checkNumber(value);
    }
  }, {
    key: 'm13',
    get: function get() {
      return this[13];
    },
    set: function set(value) {
      return this[13] = checkNumber(value);
    }
  }, {
    key: 'm20',
    get: function get() {
      return this[2];
    },
    set: function set(value) {
      return this[2] = checkNumber(value);
    }
  }, {
    key: 'm21',
    get: function get() {
      return this[6];
    },
    set: function set(value) {
      return this[6] = checkNumber(value);
    }
  }, {
    key: 'm22',
    get: function get() {
      return this[10];
    },
    set: function set(value) {
      return this[10] = checkNumber(value);
    }
  }, {
    key: 'm23',
    get: function get() {
      return this[14];
    },
    set: function set(value) {
      return this[14] = checkNumber(value);
    }
  }, {
    key: 'm30',
    get: function get() {
      return this[3];
    },
    set: function set(value) {
      return this[3] = checkNumber(value);
    }
  }, {
    key: 'm31',
    get: function get() {
      return this[7];
    },
    set: function set(value) {
      return this[7] = checkNumber(value);
    }
  }, {
    key: 'm32',
    get: function get() {
      return this[11];
    },
    set: function set(value) {
      return this[11] = checkNumber(value);
    }
  }, {
    key: 'm33',
    get: function get() {
      return this[15];
    },
    set: function set(value) {
      return this[15] = checkNumber(value);
    }
  }]);

  return Matrix4;
}(MathArray);

export default Matrix4;
//# sourceMappingURL=matrix4.js.map