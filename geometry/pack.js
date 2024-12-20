import { hasTypeGhost, isNotTypeGhost, isNotTypeVoid } from './tagged/type.js';

import { ConvexHull } from './convexHull.js';
import { Group } from './Group.js';
import { bb as bbOp } from './bb.js';
import { cast } from './cast.js';
import { linearize } from './tagged/linearize.js';
import { pack as packWithCgal } from '@jsxcad/algorithm-cgal';
import { taggedItem } from './tagged/taggedItem.js';
import { transform } from './tagged/transform.js';
import { translate } from './translate.js';

const filterSilhouettes = (geometry) =>
  geometry.type === 'polygonsWithHoles' && isNotTypeGhost(geometry);

const filterCast = (geometry) =>
  ['graph', 'polygonsWithHoles', 'item'].includes(geometry.type) &&
  isNotTypeGhost(geometry) &&
  isNotTypeVoid(geometry);

const filterSheet = (geometry) =>
  ['graph', 'polygonsWithHoles'].includes(geometry.type) &&
  isNotTypeGhost(geometry) &&
  isNotTypeVoid(geometry);

export const pack = (
  geometry,
  sheets = [],
  orientations = [],
  options = {},
  strategy = 'bb'
) => {
  const { margin = 0 } = options;
  // Convert all of the geometry into silhouettes.
  const inputs = linearize(geometry, filterCast, [], { includeItems: false });
  const silhouettes = [];
  switch (strategy) {
    case 'bb':
      // silhouettes are bounding boxes.
      for (const input of inputs) {
        const silhouette = cast(
          undefined,
          undefined,
          bbOp(input, margin, margin, margin, { flat: true })
        );
        linearize(silhouette, filterSilhouettes, silhouettes);
      }
      break;
    case 'hull':
      // silhouettes are convex hulls.
      // TODO: support margins
      for (const input of inputs) {
        const silhouette = cast(undefined, undefined, ConvexHull([input]));
        linearize(silhouette, filterSilhouettes, silhouettes);
      }
      break;
    case 'outline':
      // silhouettes are the actual shape outlines.
      // TODO: support margins
      for (const input of inputs) {
        const silhouette = cast(undefined, undefined, input);
        linearize(silhouette, filterSilhouettes, silhouettes);
      }
      break;
  }
  const count = silhouettes.length;
  for (const sheet of sheets) {
    linearize(sheet, filterSheet, silhouettes);
  }
  const sheetByInput = [];
  const packed = packWithCgal(
    silhouettes,
    count,
    orientations,
    options,
    sheetByInput
  );
  const outputs = [];
  // This places the parts and their silhouettes.
  for (let nth = 0; nth < count; nth++) {
    outputs[nth] = transform(inputs[nth], packed[nth].matrix);
    silhouettes[nth] = transform(silhouettes[nth], packed[nth].matrix);
  }
  // Now construct items with the sheet and the content.
  const pages = [];
  for (let nth = 0; nth < sheetByInput.length; nth++) {
    const sheet = sheetByInput[nth] - count;
    if (pages[sheet] === undefined) {
      pages[sheet] = taggedItem({ tags: ['pack:sheet'] }, Group([]));
      if (sheets[sheet] !== undefined) {
        // Need to distinguish the sheet somehow.
        // Put the sheet 0.01 mm below the surface.
        pages[sheet].content[0].content.push(
          translate(sheets[sheet], [0, 0, -0.01])
        );
      }
    }
    pages[sheet].content[0].content.push(outputs[nth]);
    pages[sheet].content[0].content.push(hasTypeGhost(silhouettes[nth]));
  }
  return Group(pages.filter((page) => page !== undefined));
};
