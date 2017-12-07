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

import { get } from '../../../lib';

/**
 * "Normalizes" complete or partial GeoJSON data into iterable list of features
 * Can accept GeoJSON geometry or "Feature", "FeatureCollection" in addition
 * to plain arrays and iterables.
 * Works by extracting the feature array or wrapping single objects in an array,
 * so that subsequent code can simply iterate over features.
 *
 * @param {object} geojson - geojson data
 * @param {Object|Array} data - geojson object (FeatureCollection, Feature or
 *  Geometry) or array of features
 * @return {Array|"iteratable"} - iterable list of features
 */
export function getGeojsonFeatures(geojson) {
  // If array, assume this is a list of features
  if (Array.isArray(geojson)) {
    return geojson;
  }

  var type = get(geojson, 'type');
  switch (type) {
    case 'Point':
    case 'MultiPoint':
    case 'LineString':
    case 'MultiLineString':
    case 'Polygon':
    case 'MultiPolygon':
    case 'GeometryCollection':
      // Wrap the geometry object in a 'Feature' object and wrap in an array
      return [{ type: 'Feature', properties: {}, geometry: geojson }];
    case 'Feature':
      // Wrap the feature in a 'Features' array
      return [geojson];
    case 'FeatureCollection':
      // Just return the 'Features' array from the collection
      return get(geojson, 'features');
    default:
      throw new Error('Unknown geojson type');
  }
}

