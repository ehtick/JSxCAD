import { fromPointsToAlphaShapeAsSurfaceMesh } from './fromPointsToAlphaShapeAsSurfaceMesh.js';
import { fromSurfaceMeshToGraph } from './fromSurfaceMeshToGraph.js';
import { initCgal } from './getCgal.js';
import test from 'ava';

test.beforeEach(async (t) => {
  await initCgal();
});

test('FromPointsToAlphaShapeAsSurfaceMesh', (t) => {
  const points = [
    [-0.5, -0.5, -0.5],
    [-0.5, 0.5, -0.5],
    [0.5, 0.5, -0.5],
    [0.5, -0.5, -0.5],
    [-0.5, 0.5, 0.5],
    [0.5, 0.5, 0.5],
    [-0.5, -0.5, 0.5],
    [0.5, -0.5, 0.5],
  ];

  const surfaceMesh = fromPointsToAlphaShapeAsSurfaceMesh(points, 1);
  t.true(surfaceMesh.is_valid(false));
  const graph = fromSurfaceMeshToGraph(surfaceMesh);
  t.deepEqual(JSON.parse(JSON.stringify(graph)), {
    edges: [
      { point: 1, next: 2, twin: 1, loop: 0 },
      null,
      { point: 2, next: 4, twin: 3, loop: 0 },
      null,
      { point: 0, next: 0, twin: 5, loop: 0 },
      null,
      { point: 4, next: 8, twin: 7, loop: 1 },
      null,
      { point: 5, next: 10, twin: 9, loop: 1 },
      null,
      { point: 3, next: 6, twin: 11, loop: 1 },
      null,
      { point: 7, next: 14, twin: 13, loop: 2 },
      null,
      { point: 8, next: 16, twin: 15, loop: 2 },
      null,
      { point: 6, next: 12, twin: 17, loop: 2 },
      null,
      { point: 10, next: 20, twin: 19, loop: 3 },
      null,
      { point: 11, next: 22, twin: 21, loop: 3 },
      null,
      { point: 9, next: 18, twin: 23, loop: 3 },
      null,
      { point: 13, next: 26, twin: 25, loop: 4 },
      null,
      { point: 14, next: 28, twin: 27, loop: 4 },
      null,
      { point: 12, next: 24, twin: 29, loop: 4 },
      null,
      { point: 16, next: 32, twin: 31, loop: 5 },
      null,
      { point: 17, next: 34, twin: 33, loop: 5 },
      null,
      { point: 15, next: 30, twin: 35, loop: 5 },
      null,
      { point: 19, next: 38, twin: 37, loop: 6 },
      null,
      { point: 20, next: 40, twin: 39, loop: 6 },
      null,
      { point: 18, next: 36, twin: 41, loop: 6 },
      null,
      { point: 22, next: 44, twin: 43, loop: 7 },
      null,
      { point: 23, next: 46, twin: 45, loop: 7 },
      null,
      { point: 21, next: 42, twin: 47, loop: 7 },
      null,
      { point: 25, next: 50, twin: 49, loop: 8 },
      null,
      { point: 26, next: 52, twin: 51, loop: 8 },
      null,
      { point: 24, next: 48, twin: 53, loop: 8 },
      null,
      { point: 28, next: 56, twin: 55, loop: 9 },
      null,
      { point: 29, next: 58, twin: 57, loop: 9 },
      null,
      { point: 27, next: 54, twin: 59, loop: 9 },
      null,
      { point: 31, next: 62, twin: 61, loop: 10 },
      null,
      { point: 32, next: 64, twin: 63, loop: 10 },
      null,
      { point: 30, next: 60, twin: 65, loop: 10 },
      null,
      { point: 34, next: 68, twin: 67, loop: 11 },
      null,
      { point: 35, next: 70, twin: 69, loop: 11 },
      null,
      { point: 33, next: 66, twin: 71, loop: 11 },
    ],
    faces: [
      { loop: 0, plane: [0, 1, 0, 0.5] },
      { loop: 1, plane: [0, 0, -1, 0.5] },
      { loop: 2, plane: [1, 0, 0, 0.5] },
      { loop: 3, plane: [0, -1, 0, 0.5] },
      { loop: 4, plane: [-1, 0, 0, 0.5] },
      { loop: 5, plane: [1, 0, 0, 0.5] },
      { loop: 6, plane: [-1, 0, 0, 0.5] },
      { loop: 7, plane: [0, 0, -1, 0.5] },
      { loop: 8, plane: [0, -1, 0, 0.5] },
      { loop: 9, plane: [0, 0, 1, 0.5] },
      { loop: 10, plane: [0, 1, 0, 0.5] },
      { loop: 11, plane: [0, 0, 1, 0.5] },
    ],
    loops: [
      { edge: 4, face: 0 },
      { edge: 10, face: 1 },
      { edge: 16, face: 2 },
      { edge: 22, face: 3 },
      { edge: 28, face: 4 },
      { edge: 34, face: 5 },
      { edge: 40, face: 6 },
      { edge: 46, face: 7 },
      { edge: 52, face: 8 },
      { edge: 58, face: 9 },
      { edge: 64, face: 10 },
      { edge: 70, face: 11 },
    ],
    points: [
      [-0.5, 0.5, -0.5],
      [-0.5, 0.5, 0.5],
      [0.5, 0.5, -0.5],
      [0.5, -0.5, -0.5],
      [-0.5, 0.5, -0.5],
      [0.5, 0.5, -0.5],
      [0.5, -0.5, 0.5],
      [0.5, -0.5, -0.5],
      [0.5, 0.5, -0.5],
      [-0.5, -0.5, 0.5],
      [0.5, -0.5, -0.5],
      [0.5, -0.5, 0.5],
      [-0.5, -0.5, 0.5],
      [-0.5, 0.5, -0.5],
      [-0.5, -0.5, -0.5],
      [0.5, 0.5, 0.5],
      [0.5, -0.5, 0.5],
      [0.5, 0.5, -0.5],
      [-0.5, 0.5, -0.5],
      [-0.5, -0.5, 0.5],
      [-0.5, 0.5, 0.5],
      [0.5, -0.5, -0.5],
      [-0.5, -0.5, -0.5],
      [-0.5, 0.5, -0.5],
      [-0.5, -0.5, -0.5],
      [0.5, -0.5, -0.5],
      [-0.5, -0.5, 0.5],
      [0.5, 0.5, 0.5],
      [-0.5, 0.5, 0.5],
      [0.5, -0.5, 0.5],
      [0.5, 0.5, -0.5],
      [-0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5],
      [0.5, -0.5, 0.5],
      [-0.5, 0.5, 0.5],
      [-0.5, -0.5, 0.5],
    ],
  });
});