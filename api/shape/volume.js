import Shape from './Shape.js';
import { measureVolume } from '@jsxcad/geometry';

export const volume = Shape.chainable(
  (op = (value) => (shape) => value) =>
    (shape) =>
      op(measureVolume(shape.toGeometry()))(shape)
);

Shape.registerMethod('volume', volume);