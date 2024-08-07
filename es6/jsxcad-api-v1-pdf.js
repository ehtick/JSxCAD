import { Shape, ensurePages } from './jsxcad-api-shape.js';
import { getSourceLocation, generateUniqueId, write, emit } from './jsxcad-sys.js';
import { hash } from './jsxcad-geometry.js';
import { toPdf } from './jsxcad-convert-pdf.js';

function pad (hash, len) {
  while (hash.length < len) {
    hash = '0' + hash;
  }
  return hash;
}

function fold (hash, text) {
  var i;
  var chr;
  var len;
  if (text.length === 0) {
    return hash;
  }
  for (i = 0, len = text.length; i < len; i++) {
    chr = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash < 0 ? hash * -2 : hash;
}

function foldObject (hash, o, seen) {
  return Object.keys(o).sort().reduce(foldKey, hash);
  function foldKey (hash, key) {
    return foldValue(hash, o[key], key, seen);
  }
}

function foldValue (input, value, key, seen) {
  var hash = fold(fold(fold(input, key), toString(value)), typeof value);
  if (value === null) {
    return fold(hash, 'null');
  }
  if (value === undefined) {
    return fold(hash, 'undefined');
  }
  if (typeof value === 'object' || typeof value === 'function') {
    if (seen.indexOf(value) !== -1) {
      return fold(hash, '[Circular]' + key);
    }
    seen.push(value);

    var objHash = foldObject(hash, value, seen);

    if (!('valueOf' in value) || typeof value.valueOf !== 'function') {
      return objHash;
    }

    try {
      return fold(objHash, String(value.valueOf()))
    } catch (err) {
      return fold(objHash, '[valueOf exception]' + (err.stack || err.message))
    }
  }
  return fold(hash, value.toString());
}

function toString (o) {
  return Object.prototype.toString.call(o);
}

function sum (o) {
  return pad(foldValue(0, o, '', []).toString(16), 8);
}

var hashSum = sum;

const preparePdf = async (shape, name, op = (s) => s, options = {}) => {
  const { path } = getSourceLocation();
  let index = 0;
  const records = [];
  for (const entry of await ensurePages(await op(shape))) {
    const pdfPath = `download/pdf/${path}/${generateUniqueId()}`;
    await write(pdfPath, await toPdf(entry, options));
    const filename = `${name}_${index++}.pdf`;
    const record = {
      path: pdfPath,
      filename,
      type: 'application/pdf',
    };
    records.push(record);
    const hash$1 = hashSum({ filename, options }) + hash(entry);
    await Shape.fromGeometry(entry).gridView(filename, options.view);
    emit({ download: { entries: [record] }, hash: hash$1 });
  }
  return records;
};

const pdf = Shape.registerMethod('pdf', (...args) => async (shape) => {
  const { value: name, func: op, object: options } = Shape.destructure(args);
  await preparePdf(shape, name, op, options);
  return shape;
});

export { pdf };
