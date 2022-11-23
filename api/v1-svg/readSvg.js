import { Shape } from '@jsxcad/api-shape';
import { fromSvg } from '@jsxcad/convert-svg';
import { read } from '@jsxcad/sys';

export const Svg = Shape.registerShapeMethod('Svg', async (path, { fill = true, stroke = true } = {}) => {
  const data = await read(`source/${path}`, { sources: [path] });
  if (data === undefined) {
    throw Error(`Cannot read svg from ${path}`);
  }
  return Shape.fromGeometry(
    await fromSvg(data, { doFill: fill, doStroke: stroke })
  );
});

export default Svg;
