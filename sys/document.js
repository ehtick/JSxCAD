/* global globalThis */

// This is limited to node.
import { JSDOM } from 'jsdom';
import { onBoot } from './boot.js';

onBoot(() => {
  const dom = new JSDOM('<html><body></body></html>');
  globalThis.window = dom.window;
  globalThis.window.devicePixelRatio = 1;
  globalThis.document = window.document;
});
