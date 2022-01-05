import { graphSymbol, surfaceMeshSymbol } from './symbols.js';

import { fromSurfaceMeshToLazyGraph } from '@jsxcad/algorithm-cgal';

export const fromSurfaceMeshLazy = (surfaceMesh, forceNewGraph = false) => {
  if (!surfaceMesh) {
    throw Error('null surfaceMesh');
  }
  if (surfaceMesh.provenance === undefined) {
    throw Error('Surface mesh has no provenance');
  }
  let graph = surfaceMesh[graphSymbol];
  if (forceNewGraph || graph === undefined) {
    graph = fromSurfaceMeshToLazyGraph(surfaceMesh);
    surfaceMesh[graphSymbol] = graph;
    graph[surfaceMeshSymbol] = surfaceMesh;
  }
  return graph;
};
