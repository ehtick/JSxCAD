import { outline as outlineOp } from './outline.js';
import { rewrite } from './visit.js';
import { taggedGroup } from './taggedGroup.js';
import { taggedPaths } from './taggedPaths.js';
import { toPaths } from '../graph/toPaths.js';
import { toTransformedGeometry } from './toTransformedGeometry.js';
import { toTriangles } from '../graph/toTriangles.js';
import { wireframe as wireframeOp } from './wireframe.js';

export const soup = (
  geometry,
  { doTriangles = true, doOutline = true, doWireframe = true } = {}
) => {
  const outline = doOutline ? outlineOp : () => [];
  const wireframe = doWireframe
    ? (geometry) => wireframeOp(geometry)
    : () => [];
  const triangles = doTriangles
    ? ({ tags }, geometry) => [toTriangles({ tags }, geometry)]
    : () => [];
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'graph': {
        const { graph, tags } = geometry;
        if (graph.isWireframe) {
          return taggedPaths({ tags }, toPaths(graph));
        } else if (graph.isClosed) {
          return taggedGroup(
            {},
            ...triangles({ tags }, geometry),
            ...wireframe(geometry),
            ...outline(geometry, ['color:black'])
          );
        } else if (graph.isEmpty) {
          return taggedGroup({});
        } else {
          // FIX: Simplify this arrangement.
          return taggedGroup(
            {},
            ...triangles({ tags }, geometry),
            ...wireframe(geometry),
            ...outline(geometry, ['color:black'])
          );
        }
      }
      // Unreachable.
      case 'segments':
      case 'triangles':
      case 'points':
      case 'paths':
        // Already soupy enough.
        return geometry;
      case 'displayGeometry':
        // soup can handle displayGeometry.
        return descend();
      case 'layout':
      case 'plan':
      case 'item':
      case 'sketch':
      case 'group': {
        return descend();
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(toTransformedGeometry(geometry), op);
};
