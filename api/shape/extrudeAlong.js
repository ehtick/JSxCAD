import Point from './Point.js';
import Shape from './Shape.js';
import { extrude as extrudeGeometry } from '@jsxcad/geometry';

export const extrudeAlong =
  (direction, ...extents) =>
  (shape) => {
    const heights = extents.map((extent) => Shape.toValue(extent, shape));
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
            Shape.toShape(direction, shape).toGeometry()
          )
        )
      );
    }
    return Shape.Group(...extrusions);
  };

export const ex = (...extents) => extrudeAlong(Point(0, 0, 1), ...extents);

Shape.registerMethod('extrudeAlong', extrudeAlong);

export default extrudeAlong;