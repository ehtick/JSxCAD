export const taggedSketch = ({ tags = [], matrix, provenance }, ...content) => {
  if (content.some((value) => value === undefined)) {
    throw Error(`Undefined Sketch content`);
  }
  if (content.length !== 1) {
    throw Error(`Sketch expects a single content geometry`);
  }
  return { type: 'sketch', tags, matrix, provenance, content };
};
