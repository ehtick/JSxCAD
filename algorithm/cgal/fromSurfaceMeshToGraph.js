import { equals } from '@jsxcad/math-vec3';
import { fromPolygon as fromPolygonToPlane } from '@jsxcad/math-plane';
import { getCgal } from './getCgal.js';

export const fromSurfaceMeshToGraph = (mesh) => {
  const c = getCgal();
  if (mesh.has_garbage()) {
    c.Surface_mesh__collect_garbage(mesh);
  }
  const graph = { edges: [], faces: [], loops: [], points: [] };
  const polygon = [];
  let face = -1;
  c.Surface_mesh__explore(
    mesh,
    (faceId) => {
      if (polygon.length >= 3) {
        graph.faces[face].plane = fromPolygonToPlane(polygon);
        if (graph.faces[face].plane === undefined) {
          console.log(`QQ/bent: ${JSON.stringify(polygon)}`);
        }
      } else {
        // console.log(`QQ/degenerate: ${JSON.stringify(polygon)}`);
      }
      polygon.length = 0;
      face = faceId;
    },
    (point, x, y, z) => {
      if (!isFinite(x) || !isFinite(y) || !isFinite(z)) {
        throw Error('die');
      }
      if (graph.points[point]) {
        if (!equals(graph.points[point], [x, y, z])) {
          throw Error('die');
        }
      }
      graph.points[point] = [x, y, z];
    },
    (point, edge, next, twin) => {
      graph.edges[edge] = { point, next, twin, loop: face };
      if (graph.faces[face] === undefined) {
        graph.faces[face] = { loop: face };
        graph.loops[face] = { edge, face };
      }
      polygon.push(graph.points[point]);
    }
  );
  return graph;
};