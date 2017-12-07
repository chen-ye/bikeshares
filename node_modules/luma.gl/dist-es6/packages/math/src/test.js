var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* eslint-disable max-statements */
import { Vector2, Vector3, Vector4, Matrix4, Quaternion } from './index';
import { tapeEquals } from './index';
import test from 'tape-catch';

var IDENTITY_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

var INDICES_MATRIX = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

var TRANSPOSED_INDICES_MATRIX = [1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16];

// const MATRIX_TEST_CASES = {
//   identity: {
//     title: 'identity matrix',
//     INPUTS: [],
//     RESULT: IDENTITY_MATRIX
//   },
//   set: {}
// };

test('Math#types', function (t) {
  t.equals(typeof Vector2 === 'undefined' ? 'undefined' : _typeof(Vector2), 'function');
  t.equals(typeof Vector3 === 'undefined' ? 'undefined' : _typeof(Vector3), 'function');
  t.equals(typeof Vector4 === 'undefined' ? 'undefined' : _typeof(Vector4), 'function');
  t.equals(typeof Matrix4 === 'undefined' ? 'undefined' : _typeof(Matrix4), 'function');
  t.equals(typeof Quaternion === 'undefined' ? 'undefined' : _typeof(Quaternion), 'function');
  t.end();
});

test('Math#construct and Array.isArray check', function (t) {
  t.ok(Array.isArray(new Vector2()));
  t.ok(Array.isArray(new Vector3()));
  t.ok(Array.isArray(new Vector4()));
  t.ok(Array.isArray(new Matrix4()));
  t.ok(Array.isArray(new Quaternion()));
  t.end();
});

// ['add', 'cross'];
var VECTOR_METHODS = ['clone'];

test('Vector2#members and methods', function (t) {
  var v = new Vector2();
  t.equals(v.x, 0);
  t.equals(v.y, 0);

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = VECTOR_METHODS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var method = _step.value;

      t.equals(_typeof(v[method]), 'function');
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

  t.end();
});

test('Vector3#members and methods', function (t) {
  var v = new Vector3();
  t.equals(v.x, 0);
  t.equals(v.y, 0);
  t.equals(v.z, 0);

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = VECTOR_METHODS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var method = _step2.value;

      t.equals(_typeof(v[method]), 'function');
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

  t.end();
});

test('Vector4#members and methods', function (t) {
  var v = new Vector4();
  t.equals(v.x, 0);
  t.equals(v.y, 0);
  t.equals(v.z, 0);
  t.equals(v.w, 0);

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = VECTOR_METHODS[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var method = _step3.value;

      t.equals(_typeof(v[method]), 'function');
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

  t.end();
});

test('Matrix4.toFloat32Array', function (t) {
  t.equals(_typeof(Matrix4.prototype.toFloat32Array), 'function');
  var m = new Matrix4();
  m.identity();
  t.equals(m.toFloat32Array().BYTES_PER_ELEMENT, 4);
  t.end();
});

test('Matrix4#identity (identity matrix)', function (t) {
  t.equals(_typeof(Matrix4.prototype.identity), 'function');
  var m = new Matrix4();
  m.identity();

  var RESULT = IDENTITY_MATRIX;

  tapeEquals(t, m, RESULT);
  t.end();
});

test('Matrix4#set', function (t) {
  var _ref;

  t.equals(_typeof(Matrix4.prototype.set), 'function');

  var INPUT = INDICES_MATRIX;
  var RESULT = INDICES_MATRIX;

  var m = (_ref = new Matrix4()).set.apply(_ref, INPUT);

  tapeEquals(t, m, RESULT, 'set gave the right result');
  t.end();
});

test('Matrix4.transpose', function (t) {
  var _ref2;

  t.equals(_typeof(Matrix4.prototype.transpose), 'function');

  var INPUT = INDICES_MATRIX;
  var RESULT = TRANSPOSED_INDICES_MATRIX;

  var m = (_ref2 = new Matrix4()).set.apply(_ref2, INPUT);

  var result = m.transpose();

  tapeEquals(t, result, RESULT, 'transpose gave the right result');
  t.end();
});

test('Matrix4.add', function (t) {
  var RESULT = [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2];

  t.equals(_typeof(Matrix4.prototype.add), 'function');
  var m = new Matrix4().identity();
  m = m.add(m);

  tapeEquals(t, m, RESULT, 'add gave the right result');
  t.end();
});

test('Matrix4.scale', function (t) {
  var RESULT = [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1];

  t.equals(_typeof(Matrix4.prototype.scale), 'function');
  var m = new Matrix4().identity();
  var result = m.scale([1, 2, 3]);

  tapeEquals(t, result, RESULT, 'scale gave the right result');
  t.end();
});

test('Matrix4.translate', function (t) {
  var RESULT = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1];

  t.equals(_typeof(Matrix4.prototype.translate), 'function');
  var m = new Matrix4().identity();
  var result = m.translate([1, 2, 3]);

  tapeEquals(t, result, RESULT, 'translate gave the right result');
  t.end();
});

