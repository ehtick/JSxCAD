import { toTagsFromName, toThreejsMaterialFromTags } from './material.js';

import test from 'ava';

test('Default works.', (t) => {
  t.deepEqual(toTagsFromName('glass'), ['material:glass']);
});

test('Glass.', (t) => {
  t.deepEqual(toThreejsMaterialFromTags(['material:glass']), {
    metalness: 0,
    opacity: 0.5,
    transparent: true,
    depthWrite: false,
  });
});
