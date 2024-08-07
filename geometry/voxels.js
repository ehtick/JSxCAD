import { fromPolygonSoup } from './fromPolygonSoup.js';
import { linearize } from './tagged/linearize.js';
import { measureBoundingBox } from './measureBoundingBox.js';
import { withIsExteriorPoint } from '@jsxcad/algorithm-cgal';

const X = 0;
const Y = 1;
const Z = 2;

const floor = (value, resolution) =>
  Math.floor(value / resolution) * resolution;
const ceil = (value, resolution) => Math.ceil(value / resolution) * resolution;

export const floorPoint = ([x, y, z], resolution) => [
  floor(x, resolution),
  floor(y, resolution),
  floor(z, resolution),
];
export const ceilPoint = ([x, y, z], resolution) => [
  ceil(x, resolution),
  ceil(y, resolution),
  ceil(z, resolution),
];

export const toVoxelsFromGeometry = (geometry, resolution = 1) => {
  const offset = resolution / 2;
  const [boxMin, boxMax] = measureBoundingBox(geometry);
  const min = floorPoint(boxMin, resolution);
  const max = ceilPoint(boxMax, resolution);
  const polygons = [];
  withIsExteriorPoint(
    linearize(geometry, ({ type }) =>
      ['graph', 'polygonsWithHoles'].includes(type)
    ),
    (isExteriorPoint) => {
      const isInteriorPoint = (x, y, z) => !isExteriorPoint(x, y, z);
      for (let x = min[X] - offset; x <= max[X] + offset; x += resolution) {
        for (let y = min[Y] - offset; y <= max[Y] + offset; y += resolution) {
          for (let z = min[Z] - offset; z <= max[Z] + offset; z += resolution) {
            const state = isInteriorPoint(x, y, z);
            if (state !== isInteriorPoint(x + resolution, y, z)) {
              const face = [
                [x + offset, y - offset, z - offset],
                [x + offset, y + offset, z - offset],
                [x + offset, y + offset, z + offset],
                [x + offset, y - offset, z + offset],
              ];
              polygons.push({ points: state ? face : face.reverse() });
            }
            if (state !== isInteriorPoint(x, y + resolution, z)) {
              const face = [
                [x - offset, y + offset, z - offset],
                [x + offset, y + offset, z - offset],
                [x + offset, y + offset, z + offset],
                [x - offset, y + offset, z + offset],
              ];
              polygons.push({ points: state ? face.reverse() : face });
            }
            if (state !== isInteriorPoint(x, y, z + resolution)) {
              const face = [
                [x - offset, y - offset, z + offset],
                [x + offset, y - offset, z + offset],
                [x + offset, y + offset, z + offset],
                [x - offset, y + offset, z + offset],
              ];
              polygons.push({ points: state ? face : face.reverse() });
            }
          }
        }
      }
    }
  );
  return fromPolygonSoup(polygons);
};

export const toVoxelsFromCoordinates = (coordinates) => {
  const offset = 0.5;
  const index = new Set();
  const key = (x, y, z) => `${x},${y},${z}`;
  let max = [-Infinity, -Infinity, -Infinity];
  let min = [Infinity, Infinity, Infinity];
  for (const [x, y, z] of coordinates) {
    index.add(key(x, y, z));
    max[X] = Math.max(x + 1, max[X]);
    max[Y] = Math.max(y + 1, max[Y]);
    max[Z] = Math.max(z + 1, max[Z]);
    min[X] = Math.min(x - 1, min[X]);
    min[Y] = Math.min(y - 1, min[Y]);
    min[Z] = Math.min(z - 1, min[Z]);
  }
  const isInteriorPoint = (x, y, z) => index.has(key(x, y, z));
  const polygons = [];
  for (let x = min[X]; x <= max[X]; x++) {
    for (let y = min[Y]; y <= max[Y]; y++) {
      for (let z = min[Z]; z <= max[Z]; z++) {
        const state = isInteriorPoint(x, y, z);
        if (state !== isInteriorPoint(x + 1, y, z)) {
          const face = [
            [x + offset, y - offset, z - offset],
            [x + offset, y + offset, z - offset],
            [x + offset, y + offset, z + offset],
            [x + offset, y - offset, z + offset],
          ];
          polygons.push({ points: state ? face : face.reverse() });
        }
        if (state !== isInteriorPoint(x, y + 1, z)) {
          const face = [
            [x - offset, y + offset, z - offset],
            [x + offset, y + offset, z - offset],
            [x + offset, y + offset, z + offset],
            [x - offset, y + offset, z + offset],
          ];
          polygons.push({ points: state ? face.reverse() : face });
        }
        if (state !== isInteriorPoint(x, y, z + 1)) {
          const face = [
            [x - offset, y - offset, z + offset],
            [x + offset, y - offset, z + offset],
            [x + offset, y + offset, z + offset],
            [x - offset, y + offset, z + offset],
          ];
          polygons.push({ points: state ? face : face.reverse() });
        }
      }
    }
  }
  return fromPolygonSoup(polygons);
};
