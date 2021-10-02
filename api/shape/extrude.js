import Point from './Point.js';
import Shape from './Shape.js';
import { extrude as extrudeGeometry } from '@jsxcad/geometry';

export const extrude =
  (...args) =>
  (shape) => {
    const heights = args.map((arg) => Shape.toValue(arg, shape));
    const direction =
      heights[0] instanceof Shape ? heights.shift() : Point(0, 0, 1);
    if (heights.length % 2 === 1) {
      heights.push(0);
    }
    heights.sort((a, b) => a - b);
    const extrusions = [];
    while (heights.length > 0) {
      const height = heights.pop();
      const depth = heights.pop();
      if (height === depth) {
        // Return unextruded geometry at this height, instead.
        extrusions.push(shape.z(height));
        continue;
      }
      extrusions.push(
        Shape.fromGeometry(
          extrudeGeometry(
            shape.toGeometry(),
            height,
            depth,
            direction.toGeometry()
          )
        )
      );
    }
    return Shape.Group(...extrusions);
  };

export const ex = extrude;

Shape.registerMethod('extrude', extrude);
Shape.registerMethod('ex', extrude);

export default extrude;
