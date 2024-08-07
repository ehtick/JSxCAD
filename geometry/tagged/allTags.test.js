import { allTags } from './allTags.js';
import test from 'ava';

test('Extract tags', (t) => {
  const tags = allTags({
    type: 'assembly',
    tags: ['a'],
    content: [
      { type: 'solid', solid: [], tags: ['b'] },
      {
        type: 'group',
        content: [
          { type: 'surface', surface: [], tags: ['c', 'd'] },
          { type: 'paths', paths: [], tags: ['a', 'c'] },
        ],
      },
    ],
  });
  t.deepEqual([...tags].sort(), ['a', 'b', 'c', 'd']);
});
