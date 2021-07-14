import * as fs from 'fs';
import * as v8 from 'v8';

import {
  getBase,
  getFilesystem,
  qualifyPath,
  setupFilesystem,
} from './filesystem.js';
import { isBrowser, isNode, isWebWorker } from './browserOrNode.js';

import { db } from './db.js';
import { dirname } from 'path';
import { getFile } from './files.js';
import { info } from './emit.js';
import { touch } from './touch.js';

const { promises } = fs;
const { serialize } = v8;

// FIX Convert data by representation.

export const writeFile = async (options, path, data) => {
  data = await data;

  const {
    doSerialize = true,
    ephemeral,
    workspace = getFilesystem(),
  } = options;
  let originalWorkspace = getFilesystem();
  if (workspace !== originalWorkspace) {
    info(`Write ${path} of ${workspace}`);
    // Switch to the source filesystem, if necessary.
    setupFilesystem({ fileBase: workspace });
  }

  info(`Write ${path}`);
  const file = await getFile(options, path);
  file.data = data;

  for (const watcher of file.watchers) {
    await watcher(options, file);
  }

  const base = getBase();
  if (!ephemeral && base !== undefined) {
    const persistentPath = qualifyPath(path);
    if (isNode) {
      try {
        await promises.mkdir(dirname(persistentPath), { recursive: true });
      } catch (error) {
        throw error;
      }
      try {
        if (doSerialize) {
          data = serialize(data);
        }
        await promises.writeFile(persistentPath, data);
      } catch (error) {
        throw error;
      }
    } else if (isBrowser || isWebWorker) {
      await db().setItem(persistentPath, data);
    }
    // Let everyone know the file has changed.
    await touch(persistentPath, { workspace, clear: false });
  }

  if (workspace !== originalWorkspace) {
    // Switch back to the original filesystem, if necessary.
    setupFilesystem({ fileBase: originalWorkspace });
  }

  return true;
};

export const write = async (path, data, options = {}) => {
  if (typeof data === 'function') {
    // Always fail to write functions.
    return undefined;
  }
  return writeFile(options, path, data);
};
