import { getCgal } from './getCgal.js';
import { toCgalTransformFromJsTransform } from './transform.js';

export const loftBetweenCongruentSurfaceMeshes = (
  closed = false,
  ...entries
) => {
  try {
    const mesh = getCgal().LoftBetweenCongruentSurfaceMeshes(closed, (fill) => {
      if (entries.length > 0) {
        const [mesh, transform] = entries.shift();
        fill.set_mesh(mesh);
        fill.set_transform(toCgalTransformFromJsTransform(transform));
        return true;
      } else {
        return false;
      }
    });
    mesh.provenance = 'loft';
    return mesh;
  } catch (error) {
    throw Error(error);
  }
};