// Linearize
export function separateGeojsonFeatures(features) {
  var pointFeatures = [];
  var lineFeatures = [];
  var polygonFeatures = [];
  var polygonOutlineFeatures = [];

  features.forEach(function (feature) {
    var type = get(feature, 'geometry.type');
    var coordinates = get(feature, 'geometry.coordinates');
    var properties = get(feature, 'properties');
    switch (type) {
      case 'Point':
        pointFeatures.push(feature);
        break;
      case 'MultiPoint':
        // TODO - split multipoints
        coordinates.forEach(function (point) {
          pointFeatures.push({ geometry: { coordinates: point }, properties: properties, feature: feature });
        });
        break;
      case 'LineString':
        lineFeatures.push(feature);
        break;
      case 'MultiLineString':
        // Break multilinestrings into multiple lines with same properties
        coordinates.forEach(function (path) {
          lineFeatures.push({ geometry: { coordinates: path }, properties: properties, feature: feature });
        });
        break;
      case 'Polygon':
        polygonFeatures.push(feature);
        // Break polygon into multiple lines with same properties
        coordinates.forEach(function (path) {
          polygonOutlineFeatures.push({ geometry: { coordinates: path }, properties: properties, feature: feature });
        });
        break;
      case 'MultiPolygon':
        // Break multipolygons into multiple polygons with same properties
        coordinates.forEach(function (polygon) {
          polygonFeatures.push({ geometry: { coordinates: polygon }, properties: properties, feature: feature });
          // Break polygon into multiple lines with same properties
          polygon.forEach(function (path) {
            polygonOutlineFeatures.push({ geometry: { coordinates: path }, properties: properties, feature: feature });
          });
        });
        break;
      // Not yet supported
      case 'GeometryCollection':
      default:
        throw new Error('GeoJsonLayer: ' + type + ' not supported.');
    }
  });

  return {
    pointFeatures: pointFeatures,
    lineFeatures: lineFeatures,
    polygonFeatures: polygonFeatures,
    polygonOutlineFeatures: polygonOutlineFeatures
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYXllcnMvY29yZS9nZW9qc29uLWxheWVyL2dlb2pzb24uanMiXSwibmFtZXMiOlsiZ2V0IiwiZ2V0R2VvanNvbkZlYXR1cmVzIiwiZ2VvanNvbiIsIkFycmF5IiwiaXNBcnJheSIsInR5cGUiLCJwcm9wZXJ0aWVzIiwiZ2VvbWV0cnkiLCJFcnJvciIsInNlcGFyYXRlR2VvanNvbkZlYXR1cmVzIiwiZmVhdHVyZXMiLCJwb2ludEZlYXR1cmVzIiwibGluZUZlYXR1cmVzIiwicG9seWdvbkZlYXR1cmVzIiwicG9seWdvbk91dGxpbmVGZWF0dXJlcyIsImZvckVhY2giLCJmZWF0dXJlIiwiY29vcmRpbmF0ZXMiLCJwdXNoIiwicG9pbnQiLCJwYXRoIiwicG9seWdvbiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUUEsR0FBUixRQUFrQixjQUFsQjs7QUFFQTs7Ozs7Ozs7Ozs7O0FBWUEsT0FBTyxTQUFTQyxrQkFBVCxDQUE0QkMsT0FBNUIsRUFBcUM7QUFDMUM7QUFDQSxNQUFJQyxNQUFNQyxPQUFOLENBQWNGLE9BQWQsQ0FBSixFQUE0QjtBQUMxQixXQUFPQSxPQUFQO0FBQ0Q7O0FBRUQsTUFBTUcsT0FBT0wsSUFBSUUsT0FBSixFQUFhLE1BQWIsQ0FBYjtBQUNBLFVBQVFHLElBQVI7QUFDQSxTQUFLLE9BQUw7QUFDQSxTQUFLLFlBQUw7QUFDQSxTQUFLLFlBQUw7QUFDQSxTQUFLLGlCQUFMO0FBQ0EsU0FBSyxTQUFMO0FBQ0EsU0FBSyxjQUFMO0FBQ0EsU0FBSyxvQkFBTDtBQUNFO0FBQ0EsYUFBTyxDQUNMLEVBQUNBLE1BQU0sU0FBUCxFQUFrQkMsWUFBWSxFQUE5QixFQUFrQ0MsVUFBVUwsT0FBNUMsRUFESyxDQUFQO0FBR0YsU0FBSyxTQUFMO0FBQ0U7QUFDQSxhQUFPLENBQUNBLE9BQUQsQ0FBUDtBQUNGLFNBQUssbUJBQUw7QUFDRTtBQUNBLGFBQU9GLElBQUlFLE9BQUosRUFBYSxVQUFiLENBQVA7QUFDRjtBQUNFLFlBQU0sSUFBSU0sS0FBSixDQUFVLHNCQUFWLENBQU47QUFuQkY7QUFxQkQ7O0FBRUQ7QUFDQSxPQUFPLFNBQVNDLHVCQUFULENBQWlDQyxRQUFqQyxFQUEyQztBQUNoRCxNQUFNQyxnQkFBZ0IsRUFBdEI7QUFDQSxNQUFNQyxlQUFlLEVBQXJCO0FBQ0EsTUFBTUMsa0JBQWtCLEVBQXhCO0FBQ0EsTUFBTUMseUJBQXlCLEVBQS9COztBQUVBSixXQUFTSyxPQUFULENBQWlCLG1CQUFXO0FBQzFCLFFBQU1WLE9BQU9MLElBQUlnQixPQUFKLEVBQWEsZUFBYixDQUFiO0FBQ0EsUUFBTUMsY0FBY2pCLElBQUlnQixPQUFKLEVBQWEsc0JBQWIsQ0FBcEI7QUFDQSxRQUFNVixhQUFhTixJQUFJZ0IsT0FBSixFQUFhLFlBQWIsQ0FBbkI7QUFDQSxZQUFRWCxJQUFSO0FBQ0EsV0FBSyxPQUFMO0FBQ0VNLHNCQUFjTyxJQUFkLENBQW1CRixPQUFuQjtBQUNBO0FBQ0YsV0FBSyxZQUFMO0FBQ0U7QUFDQUMsb0JBQVlGLE9BQVosQ0FBb0IsaUJBQVM7QUFDM0JKLHdCQUFjTyxJQUFkLENBQW1CLEVBQUNYLFVBQVUsRUFBQ1UsYUFBYUUsS0FBZCxFQUFYLEVBQWlDYixzQkFBakMsRUFBNkNVLGdCQUE3QyxFQUFuQjtBQUNELFNBRkQ7QUFHQTtBQUNGLFdBQUssWUFBTDtBQUNFSixxQkFBYU0sSUFBYixDQUFrQkYsT0FBbEI7QUFDQTtBQUNGLFdBQUssaUJBQUw7QUFDRTtBQUNBQyxvQkFBWUYsT0FBWixDQUFvQixnQkFBUTtBQUMxQkgsdUJBQWFNLElBQWIsQ0FBa0IsRUFBQ1gsVUFBVSxFQUFDVSxhQUFhRyxJQUFkLEVBQVgsRUFBZ0NkLHNCQUFoQyxFQUE0Q1UsZ0JBQTVDLEVBQWxCO0FBQ0QsU0FGRDtBQUdBO0FBQ0YsV0FBSyxTQUFMO0FBQ0VILHdCQUFnQkssSUFBaEIsQ0FBcUJGLE9BQXJCO0FBQ0E7QUFDQUMsb0JBQVlGLE9BQVosQ0FBb0IsZ0JBQVE7QUFDMUJELGlDQUF1QkksSUFBdkIsQ0FBNEIsRUFBQ1gsVUFBVSxFQUFDVSxhQUFhRyxJQUFkLEVBQVgsRUFBZ0NkLHNCQUFoQyxFQUE0Q1UsZ0JBQTVDLEVBQTVCO0FBQ0QsU0FGRDtBQUdBO0FBQ0YsV0FBSyxjQUFMO0FBQ0U7QUFDQUMsb0JBQVlGLE9BQVosQ0FBb0IsbUJBQVc7QUFDN0JGLDBCQUFnQkssSUFBaEIsQ0FBcUIsRUFBQ1gsVUFBVSxFQUFDVSxhQUFhSSxPQUFkLEVBQVgsRUFBbUNmLHNCQUFuQyxFQUErQ1UsZ0JBQS9DLEVBQXJCO0FBQ0E7QUFDQUssa0JBQVFOLE9BQVIsQ0FBZ0IsZ0JBQVE7QUFDdEJELG1DQUF1QkksSUFBdkIsQ0FBNEIsRUFBQ1gsVUFBVSxFQUFDVSxhQUFhRyxJQUFkLEVBQVgsRUFBZ0NkLHNCQUFoQyxFQUE0Q1UsZ0JBQTVDLEVBQTVCO0FBQ0QsV0FGRDtBQUdELFNBTkQ7QUFPQTtBQUNBO0FBQ0YsV0FBSyxvQkFBTDtBQUNBO0FBQ0UsY0FBTSxJQUFJUixLQUFKLG9CQUEyQkgsSUFBM0IscUJBQU47QUF2Q0Y7QUF5Q0QsR0E3Q0Q7O0FBK0NBLFNBQU87QUFDTE0sZ0NBREs7QUFFTEMsOEJBRks7QUFHTEMsb0NBSEs7QUFJTEM7QUFKSyxHQUFQO0FBTUQiLCJmaWxlIjoiZ2VvanNvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge2dldH0gZnJvbSAnLi4vLi4vLi4vbGliJztcblxuLyoqXG4gKiBcIk5vcm1hbGl6ZXNcIiBjb21wbGV0ZSBvciBwYXJ0aWFsIEdlb0pTT04gZGF0YSBpbnRvIGl0ZXJhYmxlIGxpc3Qgb2YgZmVhdHVyZXNcbiAqIENhbiBhY2NlcHQgR2VvSlNPTiBnZW9tZXRyeSBvciBcIkZlYXR1cmVcIiwgXCJGZWF0dXJlQ29sbGVjdGlvblwiIGluIGFkZGl0aW9uXG4gKiB0byBwbGFpbiBhcnJheXMgYW5kIGl0ZXJhYmxlcy5cbiAqIFdvcmtzIGJ5IGV4dHJhY3RpbmcgdGhlIGZlYXR1cmUgYXJyYXkgb3Igd3JhcHBpbmcgc2luZ2xlIG9iamVjdHMgaW4gYW4gYXJyYXksXG4gKiBzbyB0aGF0IHN1YnNlcXVlbnQgY29kZSBjYW4gc2ltcGx5IGl0ZXJhdGUgb3ZlciBmZWF0dXJlcy5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gZ2VvanNvbiAtIGdlb2pzb24gZGF0YVxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IGRhdGEgLSBnZW9qc29uIG9iamVjdCAoRmVhdHVyZUNvbGxlY3Rpb24sIEZlYXR1cmUgb3JcbiAqICBHZW9tZXRyeSkgb3IgYXJyYXkgb2YgZmVhdHVyZXNcbiAqIEByZXR1cm4ge0FycmF5fFwiaXRlcmF0YWJsZVwifSAtIGl0ZXJhYmxlIGxpc3Qgb2YgZmVhdHVyZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEdlb2pzb25GZWF0dXJlcyhnZW9qc29uKSB7XG4gIC8vIElmIGFycmF5LCBhc3N1bWUgdGhpcyBpcyBhIGxpc3Qgb2YgZmVhdHVyZXNcbiAgaWYgKEFycmF5LmlzQXJyYXkoZ2VvanNvbikpIHtcbiAgICByZXR1cm4gZ2VvanNvbjtcbiAgfVxuXG4gIGNvbnN0IHR5cGUgPSBnZXQoZ2VvanNvbiwgJ3R5cGUnKTtcbiAgc3dpdGNoICh0eXBlKSB7XG4gIGNhc2UgJ1BvaW50JzpcbiAgY2FzZSAnTXVsdGlQb2ludCc6XG4gIGNhc2UgJ0xpbmVTdHJpbmcnOlxuICBjYXNlICdNdWx0aUxpbmVTdHJpbmcnOlxuICBjYXNlICdQb2x5Z29uJzpcbiAgY2FzZSAnTXVsdGlQb2x5Z29uJzpcbiAgY2FzZSAnR2VvbWV0cnlDb2xsZWN0aW9uJzpcbiAgICAvLyBXcmFwIHRoZSBnZW9tZXRyeSBvYmplY3QgaW4gYSAnRmVhdHVyZScgb2JqZWN0IGFuZCB3cmFwIGluIGFuIGFycmF5XG4gICAgcmV0dXJuIFtcbiAgICAgIHt0eXBlOiAnRmVhdHVyZScsIHByb3BlcnRpZXM6IHt9LCBnZW9tZXRyeTogZ2VvanNvbn1cbiAgICBdO1xuICBjYXNlICdGZWF0dXJlJzpcbiAgICAvLyBXcmFwIHRoZSBmZWF0dXJlIGluIGEgJ0ZlYXR1cmVzJyBhcnJheVxuICAgIHJldHVybiBbZ2VvanNvbl07XG4gIGNhc2UgJ0ZlYXR1cmVDb2xsZWN0aW9uJzpcbiAgICAvLyBKdXN0IHJldHVybiB0aGUgJ0ZlYXR1cmVzJyBhcnJheSBmcm9tIHRoZSBjb2xsZWN0aW9uXG4gICAgcmV0dXJuIGdldChnZW9qc29uLCAnZmVhdHVyZXMnKTtcbiAgZGVmYXVsdDpcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZ2VvanNvbiB0eXBlJyk7XG4gIH1cbn1cblxuLy8gTGluZWFyaXplXG5leHBvcnQgZnVuY3Rpb24gc2VwYXJhdGVHZW9qc29uRmVhdHVyZXMoZmVhdHVyZXMpIHtcbiAgY29uc3QgcG9pbnRGZWF0dXJlcyA9IFtdO1xuICBjb25zdCBsaW5lRmVhdHVyZXMgPSBbXTtcbiAgY29uc3QgcG9seWdvbkZlYXR1cmVzID0gW107XG4gIGNvbnN0IHBvbHlnb25PdXRsaW5lRmVhdHVyZXMgPSBbXTtcblxuICBmZWF0dXJlcy5mb3JFYWNoKGZlYXR1cmUgPT4ge1xuICAgIGNvbnN0IHR5cGUgPSBnZXQoZmVhdHVyZSwgJ2dlb21ldHJ5LnR5cGUnKTtcbiAgICBjb25zdCBjb29yZGluYXRlcyA9IGdldChmZWF0dXJlLCAnZ2VvbWV0cnkuY29vcmRpbmF0ZXMnKTtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gZ2V0KGZlYXR1cmUsICdwcm9wZXJ0aWVzJyk7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnUG9pbnQnOlxuICAgICAgcG9pbnRGZWF0dXJlcy5wdXNoKGZlYXR1cmUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTXVsdGlQb2ludCc6XG4gICAgICAvLyBUT0RPIC0gc3BsaXQgbXVsdGlwb2ludHNcbiAgICAgIGNvb3JkaW5hdGVzLmZvckVhY2gocG9pbnQgPT4ge1xuICAgICAgICBwb2ludEZlYXR1cmVzLnB1c2goe2dlb21ldHJ5OiB7Y29vcmRpbmF0ZXM6IHBvaW50fSwgcHJvcGVydGllcywgZmVhdHVyZX0pO1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdMaW5lU3RyaW5nJzpcbiAgICAgIGxpbmVGZWF0dXJlcy5wdXNoKGZlYXR1cmUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTXVsdGlMaW5lU3RyaW5nJzpcbiAgICAgIC8vIEJyZWFrIG11bHRpbGluZXN0cmluZ3MgaW50byBtdWx0aXBsZSBsaW5lcyB3aXRoIHNhbWUgcHJvcGVydGllc1xuICAgICAgY29vcmRpbmF0ZXMuZm9yRWFjaChwYXRoID0+IHtcbiAgICAgICAgbGluZUZlYXR1cmVzLnB1c2goe2dlb21ldHJ5OiB7Y29vcmRpbmF0ZXM6IHBhdGh9LCBwcm9wZXJ0aWVzLCBmZWF0dXJlfSk7XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1BvbHlnb24nOlxuICAgICAgcG9seWdvbkZlYXR1cmVzLnB1c2goZmVhdHVyZSk7XG4gICAgICAvLyBCcmVhayBwb2x5Z29uIGludG8gbXVsdGlwbGUgbGluZXMgd2l0aCBzYW1lIHByb3BlcnRpZXNcbiAgICAgIGNvb3JkaW5hdGVzLmZvckVhY2gocGF0aCA9PiB7XG4gICAgICAgIHBvbHlnb25PdXRsaW5lRmVhdHVyZXMucHVzaCh7Z2VvbWV0cnk6IHtjb29yZGluYXRlczogcGF0aH0sIHByb3BlcnRpZXMsIGZlYXR1cmV9KTtcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTXVsdGlQb2x5Z29uJzpcbiAgICAgIC8vIEJyZWFrIG11bHRpcG9seWdvbnMgaW50byBtdWx0aXBsZSBwb2x5Z29ucyB3aXRoIHNhbWUgcHJvcGVydGllc1xuICAgICAgY29vcmRpbmF0ZXMuZm9yRWFjaChwb2x5Z29uID0+IHtcbiAgICAgICAgcG9seWdvbkZlYXR1cmVzLnB1c2goe2dlb21ldHJ5OiB7Y29vcmRpbmF0ZXM6IHBvbHlnb259LCBwcm9wZXJ0aWVzLCBmZWF0dXJlfSk7XG4gICAgICAgIC8vIEJyZWFrIHBvbHlnb24gaW50byBtdWx0aXBsZSBsaW5lcyB3aXRoIHNhbWUgcHJvcGVydGllc1xuICAgICAgICBwb2x5Z29uLmZvckVhY2gocGF0aCA9PiB7XG4gICAgICAgICAgcG9seWdvbk91dGxpbmVGZWF0dXJlcy5wdXNoKHtnZW9tZXRyeToge2Nvb3JkaW5hdGVzOiBwYXRofSwgcHJvcGVydGllcywgZmVhdHVyZX0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgICAvLyBOb3QgeWV0IHN1cHBvcnRlZFxuICAgIGNhc2UgJ0dlb21ldHJ5Q29sbGVjdGlvbic6XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgR2VvSnNvbkxheWVyOiAke3R5cGV9IG5vdCBzdXBwb3J0ZWQuYCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIHBvaW50RmVhdHVyZXMsXG4gICAgbGluZUZlYXR1cmVzLFxuICAgIHBvbHlnb25GZWF0dXJlcyxcbiAgICBwb2x5Z29uT3V0bGluZUZlYXR1cmVzXG4gIH07XG59XG4iXX0=