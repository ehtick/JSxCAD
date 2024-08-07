import { STATUS_OK, STATUS_ZERO_THICKNESS } from './status.js';
import { fromCgalGeometry, withCgalGeometry } from './cgalGeometry.js';

import { ErrorZeroThickness } from './error.js';

export const approximate = (inputs, faceCount = 0, minErrorDrop = 0) =>
  withCgalGeometry('approximate', inputs, (cgalGeometry, g) => {
    console.log(`QQ/approximate: ${typeof faceCount} ${typeof minErrorDrop}`);
    const status = g.Approximate(
      cgalGeometry,
      Number(faceCount),
      Number(minErrorDrop)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by approximate');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs);
      default:
        throw new Error(`Unexpected status ${status} in approximate`);
    }
  });
