var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint-disable guard-for-in */
import { GL } from 'luma.gl';
import Stats from './stats';
import { log } from './utils';
import assert from 'assert';

var LOG_START_END_PRIORITY = 1;
var LOG_DETAIL_PRIORITY = 2;

function noop() {}

/* eslint-disable complexity */
export function glArrayFromType(glType) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$clamped = _ref.clamped,
      clamped = _ref$clamped === undefined ? true : _ref$clamped;

  // Sorted in some order of likelihood to reduce amount of comparisons
  switch (glType) {
    case GL.FLOAT:
      return Float32Array;
    case GL.UNSIGNED_SHORT:
    case GL.UNSIGNED_SHORT_5_6_5:
    case GL.UNSIGNED_SHORT_4_4_4_4:
    case GL.UNSIGNED_SHORT_5_5_5_1:
      return Uint16Array;
    case GL.UNSIGNED_INT:
      return Uint32Array;
    case GL.UNSIGNED_BYTE:
      return clamped ? Uint8ClampedArray : Uint8Array;
    case GL.BYTE:
      return Int8Array;
    case GL.SHORT:
      return Int16Array;
    case GL.INT:
      return Int32Array;
    default:
      throw new Error('Failed to deduce type from array');
  }
}
/* eslint-enable complexity */

// Default loggers
var logFunctions = {
  onUpdateStart: function onUpdateStart(_ref2) {
    var level = _ref2.level,
        id = _ref2.id,
        numInstances = _ref2.numInstances;

    log.time(level, 'Updated attributes for ' + numInstances + ' instances in ' + id + ' in');
  },
  onLog: function onLog(_ref3) {
    var level = _ref3.level,
        message = _ref3.message;

    log.log(level, message);
  },
  onUpdateEnd: function onUpdateEnd(_ref4) {
    var level = _ref4.level,
        id = _ref4.id,
        numInstances = _ref4.numInstances;

    log.timeEnd(level, 'Updated attributes for ' + numInstances + ' instances in ' + id + ' in');
  }
};

