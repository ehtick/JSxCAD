import Shape from './Shape.js';
import { qualifyTag } from './tag.js';

export const notColor =
  (...colors) =>
  (shape) =>
    shape.untag(...colors.map((color) => qualifyTag(color, 'color')));

Shape.registerMethod('notColor', notColor);