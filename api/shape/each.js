import Shape from './Shape.js';
import { getLeafs } from '@jsxcad/geometry';

export const each =
  (op = (leafs, shape) => leafs) =>
  (shape) =>
    op(
      getLeafs(shape.toGeometry()).map((leaf) =>
        Shape.fromGeometry(leaf)
      ),
      shape
    );
Shape.registerMethod('each', each);
