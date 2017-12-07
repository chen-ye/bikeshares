import '../../../src/headless';
import { loadImage } from '../../../src/io';
import test from '../../setup';

/* eslint-disable quotes */
var PNG_BITS = 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQIW2P8z/D/PwMDAwMjjAEAQOwF/W1Dp54AAAAASUVORK5CYII=';
/* eslint-enable quotes */

var DATA_URL = 'data:image/png;base64,' + PNG_BITS;

test('io#read-image', function (t) {
  loadImage(DATA_URL).then(function (image) {
    t.equals(image.width, 2, 'width');
    t.equals(image.height, 2, 'height');
    t.end();
  });
});
//# sourceMappingURL=read-image.js.map