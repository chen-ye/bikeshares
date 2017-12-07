var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import Object3D from './object-3d';
import { Matrix4 } from '../packages/math';
import assert from 'assert';

var Group = /*#__PURE__*/function (_Object3D) {
  _inherits(Group, _Object3D);

  function Group() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Group);

    var _opts$children = opts.children,
        children = _opts$children === undefined ? [] : _opts$children;

    children.every(function (child) {
      return assert(child instanceof Object3D);
    });

    var _this = _possibleConstructorReturn(this, (Group.__proto__ || Object.getPrototypeOf(Group)).call(this, opts));

    _this.children = children;
    return _this;
  }

  // Unpacks arrays and nested arrays of children


  _createClass(Group, [{
    key: 'add',
    value: function add() {
      for (var _len = arguments.length, children = Array(_len), _key = 0; _key < _len; _key++) {
        children[_key] = arguments[_key];
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var child = _step.value;

          if (Array.isArray(child)) {
            this.add.apply(this, _toConsumableArray(child));
          } else {
            this.children.push(child);
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

      return this;
    }
  }, {
    key: 'remove',
    value: function remove(child) {
      var children = this.children;
      var indexOf = children.indexOf(child);
      if (indexOf > -1) {
        children.splice(indexOf, 1);
      }
      return this;
    }
  }, {
    key: 'removeAll',
    value: function removeAll() {
      this.children = [];
      return this;
    }

    // If visitor returns a truthy value, traversal will be aborted and that value
    // will be returned from `traverse`. Otherwise `traverse` will return null.

  }, {
    key: 'traverse',
    value: function traverse(visitor) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$modelMatrix = _ref.modelMatrix,
          modelMatrix = _ref$modelMatrix === undefined ? new Matrix4() : _ref$modelMatrix;

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var child = _step2.value;
          var matrix = child.matrix;

          modelMatrix = modelMatrix.multiplyRight(matrix);
          var result = void 0;
          if (child instanceof Group) {
            result = child.traverse(visitor, { modelMatrix: modelMatrix });
          } else {
            // child.setUniforms({modelMatrix});
            result = visitor(child, {});
          }
          // Abort if a result was returned
          if (result) {
            return result;
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

      return null;
    }

    // If visitor returns a truthy value, traversal will be aborted and that value
    // will be returned from `traverseReverse`. Otherwise `traverseReverse` will return null.

  }, {
    key: 'traverseReverse',
    value: function traverseReverse(visitor) {
      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$modelMatrix = _ref2.modelMatrix,
          modelMatrix = _ref2$modelMatrix === undefined ? new Matrix4() : _ref2$modelMatrix;

      for (var i = this.children.length - 1; i >= 0; --i) {
        var child = this.children[i];
        var matrix = child.matrix;

        modelMatrix = modelMatrix.multiplyRight(matrix);
        var result = void 0;
        if (child instanceof Group) {
          result = child.traverseReverse(visitor, { modelMatrix: modelMatrix });
        } else {
          // child.setUniforms({modelMatrix});
          result = visitor(child, {});
        }
        // Abort if a result was returned
        if (result) {
          return result;
        }
      }
      return null;
    }
  }]);

  return Group;
}(Object3D);

export default Group;
//# sourceMappingURL=group.js.map