var AttributeManager = function () {
  _createClass(AttributeManager, null, [{
    key: 'setDefaultLogFunctions',

    /**
     * Sets log functions to help trace or time attribute updates.
     * Default logging uses deck logger.
     *
     * `onLog` is called for each attribute.
     *
     * To enable detailed control of timming and e.g. hierarchical logging,
     * hooks are also provided for update start and end.
     *
     * @param {Object} [opts]
     * @param {String} [opts.onLog=] - called to print
     * @param {String} [opts.onUpdateStart=] - called before update() starts
     * @param {String} [opts.onUpdateEnd=] - called after update() ends
     */
    value: function setDefaultLogFunctions() {
      var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          onLog = _ref5.onLog,
          onUpdateStart = _ref5.onUpdateStart,
          onUpdateEnd = _ref5.onUpdateEnd;

      if (onLog !== undefined) {
        logFunctions.onLog = onLog || noop;
      }
      if (onUpdateStart !== undefined) {
        logFunctions.onUpdateStart = onUpdateStart || noop;
      }
      if (onUpdateEnd !== undefined) {
        logFunctions.onUpdateEnd = onUpdateEnd || noop;
      }
    }

    /**
     * @classdesc
     * Automated attribute generation and management. Suitable when a set of
     * vertex shader attributes are generated by iteration over a data array,
     * and updates to these attributes are needed either when the data itself
     * changes, or when other data relevant to the calculations change.
     *
     * - First the application registers descriptions of its dynamic vertex
     *   attributes using AttributeManager.add().
     * - Then, when any change that affects attributes is detected by the
     *   application, the app will call AttributeManager.invalidate().
     * - Finally before it renders, it calls AttributeManager.update() to
     *   ensure that attributes are automatically rebuilt if anything has been
     *   invalidated.
     *
     * The application provided update functions describe how attributes
     * should be updated from a data array and are expected to traverse
     * that data array (or iterable) and fill in the attribute's typed array.
     *
     * Note that the attribute manager intentionally does not do advanced
     * change detection, but instead makes it easy to build such detection
     * by offering the ability to "invalidate" each attribute separately.
     *
     * Summary:
     * - keeps track of valid state for each attribute
     * - auto reallocates attributes when needed
     * - auto updates attributes with registered updater functions
     * - allows overriding with application supplied buffers
     *
     * Limitations:
     * - There are currently no provisions for only invalidating a range of
     *   indices in an attribute.
     *
     * @class
     * @param {Object} [props]
     * @param {String} [props.id] - identifier (for debugging)
     */

  }]);

  function AttributeManager() {
    var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref6$id = _ref6.id,
        id = _ref6$id === undefined ? 'attribute-manager' : _ref6$id;

    _classCallCheck(this, AttributeManager);

    this.id = id;

    this.attributes = {};
    this.updateTriggers = {};
    this.allocedInstances = -1;
    this.needsRedraw = true;

    this.userData = {};
    this.stats = new Stats({ id: 'attr' });

    // For debugging sanity, prevent uninitialized members
    Object.seal(this);
  }

  /**
   * Adds attributes
   * Takes a map of attribute descriptor objects
   * - keys are attribute names
   * - values are objects with attribute fields
   *
   * attribute.size - number of elements per object
   * attribute.updater - number of elements
   * attribute.instanced=0 - is this is an instanced attribute (a.k.a. divisor)
   * attribute.noAlloc=false - if this attribute should not be allocated
   *
   * @example
   * attributeManager.add({
   *   positions: {size: 2, update: calculatePositions}
   *   colors: {size: 3, update: calculateColors}
   * });
   *
   * @param {Object} attributes - attribute map (see above)
   * @param {Object} updaters - separate map of update functions (deprecated)
   */


  _createClass(AttributeManager, [{
    key: 'add',
    value: function add(attributes) {
      var updaters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this._add(attributes, updaters);
    }

    /**
      * Removes attributes
      * Takes an array of attribute names and delete them from
      * the attribute map if they exists
      *
      * @example
      * attributeManager.remove(['position']);
      *
      * @param {Object} attributeNameArray - attribute name array (see above)
      */

  }, {
    key: 'remove',
    value: function remove(attributeNameArray) {
      for (var i = 0; i < attributeNameArray.length; i++) {
        var name = attributeNameArray[i];
        if (this.attributes[name] !== undefined) {
          delete this.attributes[name];
        }
      }
    }

    /* Marks an attribute for update
     * @param {string} triggerName: attribute or accessor name
     */

  }, {
    key: 'invalidate',
    value: function invalidate(triggerName) {
      var attributes = this.attributes,
          updateTriggers = this.updateTriggers;

      var attributesToUpdate = updateTriggers[triggerName];

      if (!attributesToUpdate) {
        var message = 'invalidating non-existent attribute ' + triggerName + ' for ' + this.id + '\n';
        message += 'Valid attributes: ' + Object.keys(attributes).join(', ');
        assert(attributesToUpdate, message);
      }
      attributesToUpdate.forEach(function (name) {
        var attribute = attributes[name];
        if (attribute) {
          attribute.needsUpdate = true;
        }
      });
      // For performance tuning
      logFunctions.onLog({
        level: LOG_DETAIL_PRIORITY,
        message: 'invalidated attribute ' + attributesToUpdate + ' for ' + this.id,
        id: this.identifier
      });
    }
  }, {
    key: 'invalidateAll',
    value: function invalidateAll() {
      var attributes = this.attributes;

      for (var attributeName in attributes) {
        this.invalidate(attributeName);
      }
    }

    /**
     * Ensure all attribute buffers are updated from props or data.
     *
     * Note: Any preallocated buffers in "buffers" matching registered attribute
     * names will be used. No update will happen in this case.
     * Note: Calls onUpdateStart and onUpdateEnd log callbacks before and after.
     *
     * @param {Object} opts - options
     * @param {Object} opts.data - data (iterable object)
     * @param {Object} opts.numInstances - count of data
     * @param {Object} opts.buffers = {} - pre-allocated buffers
     * @param {Object} opts.props - passed to updaters
     * @param {Object} opts.context - Used as "this" context for updaters
     */

  }, {
    key: 'update',
    value: function update() {
      var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          data = _ref7.data,
          numInstances = _ref7.numInstances,
          _ref7$props = _ref7.props,
          props = _ref7$props === undefined ? {} : _ref7$props,
          _ref7$buffers = _ref7.buffers,
          buffers = _ref7$buffers === undefined ? {} : _ref7$buffers,
          _ref7$context = _ref7.context,
          context = _ref7$context === undefined ? {} : _ref7$context,
          _ref7$ignoreUnknownAt = _ref7.ignoreUnknownAttributes,
          ignoreUnknownAttributes = _ref7$ignoreUnknownAt === undefined ? false : _ref7$ignoreUnknownAt;

      // First apply any application provided buffers
      this._checkExternalBuffers({ buffers: buffers, ignoreUnknownAttributes: ignoreUnknownAttributes });
      this._setExternalBuffers(buffers);

      // Only initiate alloc/update (and logging) if actually needed
      if (this._analyzeBuffers({ numInstances: numInstances })) {
        logFunctions.onUpdateStart({ level: LOG_START_END_PRIORITY, id: this.id, numInstances: numInstances });
        this.stats.timeStart();
        this._updateBuffers({ numInstances: numInstances, data: data, props: props, context: context });
        this.stats.timeEnd();
        logFunctions.onUpdateEnd({ level: LOG_START_END_PRIORITY, id: this.id, numInstances: numInstances });
      }
    }

    /**
     * Returns all attribute descriptors
     * Note: Format matches luma.gl Model/Program.setAttributes()
     * @return {Object} attributes - descriptors
     */

  }, {
    key: 'getAttributes',
    value: function getAttributes() {
      return this.attributes;
    }

    /**
     * Returns changed attribute descriptors
     * This indicates which WebGLBuggers need to be updated
     * @return {Object} attributes - descriptors
     */

  }, {
    key: 'getChangedAttributes',
    value: function getChangedAttributes(_ref8) {
      var _ref8$clearChangedFla = _ref8.clearChangedFlags,
          clearChangedFlags = _ref8$clearChangedFla === undefined ? false : _ref8$clearChangedFla;
      var attributes = this.attributes;

      var changedAttributes = {};
      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];
        if (attribute.changed) {
          attribute.changed = attribute.changed && !clearChangedFlags;
          changedAttributes[attributeName] = attribute;
        }
      }
      return changedAttributes;
    }

    /**
     * Returns the redraw flag, optionally clearing it.
     * Redraw flag will be set if any attributes attributes changed since
     * flag was last cleared.
     *
     * @param {Object} [opts]
     * @param {String} [opts.clearRedrawFlags=false] - whether to clear the flag
     * @return {Boolean} - whether a redraw is needed.
     */

  }, {
    key: 'getNeedsRedraw',
    value: function getNeedsRedraw() {
      var _ref9 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref9$clearRedrawFlag = _ref9.clearRedrawFlags,
          clearRedrawFlags = _ref9$clearRedrawFlag === undefined ? false : _ref9$clearRedrawFlag;

      var redraw = this.needsRedraw;
      redraw = redraw || this.needsRedraw;
      this.needsRedraw = this.needsRedraw && !clearRedrawFlags;
      return redraw;
    }

    /**
     * Sets the redraw flag.
     * @param {Boolean} redraw=true
     * @return {AttributeManager} - for chaining
     */

  }, {
    key: 'setNeedsRedraw',
    value: function setNeedsRedraw() {
      var redraw = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this.needsRedraw = true;
      return this;
    }

    // DEPRECATED METHODS

    /**
     * @deprecated since version 2.5, use add() instead
     * Adds attributes
     * @param {Object} attributes - attribute map (see above)
     * @param {Object} updaters - separate map of update functions (deprecated)
     */

  }, {
    key: 'addInstanced',
    value: function addInstanced(attributes) {
      var updaters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this._add(attributes, updaters, { instanced: 1 });
    }

    // PRIVATE METHODS

    // Used to register an attribute

  }, {
    key: '_add',
    value: function _add(attributes) {
      var updaters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var _extraProps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var newAttributes = {};

      for (var attributeName in attributes) {
        // support for separate update function map
        // For now, just copy any attributes from that map into the main map
        // TODO - Attribute maps are a deprecated feature, remove
        if (attributeName in updaters) {
          attributes[attributeName] = Object.assign({}, attributes[attributeName], updaters[attributeName]);
        }

        var attribute = attributes[attributeName];

        var isIndexed = attribute.isIndexed || attribute.elements;
        var size = attribute.elements && 1 || attribute.size;
        var value = attribute.value || null;

        // Initialize the attribute descriptor, with WebGL and metadata fields
        var attributeData = Object.assign({
          // Ensure that fields are present before Object.seal()
          target: undefined,
          userData: {} // Reserved for application
        },
        // Metadata
        attribute, {
          // State
          isExternalBuffer: false,
          needsAlloc: false,
          needsUpdate: false,
          changed: false,

          // Luma fields
          isIndexed: isIndexed,
          size: size,
          value: value
        }, _extraProps);
        // Sanity - no app fields on our attributes. Use userData instead.
        Object.seal(attributeData);

        // Check all fields and generate helpful error messages
        this._validateAttributeDefinition(attributeName, attributeData);

        // Add to both attributes list (for registration with model)
        newAttributes[attributeName] = attributeData;
      }

      Object.assign(this.attributes, newAttributes);

      this._mapUpdateTriggersToAttributes();
    }

    // build updateTrigger name to attribute name mapping

  }, {
    key: '_mapUpdateTriggersToAttributes',
    value: function _mapUpdateTriggersToAttributes() {
      var _this = this;

      var triggers = {};

      var _loop = function _loop(attributeName) {
        var attribute = _this.attributes[attributeName];
        var accessor = attribute.accessor;

        // use attribute name as update trigger key

        triggers[attributeName] = [attributeName];

        // use accessor name as update trigger key
        if (typeof accessor === 'string') {
          accessor = [accessor];
        }
        if (Array.isArray(accessor)) {
          accessor.forEach(function (accessorName) {
            if (!triggers[accessorName]) {
              triggers[accessorName] = [];
            }
            triggers[accessorName].push(attributeName);
          });
        }
      };

      for (var attributeName in this.attributes) {
        _loop(attributeName);
      }

      this.updateTriggers = triggers;
    }
  }, {
    key: '_validateAttributeDefinition',
    value: function _validateAttributeDefinition(attributeName, attribute) {
      assert(attribute.size >= 1 && attribute.size <= 4, 'Attribute definition for ' + attributeName + ' invalid size');

      // Check that either 'accessor' or 'update' is a valid function
      var hasUpdater = attribute.noAlloc || typeof attribute.update === 'function' || typeof attribute.accessor === 'string';
      if (!hasUpdater) {
        throw new Error('Attribute ' + attributeName + ' missing update or accessor');
      }
    }

    // Checks that any attribute buffers in props are valid
    // Note: This is just to help app catch mistakes

  }, {
    key: '_checkExternalBuffers',
    value: function _checkExternalBuffers() {
      var _ref10 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref10$buffers = _ref10.buffers,
          buffers = _ref10$buffers === undefined ? {} : _ref10$buffers,
          _ref10$ignoreUnknownA = _ref10.ignoreUnknownAttributes,
          ignoreUnknownAttributes = _ref10$ignoreUnknownA === undefined ? false : _ref10$ignoreUnknownA;

      var attributes = this.attributes;

      for (var attributeName in buffers) {
        var attribute = attributes[attributeName];
        if (!attribute && !ignoreUnknownAttributes) {
          throw new Error('Unknown attribute prop ' + attributeName);
        }
        // const buffer = buffers[attributeName];
        // TODO - check buffer type
      }
    }

    // Set the buffers for the supplied attributes
    // Update attribute buffers from any attributes in props
    // Detach any previously set buffers, marking all
    // Attributes for auto allocation
    /* eslint-disable max-statements */

  }, {
    key: '_setExternalBuffers',
    value: function _setExternalBuffers(bufferMap) {
      var attributes = this.attributes,
          numInstances = this.numInstances;

      // Copy the refs of any supplied buffers in the props

      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];
        var buffer = bufferMap[attributeName];
        attribute.isExternalBuffer = false;
        if (buffer) {
          var ArrayType = glArrayFromType(attribute.type || GL.FLOAT);
          if (!(buffer instanceof ArrayType)) {
            throw new Error('Attribute ' + attributeName + ' must be of type ' + ArrayType.name);
          }
          if (attribute.auto && buffer.length <= numInstances * attribute.size) {
            throw new Error('Attribute prop array must match length and size');
          }

          attribute.isExternalBuffer = true;
          attribute.needsUpdate = false;
          if (attribute.value !== buffer) {
            attribute.value = buffer;
            attribute.changed = true;
            this.needsRedraw = true;
          }
        }
      }
    }
    /* eslint-enable max-statements */

    /* Checks that typed arrays for attributes are big enough
     * sets alloc flag if not
     * @return {Boolean} whether any updates are needed
     */

  }, {
    key: '_analyzeBuffers',
    value: function _analyzeBuffers(_ref11) {
      var numInstances = _ref11.numInstances;
      var attributes = this.attributes;

      assert(numInstances !== undefined, 'numInstances not defined');

      // Track whether any allocations or updates are needed
      var needsUpdate = false;

      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];
        if (!attribute.isExternalBuffer) {
          // Do we need to reallocate the attribute's typed array?
          var needsAlloc = attribute.value === null || attribute.value.length / attribute.size < numInstances;
          if (needsAlloc && (attribute.update || attribute.accessor)) {
            attribute.needsAlloc = true;
            needsUpdate = true;
          }
          if (attribute.needsUpdate) {
            needsUpdate = true;
          }
        }
      }

      return needsUpdate;
    }

    /**
     * @private
     * Calls update on any buffers that need update
     * TODO? - If app supplied all attributes, no need to iterate over data
     *
     * @param {Object} opts - options
     * @param {Object} opts.data - data (iterable object)
     * @param {Object} opts.numInstances - count of data
     * @param {Object} opts.buffers = {} - pre-allocated buffers
     * @param {Object} opts.props - passed to updaters
     * @param {Object} opts.context - Used as "this" context for updaters
     */
    /* eslint-disable max-statements, complexity */

  }, {
    key: '_updateBuffers',
    value: function _updateBuffers(_ref12) {
      var numInstances = _ref12.numInstances,
          data = _ref12.data,
          props = _ref12.props,
          context = _ref12.context;
      var attributes = this.attributes;

      // Allocate at least one element to ensure a valid buffer

      var allocCount = Math.max(numInstances, 1);

      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];

        // Allocate a new typed array if needed
        if (attribute.needsAlloc) {
          var ArrayType = glArrayFromType(attribute.type || GL.FLOAT);
          attribute.value = new ArrayType(attribute.size * allocCount);
          logFunctions.onLog({
            level: LOG_DETAIL_PRIORITY,
            message: this.id + ':' + attributeName + ' allocated ' + allocCount,
            id: this.id
          });
          attribute.needsAlloc = false;
          attribute.needsUpdate = true;
        }

        // Call updater function if needed
        if (attribute.needsUpdate) {
          this._updateBuffer({ attribute: attribute, attributeName: attributeName, numInstances: numInstances, data: data, props: props, context: context });
        }
      }

      this.allocedInstances = allocCount;
    }
  }, {
    key: '_updateBuffer',
    value: function _updateBuffer(_ref13) {
      var attribute = _ref13.attribute,
          attributeName = _ref13.attributeName,
          numInstances = _ref13.numInstances,
          data = _ref13.data,
          props = _ref13.props,
          context = _ref13.context;
      var update = attribute.update,
          accessor = attribute.accessor;

      if (update) {
        // Custom updater - typically for non-instanced layers
        logFunctions.onLog({
          level: LOG_DETAIL_PRIORITY,
          message: this.id + ':' + attributeName + ' updating ' + numInstances,
          id: this.id
        });
        update.call(context, attribute, { data: data, props: props, numInstances: numInstances });
        this._checkAttributeArray(attribute, attributeName);
      } else if (accessor) {
        // Standard updater
        this._updateBufferViaStandardAccessor({ attribute: attribute, data: data, props: props });
        this._checkAttributeArray(attribute, attributeName);
      } else {
        logFunctions.onLog({
          level: LOG_DETAIL_PRIORITY,
          message: this.id + ':' + attributeName + ' missing update function',
          id: this.id
        });
      }

      attribute.needsUpdate = false;
      attribute.changed = true;
      this.needsRedraw = true;
    }
    /* eslint-enable max-statements */

  }, {
    key: '_updateBufferViaStandardAccessor',
    value: function _updateBufferViaStandardAccessor(_ref14) {
      var attribute = _ref14.attribute,
          data = _ref14.data,
          props = _ref14.props;
      var accessor = attribute.accessor,
          value = attribute.value,
          size = attribute.size;

      var accessorFunc = props[accessor];

      assert(typeof accessorFunc === 'function', 'accessor "' + accessor + '" is not a function');

      var _attribute$defaultVal = attribute.defaultValue,
          defaultValue = _attribute$defaultVal === undefined ? [0, 0, 0, 0] : _attribute$defaultVal;

      defaultValue = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var object = _step.value;

          var objectValue = accessorFunc(object);
          objectValue = Array.isArray(objectValue) ? objectValue : [objectValue];
          /* eslint-disable no-fallthrough, default-case */
          switch (size) {
            case 4:
              value[i + 3] = Number.isFinite(objectValue[3]) ? objectValue[3] : defaultValue[3];
            case 3:
              value[i + 2] = Number.isFinite(objectValue[2]) ? objectValue[2] : defaultValue[2];
            case 2:
              value[i + 1] = Number.isFinite(objectValue[1]) ? objectValue[1] : defaultValue[1];
            case 1:
              value[i + 0] = Number.isFinite(objectValue[0]) ? objectValue[0] : defaultValue[0];
          }
          i += size;
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
    }
  }, {
    key: '_checkAttributeArray',
    value: function _checkAttributeArray(attribute, attributeName) {
      var value = attribute.value;

      if (value && value.length >= 4) {
        var valid = Number.isFinite(value[0]) && Number.isFinite(value[1]) && Number.isFinite(value[2]) && Number.isFinite(value[3]);
        if (!valid) {
          throw new Error('Illegal attribute generated for ' + attributeName);
        }
      }
    }
  }]);

  return AttributeManager;
}();

