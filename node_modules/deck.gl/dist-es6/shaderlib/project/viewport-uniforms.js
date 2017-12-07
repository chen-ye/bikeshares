var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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

/* global window */
import mat4_invert from 'gl-mat4/invert';
import mat4_multiply from 'gl-mat4/multiply';
import vec4_transformMat4 from 'gl-vec4/transformMat4';

import assert from 'assert';
import { COORDINATE_SYSTEM } from '../../lib/constants';

function fp64ify(a) {
  var hiPart = Math.fround(a);
  var loPart = a - hiPart;
  return [hiPart, loPart];
}

// To quickly set a vector to zero
var ZERO_VECTOR = [0, 0, 0, 0];
// 4x4 matrix that drops 4th component of vector
var VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
var IDENTITY_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

// The code that utilizes Matrix4 does the same calculation as their mat4 counterparts,
// has lower performance but provides error checking.
// Uncomment when debugging
function calculateMatrixAndOffset(_ref) {
  var projectionMode = _ref.projectionMode,
      positionOrigin = _ref.positionOrigin,
      viewport = _ref.viewport;
  var viewMatrixUncentered = viewport.viewMatrixUncentered,
      projectionMatrix = viewport.projectionMatrix;
  var viewMatrix = viewport.viewMatrix,
      viewProjectionMatrix = viewport.viewProjectionMatrix;

  var projectionCenter = void 0;

  switch (projectionMode) {

    case COORDINATE_SYSTEM.IDENTITY:
    case COORDINATE_SYSTEM.LNGLAT:
      projectionCenter = ZERO_VECTOR;
      break;

    // TODO: make lighitng work for meter offset mode
    case COORDINATE_SYSTEM.METER_OFFSETS:
      // Calculate transformed projectionCenter (in 64 bit precision)
      // This is the key to offset mode precision (avoids doing this
      // addition in 32 bit precision)
      var positionPixels = viewport.projectFlat(positionOrigin);
      // projectionCenter = new Matrix4(viewProjectionMatrix)
      //   .transformVector([positionPixels[0], positionPixels[1], 0.0, 1.0]);
      projectionCenter = vec4_transformMat4([], [positionPixels[0], positionPixels[1], 0.0, 1.0], viewProjectionMatrix);

      // Always apply uncentered projection matrix if available (shader adds center)
      // Zero out 4th coordinate ("after" model matrix) - avoids further translations
      // viewMatrix = new Matrix4(viewMatrixUncentered || viewMatrix)
      //   .multiplyRight(VECTOR_TO_POINT_MATRIX);
      viewMatrix = mat4_multiply([], viewMatrixUncentered || viewMatrix, VECTOR_TO_POINT_MATRIX);
      viewProjectionMatrix = mat4_multiply([], projectionMatrix, viewMatrix);
      break;

    default:
      throw new Error('Unknown projection mode');
  }

  var viewMatrixInv = mat4_invert([], viewMatrix) || viewMatrix;
  var cameraPos = [viewMatrixInv[12], viewMatrixInv[13], viewMatrixInv[14]];

  return {
    viewMatrix: viewMatrix,
    viewProjectionMatrix: viewProjectionMatrix,
    projectionCenter: projectionCenter,
    cameraPos: cameraPos
  };
}

/**
 * Returns uniforms for shaders based on current projection
 * includes: projection matrix suitable for shaders
 *
 * TODO - Ensure this works with any viewport, not just WebMercatorViewports
 *
 * @param {WebMercatorViewport} viewport -
 * @return {Float32Array} - 4x4 projection matrix that can be used in shaders
 */
