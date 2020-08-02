import {
  add,
  equals,
  normalize,
  rotateZ,
  scale,
  subtract,
} from '@jsxcad/math-vec3';
import { createOpenPath, getEdges, isClosed } from '@jsxcad/geometry-path';
import {
  fromPoints as fromPointsToLine,
  intersect as intersectLines,
} from '@jsxcad/math-line2';

import { getNonVoidPaths } from '@jsxcad/geometry-tagged';

const X = 0;
const Y = 1;
const Z = 2;
const RIGHT_ANGLE = Math.PI / -2;

const isFinite = Number.isFinite;
const intersect = (a, b, z) => [...intersectLines(a, b), z];

const makeToolLine = (start, end, diameter) => {
  const direction = normalize(subtract(end, start));
  // The tool (with given diameter) passes along the outside of the path.
  const toolEdgeOffset = scale(diameter / 2, rotateZ(direction, RIGHT_ANGLE));
  // And in order to get sharp angles with a circular tool we need to cut a bit further.
  const toolStart = add(start, toolEdgeOffset);
  const toolEnd = add(end, toolEdgeOffset);
  const toolLine = fromPointsToLine(toolStart, toolEnd);
  return [toolStart, toolEnd, toolLine];
};

// FIX: We assume a constant Z here.
export const toolpathEdges = (
  path,
  diameter = 1,
  overcut = true,
  solid = false
) => {
  const toolpaths = [];
  let toolpath;
  let lastToolLine;
  const edges = getEdges(path).filter(([start, end]) => !equals(start, end));
  for (const [start, end] of edges) {
    const [toolStart, toolEnd, thisToolLine] = makeToolLine(
      start,
      end,
      diameter
    );
    if (!toolpath) {
      toolpath = createOpenPath();
      toolpaths.push(toolpath);
    }
    if (overcut) {
      if (lastToolLine) {
        // Move (back) to the intersection point from the overcut.
        const intersection = intersect(thisToolLine, lastToolLine, start[Z]);
        if (isFinite(intersection[X]) && isFinite(intersection[Y])) {
          toolpath.push(intersection);
        }
      }
      toolpath.push(toolStart, toolEnd);
    } else {
      if (lastToolLine) {
        // Replace the previous point with the intersection.
        const intersection = intersect(thisToolLine, lastToolLine, start[Z]);
        if (isFinite(intersection[X]) && isFinite(intersection[Y])) {
          toolpath[toolpath.length - 1] = intersection;
        }
        toolpath.push(toolEnd);
      } else {
        toolpath.push(toolStart, toolEnd);
      }
    }
    lastToolLine = thisToolLine;
  }
  if (isClosed(path) && !overcut) {
    // Rewrite the start and end to meet at their intersection.
    const [start, end] = edges[0];
    const [, , thisToolLine] = makeToolLine(start, end, diameter);
    const intersection = intersect(thisToolLine, lastToolLine, start[Z]);
    if (isFinite(intersection[X]) && isFinite(intersection[Y])) {
      toolpath.shift();
      toolpath[0] = intersection;
      toolpath[toolpath.length - 1] = intersection;
    }
  }
  return toolpaths;
};

export const toolpath = (
  geometry,
  diameter = 1,
  overcut = true,
  solid = false
) => {
  const toolpaths = [];
  for (const { paths } of getNonVoidPaths(geometry)) {
    for (const path of paths) {
      toolpaths.push(...toolpathEdges(path, diameter, overcut, solid));
    }
  }
  return toolpaths;
};