import { readFileSync } from 'fs';
import { test } from 'ava';
import { toStla } from './toStla';

const box1Solid =
  [
    [[[-5, -5, -5], [-5, -5, 5], [-5, 5, 5], [-5, 5, -5]]],
    [[[5, -5, -5], [5, 5, -5], [5, 5, 5], [5, -5, 5]]],
    [[[-5, -5, -5], [5, -5, -5], [5, -5, 5], [-5, -5, 5]]],
    [[[-5, 5, -5], [-5, 5, 5], [5, 5, 5], [5, 5, -5]]],
    [[[-5, -5, -5], [-5, 5, -5], [5, 5, -5], [5, -5, -5]]],
    [[[-5, -5, 5], [5, -5, 5], [5, 5, 5], [-5, 5, 5]]]
  ];

test('Correctly render a box', async t => {
  t.is(await toStla({}, { solid: box1Solid }), readFileSync('toStla.test.box.stl', { encoding: 'utf8' }));
});