export function getUniformsFromViewport() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      viewport = _ref2.viewport,
      _ref2$modelMatrix = _ref2.modelMatrix,
      modelMatrix = _ref2$modelMatrix === undefined ? null : _ref2$modelMatrix,
      _ref2$projectionMode = _ref2.projectionMode,
      projectionMode = _ref2$projectionMode === undefined ? COORDINATE_SYSTEM.LNGLAT : _ref2$projectionMode,
      _ref2$positionOrigin = _ref2.positionOrigin,
      positionOrigin = _ref2$positionOrigin === undefined ? [0, 0] : _ref2$positionOrigin;

  if (!viewport) {
    return {};
  }

  assert(viewport.scale, 'Viewport scale missing');

  var _calculateMatrixAndOf = calculateMatrixAndOffset({ projectionMode: projectionMode, positionOrigin: positionOrigin, viewport: viewport }),
      projectionCenter = _calculateMatrixAndOf.projectionCenter,
      viewProjectionMatrix = _calculateMatrixAndOf.viewProjectionMatrix,
      cameraPos = _calculateMatrixAndOf.cameraPos;

  // Calculate projection pixels per unit


  var _viewport$getDistance = viewport.getDistanceScales(),
      pixelsPerMeter = _viewport$getDistance.pixelsPerMeter;

  assert(pixelsPerMeter, 'Viewport missing pixelsPerMeter');

  // "Float64Array"
  // Transpose the projection matrix to column major for GLSL.
  var glProjectionMatrixFP64 = new Float32Array(32);
  for (var i = 0; i < 4; ++i) {
    for (var j = 0; j < 4; ++j) {
      var _fp64ify = fp64ify(viewProjectionMatrix[j * 4 + i]);

      var _fp64ify2 = _slicedToArray(_fp64ify, 2);

      glProjectionMatrixFP64[(i * 4 + j) * 2] = _fp64ify2[0];
      glProjectionMatrixFP64[(i * 4 + j) * 2 + 1] = _fp64ify2[1];
    }
  }

  var devicePixelRatio = window && window.devicePixelRatio || 1;

  return {
    // Projection mode values
    projectionMode: projectionMode,
    projectionCenter: projectionCenter,

    // Screen size
    viewportSize: [viewport.width * devicePixelRatio, viewport.height * devicePixelRatio],
    devicePixelRatio: devicePixelRatio,

    // Main projection matrices
    modelMatrix: new Float32Array(modelMatrix || IDENTITY_MATRIX),
    // viewMatrix: new Float32Array(viewMatrix),
    projectionMatrix: new Float32Array(viewProjectionMatrix),
    projectionFP64: glProjectionMatrixFP64,

    projectionPixelsPerUnit: pixelsPerMeter,
    projectionScale: viewport.scale, // This is the mercator scale (2 ** zoom)
    projectionScaleFP64: fp64ify(viewport.scale), // Deprecated?

    // This is for lighting calculations
    cameraPos: new Float32Array(cameraPos)
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zaGFkZXJsaWIvcHJvamVjdC92aWV3cG9ydC11bmlmb3Jtcy5qcyJdLCJuYW1lcyI6WyJtYXQ0X2ludmVydCIsIm1hdDRfbXVsdGlwbHkiLCJ2ZWM0X3RyYW5zZm9ybU1hdDQiLCJhc3NlcnQiLCJDT09SRElOQVRFX1NZU1RFTSIsImZwNjRpZnkiLCJhIiwiaGlQYXJ0IiwiTWF0aCIsImZyb3VuZCIsImxvUGFydCIsIlpFUk9fVkVDVE9SIiwiVkVDVE9SX1RPX1BPSU5UX01BVFJJWCIsIklERU5USVRZX01BVFJJWCIsImNhbGN1bGF0ZU1hdHJpeEFuZE9mZnNldCIsInByb2plY3Rpb25Nb2RlIiwicG9zaXRpb25PcmlnaW4iLCJ2aWV3cG9ydCIsInZpZXdNYXRyaXhVbmNlbnRlcmVkIiwicHJvamVjdGlvbk1hdHJpeCIsInZpZXdNYXRyaXgiLCJ2aWV3UHJvamVjdGlvbk1hdHJpeCIsInByb2plY3Rpb25DZW50ZXIiLCJJREVOVElUWSIsIkxOR0xBVCIsIk1FVEVSX09GRlNFVFMiLCJwb3NpdGlvblBpeGVscyIsInByb2plY3RGbGF0IiwiRXJyb3IiLCJ2aWV3TWF0cml4SW52IiwiY2FtZXJhUG9zIiwiZ2V0VW5pZm9ybXNGcm9tVmlld3BvcnQiLCJtb2RlbE1hdHJpeCIsInNjYWxlIiwiZ2V0RGlzdGFuY2VTY2FsZXMiLCJwaXhlbHNQZXJNZXRlciIsImdsUHJvamVjdGlvbk1hdHJpeEZQNjQiLCJGbG9hdDMyQXJyYXkiLCJpIiwiaiIsImRldmljZVBpeGVsUmF0aW8iLCJ3aW5kb3ciLCJ2aWV3cG9ydFNpemUiLCJ3aWR0aCIsImhlaWdodCIsInByb2plY3Rpb25GUDY0IiwicHJvamVjdGlvblBpeGVsc1BlclVuaXQiLCJwcm9qZWN0aW9uU2NhbGUiLCJwcm9qZWN0aW9uU2NhbGVGUDY0Il0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QXFCa0IsSUFBSSxDQUFKLEdBQVFELENBQTdCLENBQVIsQ0FKc0I7O0FBQUE7O0FBRXhCRiw2QkFBdUIsQ0FBQ0UsSUFBSSxDQUFKLEdBQVFDLENBQVQsSUFBYyxDQUFyQyxDQUZ3QjtBQUd4QkgsNkJBQXVCLENBQUNFLElBQUksQ0FBSixHQUFRQyxDQUFULElBQWMsQ0FBZCxHQUFrQixDQUF6QyxDQUh3QjtBQUszQjtBQUNGOztBQUVELE1BQU1DLG1CQUFvQkMsVUFBVUEsT0FBT0QsZ0JBQWxCLElBQXVDLENBQWhFOztBQUVBLFNBQU87QUFDTDtBQUNBekIsa0NBRks7QUFHTE8sc0NBSEs7O0FBS0w7QUFDQW9CLGtCQUFjLENBQUN6QixTQUFTMEIsS0FBVCxHQUFpQkgsZ0JBQWxCLEVBQW9DdkIsU0FBUzJCLE1BQVQsR0FBa0JKLGdCQUF0RCxDQU5UO0FBT0xBLHNDQVBLOztBQVNMO0FBQ0FSLGlCQUFhLElBQUlLLFlBQUosQ0FBaUJMLGVBQWVuQixlQUFoQyxDQVZSO0FBV0w7QUFDQU0sc0JBQWtCLElBQUlrQixZQUFKLENBQWlCaEIsb0JBQWpCLENBWmI7QUFhTHdCLG9CQUFnQlQsc0JBYlg7O0FBZUxVLDZCQUF5QlgsY0FmcEI7QUFnQkxZLHFCQUFpQjlCLFNBQVNnQixLQWhCckIsRUFnQjRCO0FBQ2pDZSx5QkFBcUIzQyxRQUFRWSxTQUFTZ0IsS0FBakIsQ0FqQmhCLEVBaUJ5Qzs7QUFFOUM7QUFDQUgsZUFBVyxJQUFJTyxZQUFKLENBQWlCUCxTQUFqQjtBQXBCTixHQUFQO0FBc0JEIiwiZmlsZSI6InZpZXdwb3J0LXVuaWZvcm1zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8qIGdsb2JhbCB3aW5kb3cgKi9cbmltcG9ydCBtYXQ0X2ludmVydCBmcm9tICdnbC1tYXQ0L2ludmVydCc7XG5pbXBvcnQgbWF0NF9tdWx0aXBseSBmcm9tICdnbC1tYXQ0L211bHRpcGx5JztcbmltcG9ydCB2ZWM0X3RyYW5zZm9ybU1hdDQgZnJvbSAnZ2wtdmVjNC90cmFuc2Zvcm1NYXQ0JztcblxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDT09SRElOQVRFX1NZU1RFTX0gZnJvbSAnLi4vLi4vbGliL2NvbnN0YW50cyc7XG5cbmZ1bmN0aW9uIGZwNjRpZnkoYSkge1xuICBjb25zdCBoaVBhcnQgPSBNYXRoLmZyb3VuZChhKTtcbiAgY29uc3QgbG9QYXJ0ID0gYSAtIGhpUGFydDtcbiAgcmV0dXJuIFtoaVBhcnQsIGxvUGFydF07XG59XG5cbi8vIFRvIHF1aWNrbHkgc2V0IGEgdmVjdG9yIHRvIHplcm9cbmNvbnN0IFpFUk9fVkVDVE9SID0gWzAsIDAsIDAsIDBdO1xuLy8gNHg0IG1hdHJpeCB0aGF0IGRyb3BzIDR0aCBjb21wb25lbnQgb2YgdmVjdG9yXG5jb25zdCBWRUNUT1JfVE9fUE9JTlRfTUFUUklYID0gWzEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDBdO1xuY29uc3QgSURFTlRJVFlfTUFUUklYID0gWzEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDFdO1xuXG4vLyBUaGUgY29kZSB0aGF0IHV0aWxpemVzIE1hdHJpeDQgZG9lcyB0aGUgc2FtZSBjYWxjdWxhdGlvbiBhcyB0aGVpciBtYXQ0IGNvdW50ZXJwYXJ0cyxcbi8vIGhhcyBsb3dlciBwZXJmb3JtYW5jZSBidXQgcHJvdmlkZXMgZXJyb3IgY2hlY2tpbmcuXG4vLyBVbmNvbW1lbnQgd2hlbiBkZWJ1Z2dpbmdcbmZ1bmN0aW9uIGNhbGN1bGF0ZU1hdHJpeEFuZE9mZnNldCh7XG4gIHByb2plY3Rpb25Nb2RlLFxuICBwb3NpdGlvbk9yaWdpbixcbiAgdmlld3BvcnRcbn0pIHtcbiAgY29uc3Qge3ZpZXdNYXRyaXhVbmNlbnRlcmVkLCBwcm9qZWN0aW9uTWF0cml4fSA9IHZpZXdwb3J0O1xuICBsZXQge3ZpZXdNYXRyaXgsIHZpZXdQcm9qZWN0aW9uTWF0cml4fSA9IHZpZXdwb3J0O1xuICBsZXQgcHJvamVjdGlvbkNlbnRlcjtcblxuICBzd2l0Y2ggKHByb2plY3Rpb25Nb2RlKSB7XG5cbiAgY2FzZSBDT09SRElOQVRFX1NZU1RFTS5JREVOVElUWTpcbiAgY2FzZSBDT09SRElOQVRFX1NZU1RFTS5MTkdMQVQ6XG4gICAgcHJvamVjdGlvbkNlbnRlciA9IFpFUk9fVkVDVE9SO1xuICAgIGJyZWFrO1xuXG4gIC8vIFRPRE86IG1ha2UgbGlnaGl0bmcgd29yayBmb3IgbWV0ZXIgb2Zmc2V0IG1vZGVcbiAgY2FzZSBDT09SRElOQVRFX1NZU1RFTS5NRVRFUl9PRkZTRVRTOlxuICAgIC8vIENhbGN1bGF0ZSB0cmFuc2Zvcm1lZCBwcm9qZWN0aW9uQ2VudGVyIChpbiA2NCBiaXQgcHJlY2lzaW9uKVxuICAgIC8vIFRoaXMgaXMgdGhlIGtleSB0byBvZmZzZXQgbW9kZSBwcmVjaXNpb24gKGF2b2lkcyBkb2luZyB0aGlzXG4gICAgLy8gYWRkaXRpb24gaW4gMzIgYml0IHByZWNpc2lvbilcbiAgICBjb25zdCBwb3NpdGlvblBpeGVscyA9IHZpZXdwb3J0LnByb2plY3RGbGF0KHBvc2l0aW9uT3JpZ2luKTtcbiAgICAvLyBwcm9qZWN0aW9uQ2VudGVyID0gbmV3IE1hdHJpeDQodmlld1Byb2plY3Rpb25NYXRyaXgpXG4gICAgLy8gICAudHJhbnNmb3JtVmVjdG9yKFtwb3NpdGlvblBpeGVsc1swXSwgcG9zaXRpb25QaXhlbHNbMV0sIDAuMCwgMS4wXSk7XG4gICAgcHJvamVjdGlvbkNlbnRlciA9IHZlYzRfdHJhbnNmb3JtTWF0NChbXSxcbiAgICAgIFtwb3NpdGlvblBpeGVsc1swXSwgcG9zaXRpb25QaXhlbHNbMV0sIDAuMCwgMS4wXSxcbiAgICAgIHZpZXdQcm9qZWN0aW9uTWF0cml4KTtcblxuICAgIC8vIEFsd2F5cyBhcHBseSB1bmNlbnRlcmVkIHByb2plY3Rpb24gbWF0cml4IGlmIGF2YWlsYWJsZSAoc2hhZGVyIGFkZHMgY2VudGVyKVxuICAgIC8vIFplcm8gb3V0IDR0aCBjb29yZGluYXRlIChcImFmdGVyXCIgbW9kZWwgbWF0cml4KSAtIGF2b2lkcyBmdXJ0aGVyIHRyYW5zbGF0aW9uc1xuICAgIC8vIHZpZXdNYXRyaXggPSBuZXcgTWF0cml4NCh2aWV3TWF0cml4VW5jZW50ZXJlZCB8fCB2aWV3TWF0cml4KVxuICAgIC8vICAgLm11bHRpcGx5UmlnaHQoVkVDVE9SX1RPX1BPSU5UX01BVFJJWCk7XG4gICAgdmlld01hdHJpeCA9IG1hdDRfbXVsdGlwbHkoW10sIHZpZXdNYXRyaXhVbmNlbnRlcmVkIHx8IHZpZXdNYXRyaXgsIFZFQ1RPUl9UT19QT0lOVF9NQVRSSVgpO1xuICAgIHZpZXdQcm9qZWN0aW9uTWF0cml4ID0gbWF0NF9tdWx0aXBseShbXSwgcHJvamVjdGlvbk1hdHJpeCwgdmlld01hdHJpeCk7XG4gICAgYnJlYWs7XG5cbiAgZGVmYXVsdDpcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcHJvamVjdGlvbiBtb2RlJyk7XG4gIH1cblxuICBjb25zdCB2aWV3TWF0cml4SW52ID0gbWF0NF9pbnZlcnQoW10sIHZpZXdNYXRyaXgpIHx8IHZpZXdNYXRyaXg7XG4gIGNvbnN0IGNhbWVyYVBvcyA9IFt2aWV3TWF0cml4SW52WzEyXSwgdmlld01hdHJpeEludlsxM10sIHZpZXdNYXRyaXhJbnZbMTRdXTtcblxuICByZXR1cm4ge1xuICAgIHZpZXdNYXRyaXgsXG4gICAgdmlld1Byb2plY3Rpb25NYXRyaXgsXG4gICAgcHJvamVjdGlvbkNlbnRlcixcbiAgICBjYW1lcmFQb3NcbiAgfTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHVuaWZvcm1zIGZvciBzaGFkZXJzIGJhc2VkIG9uIGN1cnJlbnQgcHJvamVjdGlvblxuICogaW5jbHVkZXM6IHByb2plY3Rpb24gbWF0cml4IHN1aXRhYmxlIGZvciBzaGFkZXJzXG4gKlxuICogVE9ETyAtIEVuc3VyZSB0aGlzIHdvcmtzIHdpdGggYW55IHZpZXdwb3J0LCBub3QganVzdCBXZWJNZXJjYXRvclZpZXdwb3J0c1xuICpcbiAqIEBwYXJhbSB7V2ViTWVyY2F0b3JWaWV3cG9ydH0gdmlld3BvcnQgLVxuICogQHJldHVybiB7RmxvYXQzMkFycmF5fSAtIDR4NCBwcm9qZWN0aW9uIG1hdHJpeCB0aGF0IGNhbiBiZSB1c2VkIGluIHNoYWRlcnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFVuaWZvcm1zRnJvbVZpZXdwb3J0KHtcbiAgdmlld3BvcnQsXG4gIG1vZGVsTWF0cml4ID0gbnVsbCxcbiAgcHJvamVjdGlvbk1vZGUgPSBDT09SRElOQVRFX1NZU1RFTS5MTkdMQVQsXG4gIHBvc2l0aW9uT3JpZ2luID0gWzAsIDBdXG59ID0ge30pIHtcbiAgaWYgKCF2aWV3cG9ydCkge1xuICAgIHJldHVybiB7fTtcbiAgfVxuXG4gIGFzc2VydCh2aWV3cG9ydC5zY2FsZSwgJ1ZpZXdwb3J0IHNjYWxlIG1pc3NpbmcnKTtcblxuICBjb25zdCB7cHJvamVjdGlvbkNlbnRlciwgdmlld1Byb2plY3Rpb25NYXRyaXgsIGNhbWVyYVBvc30gPVxuICAgIGNhbGN1bGF0ZU1hdHJpeEFuZE9mZnNldCh7cHJvamVjdGlvbk1vZGUsIHBvc2l0aW9uT3JpZ2luLCB2aWV3cG9ydH0pO1xuXG4gIC8vIENhbGN1bGF0ZSBwcm9qZWN0aW9uIHBpeGVscyBwZXIgdW5pdFxuICBjb25zdCB7cGl4ZWxzUGVyTWV0ZXJ9ID0gdmlld3BvcnQuZ2V0RGlzdGFuY2VTY2FsZXMoKTtcbiAgYXNzZXJ0KHBpeGVsc1Blck1ldGVyLCAnVmlld3BvcnQgbWlzc2luZyBwaXhlbHNQZXJNZXRlcicpO1xuXG4gIC8vIFwiRmxvYXQ2NEFycmF5XCJcbiAgLy8gVHJhbnNwb3NlIHRoZSBwcm9qZWN0aW9uIG1hdHJpeCB0byBjb2x1bW4gbWFqb3IgZm9yIEdMU0wuXG4gIGNvbnN0IGdsUHJvamVjdGlvbk1hdHJpeEZQNjQgPSBuZXcgRmxvYXQzMkFycmF5KDMyKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyArK2kpIHtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IDQ7ICsraikge1xuICAgICAgW1xuICAgICAgICBnbFByb2plY3Rpb25NYXRyaXhGUDY0WyhpICogNCArIGopICogMl0sXG4gICAgICAgIGdsUHJvamVjdGlvbk1hdHJpeEZQNjRbKGkgKiA0ICsgaikgKiAyICsgMV1cbiAgICAgIF0gPSBmcDY0aWZ5KHZpZXdQcm9qZWN0aW9uTWF0cml4W2ogKiA0ICsgaV0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGRldmljZVBpeGVsUmF0aW8gPSAod2luZG93ICYmIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKSB8fCAxO1xuXG4gIHJldHVybiB7XG4gICAgLy8gUHJvamVjdGlvbiBtb2RlIHZhbHVlc1xuICAgIHByb2plY3Rpb25Nb2RlLFxuICAgIHByb2plY3Rpb25DZW50ZXIsXG5cbiAgICAvLyBTY3JlZW4gc2l6ZVxuICAgIHZpZXdwb3J0U2l6ZTogW3ZpZXdwb3J0LndpZHRoICogZGV2aWNlUGl4ZWxSYXRpbywgdmlld3BvcnQuaGVpZ2h0ICogZGV2aWNlUGl4ZWxSYXRpb10sXG4gICAgZGV2aWNlUGl4ZWxSYXRpbyxcblxuICAgIC8vIE1haW4gcHJvamVjdGlvbiBtYXRyaWNlc1xuICAgIG1vZGVsTWF0cml4OiBuZXcgRmxvYXQzMkFycmF5KG1vZGVsTWF0cml4IHx8IElERU5USVRZX01BVFJJWCksXG4gICAgLy8gdmlld01hdHJpeDogbmV3IEZsb2F0MzJBcnJheSh2aWV3TWF0cml4KSxcbiAgICBwcm9qZWN0aW9uTWF0cml4OiBuZXcgRmxvYXQzMkFycmF5KHZpZXdQcm9qZWN0aW9uTWF0cml4KSxcbiAgICBwcm9qZWN0aW9uRlA2NDogZ2xQcm9qZWN0aW9uTWF0cml4RlA2NCxcblxuICAgIHByb2plY3Rpb25QaXhlbHNQZXJVbml0OiBwaXhlbHNQZXJNZXRlcixcbiAgICBwcm9qZWN0aW9uU2NhbGU6IHZpZXdwb3J0LnNjYWxlLCAvLyBUaGlzIGlzIHRoZSBtZXJjYXRvciBzY2FsZSAoMiAqKiB6b29tKVxuICAgIHByb2plY3Rpb25TY2FsZUZQNjQ6IGZwNjRpZnkodmlld3BvcnQuc2NhbGUpLCAvLyBEZXByZWNhdGVkP1xuXG4gICAgLy8gVGhpcyBpcyBmb3IgbGlnaHRpbmcgY2FsY3VsYXRpb25zXG4gICAgY2FtZXJhUG9zOiBuZXcgRmxvYXQzMkFycmF5KGNhbWVyYVBvcylcbiAgfTtcbn1cbiJdfQ==