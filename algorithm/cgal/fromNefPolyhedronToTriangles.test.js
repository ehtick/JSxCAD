import { fromNefPolyhedronToTriangles } from './fromNefPolyhedronToTriangles.js';
import { fromPolygonsToSurfaceMesh } from './fromPolygonsToSurfaceMesh.js';
import { fromSurfaceMeshToNefPolyhedron } from './fromSurfaceMeshToNefPolyhedron.js';
import { initCgal } from './getCgal.js';

import test from 'ava';

test.beforeEach(async (t) => {
  await initCgal();
});

const box = [
  [
    [-0.5, 0.5, -0.5],
    [-0.5, 0.5, 0.5],
    [0.5, 0.5, 0.5],
  ],
  [
    [0.5, 0.5, 0.5],
    [0.5, 0.5, -0.5],
    [-0.5, 0.5, -0.5],
  ],
  [
    [0.5, -0.5, 0.5],
    [0.5, 0.5, 0.5],
    [-0.5, 0.5, 0.5],
  ],
  [
    [-0.5, 0.5, 0.5],
    [-0.5, -0.5, 0.5],
    [0.5, -0.5, 0.5],
  ],
  [
    [-0.5, 0.5, 0.5],
    [-0.5, 0.5, -0.5],
    [-0.5, -0.5, -0.5],
  ],
  [
    [-0.5, -0.5, -0.5],
    [-0.5, -0.5, 0.5],
    [-0.5, 0.5, 0.5],
  ],
  [
    [-0.5, 0.5, -0.5],
    [0.5, 0.5, -0.5],
    [0.5, -0.5, -0.5],
  ],
  [
    [0.5, -0.5, -0.5],
    [-0.5, -0.5, -0.5],
    [-0.5, 0.5, -0.5],
  ],
  [
    [0.5, 0.5, -0.5],
    [0.5, 0.5, 0.5],
    [0.5, -0.5, 0.5],
  ],
  [
    [0.5, -0.5, 0.5],
    [0.5, -0.5, -0.5],
    [0.5, 0.5, -0.5],
  ],
  [
    [-0.5, -0.5, 0.5],
    [-0.5, -0.5, -0.5],
    [0.5, -0.5, -0.5],
  ],
  [
    [0.5, -0.5, -0.5],
    [0.5, -0.5, 0.5],
    [-0.5, -0.5, 0.5],
  ],
];

test('FromPolygonsToSurfaceMesh', (t) => {
  const surfaceMesh = fromPolygonsToSurfaceMesh(box);
  t.true(surfaceMesh.is_valid(false));
  const nefPolyhedron = fromSurfaceMeshToNefPolyhedron(surfaceMesh);
  t.true(nefPolyhedron.is_valid(false, 1));
  const triangles = fromNefPolyhedronToTriangles(nefPolyhedron);
  t.deepEqual(triangles, [
    [
      [-0.5, -0.5, -0.5],
      [-0.5, 0.5, -0.5],
      [0.5, -0.5, -0.5],
    ],
    [
      [0.5, -0.5, -0.5],
      [-0.5, 0.5, -0.5],
      [0.5, 0.5, -0.5],
    ],
    [
      [-0.5, 0.5, -0.5],
      [-0.5, 0.5, 0.5],
      [0.5, 0.5, -0.5],
    ],
    [
      [0.5, 0.5, -0.5],
      [-0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5],
    ],
    [
      [-0.5, -0.5, -0.5],
      [-0.5, -0.5, 0.5],
      [-0.5, 0.5, -0.5],
    ],
    [
      [-0.5, 0.5, -0.5],
      [-0.5, -0.5, 0.5],
      [-0.5, 0.5, 0.5],
    ],
    [
      [-0.5, -0.5, -0.5],
      [0.5, -0.5, -0.5],
      [-0.5, -0.5, 0.5],
    ],
    [
      [-0.5, -0.5, 0.5],
      [0.5, -0.5, -0.5],
      [0.5, -0.5, 0.5],
    ],
    [
      [0.5, -0.5, -0.5],
      [0.5, 0.5, -0.5],
      [0.5, -0.5, 0.5],
    ],
    [
      [0.5, -0.5, 0.5],
      [0.5, 0.5, -0.5],
      [0.5, 0.5, 0.5],
    ],
    [
      [-0.5, -0.5, 0.5],
      [0.5, -0.5, 0.5],
      [-0.5, 0.5, 0.5],
    ],
    [
      [-0.5, 0.5, 0.5],
      [0.5, -0.5, 0.5],
      [0.5, 0.5, 0.5],
    ],
  ]);
});