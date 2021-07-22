import { add, dot, subtract } from '@jsxcad/math-vec3';
import { fromPoints, toXYPlaneTransforms } from '@jsxcad/math-plane';
import { getPeg, taggedPoints } from '@jsxcad/geometry';

import Shape from './Shape.js';

const normalizeCoords = ([
  x = 0,
  y = 0,
  z = 0,
  fX = 0,
  fY = 1,
  fZ = 0,
  rX = 1,
  rY = 0,
  rZ = 0,
]) => [x, y, z, fX, fY, fZ, rX, rY, rZ];

export const getPegCoords = (shape) => {
  const coords =
    shape.constructor === Shape
      ? getPeg(shape.toTransformedGeometry())
      : normalizeCoords(shape);
  const origin = coords.slice(0, 3);
  const forward = coords.slice(3, 6);
  const right = coords.slice(6, 9);
  // const plane = fromPoints(right, forward, origin);
  const plane = fromPoints(origin, forward, right);

  return { coords, origin, forward, right, plane };
};

// See also:
// https://gist.github.com/kevinmoran/b45980723e53edeb8a5a43c49f134724

export const orient = (origin, forward, right, shapeToPeg) => {
  console.log(`QQ/orient`);
  console.log(`QQ/right: ${JSON.stringify(right)}`);
  console.log(`QQ/forward: ${JSON.stringify(forward)}`);
  console.log(`QQ/origin: ${JSON.stringify(origin)}`);
  // const plane = fromPoints(right, forward, origin);
  const plane = fromPoints(origin, forward, right);
  console.log(`QQ/orient/plane: ${JSON.stringify(plane)}`);
  const d = Math.abs(dot(plane, [0, 0, 1, 0]));
  if (d >= 0.99999) {
    return shapeToPeg.move(...origin);
  }
  const rightDirection = subtract(right, origin);
  console.log(`QQ/orient/rightDirection: ${JSON.stringify(rightDirection)}`);
  const [, from] = toXYPlaneTransforms(plane, rightDirection);
  console.log(`QQ/orient/from: ${JSON.stringify(from)}`);
  return shapeToPeg.transform(from).move(...origin);
};

export const peg = (shapeToPeg) => (shape) => {
  const { origin, right, forward } = getPegCoords(shape);
  return orient(origin, right, forward, shapeToPeg);
};

Shape.registerMethod('peg', peg);

export const put = (pegShape) => (shape) => peg(shape)(pegShape);

Shape.registerMethod('put', put);

const X = 0;
const Y = 1;
const Z = 2;

export const Peg = (
  name,
  origin = [0, 0, 0],
  forward = [0, 1, 0],
  right = [1, 0, 0]
) => {
  const o = origin;
  const f = add(origin, forward);
  const r = add(origin, right);
  const tags = ['peg'];
  if (name) {
    tags.push(`peg:${name}`);
  }
  return Shape.fromGeometry(
    taggedPoints({ tags }, [
      [o[X], o[Y], o[Z], f[X], f[Y], f[Z], r[X], r[Y], r[Z]],
    ])
  );
};

export default Peg;

Shape.prototype.Peg = Shape.shapeMethod(Peg);
