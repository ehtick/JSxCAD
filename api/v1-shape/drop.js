import { Shape, fromGeometry, toGeometry } from './Shape';
import { drop as dropGeometry, rewriteTags } from '@jsxcad/geometry-tagged';

/**
 *
 * # Drop from assembly
 *
 * Generates an assembly from components in an assembly without a tag.
 *
 * If no tag is supplied, the whole shape is dropped.
 *
 * ::: illustration
 * ```
 * assemble(Circle(10).as('A'),
 *          Square(10).as('B'))
 * ```
 * :::
 * ::: illustration
 * ```
 * assemble(Circle(10).as('A'),
 *          Square(10).as('B'))
 *   .drop('A')
 * ```
 * :::
 * ::: illustration
 * ```
 * assemble(Circle(10).as('A'),
 *          Square(10).as('B'))
 *   .drop('B')
 * ```
 * :::
 * ::: illustration
 * ```
 * assemble(Circle(10).as('A'),
 *          Square(10).as('B'))
 *   .drop('A', 'B')
 * ```
 * :::
 * ::: illustration
 * ```
 * assemble(Cube(10).below(),
 *          Cube(8).below().drop())
 * ```
 * :::
 *
 **/

export const drop = (shape, ...tags) => {
  if (tags.length === 0) {
    return fromGeometry(rewriteTags(['compose/non-positive'], [], toGeometry(shape)));
  } else {
    return fromGeometry(dropGeometry(tags.map(tag => `user/${tag}`), toGeometry(shape)));
  }
};

const dropMethod = function (...tags) { return drop(this, ...tags); };
Shape.prototype.drop = dropMethod;

export default drop;

drop.signature = '(shape:Shape ...tags:string) -> Shape';
dropMethod.signature = 'Shape -> drop(...tags:string) -> Shape';