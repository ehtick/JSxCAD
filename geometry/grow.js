import {
  deletePendingSurfaceMeshes,
  grow as growWithCgal,
} from '@jsxcad/algorithm-cgal';

import { isNotTypeVoid } from './tagged/type.js';
import { linearize } from './tagged/linearize.js';
import { replacer } from './tagged/visit.js';
import { toConcreteGeometry } from './tagged/toConcreteGeometry.js';

const filter = (geometry, parent) =>
  ['graph'].includes(geometry.type) && isNotTypeVoid(geometry);

export const grow = (geometry, offset, selections, options) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter, inputs);
  const count = inputs.length;
  inputs.push(offset);
  for (const selection of selections) {
    linearize(toConcreteGeometry(selection), filter, inputs);
  }
  const outputs = growWithCgal(inputs, count, options);
  deletePendingSurfaceMeshes();
  return replacer(inputs, outputs)(concreteGeometry);
};