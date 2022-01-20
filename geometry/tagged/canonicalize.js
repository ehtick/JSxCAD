import { canonicalize as canonicalizePaths } from '../paths/canonicalize.js';
import { canonicalize as canonicalizePlane } from '@jsxcad/math-plane';
import { canonicalize as canonicalizePoints } from '../points/canonicalize.js';
import { canonicalize as canonicalizePolygons } from '../polygons/canonicalize.js';
import { prepareForSerialization } from './prepareForSerialization.js';
import { rewrite } from './visit.js';
import { toTransformedGeometry } from './toTransformedGeometry.js';

export const canonicalize = (geometry) => {
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'points':
        return descend({ points: canonicalizePoints(geometry.points) });
      case 'segments':
        return geometry;
      case 'paths':
        return descend({ paths: canonicalizePaths(geometry.paths) });
      case 'triangles':
        return descend({ triangles: canonicalizePolygons(geometry.triangles) });
      case 'plan':
        return descend({
          marks: canonicalizePoints(geometry.marks),
          planes: geometry.planes.map(canonicalizePlane),
        });
      case 'graph':
        return prepareForSerialization(geometry);
      case 'item':
      case 'group':
      case 'layout':
      case 'sketch':
        return descend();
      default:
        throw Error(`Unexpected geometry type ${geometry.type}`);
    }
  };
  return rewrite(toTransformedGeometry(geometry), op);
};