// test('Matrix4.invert', t => {
//   t.equals(typeof Matrix4.prototype.invert, 'function');
//   const m = new Matrix4();
//   m.identity();
//   const ans = m.frustum(-1, 1, -1, 1, 0.1, 100).invert();
//   t.ok(abs(ans.n11 - 9.99999999) < delta);
//   t.ok(abs(ans.n12 - 0) < delta);
//   t.ok(abs(ans.n13 - 0) < delta);
//   t.ok(abs(ans.n14 - 0) < delta);
//   t.ok(abs(ans.n21 - 0) < delta);
//   t.ok(abs(ans.n22 - 9.99999999) < delta);
//   t.ok(abs(ans.n23 - 0) < delta);
//   t.ok(abs(ans.n24 - 0) < delta);
//   t.ok(abs(ans.n31 - 0) < delta);
//   t.ok(abs(ans.n32 - 0) < delta);
//   t.ok(abs(ans.n33 - 0) < delta);
//   t.ok(abs(ans.n34 - -1) < delta);
//   t.ok(abs(ans.n41 - 0) < delta);
//   t.ok(abs(ans.n42 - 0) < delta);
//   t.ok(abs(ans.n43 - -4.995) < delta);
//   t.ok(abs(ans.n44 - 5.005) < delta);
//   t.end();
// });

// test('Matrix4.mulVector3', t => {
//   t.equals(typeof Matrix4.prototype.mulVector3, 'function');
//   const v = new Vector3(1, 1, 1);
//   const m = new Matrix4();
//   const ans = m.mulVector3(v);

//   t.equals(ans[0], 1);
//   t.equals(ans[1], 1);
//   t.equals(ans[2], 1);
//   t.end();
// });

// test('Matrix4.$mulVector3', t => {
//   t.equals(typeof Matrix4.prototype.$mulVector3, 'function');
//   const v = new Vector3(1, 1, 1);
//   const m = new Matrix4();

//   m.$mulVector3(v);

//   t.equals(v[0], 1);
//   t.equals(v[1], 1);
//   t.equals(v[2], 1);
//   t.end();
// });

// test('Matrix4.mulMatrix42', t => {
//   t.equals(typeof Matrix4.prototype.mulMatrix42, 'function');
//   const m1 = new Matrix4();
//   m1.set(1, 2, 3, 4,
//          5, 6, 7, 8,
//          9, 10, 11, 12,
//          13, 14, 15, 16);

//   const m2 = new Matrix4();
//   m2.set(1, 2, 3, 4,
//          5, 6, 7, 8,
//          9, 10, 11, 12,
//          13, 14, 15, 16).$transpose();

