import { computeToolpath as computeToolpathWithCgal } from '@jsxcad/algorithm-cgal';
import { isNotTypeGhost } from './tagged/type.js';
import { linearize } from './tagged/linearize.js';
import { taggedGroup } from './tagged/taggedGroup.js';

const filter = (geometry) =>
  ['graph'].includes(geometry.type) && isNotTypeGhost(geometry);

export const computeToolpath = (
  geometry,
  material,
  resolution,
  toolSize,
  toolCutDepth,
  annealingMax,
  annealingMin,
  annealingDecay,
  { simple = false } = {}
) => {
  const inputs = [];
  linearize(geometry, filter, inputs);
  const materialStart = inputs.length;
  linearize(material, filter, inputs);
  const outputs = computeToolpathWithCgal(
    inputs,
    materialStart,
    resolution,
    toolSize,
    toolCutDepth,
    annealingMax,
    annealingMin,
    annealingDecay,
    simple
  );
  return taggedGroup({}, ...outputs);
};
