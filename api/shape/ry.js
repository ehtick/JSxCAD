import { Shape } from './Shape.js';
import { fromRotateYToTransform } from '@jsxcad/algorithm-cgal';

// ry is in terms of turns -- 1/2 is a half turn.
export const ry =
  (...angles) =>
  (shape) =>
    Shape.Group(
      ...shape
        .toFlatValues(angles)
        .map((angle) => shape.transform(fromRotateYToTransform(angle * 360)))
    );

Shape.registerMethod('ry', ry);

export const rotateY = ry;
Shape.registerMethod('rotateY', ry);