export default AttributeManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvYXR0cmlidXRlLW1hbmFnZXIuanMiXSwibmFtZXMiOlsiR0wiLCJTdGF0cyIsImxvZyIsImFzc2VydCIsIkxPR19TVEFSVF9FTkRfUFJJT1JJVFkiLCJMT0dfREVUQUlMX1BSSU9SSVRZIiwibm9vcCIsImdsQXJyYXlGcm9tVHlwZSIsImdsVHlwZSIsImNsYW1wZWQiLCJGTE9BVCIsIkZsb2F0MzJBcnJheSIsIlVOU0lHTkVEX1NIT1JUIiwiVU5TSUdORURfU0hPUlRfNV82XzUiLCJVTlNJR05FRF9TSE9SVF80XzRfNF80IiwiVU5TSUdORURfU0hPUlRfNV81XzVfMSIsIlVpbnQxNkFycmF5IiwiVU5TSUdORURfSU5UIiwiVWludDMyQXJyYXkiLCJVTlNJR05FRF9CWVRFIiwiVWludDhDbGFtcGVkQXJyYXkiLCJVaW50OEFycmF5IiwiQllURSIsIkludDhBcnJheSIsIlNIT1JUIiwiSW50MTZBcnJheSIsIklOVCIsIkludDMyQXJyYXkiLCJFcnJvciIsImxvZ0Z1bmN0aW9ucyIsIm9uVXBkYXRlU3RhcnQiLCJsZXZlbCIsImlkIiwibnVtSW5zdGFuY2VzIiwidGltZSIsIm9uTG9nIiwibWVzc2FnZSIsIm9uVXBkYXRlRW5kIiwidGltZUVuZCIsIkF0dHJpYnV0ZU1hbmFnZXIiLCJ1bmRlZmluZWQiLCJhdHRyaWJ1dGVzIiwidXBkYXRlVHJpZ2dlcnMiLCJhbGxvY2VkSW5zdGFuY2VzIiwibmVlZHNSZWRyYXciLCJ1c2VyRGF0YSIsInN0YXRzIiwiT2JqZWN0Iiwic2VhbCIsInVwZGF0ZXJzIiwiX2FkZCIsImF0dHJpYnV0ZU5hbWVBcnJheSIsImkiLCJsZW5ndGgiLCJuYW1lIiwidHJpZ2dlck5hbWUiLCJhdHRyaWJ1dGVzVG9VcGRhdGUiLCJrZXlzIiwiam9pbiIsImZvckVhY2giLCJhdHRyaWJ1dGUiLCJuZWVkc1VwZGF0ZSIsImlkZW50aWZpZXIiLCJhdHRyaWJ1dGVOYW1lIiwiaW52YWxpZGF0ZSIsImRhdGEiLCJwcm9wcyIsImJ1ZmZlcnMiLCJjb250ZXh0IiwiaWdub3JlVW5rbm93bkF0dHJpYnV0ZXMiLCJfY2hlY2tFeHRlcm5hbEJ1ZmZlcnMiLCJfc2V0RXh0ZXJuYWxCdWZmZXJzIiwiX2FuYWx5emVCdWZmZXJzIiwidGltZVN0YXJ0IiwiX3VwZGF0ZUJ1ZmZlcnMiLCJjbGVhckNoYW5nZWRGbGFncyIsImNoYW5nZWRBdHRyaWJ1dGVzIiwiY2hhbmdlZCIsImNsZWFyUmVkcmF3RmxhZ3MiLCJyZWRyYXciLCJpbnN0YW5jZWQiLCJfZXh0cmFQcm9wcyIsIm5ld0F0dHJpYnV0ZXMiLCJhc3NpZ24iLCJpc0luZGV4ZWQiLCJlbGVtZW50cyIsInNpemUiLCJ2YWx1ZSIsImF0dHJpYnV0ZURhdGEiLCJ0YXJnZXQiLCJpc0V4dGVybmFsQnVmZmVyIiwibmVlZHNBbGxvYyIsIl92YWxpZGF0ZUF0dHJpYnV0ZURlZmluaXRpb24iLCJfbWFwVXBkYXRlVHJpZ2dlcnNUb0F0dHJpYnV0ZXMiLCJ0cmlnZ2VycyIsImFjY2Vzc29yIiwiQXJyYXkiLCJpc0FycmF5IiwiYWNjZXNzb3JOYW1lIiwicHVzaCIsImhhc1VwZGF0ZXIiLCJub0FsbG9jIiwidXBkYXRlIiwiYnVmZmVyTWFwIiwiYnVmZmVyIiwiQXJyYXlUeXBlIiwidHlwZSIsImF1dG8iLCJhbGxvY0NvdW50IiwiTWF0aCIsIm1heCIsIl91cGRhdGVCdWZmZXIiLCJjYWxsIiwiX2NoZWNrQXR0cmlidXRlQXJyYXkiLCJfdXBkYXRlQnVmZmVyVmlhU3RhbmRhcmRBY2Nlc3NvciIsImFjY2Vzc29yRnVuYyIsImRlZmF1bHRWYWx1ZSIsIm9iamVjdCIsIm9iamVjdFZhbHVlIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJ2YWxpZCJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUUEsRUFBUixRQUFpQixTQUFq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RDs7O3lDQUVvQjFCLFMsRUFBV0csYSxFQUFlO0FBQUEsVUFDdEN3QixLQURzQyxHQUM3QjNCLFNBRDZCLENBQ3RDMkIsS0FEc0M7O0FBRTdDLFVBQUlBLFNBQVNBLE1BQU1sQyxNQUFOLElBQWdCLENBQTdCLEVBQWdDO0FBQzlCLFlBQU1vRSxRQUNKRixPQUFPQyxRQUFQLENBQWdCakMsTUFBTSxDQUFOLENBQWhCLEtBQTZCZ0MsT0FBT0MsUUFBUCxDQUFnQmpDLE1BQU0sQ0FBTixDQUFoQixDQUE3QixJQUNBZ0MsT0FBT0MsUUFBUCxDQUFnQmpDLE1BQU0sQ0FBTixDQUFoQixDQURBLElBQzZCZ0MsT0FBT0MsUUFBUCxDQUFnQmpDLE1BQU0sQ0FBTixDQUFoQixDQUYvQjtBQUdBLFlBQUksQ0FBQ2tDLEtBQUwsRUFBWTtBQUNWLGdCQUFNLElBQUk3RixLQUFKLHNDQUE2Q21DLGFBQTdDLENBQU47QUFDRDtBQUNGO0FBQ0Y7Ozs7OztlQXRpQmtCeEIsZ0IiLCJmaWxlIjoiYXR0cmlidXRlLW1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLyogZXNsaW50LWRpc2FibGUgZ3VhcmQtZm9yLWluICovXG5pbXBvcnQge0dMfSBmcm9tICdsdW1hLmdsJztcbmltcG9ydCBTdGF0cyBmcm9tICcuL3N0YXRzJztcbmltcG9ydCB7bG9nfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgTE9HX1NUQVJUX0VORF9QUklPUklUWSA9IDE7XG5jb25zdCBMT0dfREVUQUlMX1BSSU9SSVRZID0gMjtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbi8qIGVzbGludC1kaXNhYmxlIGNvbXBsZXhpdHkgKi9cbmV4cG9ydCBmdW5jdGlvbiBnbEFycmF5RnJvbVR5cGUoZ2xUeXBlLCB7Y2xhbXBlZCA9IHRydWV9ID0ge30pIHtcbiAgLy8gU29ydGVkIGluIHNvbWUgb3JkZXIgb2YgbGlrZWxpaG9vZCB0byByZWR1Y2UgYW1vdW50IG9mIGNvbXBhcmlzb25zXG4gIHN3aXRjaCAoZ2xUeXBlKSB7XG4gIGNhc2UgR0wuRkxPQVQ6XG4gICAgcmV0dXJuIEZsb2F0MzJBcnJheTtcbiAgY2FzZSBHTC5VTlNJR05FRF9TSE9SVDpcbiAgY2FzZSBHTC5VTlNJR05FRF9TSE9SVF81XzZfNTpcbiAgY2FzZSBHTC5VTlNJR05FRF9TSE9SVF80XzRfNF80OlxuICBjYXNlIEdMLlVOU0lHTkVEX1NIT1JUXzVfNV81XzE6XG4gICAgcmV0dXJuIFVpbnQxNkFycmF5O1xuICBjYXNlIEdMLlVOU0lHTkVEX0lOVDpcbiAgICByZXR1cm4gVWludDMyQXJyYXk7XG4gIGNhc2UgR0wuVU5TSUdORURfQllURTpcbiAgICByZXR1cm4gY2xhbXBlZCA/IFVpbnQ4Q2xhbXBlZEFycmF5IDogVWludDhBcnJheTtcbiAgY2FzZSBHTC5CWVRFOlxuICAgIHJldHVybiBJbnQ4QXJyYXk7XG4gIGNhc2UgR0wuU0hPUlQ6XG4gICAgcmV0dXJuIEludDE2QXJyYXk7XG4gIGNhc2UgR0wuSU5UOlxuICAgIHJldHVybiBJbnQzMkFycmF5O1xuICBkZWZhdWx0OlxuICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGRlZHVjZSB0eXBlIGZyb20gYXJyYXknKTtcbiAgfVxufVxuLyogZXNsaW50LWVuYWJsZSBjb21wbGV4aXR5ICovXG5cbi8vIERlZmF1bHQgbG9nZ2Vyc1xuY29uc3QgbG9nRnVuY3Rpb25zID0ge1xuICBvblVwZGF0ZVN0YXJ0OiAoe2xldmVsLCBpZCwgbnVtSW5zdGFuY2VzfSkgPT4ge1xuICAgIGxvZy50aW1lKGxldmVsLCBgVXBkYXRlZCBhdHRyaWJ1dGVzIGZvciAke251bUluc3RhbmNlc30gaW5zdGFuY2VzIGluICR7aWR9IGluYCk7XG4gIH0sXG4gIG9uTG9nOiAoe2xldmVsLCBtZXNzYWdlfSkgPT4ge1xuICAgIGxvZy5sb2cobGV2ZWwsIG1lc3NhZ2UpO1xuICB9LFxuICBvblVwZGF0ZUVuZDogKHtsZXZlbCwgaWQsIG51bUluc3RhbmNlc30pID0+IHtcbiAgICBsb2cudGltZUVuZChsZXZlbCwgYFVwZGF0ZWQgYXR0cmlidXRlcyBmb3IgJHtudW1JbnN0YW5jZXN9IGluc3RhbmNlcyBpbiAke2lkfSBpbmApO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdHRyaWJ1dGVNYW5hZ2VyIHtcbiAgLyoqXG4gICAqIFNldHMgbG9nIGZ1bmN0aW9ucyB0byBoZWxwIHRyYWNlIG9yIHRpbWUgYXR0cmlidXRlIHVwZGF0ZXMuXG4gICAqIERlZmF1bHQgbG9nZ2luZyB1c2VzIGRlY2sgbG9nZ2VyLlxuICAgKlxuICAgKiBgb25Mb2dgIGlzIGNhbGxlZCBmb3IgZWFjaCBhdHRyaWJ1dGUuXG4gICAqXG4gICAqIFRvIGVuYWJsZSBkZXRhaWxlZCBjb250cm9sIG9mIHRpbW1pbmcgYW5kIGUuZy4gaGllcmFyY2hpY2FsIGxvZ2dpbmcsXG4gICAqIGhvb2tzIGFyZSBhbHNvIHByb3ZpZGVkIGZvciB1cGRhdGUgc3RhcnQgYW5kIGVuZC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRzXVxuICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdHMub25Mb2c9XSAtIGNhbGxlZCB0byBwcmludFxuICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdHMub25VcGRhdGVTdGFydD1dIC0gY2FsbGVkIGJlZm9yZSB1cGRhdGUoKSBzdGFydHNcbiAgICogQHBhcmFtIHtTdHJpbmd9IFtvcHRzLm9uVXBkYXRlRW5kPV0gLSBjYWxsZWQgYWZ0ZXIgdXBkYXRlKCkgZW5kc1xuICAgKi9cbiAgc3RhdGljIHNldERlZmF1bHRMb2dGdW5jdGlvbnMoe1xuICAgIG9uTG9nLFxuICAgIG9uVXBkYXRlU3RhcnQsXG4gICAgb25VcGRhdGVFbmRcbiAgfSA9IHt9KSB7XG4gICAgaWYgKG9uTG9nICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxvZ0Z1bmN0aW9ucy5vbkxvZyA9IG9uTG9nIHx8IG5vb3A7XG4gICAgfVxuICAgIGlmIChvblVwZGF0ZVN0YXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxvZ0Z1bmN0aW9ucy5vblVwZGF0ZVN0YXJ0ID0gb25VcGRhdGVTdGFydCB8fCBub29wO1xuICAgIH1cbiAgICBpZiAob25VcGRhdGVFbmQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgbG9nRnVuY3Rpb25zLm9uVXBkYXRlRW5kID0gb25VcGRhdGVFbmQgfHwgbm9vcDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBBdXRvbWF0ZWQgYXR0cmlidXRlIGdlbmVyYXRpb24gYW5kIG1hbmFnZW1lbnQuIFN1aXRhYmxlIHdoZW4gYSBzZXQgb2ZcbiAgICogdmVydGV4IHNoYWRlciBhdHRyaWJ1dGVzIGFyZSBnZW5lcmF0ZWQgYnkgaXRlcmF0aW9uIG92ZXIgYSBkYXRhIGFycmF5LFxuICAgKiBhbmQgdXBkYXRlcyB0byB0aGVzZSBhdHRyaWJ1dGVzIGFyZSBuZWVkZWQgZWl0aGVyIHdoZW4gdGhlIGRhdGEgaXRzZWxmXG4gICAqIGNoYW5nZXMsIG9yIHdoZW4gb3RoZXIgZGF0YSByZWxldmFudCB0byB0aGUgY2FsY3VsYXRpb25zIGNoYW5nZS5cbiAgICpcbiAgICogLSBGaXJzdCB0aGUgYXBwbGljYXRpb24gcmVnaXN0ZXJzIGRlc2NyaXB0aW9ucyBvZiBpdHMgZHluYW1pYyB2ZXJ0ZXhcbiAgICogICBhdHRyaWJ1dGVzIHVzaW5nIEF0dHJpYnV0ZU1hbmFnZXIuYWRkKCkuXG4gICAqIC0gVGhlbiwgd2hlbiBhbnkgY2hhbmdlIHRoYXQgYWZmZWN0cyBhdHRyaWJ1dGVzIGlzIGRldGVjdGVkIGJ5IHRoZVxuICAgKiAgIGFwcGxpY2F0aW9uLCB0aGUgYXBwIHdpbGwgY2FsbCBBdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGUoKS5cbiAgICogLSBGaW5hbGx5IGJlZm9yZSBpdCByZW5kZXJzLCBpdCBjYWxscyBBdHRyaWJ1dGVNYW5hZ2VyLnVwZGF0ZSgpIHRvXG4gICAqICAgZW5zdXJlIHRoYXQgYXR0cmlidXRlcyBhcmUgYXV0b21hdGljYWxseSByZWJ1aWx0IGlmIGFueXRoaW5nIGhhcyBiZWVuXG4gICAqICAgaW52YWxpZGF0ZWQuXG4gICAqXG4gICAqIFRoZSBhcHBsaWNhdGlvbiBwcm92aWRlZCB1cGRhdGUgZnVuY3Rpb25zIGRlc2NyaWJlIGhvdyBhdHRyaWJ1dGVzXG4gICAqIHNob3VsZCBiZSB1cGRhdGVkIGZyb20gYSBkYXRhIGFycmF5IGFuZCBhcmUgZXhwZWN0ZWQgdG8gdHJhdmVyc2VcbiAgICogdGhhdCBkYXRhIGFycmF5IChvciBpdGVyYWJsZSkgYW5kIGZpbGwgaW4gdGhlIGF0dHJpYnV0ZSdzIHR5cGVkIGFycmF5LlxuICAgKlxuICAgKiBOb3RlIHRoYXQgdGhlIGF0dHJpYnV0ZSBtYW5hZ2VyIGludGVudGlvbmFsbHkgZG9lcyBub3QgZG8gYWR2YW5jZWRcbiAgICogY2hhbmdlIGRldGVjdGlvbiwgYnV0IGluc3RlYWQgbWFrZXMgaXQgZWFzeSB0byBidWlsZCBzdWNoIGRldGVjdGlvblxuICAgKiBieSBvZmZlcmluZyB0aGUgYWJpbGl0eSB0byBcImludmFsaWRhdGVcIiBlYWNoIGF0dHJpYnV0ZSBzZXBhcmF0ZWx5LlxuICAgKlxuICAgKiBTdW1tYXJ5OlxuICAgKiAtIGtlZXBzIHRyYWNrIG9mIHZhbGlkIHN0YXRlIGZvciBlYWNoIGF0dHJpYnV0ZVxuICAgKiAtIGF1dG8gcmVhbGxvY2F0ZXMgYXR0cmlidXRlcyB3aGVuIG5lZWRlZFxuICAgKiAtIGF1dG8gdXBkYXRlcyBhdHRyaWJ1dGVzIHdpdGggcmVnaXN0ZXJlZCB1cGRhdGVyIGZ1bmN0aW9uc1xuICAgKiAtIGFsbG93cyBvdmVycmlkaW5nIHdpdGggYXBwbGljYXRpb24gc3VwcGxpZWQgYnVmZmVyc1xuICAgKlxuICAgKiBMaW1pdGF0aW9uczpcbiAgICogLSBUaGVyZSBhcmUgY3VycmVudGx5IG5vIHByb3Zpc2lvbnMgZm9yIG9ubHkgaW52YWxpZGF0aW5nIGEgcmFuZ2Ugb2ZcbiAgICogICBpbmRpY2VzIGluIGFuIGF0dHJpYnV0ZS5cbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHNdXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbcHJvcHMuaWRdIC0gaWRlbnRpZmllciAoZm9yIGRlYnVnZ2luZylcbiAgICovXG4gIGNvbnN0cnVjdG9yKHtpZCA9ICdhdHRyaWJ1dGUtbWFuYWdlcid9ID0ge30pIHtcbiAgICB0aGlzLmlkID0gaWQ7XG5cbiAgICB0aGlzLmF0dHJpYnV0ZXMgPSB7fTtcbiAgICB0aGlzLnVwZGF0ZVRyaWdnZXJzID0ge307XG4gICAgdGhpcy5hbGxvY2VkSW5zdGFuY2VzID0gLTE7XG4gICAgdGhpcy5uZWVkc1JlZHJhdyA9IHRydWU7XG5cbiAgICB0aGlzLnVzZXJEYXRhID0ge307XG4gICAgdGhpcy5zdGF0cyA9IG5ldyBTdGF0cyh7aWQ6ICdhdHRyJ30pO1xuXG4gICAgLy8gRm9yIGRlYnVnZ2luZyBzYW5pdHksIHByZXZlbnQgdW5pbml0aWFsaXplZCBtZW1iZXJzXG4gICAgT2JqZWN0LnNlYWwodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhdHRyaWJ1dGVzXG4gICAqIFRha2VzIGEgbWFwIG9mIGF0dHJpYnV0ZSBkZXNjcmlwdG9yIG9iamVjdHNcbiAgICogLSBrZXlzIGFyZSBhdHRyaWJ1dGUgbmFtZXNcbiAgICogLSB2YWx1ZXMgYXJlIG9iamVjdHMgd2l0aCBhdHRyaWJ1dGUgZmllbGRzXG4gICAqXG4gICAqIGF0dHJpYnV0ZS5zaXplIC0gbnVtYmVyIG9mIGVsZW1lbnRzIHBlciBvYmplY3RcbiAgICogYXR0cmlidXRlLnVwZGF0ZXIgLSBudW1iZXIgb2YgZWxlbWVudHNcbiAgICogYXR0cmlidXRlLmluc3RhbmNlZD0wIC0gaXMgdGhpcyBpcyBhbiBpbnN0YW5jZWQgYXR0cmlidXRlIChhLmsuYS4gZGl2aXNvcilcbiAgICogYXR0cmlidXRlLm5vQWxsb2M9ZmFsc2UgLSBpZiB0aGlzIGF0dHJpYnV0ZSBzaG91bGQgbm90IGJlIGFsbG9jYXRlZFxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBhdHRyaWJ1dGVNYW5hZ2VyLmFkZCh7XG4gICAqICAgcG9zaXRpb25zOiB7c2l6ZTogMiwgdXBkYXRlOiBjYWxjdWxhdGVQb3NpdGlvbnN9XG4gICAqICAgY29sb3JzOiB7c2l6ZTogMywgdXBkYXRlOiBjYWxjdWxhdGVDb2xvcnN9XG4gICAqIH0pO1xuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlcyAtIGF0dHJpYnV0ZSBtYXAgKHNlZSBhYm92ZSlcbiAgICogQHBhcmFtIHtPYmplY3R9IHVwZGF0ZXJzIC0gc2VwYXJhdGUgbWFwIG9mIHVwZGF0ZSBmdW5jdGlvbnMgKGRlcHJlY2F0ZWQpXG4gICAqL1xuICBhZGQoYXR0cmlidXRlcywgdXBkYXRlcnMgPSB7fSkge1xuICAgIHRoaXMuX2FkZChhdHRyaWJ1dGVzLCB1cGRhdGVycyk7XG4gIH1cblxuIC8qKlxuICAgKiBSZW1vdmVzIGF0dHJpYnV0ZXNcbiAgICogVGFrZXMgYW4gYXJyYXkgb2YgYXR0cmlidXRlIG5hbWVzIGFuZCBkZWxldGUgdGhlbSBmcm9tXG4gICAqIHRoZSBhdHRyaWJ1dGUgbWFwIGlmIHRoZXkgZXhpc3RzXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGF0dHJpYnV0ZU1hbmFnZXIucmVtb3ZlKFsncG9zaXRpb24nXSk7XG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVOYW1lQXJyYXkgLSBhdHRyaWJ1dGUgbmFtZSBhcnJheSAoc2VlIGFib3ZlKVxuICAgKi9cbiAgcmVtb3ZlKGF0dHJpYnV0ZU5hbWVBcnJheSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXR0cmlidXRlTmFtZUFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBuYW1lID0gYXR0cmlidXRlTmFtZUFycmF5W2ldO1xuICAgICAgaWYgKHRoaXMuYXR0cmlidXRlc1tuYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmF0dHJpYnV0ZXNbbmFtZV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyogTWFya3MgYW4gYXR0cmlidXRlIGZvciB1cGRhdGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRyaWdnZXJOYW1lOiBhdHRyaWJ1dGUgb3IgYWNjZXNzb3IgbmFtZVxuICAgKi9cbiAgaW52YWxpZGF0ZSh0cmlnZ2VyTmFtZSkge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVzLCB1cGRhdGVUcmlnZ2Vyc30gPSB0aGlzO1xuICAgIGNvbnN0IGF0dHJpYnV0ZXNUb1VwZGF0ZSA9IHVwZGF0ZVRyaWdnZXJzW3RyaWdnZXJOYW1lXTtcblxuICAgIGlmICghYXR0cmlidXRlc1RvVXBkYXRlKSB7XG4gICAgICBsZXQgbWVzc2FnZSA9XG4gICAgICAgIGBpbnZhbGlkYXRpbmcgbm9uLWV4aXN0ZW50IGF0dHJpYnV0ZSAke3RyaWdnZXJOYW1lfSBmb3IgJHt0aGlzLmlkfVxcbmA7XG4gICAgICBtZXNzYWdlICs9IGBWYWxpZCBhdHRyaWJ1dGVzOiAke09iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmpvaW4oJywgJyl9YDtcbiAgICAgIGFzc2VydChhdHRyaWJ1dGVzVG9VcGRhdGUsIG1lc3NhZ2UpO1xuICAgIH1cbiAgICBhdHRyaWJ1dGVzVG9VcGRhdGUuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNbbmFtZV07XG4gICAgICBpZiAoYXR0cmlidXRlKSB7XG4gICAgICAgIGF0dHJpYnV0ZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgLy8gRm9yIHBlcmZvcm1hbmNlIHR1bmluZ1xuICAgIGxvZ0Z1bmN0aW9ucy5vbkxvZyh7XG4gICAgICBsZXZlbDogTE9HX0RFVEFJTF9QUklPUklUWSxcbiAgICAgIG1lc3NhZ2U6IGBpbnZhbGlkYXRlZCBhdHRyaWJ1dGUgJHthdHRyaWJ1dGVzVG9VcGRhdGV9IGZvciAke3RoaXMuaWR9YCxcbiAgICAgIGlkOiB0aGlzLmlkZW50aWZpZXJcbiAgICB9KTtcbiAgfVxuXG4gIGludmFsaWRhdGVBbGwoKSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZXN9ID0gdGhpcztcbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZU5hbWUgaW4gYXR0cmlidXRlcykge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlKGF0dHJpYnV0ZU5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFbnN1cmUgYWxsIGF0dHJpYnV0ZSBidWZmZXJzIGFyZSB1cGRhdGVkIGZyb20gcHJvcHMgb3IgZGF0YS5cbiAgICpcbiAgICogTm90ZTogQW55IHByZWFsbG9jYXRlZCBidWZmZXJzIGluIFwiYnVmZmVyc1wiIG1hdGNoaW5nIHJlZ2lzdGVyZWQgYXR0cmlidXRlXG4gICAqIG5hbWVzIHdpbGwgYmUgdXNlZC4gTm8gdXBkYXRlIHdpbGwgaGFwcGVuIGluIHRoaXMgY2FzZS5cbiAgICogTm90ZTogQ2FsbHMgb25VcGRhdGVTdGFydCBhbmQgb25VcGRhdGVFbmQgbG9nIGNhbGxiYWNrcyBiZWZvcmUgYW5kIGFmdGVyLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cyAtIG9wdGlvbnNcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMuZGF0YSAtIGRhdGEgKGl0ZXJhYmxlIG9iamVjdClcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMubnVtSW5zdGFuY2VzIC0gY291bnQgb2YgZGF0YVxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cy5idWZmZXJzID0ge30gLSBwcmUtYWxsb2NhdGVkIGJ1ZmZlcnNcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMucHJvcHMgLSBwYXNzZWQgdG8gdXBkYXRlcnNcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMuY29udGV4dCAtIFVzZWQgYXMgXCJ0aGlzXCIgY29udGV4dCBmb3IgdXBkYXRlcnNcbiAgICovXG4gIHVwZGF0ZSh7XG4gICAgZGF0YSxcbiAgICBudW1JbnN0YW5jZXMsXG4gICAgcHJvcHMgPSB7fSxcbiAgICBidWZmZXJzID0ge30sXG4gICAgY29udGV4dCA9IHt9LFxuICAgIGlnbm9yZVVua25vd25BdHRyaWJ1dGVzID0gZmFsc2VcbiAgfSA9IHt9KSB7XG4gICAgLy8gRmlyc3QgYXBwbHkgYW55IGFwcGxpY2F0aW9uIHByb3ZpZGVkIGJ1ZmZlcnNcbiAgICB0aGlzLl9jaGVja0V4dGVybmFsQnVmZmVycyh7YnVmZmVycywgaWdub3JlVW5rbm93bkF0dHJpYnV0ZXN9KTtcbiAgICB0aGlzLl9zZXRFeHRlcm5hbEJ1ZmZlcnMoYnVmZmVycyk7XG5cbiAgICAvLyBPbmx5IGluaXRpYXRlIGFsbG9jL3VwZGF0ZSAoYW5kIGxvZ2dpbmcpIGlmIGFjdHVhbGx5IG5lZWRlZFxuICAgIGlmICh0aGlzLl9hbmFseXplQnVmZmVycyh7bnVtSW5zdGFuY2VzfSkpIHtcbiAgICAgIGxvZ0Z1bmN0aW9ucy5vblVwZGF0ZVN0YXJ0KHtsZXZlbDogTE9HX1NUQVJUX0VORF9QUklPUklUWSwgaWQ6IHRoaXMuaWQsIG51bUluc3RhbmNlc30pO1xuICAgICAgdGhpcy5zdGF0cy50aW1lU3RhcnQoKTtcbiAgICAgIHRoaXMuX3VwZGF0ZUJ1ZmZlcnMoe251bUluc3RhbmNlcywgZGF0YSwgcHJvcHMsIGNvbnRleHR9KTtcbiAgICAgIHRoaXMuc3RhdHMudGltZUVuZCgpO1xuICAgICAgbG9nRnVuY3Rpb25zLm9uVXBkYXRlRW5kKHtsZXZlbDogTE9HX1NUQVJUX0VORF9QUklPUklUWSwgaWQ6IHRoaXMuaWQsIG51bUluc3RhbmNlc30pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCBhdHRyaWJ1dGUgZGVzY3JpcHRvcnNcbiAgICogTm90ZTogRm9ybWF0IG1hdGNoZXMgbHVtYS5nbCBNb2RlbC9Qcm9ncmFtLnNldEF0dHJpYnV0ZXMoKVxuICAgKiBAcmV0dXJuIHtPYmplY3R9IGF0dHJpYnV0ZXMgLSBkZXNjcmlwdG9yc1xuICAgKi9cbiAgZ2V0QXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgY2hhbmdlZCBhdHRyaWJ1dGUgZGVzY3JpcHRvcnNcbiAgICogVGhpcyBpbmRpY2F0ZXMgd2hpY2ggV2ViR0xCdWdnZXJzIG5lZWQgdG8gYmUgdXBkYXRlZFxuICAgKiBAcmV0dXJuIHtPYmplY3R9IGF0dHJpYnV0ZXMgLSBkZXNjcmlwdG9yc1xuICAgKi9cbiAgZ2V0Q2hhbmdlZEF0dHJpYnV0ZXMoe2NsZWFyQ2hhbmdlZEZsYWdzID0gZmFsc2V9KSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZXN9ID0gdGhpcztcbiAgICBjb25zdCBjaGFuZ2VkQXR0cmlidXRlcyA9IHt9O1xuICAgIGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgaWYgKGF0dHJpYnV0ZS5jaGFuZ2VkKSB7XG4gICAgICAgIGF0dHJpYnV0ZS5jaGFuZ2VkID0gYXR0cmlidXRlLmNoYW5nZWQgJiYgIWNsZWFyQ2hhbmdlZEZsYWdzO1xuICAgICAgICBjaGFuZ2VkQXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSA9IGF0dHJpYnV0ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNoYW5nZWRBdHRyaWJ1dGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJlZHJhdyBmbGFnLCBvcHRpb25hbGx5IGNsZWFyaW5nIGl0LlxuICAgKiBSZWRyYXcgZmxhZyB3aWxsIGJlIHNldCBpZiBhbnkgYXR0cmlidXRlcyBhdHRyaWJ1dGVzIGNoYW5nZWQgc2luY2VcbiAgICogZmxhZyB3YXMgbGFzdCBjbGVhcmVkLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdHNdXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0cy5jbGVhclJlZHJhd0ZsYWdzPWZhbHNlXSAtIHdoZXRoZXIgdG8gY2xlYXIgdGhlIGZsYWdcbiAgICogQHJldHVybiB7Qm9vbGVhbn0gLSB3aGV0aGVyIGEgcmVkcmF3IGlzIG5lZWRlZC5cbiAgICovXG4gIGdldE5lZWRzUmVkcmF3KHtjbGVhclJlZHJhd0ZsYWdzID0gZmFsc2V9ID0ge30pIHtcbiAgICBsZXQgcmVkcmF3ID0gdGhpcy5uZWVkc1JlZHJhdztcbiAgICByZWRyYXcgPSByZWRyYXcgfHwgdGhpcy5uZWVkc1JlZHJhdztcbiAgICB0aGlzLm5lZWRzUmVkcmF3ID0gdGhpcy5uZWVkc1JlZHJhdyAmJiAhY2xlYXJSZWRyYXdGbGFncztcbiAgICByZXR1cm4gcmVkcmF3O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHJlZHJhdyBmbGFnLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IHJlZHJhdz10cnVlXG4gICAqIEByZXR1cm4ge0F0dHJpYnV0ZU1hbmFnZXJ9IC0gZm9yIGNoYWluaW5nXG4gICAqL1xuICBzZXROZWVkc1JlZHJhdyhyZWRyYXcgPSB0cnVlKSB7XG4gICAgdGhpcy5uZWVkc1JlZHJhdyA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBERVBSRUNBVEVEIE1FVEhPRFNcblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgc2luY2UgdmVyc2lvbiAyLjUsIHVzZSBhZGQoKSBpbnN0ZWFkXG4gICAqIEFkZHMgYXR0cmlidXRlc1xuICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlcyAtIGF0dHJpYnV0ZSBtYXAgKHNlZSBhYm92ZSlcbiAgICogQHBhcmFtIHtPYmplY3R9IHVwZGF0ZXJzIC0gc2VwYXJhdGUgbWFwIG9mIHVwZGF0ZSBmdW5jdGlvbnMgKGRlcHJlY2F0ZWQpXG4gICAqL1xuICBhZGRJbnN0YW5jZWQoYXR0cmlidXRlcywgdXBkYXRlcnMgPSB7fSkge1xuICAgIHRoaXMuX2FkZChhdHRyaWJ1dGVzLCB1cGRhdGVycywge2luc3RhbmNlZDogMX0pO1xuICB9XG5cbiAgLy8gUFJJVkFURSBNRVRIT0RTXG5cbiAgLy8gVXNlZCB0byByZWdpc3RlciBhbiBhdHRyaWJ1dGVcbiAgX2FkZChhdHRyaWJ1dGVzLCB1cGRhdGVycyA9IHt9LCBfZXh0cmFQcm9wcyA9IHt9KSB7XG5cbiAgICBjb25zdCBuZXdBdHRyaWJ1dGVzID0ge307XG5cbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZU5hbWUgaW4gYXR0cmlidXRlcykge1xuICAgICAgLy8gc3VwcG9ydCBmb3Igc2VwYXJhdGUgdXBkYXRlIGZ1bmN0aW9uIG1hcFxuICAgICAgLy8gRm9yIG5vdywganVzdCBjb3B5IGFueSBhdHRyaWJ1dGVzIGZyb20gdGhhdCBtYXAgaW50byB0aGUgbWFpbiBtYXBcbiAgICAgIC8vIFRPRE8gLSBBdHRyaWJ1dGUgbWFwcyBhcmUgYSBkZXByZWNhdGVkIGZlYXR1cmUsIHJlbW92ZVxuICAgICAgaWYgKGF0dHJpYnV0ZU5hbWUgaW4gdXBkYXRlcnMpIHtcbiAgICAgICAgYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSA9XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbih7fSwgYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSwgdXBkYXRlcnNbYXR0cmlidXRlTmFtZV0pO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuXG4gICAgICBjb25zdCBpc0luZGV4ZWQgPSBhdHRyaWJ1dGUuaXNJbmRleGVkIHx8IGF0dHJpYnV0ZS5lbGVtZW50cztcbiAgICAgIGNvbnN0IHNpemUgPSAoYXR0cmlidXRlLmVsZW1lbnRzICYmIDEpIHx8IGF0dHJpYnV0ZS5zaXplO1xuICAgICAgY29uc3QgdmFsdWUgPSBhdHRyaWJ1dGUudmFsdWUgfHwgbnVsbDtcblxuICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgYXR0cmlidXRlIGRlc2NyaXB0b3IsIHdpdGggV2ViR0wgYW5kIG1ldGFkYXRhIGZpZWxkc1xuICAgICAgY29uc3QgYXR0cmlidXRlRGF0YSA9IE9iamVjdC5hc3NpZ24oXG4gICAgICAgIHtcbiAgICAgICAgICAvLyBFbnN1cmUgdGhhdCBmaWVsZHMgYXJlIHByZXNlbnQgYmVmb3JlIE9iamVjdC5zZWFsKClcbiAgICAgICAgICB0YXJnZXQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICB1c2VyRGF0YToge30gICAgICAgIC8vIFJlc2VydmVkIGZvciBhcHBsaWNhdGlvblxuICAgICAgICB9LFxuICAgICAgICAvLyBNZXRhZGF0YVxuICAgICAgICBhdHRyaWJ1dGUsXG4gICAgICAgIHtcbiAgICAgICAgICAvLyBTdGF0ZVxuICAgICAgICAgIGlzRXh0ZXJuYWxCdWZmZXI6IGZhbHNlLFxuICAgICAgICAgIG5lZWRzQWxsb2M6IGZhbHNlLFxuICAgICAgICAgIG5lZWRzVXBkYXRlOiBmYWxzZSxcbiAgICAgICAgICBjaGFuZ2VkOiBmYWxzZSxcblxuICAgICAgICAgIC8vIEx1bWEgZmllbGRzXG4gICAgICAgICAgaXNJbmRleGVkLFxuICAgICAgICAgIHNpemUsXG4gICAgICAgICAgdmFsdWVcbiAgICAgICAgfSxcbiAgICAgICAgX2V4dHJhUHJvcHNcbiAgICAgICk7XG4gICAgICAvLyBTYW5pdHkgLSBubyBhcHAgZmllbGRzIG9uIG91ciBhdHRyaWJ1dGVzLiBVc2UgdXNlckRhdGEgaW5zdGVhZC5cbiAgICAgIE9iamVjdC5zZWFsKGF0dHJpYnV0ZURhdGEpO1xuXG4gICAgICAvLyBDaGVjayBhbGwgZmllbGRzIGFuZCBnZW5lcmF0ZSBoZWxwZnVsIGVycm9yIG1lc3NhZ2VzXG4gICAgICB0aGlzLl92YWxpZGF0ZUF0dHJpYnV0ZURlZmluaXRpb24oYXR0cmlidXRlTmFtZSwgYXR0cmlidXRlRGF0YSk7XG5cbiAgICAgIC8vIEFkZCB0byBib3RoIGF0dHJpYnV0ZXMgbGlzdCAoZm9yIHJlZ2lzdHJhdGlvbiB3aXRoIG1vZGVsKVxuICAgICAgbmV3QXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSA9IGF0dHJpYnV0ZURhdGE7XG4gICAgfVxuXG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLmF0dHJpYnV0ZXMsIG5ld0F0dHJpYnV0ZXMpO1xuXG4gICAgdGhpcy5fbWFwVXBkYXRlVHJpZ2dlcnNUb0F0dHJpYnV0ZXMoKTtcbiAgfVxuXG4gIC8vIGJ1aWxkIHVwZGF0ZVRyaWdnZXIgbmFtZSB0byBhdHRyaWJ1dGUgbmFtZSBtYXBwaW5nXG4gIF9tYXBVcGRhdGVUcmlnZ2Vyc1RvQXR0cmlidXRlcygpIHtcbiAgICBjb25zdCB0cmlnZ2VycyA9IHt9O1xuXG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGVOYW1lIGluIHRoaXMuYXR0cmlidXRlcykge1xuICAgICAgY29uc3QgYXR0cmlidXRlID0gdGhpcy5hdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgbGV0IHthY2Nlc3Nvcn0gPSBhdHRyaWJ1dGU7XG5cbiAgICAgIC8vIHVzZSBhdHRyaWJ1dGUgbmFtZSBhcyB1cGRhdGUgdHJpZ2dlciBrZXlcbiAgICAgIHRyaWdnZXJzW2F0dHJpYnV0ZU5hbWVdID0gW2F0dHJpYnV0ZU5hbWVdO1xuXG4gICAgICAvLyB1c2UgYWNjZXNzb3IgbmFtZSBhcyB1cGRhdGUgdHJpZ2dlciBrZXlcbiAgICAgIGlmICh0eXBlb2YgYWNjZXNzb3IgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGFjY2Vzc29yID0gW2FjY2Vzc29yXTtcbiAgICAgIH1cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGFjY2Vzc29yKSkge1xuICAgICAgICBhY2Nlc3Nvci5mb3JFYWNoKGFjY2Vzc29yTmFtZSA9PiB7XG4gICAgICAgICAgaWYgKCF0cmlnZ2Vyc1thY2Nlc3Nvck5hbWVdKSB7XG4gICAgICAgICAgICB0cmlnZ2Vyc1thY2Nlc3Nvck5hbWVdID0gW107XG4gICAgICAgICAgfVxuICAgICAgICAgIHRyaWdnZXJzW2FjY2Vzc29yTmFtZV0ucHVzaChhdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVUcmlnZ2VycyA9IHRyaWdnZXJzO1xuICB9XG5cbiAgX3ZhbGlkYXRlQXR0cmlidXRlRGVmaW5pdGlvbihhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGUpIHtcbiAgICBhc3NlcnQoYXR0cmlidXRlLnNpemUgPj0gMSAmJiBhdHRyaWJ1dGUuc2l6ZSA8PSA0LFxuICAgICAgYEF0dHJpYnV0ZSBkZWZpbml0aW9uIGZvciAke2F0dHJpYnV0ZU5hbWV9IGludmFsaWQgc2l6ZWApO1xuXG4gICAgLy8gQ2hlY2sgdGhhdCBlaXRoZXIgJ2FjY2Vzc29yJyBvciAndXBkYXRlJyBpcyBhIHZhbGlkIGZ1bmN0aW9uXG4gICAgY29uc3QgaGFzVXBkYXRlciA9IGF0dHJpYnV0ZS5ub0FsbG9jIHx8XG4gICAgICB0eXBlb2YgYXR0cmlidXRlLnVwZGF0ZSA9PT0gJ2Z1bmN0aW9uJyB8fFxuICAgICAgdHlwZW9mIGF0dHJpYnV0ZS5hY2Nlc3NvciA9PT0gJ3N0cmluZyc7XG4gICAgaWYgKCFoYXNVcGRhdGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEF0dHJpYnV0ZSAke2F0dHJpYnV0ZU5hbWV9IG1pc3NpbmcgdXBkYXRlIG9yIGFjY2Vzc29yYCk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2tzIHRoYXQgYW55IGF0dHJpYnV0ZSBidWZmZXJzIGluIHByb3BzIGFyZSB2YWxpZFxuICAvLyBOb3RlOiBUaGlzIGlzIGp1c3QgdG8gaGVscCBhcHAgY2F0Y2ggbWlzdGFrZXNcbiAgX2NoZWNrRXh0ZXJuYWxCdWZmZXJzKHtcbiAgICBidWZmZXJzID0ge30sXG4gICAgaWdub3JlVW5rbm93bkF0dHJpYnV0ZXMgPSBmYWxzZVxuICB9ID0ge30pIHtcbiAgICBjb25zdCB7YXR0cmlidXRlc30gPSB0aGlzO1xuICAgIGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBpbiBidWZmZXJzKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgaWYgKCFhdHRyaWJ1dGUgJiYgIWlnbm9yZVVua25vd25BdHRyaWJ1dGVzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBhdHRyaWJ1dGUgcHJvcCAke2F0dHJpYnV0ZU5hbWV9YCk7XG4gICAgICB9XG4gICAgICAvLyBjb25zdCBidWZmZXIgPSBidWZmZXJzW2F0dHJpYnV0ZU5hbWVdO1xuICAgICAgLy8gVE9ETyAtIGNoZWNrIGJ1ZmZlciB0eXBlXG4gICAgfVxuICB9XG5cbiAgLy8gU2V0IHRoZSBidWZmZXJzIGZvciB0aGUgc3VwcGxpZWQgYXR0cmlidXRlc1xuICAvLyBVcGRhdGUgYXR0cmlidXRlIGJ1ZmZlcnMgZnJvbSBhbnkgYXR0cmlidXRlcyBpbiBwcm9wc1xuICAvLyBEZXRhY2ggYW55IHByZXZpb3VzbHkgc2V0IGJ1ZmZlcnMsIG1hcmtpbmcgYWxsXG4gIC8vIEF0dHJpYnV0ZXMgZm9yIGF1dG8gYWxsb2NhdGlvblxuICAvKiBlc2xpbnQtZGlzYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuICBfc2V0RXh0ZXJuYWxCdWZmZXJzKGJ1ZmZlck1hcCkge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVzLCBudW1JbnN0YW5jZXN9ID0gdGhpcztcblxuICAgIC8vIENvcHkgdGhlIHJlZnMgb2YgYW55IHN1cHBsaWVkIGJ1ZmZlcnMgaW4gdGhlIHByb3BzXG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XG4gICAgICBjb25zdCBidWZmZXIgPSBidWZmZXJNYXBbYXR0cmlidXRlTmFtZV07XG4gICAgICBhdHRyaWJ1dGUuaXNFeHRlcm5hbEJ1ZmZlciA9IGZhbHNlO1xuICAgICAgaWYgKGJ1ZmZlcikge1xuICAgICAgICBjb25zdCBBcnJheVR5cGUgPSBnbEFycmF5RnJvbVR5cGUoYXR0cmlidXRlLnR5cGUgfHwgR0wuRkxPQVQpO1xuICAgICAgICBpZiAoIShidWZmZXIgaW5zdGFuY2VvZiBBcnJheVR5cGUpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBdHRyaWJ1dGUgJHthdHRyaWJ1dGVOYW1lfSBtdXN0IGJlIG9mIHR5cGUgJHtBcnJheVR5cGUubmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXR0cmlidXRlLmF1dG8gJiYgYnVmZmVyLmxlbmd0aCA8PSBudW1JbnN0YW5jZXMgKiBhdHRyaWJ1dGUuc2l6ZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQXR0cmlidXRlIHByb3AgYXJyYXkgbXVzdCBtYXRjaCBsZW5ndGggYW5kIHNpemUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF0dHJpYnV0ZS5pc0V4dGVybmFsQnVmZmVyID0gdHJ1ZTtcbiAgICAgICAgYXR0cmlidXRlLm5lZWRzVXBkYXRlID0gZmFsc2U7XG4gICAgICAgIGlmIChhdHRyaWJ1dGUudmFsdWUgIT09IGJ1ZmZlcikge1xuICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZSA9IGJ1ZmZlcjtcbiAgICAgICAgICBhdHRyaWJ1dGUuY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgdGhpcy5uZWVkc1JlZHJhdyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuXG4gIC8qIENoZWNrcyB0aGF0IHR5cGVkIGFycmF5cyBmb3IgYXR0cmlidXRlcyBhcmUgYmlnIGVub3VnaFxuICAgKiBzZXRzIGFsbG9jIGZsYWcgaWYgbm90XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IHdoZXRoZXIgYW55IHVwZGF0ZXMgYXJlIG5lZWRlZFxuICAgKi9cbiAgX2FuYWx5emVCdWZmZXJzKHtudW1JbnN0YW5jZXN9KSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZXN9ID0gdGhpcztcbiAgICBhc3NlcnQobnVtSW5zdGFuY2VzICE9PSB1bmRlZmluZWQsICdudW1JbnN0YW5jZXMgbm90IGRlZmluZWQnKTtcblxuICAgIC8vIFRyYWNrIHdoZXRoZXIgYW55IGFsbG9jYXRpb25zIG9yIHVwZGF0ZXMgYXJlIG5lZWRlZFxuICAgIGxldCBuZWVkc1VwZGF0ZSA9IGZhbHNlO1xuXG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XG4gICAgICBpZiAoIWF0dHJpYnV0ZS5pc0V4dGVybmFsQnVmZmVyKSB7XG4gICAgICAgIC8vIERvIHdlIG5lZWQgdG8gcmVhbGxvY2F0ZSB0aGUgYXR0cmlidXRlJ3MgdHlwZWQgYXJyYXk/XG4gICAgICAgIGNvbnN0IG5lZWRzQWxsb2MgPVxuICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZSA9PT0gbnVsbCB8fFxuICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZS5sZW5ndGggLyBhdHRyaWJ1dGUuc2l6ZSA8IG51bUluc3RhbmNlcztcbiAgICAgICAgaWYgKG5lZWRzQWxsb2MgJiYgKGF0dHJpYnV0ZS51cGRhdGUgfHwgYXR0cmlidXRlLmFjY2Vzc29yKSkge1xuICAgICAgICAgIGF0dHJpYnV0ZS5uZWVkc0FsbG9jID0gdHJ1ZTtcbiAgICAgICAgICBuZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF0dHJpYnV0ZS5uZWVkc1VwZGF0ZSkge1xuICAgICAgICAgIG5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZWVkc1VwZGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBDYWxscyB1cGRhdGUgb24gYW55IGJ1ZmZlcnMgdGhhdCBuZWVkIHVwZGF0ZVxuICAgKiBUT0RPPyAtIElmIGFwcCBzdXBwbGllZCBhbGwgYXR0cmlidXRlcywgbm8gbmVlZCB0byBpdGVyYXRlIG92ZXIgZGF0YVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cyAtIG9wdGlvbnNcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMuZGF0YSAtIGRhdGEgKGl0ZXJhYmxlIG9iamVjdClcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMubnVtSW5zdGFuY2VzIC0gY291bnQgb2YgZGF0YVxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cy5idWZmZXJzID0ge30gLSBwcmUtYWxsb2NhdGVkIGJ1ZmZlcnNcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMucHJvcHMgLSBwYXNzZWQgdG8gdXBkYXRlcnNcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMuY29udGV4dCAtIFVzZWQgYXMgXCJ0aGlzXCIgY29udGV4dCBmb3IgdXBkYXRlcnNcbiAgICovXG4gIC8qIGVzbGludC1kaXNhYmxlIG1heC1zdGF0ZW1lbnRzLCBjb21wbGV4aXR5ICovXG4gIF91cGRhdGVCdWZmZXJzKHtudW1JbnN0YW5jZXMsIGRhdGEsIHByb3BzLCBjb250ZXh0fSkge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVzfSA9IHRoaXM7XG5cbiAgICAvLyBBbGxvY2F0ZSBhdCBsZWFzdCBvbmUgZWxlbWVudCB0byBlbnN1cmUgYSB2YWxpZCBidWZmZXJcbiAgICBjb25zdCBhbGxvY0NvdW50ID0gTWF0aC5tYXgobnVtSW5zdGFuY2VzLCAxKTtcblxuICAgIGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuXG4gICAgICAvLyBBbGxvY2F0ZSBhIG5ldyB0eXBlZCBhcnJheSBpZiBuZWVkZWRcbiAgICAgIGlmIChhdHRyaWJ1dGUubmVlZHNBbGxvYykge1xuICAgICAgICBjb25zdCBBcnJheVR5cGUgPSBnbEFycmF5RnJvbVR5cGUoYXR0cmlidXRlLnR5cGUgfHwgR0wuRkxPQVQpO1xuICAgICAgICBhdHRyaWJ1dGUudmFsdWUgPSBuZXcgQXJyYXlUeXBlKGF0dHJpYnV0ZS5zaXplICogYWxsb2NDb3VudCk7XG4gICAgICAgIGxvZ0Z1bmN0aW9ucy5vbkxvZyh7XG4gICAgICAgICAgbGV2ZWw6IExPR19ERVRBSUxfUFJJT1JJVFksXG4gICAgICAgICAgbWVzc2FnZTogYCR7dGhpcy5pZH06JHthdHRyaWJ1dGVOYW1lfSBhbGxvY2F0ZWQgJHthbGxvY0NvdW50fWAsXG4gICAgICAgICAgaWQ6IHRoaXMuaWRcbiAgICAgICAgfSk7XG4gICAgICAgIGF0dHJpYnV0ZS5uZWVkc0FsbG9jID0gZmFsc2U7XG4gICAgICAgIGF0dHJpYnV0ZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIENhbGwgdXBkYXRlciBmdW5jdGlvbiBpZiBuZWVkZWRcbiAgICAgIGlmIChhdHRyaWJ1dGUubmVlZHNVcGRhdGUpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlQnVmZmVyKHthdHRyaWJ1dGUsIGF0dHJpYnV0ZU5hbWUsIG51bUluc3RhbmNlcywgZGF0YSwgcHJvcHMsIGNvbnRleHR9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmFsbG9jZWRJbnN0YW5jZXMgPSBhbGxvY0NvdW50O1xuICB9XG5cbiAgX3VwZGF0ZUJ1ZmZlcih7YXR0cmlidXRlLCBhdHRyaWJ1dGVOYW1lLCBudW1JbnN0YW5jZXMsIGRhdGEsIHByb3BzLCBjb250ZXh0fSkge1xuICAgIGNvbnN0IHt1cGRhdGUsIGFjY2Vzc29yfSA9IGF0dHJpYnV0ZTtcbiAgICBpZiAodXBkYXRlKSB7XG4gICAgICAvLyBDdXN0b20gdXBkYXRlciAtIHR5cGljYWxseSBmb3Igbm9uLWluc3RhbmNlZCBsYXllcnNcbiAgICAgIGxvZ0Z1bmN0aW9ucy5vbkxvZyh7XG4gICAgICAgIGxldmVsOiBMT0dfREVUQUlMX1BSSU9SSVRZLFxuICAgICAgICBtZXNzYWdlOiBgJHt0aGlzLmlkfToke2F0dHJpYnV0ZU5hbWV9IHVwZGF0aW5nICR7bnVtSW5zdGFuY2VzfWAsXG4gICAgICAgIGlkOiB0aGlzLmlkXG4gICAgICB9KTtcbiAgICAgIHVwZGF0ZS5jYWxsKGNvbnRleHQsIGF0dHJpYnV0ZSwge2RhdGEsIHByb3BzLCBudW1JbnN0YW5jZXN9KTtcbiAgICAgIHRoaXMuX2NoZWNrQXR0cmlidXRlQXJyYXkoYXR0cmlidXRlLCBhdHRyaWJ1dGVOYW1lKTtcbiAgICB9IGVsc2UgaWYgKGFjY2Vzc29yKSB7XG4gICAgICAvLyBTdGFuZGFyZCB1cGRhdGVyXG4gICAgICB0aGlzLl91cGRhdGVCdWZmZXJWaWFTdGFuZGFyZEFjY2Vzc29yKHthdHRyaWJ1dGUsIGRhdGEsIHByb3BzfSk7XG4gICAgICB0aGlzLl9jaGVja0F0dHJpYnV0ZUFycmF5KGF0dHJpYnV0ZSwgYXR0cmlidXRlTmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ0Z1bmN0aW9ucy5vbkxvZyh7XG4gICAgICAgIGxldmVsOiBMT0dfREVUQUlMX1BSSU9SSVRZLFxuICAgICAgICBtZXNzYWdlOiBgJHt0aGlzLmlkfToke2F0dHJpYnV0ZU5hbWV9IG1pc3NpbmcgdXBkYXRlIGZ1bmN0aW9uYCxcbiAgICAgICAgaWQ6IHRoaXMuaWRcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGF0dHJpYnV0ZS5uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuICAgIGF0dHJpYnV0ZS5jaGFuZ2VkID0gdHJ1ZTtcbiAgICB0aGlzLm5lZWRzUmVkcmF3ID0gdHJ1ZTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIG1heC1zdGF0ZW1lbnRzICovXG5cbiAgX3VwZGF0ZUJ1ZmZlclZpYVN0YW5kYXJkQWNjZXNzb3Ioe2F0dHJpYnV0ZSwgZGF0YSwgcHJvcHN9KSB7XG4gICAgY29uc3Qge2FjY2Vzc29yLCB2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgY29uc3QgYWNjZXNzb3JGdW5jID0gcHJvcHNbYWNjZXNzb3JdO1xuXG4gICAgYXNzZXJ0KHR5cGVvZiBhY2Nlc3NvckZ1bmMgPT09ICdmdW5jdGlvbicsIGBhY2Nlc3NvciBcIiR7YWNjZXNzb3J9XCIgaXMgbm90IGEgZnVuY3Rpb25gKTtcblxuICAgIGxldCB7ZGVmYXVsdFZhbHVlID0gWzAsIDAsIDAsIDBdfSA9IGF0dHJpYnV0ZTtcbiAgICBkZWZhdWx0VmFsdWUgPSBBcnJheS5pc0FycmF5KGRlZmF1bHRWYWx1ZSkgPyBkZWZhdWx0VmFsdWUgOiBbZGVmYXVsdFZhbHVlXTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBvYmplY3Qgb2YgZGF0YSkge1xuICAgICAgbGV0IG9iamVjdFZhbHVlID0gYWNjZXNzb3JGdW5jKG9iamVjdCk7XG4gICAgICBvYmplY3RWYWx1ZSA9IEFycmF5LmlzQXJyYXkob2JqZWN0VmFsdWUpID8gb2JqZWN0VmFsdWUgOiBbb2JqZWN0VmFsdWVdO1xuICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tZmFsbHRocm91Z2gsIGRlZmF1bHQtY2FzZSAqL1xuICAgICAgc3dpdGNoIChzaXplKSB7XG4gICAgICBjYXNlIDQ6IHZhbHVlW2kgKyAzXSA9IE51bWJlci5pc0Zpbml0ZShvYmplY3RWYWx1ZVszXSkgPyBvYmplY3RWYWx1ZVszXSA6IGRlZmF1bHRWYWx1ZVszXTtcbiAgICAgIGNhc2UgMzogdmFsdWVbaSArIDJdID0gTnVtYmVyLmlzRmluaXRlKG9iamVjdFZhbHVlWzJdKSA/IG9iamVjdFZhbHVlWzJdIDogZGVmYXVsdFZhbHVlWzJdO1xuICAgICAgY2FzZSAyOiB2YWx1ZVtpICsgMV0gPSBOdW1iZXIuaXNGaW5pdGUob2JqZWN0VmFsdWVbMV0pID8gb2JqZWN0VmFsdWVbMV0gOiBkZWZhdWx0VmFsdWVbMV07XG4gICAgICBjYXNlIDE6IHZhbHVlW2kgKyAwXSA9IE51bWJlci5pc0Zpbml0ZShvYmplY3RWYWx1ZVswXSkgPyBvYmplY3RWYWx1ZVswXSA6IGRlZmF1bHRWYWx1ZVswXTtcbiAgICAgIH1cbiAgICAgIGkgKz0gc2l6ZTtcbiAgICB9XG4gIH1cblxuICBfY2hlY2tBdHRyaWJ1dGVBcnJheShhdHRyaWJ1dGUsIGF0dHJpYnV0ZU5hbWUpIHtcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS5sZW5ndGggPj0gNCkge1xuICAgICAgY29uc3QgdmFsaWQgPVxuICAgICAgICBOdW1iZXIuaXNGaW5pdGUodmFsdWVbMF0pICYmIE51bWJlci5pc0Zpbml0ZSh2YWx1ZVsxXSkgJiZcbiAgICAgICAgTnVtYmVyLmlzRmluaXRlKHZhbHVlWzJdKSAmJiBOdW1iZXIuaXNGaW5pdGUodmFsdWVbM10pO1xuICAgICAgaWYgKCF2YWxpZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYElsbGVnYWwgYXR0cmlidXRlIGdlbmVyYXRlZCBmb3IgJHthdHRyaWJ1dGVOYW1lfWApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19