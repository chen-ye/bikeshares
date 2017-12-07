var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

import { log } from './utils';
import assert from 'assert';

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * @param {Object} opt.oldProps - object with old key/value pairs
 * @param {Object} opt.newProps - object with new key/value pairs
 * @param {Object} opt.ignoreProps={} - object, keys that should not be compared
 * @returns {null|String} - null when values of all keys are strictly equal.
 *   if unequal, returns a string explaining what changed.
 */
/* eslint-disable max-statements, complexity */
export function compareProps() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      oldProps = _ref.oldProps,
      newProps = _ref.newProps,
      _ref$ignoreProps = _ref.ignoreProps,
      ignoreProps = _ref$ignoreProps === undefined ? {} : _ref$ignoreProps,
      _ref$triggerName = _ref.triggerName,
      triggerName = _ref$triggerName === undefined ? 'props' : _ref$triggerName;

  assert(oldProps !== undefined && newProps !== undefined, 'compareProps args');

  // shallow equality => deep equality
  if (oldProps === newProps) {
    return null;
  }

  if ((typeof newProps === 'undefined' ? 'undefined' : _typeof(newProps)) !== 'object' || newProps === null) {
    return triggerName + ' changed shallowly';
  }

  if ((typeof oldProps === 'undefined' ? 'undefined' : _typeof(oldProps)) !== 'object' || oldProps === null) {
    return triggerName + ' changed shallowly';
  }

  // Test if new props different from old props
  for (var key in oldProps) {
    if (!(key in ignoreProps)) {
      if (!newProps.hasOwnProperty(key)) {
        return triggerName + ' ' + key + ' dropped: ' + oldProps[key] + ' -> (undefined)';
      }

      var equals = newProps[key] && oldProps[key] && newProps[key].equals;
      if (equals && !equals.call(newProps[key], oldProps[key])) {
        return triggerName + ' ' + key + ' changed deeply: ' + oldProps[key] + ' -> ' + newProps[key];
      }

      if (!equals && oldProps[key] !== newProps[key]) {
        return triggerName + ' ' + key + ' changed shallowly: ' + oldProps[key] + ' -> ' + newProps[key];
      }
    }
  }

  // Test if any new props have been added
  for (var _key in newProps) {
    if (!(_key in ignoreProps)) {
      if (!oldProps.hasOwnProperty(_key)) {
        return triggerName + ' ' + _key + ' added: (undefined) -> ' + newProps[_key];
      }
    }
  }

  return null;
}
/* eslint-enable max-statements, complexity */

// HELPERS

// Constructors have their super class constructors as prototypes
function getOwnProperty(object, prop) {
  return object.hasOwnProperty(prop) && object[prop];
}

/*
 * Return merged default props stored on layers constructor, create them if needed
 */
export function getDefaultProps(layer) {
  var mergedDefaultProps = getOwnProperty(layer.constructor, 'mergedDefaultProps');
  if (mergedDefaultProps) {
    return mergedDefaultProps;
  }
  return mergeDefaultProps(layer);
}

/*
 * Walk a prototype chain and merge all default props from any 'defaultProps' objects
 */