//   const ans = new Matrix4();
//   ans.mulMatrix42(m1, m2);
//   t.ok(abs(ans.n11 - 30) < delta);
//   t.ok(abs(ans.n12 - 70) < delta);
//   t.ok(abs(ans.n13 - 110) < delta);
//   t.ok(abs(ans.n14 - 150) < delta);
//   t.ok(abs(ans.n21 - 70) < delta);
//   t.ok(abs(ans.n22 - 174) < delta);
//   t.ok(abs(ans.n23 - 278) < delta);
//   t.ok(abs(ans.n24 - 382) < delta);
//   t.ok(abs(ans.n31 - 110) < delta);
//   t.ok(abs(ans.n32 - 278) < delta);
//   t.ok(abs(ans.n33 - 446) < delta);
//   t.ok(abs(ans.n34 - 614) < delta);
//   t.ok(abs(ans.n41 - 150) < delta);
//   t.ok(abs(ans.n42 - 382) < delta);
//   t.ok(abs(ans.n43 - 614) < delta);
//   t.ok(abs(ans.n44 - 846) < delta);
//   t.end();
// });

// test('Matrix4.lookAt', t => {
//   t.equals(typeof Matrix4.prototype.lookAt, 'function');
//   t.end();
// });

// test('Matrix4.perspective', t => {
//   t.equals(typeof Matrix4.prototype.perspective, 'function');
//   t.end();
// });

// test('Matrix4.frustum', t => {
//   t.equals(typeof Matrix4.prototype.frustum, 'function');
//   const m = new Matrix4();
//   m.identity();
//   const ans = m.frustum(-1, 1, -1, 1, 0.1, 100);
//   t.ok(abs(ans.n11 - 0.1) < delta);
//   t.ok(abs(ans.n12 - 0) < delta);
//   t.ok(abs(ans.n13 - 0) < delta);
//   t.ok(abs(ans.n14 - 0) < delta);
//   t.ok(abs(ans.n21 - 0) < delta);
//   t.ok(abs(ans.n22 - 0.1) < delta);
//   t.ok(abs(ans.n23 - 0) < delta);
//   t.ok(abs(ans.n24 - 0) < delta);
//   t.ok(abs(ans.n31 - 0) < delta);
//   t.ok(abs(ans.n32 - 0) < delta);
//   t.ok(abs(ans.n33 - -1.002002002002002) < delta);
//   t.ok(abs(ans.n34 - -0.20020020020020018) < delta);
//   t.ok(abs(ans.n41 - 0) < delta);
//   t.ok(abs(ans.n42 - 0) < delta);
//   t.ok(abs(ans.n43 - -1) < delta);
//   t.ok(abs(ans.n44 - 0) < delta);
//   t.end();
// });

// test('Matrix4.rotateAxis', t => {
//   t.equals(typeof Matrix4.prototype.rotateAxis, 'function');
//   const v = [1, 2, 3];
//   const len = Math.sqrt(1 * 1 + 2 * 2 + 3 * 3);
//   const theta = Math.PI / 4;
//   const m = new Matrix4();

//   v[0] /= len;
//   v[1] /= len;
//   v[2] /= len;

//   const ans = m.rotateAxis(theta, v);
//   t.ok(abs(ans.n11 - 0.7280277013778687) < delta);
//   t.ok(abs(ans.n12 - -0.525104820728302) < delta);
//   t.ok(abs(ans.n13 - 0.4407272934913635) < delta);
//   t.ok(abs(ans.n14 - 0) < delta);
//   t.ok(abs(ans.n21 - 0.6087885979157627) < delta);
//   t.ok(abs(ans.n22 - 0.7907905578613281) < delta);
//   t.ok(abs(ans.n23 - -0.06345657259225845) < delta);
//   t.ok(abs(ans.n24 - 0) < delta);
//   t.ok(abs(ans.n31 - -0.3152016404063445) < delta);
//   t.ok(abs(ans.n32 - 0.3145079017103789) < delta);
//   t.ok(abs(ans.n33 - 0.8953952789306641) < delta);
//   t.ok(abs(ans.n34 - 0) < delta);
//   t.ok(abs(ans.n41 - 0) < delta);
//   t.ok(abs(ans.n42 - 0) < delta);
//   t.ok(abs(ans.n43 - 0) < delta);
//   t.ok(abs(ans.n44 - 1) < delta);
//   t.end();
// });

