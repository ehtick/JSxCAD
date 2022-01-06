import { getCgal } from './getCgal.js';
import { toCgalTransformFromJsTransform } from './transform.js';

export const extrudeToPlaneOfSurfaceMesh = (
  mesh,
  transform,
  highX,
  highY,
  highZ,
  highPlaneX,
  highPlaneY,
  highPlaneZ,
  highPlaneW,
  lowX,
  lowY,
  lowZ,
  lowPlaneX,
  lowPlaneY,
  lowPlaneZ,
  lowPlaneW
) => {
  try {
    return getCgal().ExtrusionToPlaneOfSurfaceMesh(
      mesh,
      toCgalTransformFromJsTransform(transform),
      highX,
      highY,
      highZ,
      highPlaneX,
      highPlaneY,
      highPlaneZ,
      highPlaneW,
      lowX,
      lowY,
      lowZ,
      lowPlaneX,
      lowPlaneY,
      lowPlaneZ,
      lowPlaneW
    );
  } catch (error) {
    throw Error(error);
  }
};
