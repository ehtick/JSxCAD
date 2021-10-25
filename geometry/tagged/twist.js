import { reify } from './reify.js';
import { rewrite } from './visit.js';
import { toTransformedGeometry } from './toTransformedGeometry.js';
import { twist as twistGraph } from '../graph/twist.js';

export const twist = (geometry, turnsPerMm, axis) => {
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'graph': {
        return twistGraph(geometry, turnsPerMm, axis);
      }
      case 'triangles':
      case 'paths':
      case 'points':
        // Not implemented yet.
        return geometry;
      case 'plan':
        return twist(reify(geometry).content[0], turnsPerMm, axis);
      case 'item':
      case 'group': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real for twist.
        return geometry;
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(toTransformedGeometry(geometry), op);
};
