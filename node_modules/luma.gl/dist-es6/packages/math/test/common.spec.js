var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

import { isArray } from '../';
// import {tapeEquals} from './index';
import test from 'tape-catch';

test('Math#types', function (t) {
  t.equals(typeof isArray === 'undefined' ? 'undefined' : _typeof(isArray), 'function');
  t.end();
});

test('Math#construct and isArray check', function (t) {
  t.ok(isArray([]), 'isArray([])');
  t.ok(isArray(new Float32Array(1)), 'isArray(Float32Array)');
  t.notOk(isArray(new ArrayBuffer(4)), 'isArray(ArrayBuffer)');
  t.notOk(isArray(new DataView(new ArrayBuffer(16))), 'isArray(DataView)');

  t.notOk(isArray(undefined), 'isArray(undefined)');
  t.notOk(isArray(null), 'isArray(null)');
  t.notOk(isArray({}), 'isArray({})');
  t.notOk(isArray({ length: 0 }), 'isArray({...})');
  t.notOk(isArray(1), 'isArray(1)');
  t.notOk(isArray(NaN), 'isArray(NaN)');
  t.notOk(isArray('NaN'), 'isArray(\'NaN\')');
  t.notOk(isArray(''), 'isArray(\'\')');

  t.end();
});
//# sourceMappingURL=common.spec.js.map