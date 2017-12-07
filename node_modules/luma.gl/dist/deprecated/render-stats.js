'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* eslint-disable */
// An adaptation of the THREE.js stats helpers (MIT licensed)
// https://github.com/mrdoob/stats.js
// https://github.com/jeromeetienne/threex.rendererstats

/**
 * @author mrdoob / http://mrdoob.com/
 */

/* global document, window */
var PR = Math.round(window.devicePixelRatio || 1);

var WIDTH = 80 * PR;
var HEIGHT = 48 * PR;
var TEXT_X = 3 * PR;
var TEXT_Y = 2 * PR;
var GRAPH_X = 3 * PR;
var GRAPH_Y = 15 * PR;
var GRAPH_WIDTH = 74 * PR;
var GRAPH_HEIGHT = 30 * PR;

var Panel = exports.Panel = function () {

  /* eslint-disable max-statements */
  function Panel(name, fg, bg) {
    _classCallCheck(this, Panel);

    var canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.cssText = 'width:80px;height:48px';

    var context = canvas.getContext('2d');
    context.font = 'bold ' + 9 * PR + 'px Helvetica,Arial,sans-serif';
    context.textBaseline = 'top';

    context.fillStyle = bg;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.fillStyle = fg;
    context.fillText(name, TEXT_X, TEXT_Y);
    context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

    context.fillStyle = bg;
    context.globalAlpha = 0.9;
    context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

    this.name = name;
    this.fg = fg;
    this.bg = bg;
    this.context = context;
    this.dom = canvas;
  }
  /* eslint-enable max-statements */

  _createClass(Panel, [{
    key: 'update',
    value: function update(_ref) {
      var value = _ref.value,
          maxValue = _ref.maxValue;

      var min = Math.min(min, value);
      var max = Math.max(max, value);

      this.context.fillStyle = this.bg;
      this.context.globalAlpha = 1;
      this.context.fillRect(0, 0, WIDTH, GRAPH_Y);
      this.context.fillStyle = this.fg;

      var round = Math.round;
      this.context.fillText(round(value) + ' ' + this.name + ' (' + round(min) + '-' + round(max) + ')', TEXT_X, TEXT_Y);

      this.context.drawImage(this.canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT);

      this.context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);

      this.context.fillStyle = this.bg;
      this.context.globalAlpha = 0.9;
      this.context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, Math.round((1 - value / maxValue) * GRAPH_HEIGHT));
    }
  }]);

  return Panel;
}();

var Stats = function () {
  function Stats() {
    var _this = this;

    _classCallCheck(this, Stats);

    this.performance = window.performance;

    this.mode = 0;

    var container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';

    container.addEventListener('click', function (event) {
      event.preventDefault();
      _this.showPanel(++_this.mode % _this.container.children.length);
    }, false);

    //
    this.beginTime = (this.performance || Date).now();
    this.prevTime = this.beginTime;
    this.frames = 0;

    this.fpsPanel = this.addPanel(new Stats.Panel('FPS', '#0ff', '#002'));
    this.msPanel = this.addPanel(new Stats.Panel('MS', '#0f0', '#020'));
    if (this.performance && this.performance.memory) {
      this.memPanel = this.addPanel(new Stats.Panel('MB', '#f08', '#201'));
    }

    this.showPanel(0);

    this.dom = container;
  }

  _createClass(Stats, [{
    key: 'addPanel',
    value: function addPanel(panel) {
      this.container.appendChild(panel.dom);
      return panel;
    }

    // Shows selected panel and hides all others

  }, {
    key: 'showPanel',
    value: function showPanel(id) {
      this.container.children.forEach(function (child, i) {
        return child.display = i === id ? 'block' : 'none';
      });
      this.mode = id;
    }
  }, {
    key: 'setMode',
    value: function setMode(id) {
      this.showPanel(id);
    }
  }, {
    key: 'beginFrame',
    value: function beginFrame() {
      this.beginTime = (this.performance || Date).now();
    }
  }, {
    key: 'endFrame',
    value: function endFrame() {
      this.frames++;

      var time = (this.performance || Date).now();

      this.msPanel.update(time - this.beginTime, 200);

      var deltaTime = time - this.prevTime;
      if (deltaTime > 1000) {
        this.fpsPanel.update({
          value: this.frames * deltaTime / 1000,
          maxValue: 100
        });

        this.prevTime = time;
        this.frames = 0;

        if (this.memPanel) {
          var memory = this.performance.memory;
          this.memPanel.update({
            value: memory.usedJSHeapSize / 1048576,
            maxValue: memory.jsHeapSizeLimit / 1048576
          });
        }
      }

      return time;
    }
  }, {
    key: 'update',
    value: function update() {
      this.beginTime = this.end();
    }
  }]);

  return Stats;
}();

/**
 * @author mrdoob / http://mrdoob.com/
 * @author jetienne / http://jetienne.com/
 */
/** global document */

exports.default = Stats;

var RendererStats = exports.RendererStats = function () {
  /**
   * Provide info on THREE.WebGLRenderer
   *
   * @param {Object} renderer the renderer to update
   * @param {Object} Camera the camera to update
  */
  function RendererStats() {
    _classCallCheck(this, RendererStats);

    var container = document.createElement('div');
    container.style.cssText = 'width:80px;opacity:0.9;cursor:pointer';

    var msDiv = document.createElement('div');
    msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;backgound-color:#200;';
    container.appendChild(msDiv);

    var msText = document.createElement('div');
    msText.style.cssText = 'color:#f00;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
    msText.innerHTML = 'Render Stats';
    msDiv.appendChild(msText);

    this.msTexts = [];
    this.nLines = 9;
    for (var i = 0; i < this.nLines; i++) {
      this.msTexts[i] = document.createElement('div');
      this.msTexts[i].style.cssText = 'color:#f00;background-color:#311;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
      this.msTexts[i].innerHTML = '-';
      msDiv.appendChild(this.msTexts[i]);
    }

    this.lastTime = Date.now();
    this.domElement = container;
  }

  _createClass(RendererStats, [{
    key: 'update',
    value: function update(info) {
      // refresh only 30time per second
      if (Date.now() - this.lastTime < 1000 / 30) {
        return;
      }
      this.lastTime = Date.now();

      var i = 0;
      this.msTexts[i++].textContent = '== Memory ==';
      this.msTexts[i++].textContent = 'Programs: ' + info.memory.programs;
      this.msTexts[i++].textContent = 'Geometries: ' + info.memory.geometries;
      this.msTexts[i++].textContent = 'Textures: ' + info.memory.textures;

      this.msTexts[i++].textContent = '== Render ==';
      this.msTexts[i++].textContent = 'Calls: ' + info.render.calls;
      this.msTexts[i++].textContent = 'Vertices: ' + info.render.vertices;
      this.msTexts[i++].textContent = 'Faces: ' + info.render.faces;
      this.msTexts[i++].textContent = 'Points: ' + info.render.points;
    }
  }]);

  return RendererStats;
}();
//# sourceMappingURL=render-stats.js.map