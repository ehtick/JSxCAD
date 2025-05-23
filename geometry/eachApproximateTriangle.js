import { eachApproximateTriangle as eachApproximateTriangleWithCgal } from '@jsxcad/algorithm-cgal';
import { linearize } from './tagged/linearize.js';
import { toConcreteGeometry } from './tagged/toConcreteGeometry.js';

const filterTargets = (geometry) => ['graph'].includes(geometry.type);

export const eachTriangle = (geometry, emitTriangle) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filterTargets, inputs);
  eachApproximateTriangleWithCgal(inputs, emitTriangle);
};
