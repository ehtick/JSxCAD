/*
import { getCgal } from './getCgal.js';

const X = 0;
const Y = 1;
const Z = 2;

export const fromGraphToSurfaceMesh = (graph) => {
  try {
    const c = getCgal();
    const mesh = new c.Surface_mesh();

    const vertexIndex = [];
    for (let nthPoint = 0; ; nthPoint++) {
      if (graph.exactPoints) {
        const exact = graph.exactPoints[nthPoint];
        if (exact) {
          vertexIndex.push(
            c.Surface_mesh__add_exact(mesh, exact[X], exact[Y], exact[Z])
          );
          continue;
        }
      }
      if (graph.points) {
        const approximate = graph.points[nthPoint];
        if (approximate) {
          vertexIndex.push(
            c.Surface_mesh__add_vertex(
              mesh,
              approximate[X],
              approximate[Y],
              approximate[Z]
            )
          );
          continue;
        }
      }
      break;
    }

    if (graph.facets) {
      graph.facets.forEach(({ edge }, facet) => {
        const points = [];
        const faceIndex = c.Surface_mesh__add_face_vertices(mesh, () => {
          const edgeNode = graph.edges[edge];
          edge = edgeNode.next;
          points.push(graph.points[edgeNode.point]);
          return vertexIndex[edgeNode.point];
        });
        if (faceIndex === 4294967295 // -1 //) {
          throw Error(`Face could not be added: ${JSON.stringify(points)}`);
        }
      });
    }

    if (!c.Surface_mesh__triangulate_faces(mesh)) {
      throw Error('triangulation failed');
    }

    if (!mesh.is_valid(false)) {
      throw Error('die');
    }

    mesh.provenance = 'fromGraph';
    return mesh;
  } catch (error) {
    throw Error(error);
  }
};
*/