// test('Matrix4.rotateXYZ', t => {
//   t.equals(typeof Matrix4.prototype.rotateXYZ, 'function');
//   const m = new Matrix4();
//   m.identity();
//   const ans = m.rotateXYZ(1, 2, 3);
//   t.ok(abs(ans.n11 - 0.411982245665683) < delta);
//   t.ok(abs(ans.n12 - -0.8337376517741568) < delta);
//   t.ok(abs(ans.n13 - -0.36763046292489926) < delta);
//   t.ok(abs(ans.n14 - 0) < delta);
//   t.ok(abs(ans.n21 - -0.05872664492762098) < delta);
//   t.ok(abs(ans.n22 - -0.42691762127620736) < delta);
//   t.ok(abs(ans.n23 - 0.9023815854833308) < delta);
//   t.ok(abs(ans.n24 - 0) < delta);
//   t.ok(abs(ans.n31 - -0.9092974268256817) < delta);
//   t.ok(abs(ans.n32 - -0.35017548837401463) < delta);
//   t.ok(abs(ans.n33 - -0.2248450953661529) < delta);
//   t.ok(abs(ans.n34 - 0) < delta);
//   t.ok(abs(ans.n41 - 0) < delta);
//   t.ok(abs(ans.n42 - 0) < delta);
//   t.ok(abs(ans.n43 - 0) < delta);
//   t.ok(abs(ans.n44 - 1) < delta);
//   t.end();
// });

test('Quaternion#methods', function (t) {
  var q = new Quaternion();
  t.equals(q[0], 0);
  t.equals(q[1], 0);
  t.equals(q[2], 0);
  t.equals(q[3], 1);
  t.equals(_typeof(q.add), 'function');
  t.equals(_typeof(q.clone), 'function');
  t.equals(_typeof(q.conjugate), 'function');
  // t.equals(typeof q.divQuaternion, 'function');
  t.equals(_typeof(q.invert), 'function');
  t.equals(_typeof(q.multiply), 'function');
  // t.equals(typeof q.negate, 'function');
  // t.equals(typeof q.norm, 'function');
  // t.equals(typeof q.normSq, 'function');
  t.equals(_typeof(q.scale), 'function');
  t.equals(_typeof(q.set), 'function');
  // t.equals(typeof q.setQuaternion, 'function');
  // t.equals(typeof q.sub, 'function');
  // t.equals(typeof q.unit, 'function');
  t.end();
});

// test('Quaternion.fromAxisRotation', t => {
//   let q = Quaternion.fromAxisRotation(new Vector3(0, 0, 1), Math.PI);
//   t.equals(q[0], 0);
//   t.equals(q[1], 0);
//   t.equals(q[2], 1);
//   t.equals(q[3], Math.cos(Math.PI / 2));

//   q = Quaternion.fromAxisRotation(new Vector3(0, 1, 0), Math.PI);
//   t.equals(q[0], 0);
//   t.equals(q[1], 1);
//   t.equals(q[2], 0);
//   t.equals(q[3], Math.cos(Math.PI / 2));

//   q = Quaternion.fromAxisRotation(new Vector3(1, 0, 0), Math.PI);
//   t.equals(q[0], 1);
//   t.equals(q[1], 0);
//   t.equals(q[2], 0);
//   t.equals(q[3], Math.cos(Math.PI / 2));

//   const q1 = Quaternion.fromAxisRotation(new Vector3(5, 0, -2), Math.PI / 3);
//   const q2 = Quaternion.fromAxisRotation(new Vector3(1, 3, 0), Math.PI / 4);
//   q1.$mulQuaternion(q2);
//   t.equals(q1[0], 0.6011183144537015);
//   t.equals(q1[1], 0.29193457751898655);
//   t.equals(q1[2], -0.0030205353559888126);
//   t.equals(q1[3], 0.7439232829017486);
//   t.end();
// });
//# sourceMappingURL=test.js.map