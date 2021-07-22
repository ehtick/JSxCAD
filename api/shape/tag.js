import Shape from './Shape.js';
import { rewriteTags } from '@jsxcad/geometry';

export const tag =
  (...tags) =>
  (shape) =>
    Shape.fromGeometry(
      rewriteTags(
        tags.map((tag) => `user:${tag}`),
        [],
        shape.toGeometry()
      )
    );

Shape.registerMethod('tag', tag);
