import { assertCoplanar } from '@jsxcad/geometry-surface';
import { build } from './build';
import { create } from './create';

const copyBsp = ({ plane, surfaces, front, back }) => {
  const copy = {};
  if (plane !== undefined) {
    copy.plane = plane;
  }
  if (surfaces !== undefined) {
    copy.surfaces = surfaces.slice();
  }
  if (front !== undefined) {
    copy.front = copyBsp(front);
  }
  if (back !== undefined) {
    copy.back = copyBsp(back);
  }
  return copy;
};

export const fromSurfaces = (options = {}, surfaces) => {
  if (surfaces.bsp === undefined) {
    for (const surface of surfaces) {
      assertCoplanar(surface);
    }
    const bsp = create();
    // Build is destructive.
    build(bsp, surfaces.map(surface => surface.slice()));
    surfaces.bsp = bsp;
  }
  // FIX: See if we can make the operations non-destructive so that we do not need to copy the cached tree.
  return copyBsp(surfaces.bsp);
};