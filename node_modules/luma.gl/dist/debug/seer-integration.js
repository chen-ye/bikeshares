'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOverrides = exports.setOverride = exports.removeModel = exports.logModel = exports.addModel = undefined;

var _seer = require('seer');

var _seer2 = _interopRequireDefault(_seer);

var _globals = require('../utils/globals');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var models = {};

/**
 * Add a model to our cache indexed by id
 */
var addModel = exports.addModel = function addModel(model) {
  if (models[model.id]) {
    return;
  }
  models[model.id] = model;

  _seer2.default.listItem('luma.gl', model.id);
};

/**
 * Log a model uniforms and attributes.
 */
var logModel = exports.logModel = function logModel(model, uniforms) {
  if (!_globals.window.__SEER_INITIALIZED__ || _seer2.default.throttle('luma.gl:' + model.id, 1E3)) {
    return;
  }

  var attributesObject = Object.assign({}, model.geometry.attributes, model.attributes);
  var uniformsObject = Object.assign({}, model.uniforms, uniforms);

  _seer2.default.multiUpdate('luma.gl', model.id, [{ path: 'objects.uniforms', data: uniformsObject }, { path: 'objects.attributes', data: attributesObject }]);
};

/**
 * Remove a previously set model from the cache
 */
var removeModel = exports.removeModel = function removeModel(id) {
  delete models[id];
  _seer2.default.deleteItem('luma.gl', id);
};

/**
 * Recursively traverse an object given a path of properties and set the given value
 */
var recursiveSet = function recursiveSet(obj, path, value) {
  if (!obj) {
    return;
  }

  if (path.length > 1) {
    recursiveSet(obj[path[0]], path.slice(1), value);
  } else {
    obj[path[0]] = value;
  }
};

var overrides = new Map();

/**
 * Create an override on the specify layer, indexed by a valuePath array.
 * Do nothing in case Seer as not been initialized to prevent any preformance drawback.
 */
var setOverride = exports.setOverride = function setOverride(id, valuePath, value) {
  if (!_globals.window.__SEER_INITIALIZED__) {
    return;
  }

  if (!overrides.has(id)) {
    overrides.set(id, new Map());
  }

  var uniforms = overrides.get(id);
  uniforms.set(valuePath, value);
};

/**
 * Apply overrides to a specific model's uniforms
 */
var getOverrides = exports.getOverrides = function getOverrides(id, uniforms) {
  if (!_globals.window.__SEER_INITIALIZED__ || !id) {
    return;
  }

  var overs = overrides.get(id);
  if (!overs) {
    return;
  }

  overs.forEach(function (value, valuePath) {
    recursiveSet(uniforms, valuePath, value);
  });
};

/**
 * Listen for luma.gl edit events
 */
_seer2.default.listenFor('luma.gl', function (payload) {
  var model = models[payload.itemKey];
  if (!model || payload.type !== 'edit' || payload.valuePath[0] !== 'uniforms') {
    return;
  }

  var valuePath = payload.valuePath.slice(1);
  setOverride(payload.itemKey, valuePath, payload.value);

  var uniforms = model.getUniforms();
  recursiveSet(uniforms, valuePath, payload.value);
  model.setUniforms(uniforms);
});
//# sourceMappingURL=seer-integration.js.map