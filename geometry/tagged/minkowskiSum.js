import { getNonVoidGraphs } from './getNonVoidGraphs.js';
import { minkowskiSum as minkowskiSumOfGraphs } from '../graph/minkowskiSum.js';
import { reify } from './reify.js';
import { rewrite } from './visit.js';
import { taggedGroup } from './taggedGroup.js';
import { toTransformedGeometry } from './toTransformedGeometry.js';

export const minkowskiSum = (geometry, offset) => {
  offset = reify(offset);
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        const sums = [];
        for (const otherGeometry of getNonVoidGraphs(offset)) {
          sums.push(minkowskiSumOfGraphs({ tags }, geometry, otherGeometry));
        }
        return taggedGroup({}, ...sums);
      }
      case 'triangles':
      case 'paths':
      case 'points':
        // Not implemented yet.
        return geometry;
      case 'plan':
        return minkowskiSum(reify(geometry).content[0], offset);
      case 'item':
      case 'group': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real for push.
        return geometry;
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(toTransformedGeometry(geometry), op);
};
