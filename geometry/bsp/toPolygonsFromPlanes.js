import { toPolygon as toPolygonFromPlane } from '@jsxcad/math-plane';

export const toPolygonsFromPlanes = (planes) => {
  const polygons = [];
  for (const plane of planes) {
    polygons.push(toPolygonFromPlane(plane));
  }
  return polygons;
};

export default toPolygonsFromPlanes;