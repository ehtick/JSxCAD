import { add, distance, scale } from '@jsxcad/math-vec3';

import Shape from './Shape.js';
import { measureBoundingBox } from '@jsxcad/geometry';

const X = 0;
const Y = 1;
const Z = 2;

export const size =
  (op = (size) => (shape) => size) =>
  (shape) => {
    const geometry = shape.toConcreteGeometry();
    let bounds = measureBoundingBox(geometry);
    if (bounds === undefined) {
      return op({
        length: 0,
        width: 0,
        height: 0,
        max: [0, 0, 0],
        min: [0, 0, 0],
        center: [0, 0, 0],
        radius: 0,
      })(Shape.fromGeometry(geometry));
    }
    let [min, max] = bounds;
    const length = max[X] - min[X];
    const width = max[Y] - min[Y];
    const height = max[Z] - min[Z];
    const center = scale(0.5, add(min, max));
    const radius = distance(center, max);
    return op({
      length,
      width,
      height,
      max,
      min,
      center,
      radius,
    })(Shape.fromGeometry(geometry));
  };

Shape.registerMethod('size', size);