export function mergeDefaultProps(object) {
  var objectNameKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'layerName';

  var subClassConstructor = object.constructor;
  var objectName = getOwnProperty(subClassConstructor, objectNameKey);
  if (!objectName) {
    log.once(0, object.constructor.name + ' does not specify a ' + objectNameKey);
  }

  // Use the object's constructor name as default id prop.
  // Note that constructor names are substituted during minification and may not be "human readable"
  var mergedDefaultProps = {
    id: objectName || object.constructor.name
  };

  // Reverse shadowing
  // TODO - Rewrite to stop when mergedDefaultProps is available on parent?
  while (object) {
    var objectDefaultProps = getOwnProperty(object.constructor, 'defaultProps');
    Object.freeze(objectDefaultProps);
    if (objectDefaultProps) {
      mergedDefaultProps = Object.assign({}, objectDefaultProps, mergedDefaultProps);
    }
    object = Object.getPrototypeOf(object);
  }

  Object.freeze(mergedDefaultProps);

  // Store for quick lookup
  subClassConstructor.mergedDefaultProps = mergedDefaultProps;

  assert(mergeDefaultProps);
  return mergedDefaultProps;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvcHJvcHMuanMiXSwibmFtZXMiOlsibG9nIiwiYXNzZXJ0IiwiY29tcGFyZVByb3BzIiwib2xkUHJvcHMiLCJuZXdQcm9wcyIsImlnbm9yZVByb3BzIiwidHJpZ2dlck5hbWUiLCJ1bmRlZmluZWQiLCJrZXkiLCJoYXNPd25Qcm9wZXJ0eSIsImVxdWFscyIsImNhbGwiLCJnZXRPd25Qcm9wZXJ0eSIsIm9iamVjdCIsInByb3AiLCJnZXREZWZhdWx0UHJvcHMiLCJsYXllciIsIm1lcmdlZERlZmF1bHRQcm9wcyIsImNvbnN0cnVjdG9yIiwibWVyZ2VEZWZhdWx0UHJvcHMiLCJvYmplY3ROYW1lS2V5Iiwic3ViQ2xhc3NDb25zdHJ1Y3RvciIsIm9iamVjdE5hbWUiLCJvbmNlIiwibmFtZSIsImlkIiwib2JqZWN0RGVmYXVsdFByb3BzIiwiT2JqZWN0IiwiZnJlZXplIiwiYXNzaWduIiwiZ2V0UHJvdG90eXBlT2YiXSwibWFwcGluZ3MiOiI7O0FBQUEsU0FBUUEsR0FBUixRQUFrQixTQUFsQjtBQUNBLE9BQU9DLE1BQVAsTUFBbUIsUUFBbkI7O0FBRUE7Ozs7Ozs7OztBQVNBO0FBQ0EsT0FBTyxTQUFTQyxZQUFULEdBQTBGO0FBQUEsaUZBQUosRUFBSTtBQUFBLE1BQW5FQyxRQUFtRSxRQUFuRUEsUUFBbUU7QUFBQSxNQUF6REMsUUFBeUQsUUFBekRBLFFBQXlEO0FBQUEsOEJBQS9DQyxXQUErQztBQUFBLE1BQS9DQSxXQUErQyxvQ0FBakMsRUFBaUM7QUFBQSw4QkFBN0JDLFdBQTZCO0FBQUEsTUFBN0JBLFdBQTZCLG9DQUFmLE9BQWU7O0FBQy9GTCxTQUFPRSxhQUFhSSxTQUFiLElBQTBCSCxhQUFhRyxTQUE5QyxFQUF5RCxtQkFBekQ7O0FBRUE7QUFDQSxNQUFJSixhQUFhQyxRQUFqQixFQUEyQjtBQUN6QixXQUFPLElBQVA7QUFDRDs7QUFFRCxNQUFJLFFBQU9BLFFBQVAseUNBQU9BLFFBQVAsT0FBb0IsUUFBcEIsSUFBZ0NBLGFB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LEVBQWQsRUFBa0JILGtCQUFsQixFQUFzQ1Qsa0JBQXRDLENBQXJCO0FBQ0Q7QUFDREosYUFBU2MsT0FBT0csY0FBUCxDQUFzQmpCLE1BQXRCLENBQVQ7QUFDRDs7QUFFRGMsU0FBT0MsTUFBUCxDQUFjWCxrQkFBZDs7QUFFQTtBQUNBSSxzQkFBb0JKLGtCQUFwQixHQUF5Q0Esa0JBQXpDOztBQUVBaEIsU0FBT2tCLGlCQUFQO0FBQ0EsU0FBT0Ysa0JBQVA7QUFDRCIsImZpbGUiOiJwcm9wcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7bG9nfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuLyoqXG4gKiBQZXJmb3JtcyBlcXVhbGl0eSBieSBpdGVyYXRpbmcgdGhyb3VnaCBrZXlzIG9uIGFuIG9iamVjdCBhbmQgcmV0dXJuaW5nIGZhbHNlXG4gKiB3aGVuIGFueSBrZXkgaGFzIHZhbHVlcyB3aGljaCBhcmUgbm90IHN0cmljdGx5IGVxdWFsIGJldHdlZW4gdGhlIGFyZ3VtZW50cy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHQub2xkUHJvcHMgLSBvYmplY3Qgd2l0aCBvbGQga2V5L3ZhbHVlIHBhaXJzXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0Lm5ld1Byb3BzIC0gb2JqZWN0IHdpdGggbmV3IGtleS92YWx1ZSBwYWlyc1xuICogQHBhcmFtIHtPYmplY3R9IG9wdC5pZ25vcmVQcm9wcz17fSAtIG9iamVjdCwga2V5cyB0aGF0IHNob3VsZCBub3QgYmUgY29tcGFyZWRcbiAqIEByZXR1cm5zIHtudWxsfFN0cmluZ30gLSBudWxsIHdoZW4gdmFsdWVzIG9mIGFsbCBrZXlzIGFyZSBzdHJpY3RseSBlcXVhbC5cbiAqICAgaWYgdW5lcXVhbCwgcmV0dXJucyBhIHN0cmluZyBleHBsYWluaW5nIHdoYXQgY2hhbmdlZC5cbiAqL1xuLyogZXNsaW50LWRpc2FibGUgbWF4LXN0YXRlbWVudHMsIGNvbXBsZXhpdHkgKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wYXJlUHJvcHMoe29sZFByb3BzLCBuZXdQcm9wcywgaWdub3JlUHJvcHMgPSB7fSwgdHJpZ2dlck5hbWUgPSAncHJvcHMnfSA9IHt9KSB7XG4gIGFzc2VydChvbGRQcm9wcyAhPT0gdW5kZWZpbmVkICYmIG5ld1Byb3BzICE9PSB1bmRlZmluZWQsICdjb21wYXJlUHJvcHMgYXJncycpO1xuXG4gIC8vIHNoYWxsb3cgZXF1YWxpdHkgPT4gZGVlcCBlcXVhbGl0eVxuICBpZiAob2xkUHJvcHMgPT09IG5ld1Byb3BzKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAodHlwZW9mIG5ld1Byb3BzICE9PSAnb2JqZWN0JyB8fCBuZXdQcm9wcyA9PT0gbnVsbCkge1xuICAgIHJldHVybiBgJHt0cmlnZ2VyTmFtZX0gY2hhbmdlZCBzaGFsbG93bHlgO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBvbGRQcm9wcyAhPT0gJ29iamVjdCcgfHwgb2xkUHJvcHMgPT09IG51bGwpIHtcbiAgICByZXR1cm4gYCR7dHJpZ2dlck5hbWV9IGNoYW5nZWQgc2hhbGxvd2x5YDtcbiAgfVxuXG4gIC8vIFRlc3QgaWYgbmV3IHByb3BzIGRpZmZlcmVudCBmcm9tIG9sZCBwcm9wc1xuICBmb3IgKGNvbnN0IGtleSBpbiBvbGRQcm9wcykge1xuICAgIGlmICghKGtleSBpbiBpZ25vcmVQcm9wcykpIHtcbiAgICAgIGlmICghbmV3UHJvcHMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICByZXR1cm4gYCR7dHJpZ2dlck5hbWV9ICR7a2V5fSBkcm9wcGVkOiAke29sZFByb3BzW2tleV19IC0+ICh1bmRlZmluZWQpYDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZXF1YWxzID0gbmV3UHJvcHNba2V5XSAmJiBvbGRQcm9wc1trZXldICYmIG5ld1Byb3BzW2tleV0uZXF1YWxzO1xuICAgICAgaWYgKGVxdWFscyAmJiAhZXF1YWxzLmNhbGwobmV3UHJvcHNba2V5XSwgb2xkUHJvcHNba2V5XSkpIHtcbiAgICAgICAgcmV0dXJuIGAke3RyaWdnZXJOYW1lfSAke2tleX0gY2hhbmdlZCBkZWVwbHk6ICR7b2xkUHJvcHNba2V5XX0gLT4gJHtuZXdQcm9wc1trZXldfWA7XG4gICAgICB9XG5cbiAgICAgIGlmICghZXF1YWxzICYmIG9sZFByb3BzW2tleV0gIT09IG5ld1Byb3BzW2tleV0pIHtcbiAgICAgICAgcmV0dXJuIGAke3RyaWdnZXJOYW1lfSAke2tleX0gY2hhbmdlZCBzaGFsbG93bHk6ICR7b2xkUHJvcHNba2V5XX0gLT4gJHtuZXdQcm9wc1trZXldfWA7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gVGVzdCBpZiBhbnkgbmV3IHByb3BzIGhhdmUgYmVlbiBhZGRlZFxuICBmb3IgKGNvbnN0IGtleSBpbiBuZXdQcm9wcykge1xuICAgIGlmICghKGtleSBpbiBpZ25vcmVQcm9wcykpIHtcbiAgICAgIGlmICghb2xkUHJvcHMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICByZXR1cm4gYCR7dHJpZ2dlck5hbWV9ICR7a2V5fSBhZGRlZDogKHVuZGVmaW5lZCkgLT4gJHtuZXdQcm9wc1trZXldfWA7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4vKiBlc2xpbnQtZW5hYmxlIG1heC1zdGF0ZW1lbnRzLCBjb21wbGV4aXR5ICovXG5cbi8vIEhFTFBFUlNcblxuLy8gQ29uc3RydWN0b3JzIGhhdmUgdGhlaXIgc3VwZXIgY2xhc3MgY29uc3RydWN0b3JzIGFzIHByb3RvdHlwZXNcbmZ1bmN0aW9uIGdldE93blByb3BlcnR5KG9iamVjdCwgcHJvcCkge1xuICByZXR1cm4gb2JqZWN0Lmhhc093blByb3BlcnR5KHByb3ApICYmIG9iamVjdFtwcm9wXTtcbn1cblxuLypcbiAqIFJldHVybiBtZXJnZWQgZGVmYXVsdCBwcm9wcyBzdG9yZWQgb24gbGF5ZXJzIGNvbnN0cnVjdG9yLCBjcmVhdGUgdGhlbSBpZiBuZWVkZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcyhsYXllcikge1xuICBjb25zdCBtZXJnZWREZWZhdWx0UHJvcHMgPSBnZXRPd25Qcm9wZXJ0eShsYXllci5jb25zdHJ1Y3RvciwgJ21lcmdlZERlZmF1bHRQcm9wcycpO1xuICBpZiAobWVyZ2VkRGVmYXVsdFByb3BzKSB7XG4gICAgcmV0dXJuIG1lcmdlZERlZmF1bHRQcm9wcztcbiAgfVxuICByZXR1cm4gbWVyZ2VEZWZhdWx0UHJvcHMobGF5ZXIpO1xufVxuXG4vKlxuICogV2FsayBhIHByb3RvdHlwZSBjaGFpbiBhbmQgbWVyZ2UgYWxsIGRlZmF1bHQgcHJvcHMgZnJvbSBhbnkgJ2RlZmF1bHRQcm9wcycgb2JqZWN0c1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VEZWZhdWx0UHJvcHMob2JqZWN0LCBvYmplY3ROYW1lS2V5ID0gJ2xheWVyTmFtZScpIHtcbiAgY29uc3Qgc3ViQ2xhc3NDb25zdHJ1Y3RvciA9IG9iamVjdC5jb25zdHJ1Y3RvcjtcbiAgY29uc3Qgb2JqZWN0TmFtZSA9IGdldE93blByb3BlcnR5KHN1YkNsYXNzQ29uc3RydWN0b3IsIG9iamVjdE5hbWVLZXkpO1xuICBpZiAoIW9iamVjdE5hbWUpIHtcbiAgICBsb2cub25jZSgwLCBgJHtvYmplY3QuY29uc3RydWN0b3IubmFtZX0gZG9lcyBub3Qgc3BlY2lmeSBhICR7b2JqZWN0TmFtZUtleX1gKTtcbiAgfVxuXG4gIC8vIFVzZSB0aGUgb2JqZWN0J3MgY29uc3RydWN0b3IgbmFtZSBhcyBkZWZhdWx0IGlkIHByb3AuXG4gIC8vIE5vdGUgdGhhdCBjb25zdHJ1Y3RvciBuYW1lcyBhcmUgc3Vic3RpdHV0ZWQgZHVyaW5nIG1pbmlmaWNhdGlvbiBhbmQgbWF5IG5vdCBiZSBcImh1bWFuIHJlYWRhYmxlXCJcbiAgbGV0IG1lcmdlZERlZmF1bHRQcm9wcyA9IHtcbiAgICBpZDogb2JqZWN0TmFtZSB8fCBvYmplY3QuY29uc3RydWN0b3IubmFtZVxuICB9O1xuXG4gIC8vIFJldmVyc2Ugc2hhZG93aW5nXG4gIC8vIFRPRE8gLSBSZXdyaXRlIHRvIHN0b3Agd2hlbiBtZXJnZWREZWZhdWx0UHJvcHMgaXMgYXZhaWxhYmxlIG9uIHBhcmVudD9cbiAgd2hpbGUgKG9iamVjdCkge1xuICAgIGNvbnN0IG9iamVjdERlZmF1bHRQcm9wcyA9IGdldE93blByb3BlcnR5KG9iamVjdC5jb25zdHJ1Y3RvciwgJ2RlZmF1bHRQcm9wcycpO1xuICAgIE9iamVjdC5mcmVlemUob2JqZWN0RGVmYXVsdFByb3BzKTtcbiAgICBpZiAob2JqZWN0RGVmYXVsdFByb3BzKSB7XG4gICAgICBtZXJnZWREZWZhdWx0UHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBvYmplY3REZWZhdWx0UHJvcHMsIG1lcmdlZERlZmF1bHRQcm9wcyk7XG4gICAgfVxuICAgIG9iamVjdCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO1xuICB9XG5cbiAgT2JqZWN0LmZyZWV6ZShtZXJnZWREZWZhdWx0UHJvcHMpO1xuXG4gIC8vIFN0b3JlIGZvciBxdWljayBsb29rdXBcbiAgc3ViQ2xhc3NDb25zdHJ1Y3Rvci5tZXJnZWREZWZhdWx0UHJvcHMgPSBtZXJnZWREZWZhdWx0UHJvcHM7XG5cbiAgYXNzZXJ0KG1lcmdlRGVmYXVsdFByb3BzKTtcbiAgcmV0dXJuIG1lcmdlZERlZmF1bHRQcm9wcztcbn1cbiJdfQ==