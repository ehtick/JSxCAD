import { STATUS_OK, STATUS_ZERO_THICKNESS } from './status.js';
import { fromCgalGeometry, withCgalGeometry } from './cgalGeometry.js';

import { ErrorZeroThickness } from './error.js';

export const demesh = (inputs) =>
  withCgalGeometry(inputs, (cgalGeometry, g) => {
    const status = g.Demesh(cgalGeometry);
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by demesh');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs);
      default:
        throw new Error(`Unexpected status ${status}`);
    }
  });