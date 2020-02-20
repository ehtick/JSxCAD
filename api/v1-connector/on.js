import Shape from '@jsxcad/api-v1-shape';

export const on = (above, below, op = _ => _) => above.bottom().from(below.top().op(op));
const onMethod = function (below, op) { return on(this, below, op); };

Shape.prototype.on = onMethod;