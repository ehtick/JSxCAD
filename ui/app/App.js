/* global */

import * as PropTypes from 'prop-types';

import {
  appendViewGroupCode,
  deleteViewGroupCode,
  extractViewGroupCode,
  rewriteViewGroupOrient,
} from '@jsxcad/compiler';

import {
  askService,
  ask as askSys,
  boot,
  clearCacheDb,
  clearEmitted,
  deleteFile,
  getActiveServices,
  listFiles,
  log,
  logInfo,
  read,
  resolvePending,
  terminateActiveServices,
  touch,
  watchFileCreation,
  watchFileDeletion,
  watchLog,
  watchServices,
  write,
} from '@jsxcad/sys';

import { getNotebookControlData, toDomElement } from '@jsxcad/ui-notebook';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import FlexLayout from 'flexlayout-react';
import Form from 'react-bootstrap/Form';
import JsEditorUi from './JsEditorUi.js';
import ListGroup from 'react-bootstrap/ListGroup';
import OrbitView from './OrbitView.js';
import Prettier from 'https://unpkg.com/prettier@2.3.2/esm/standalone.mjs';
import PrettierParserBabel from 'https://unpkg.com/prettier@2.3.2/esm/parser-babel.mjs';
import React from 'react';
import ReactDOM from 'react-dom';
import Row from 'react-bootstrap/Row';
import { animationFrame } from './schedule.js';
import { execute } from '@jsxcad/api';
import { getWorldPosition } from '@jsxcad/ui-threejs';

const ensureFile = async (file, url, { workspace } = {}) => {
  const sources = [];
  if (url !== undefined) {
    sources.push(url);
  }
  // Ensure the file exists.
  // TODO: Handle a transform from file to source so that things github can be used sensibly.
  const content = await read(`${file}`, { sources, workspace });
  if (content === undefined) {
    // If we couldn't find it, create it as an empty file.
    await write(`${file}`, '', { workspace });
  }
};

const isRegenerable = (file) =>
  file.startsWith('data/') ||
  file.startsWith('meta/') ||
  file.startsWith('view/') ||
  file.startsWith('download/');

const defaultModelConfig = {
  global: {
    rootOrientationVertical: true,
  },
  borders: [
    {
      type: 'border',
      location: 'left',
      weight: 50,
      children: [
        {
          id: 'Workspace',
          type: 'tab',
          name: 'Workspace',
          component: 'Workspace',
          enableClose: false,
          borderWidth: 512,
        },
        {
          id: 'View',
          type: 'tab',
          name: 'View',
          component: 'View',
          enableClose: false,
        },
        {
          id: 'Make',
          type: 'tab',
          name: 'Make',
          component: 'Make',
          enableClose: false,
        },
        {
          id: 'Share',
          type: 'tab',
          name: 'Share',
          component: 'Share',
          enableClose: false,
        },
        {
          id: 'Help',
          type: 'tab',
          name: 'Help',
          component: 'Help',
          enableClose: false,
        },
        {
          id: 'Log',
          type: 'tab',
          name: 'Log',
          component: 'Log',
          enableClose: false,
          borderWidth: 1024,
        },
        {
          id: 'Files',
          type: 'tab',
          name: 'Files',
          component: 'Files',
          enableClose: false,
          borderWidth: 1024,
        },
      ],
    },
  ],
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        id: 'Notebooks',
        type: 'tabset',
        weight: 100,
        enableDeleteWhenEmpty: false,
        children: [],
      },
      {
        id: 'Clipboards',
        type: 'tabset',
        weight: 100,
        enableDeleteWhenEmpty: false,
        children: [
          {
            id: 'Clipboard',
            type: 'tab',
            name: 'Clipboard',
            component: 'Clipboard',
            enableClose: false,
            borderWidth: 1024,
          },
        ],
      },
    ],
  },
};

class App extends React.Component {
  static get propTypes() {
    return {
      workspace: PropTypes.string,
      sha: PropTypes.string,
    };
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    const { sha, workspace } = this.props;

    this.agent = async ({ ask, message, type }) => {
      const {
        op,
        entry,
        id,
        identifier,
        notes,
        options,
        path,
        paths,
        sourceLocation,
      } = message;
      switch (op) {
        case 'geometry/disjoint': {
          // Build up a set of parallel operations.
          const ops = [];
          if (paths.length < 2) {
            return paths;
          }
          for (let nth = 0; nth < paths.length - 1; nth++) {
            ops.push(
              this.ask({
                op: 'geometry/difference',
                paths: paths.slice(nth),
                workspace,
              })
            );
          }
          const disjointPaths = [paths[paths.length - 1]];
          for (const op of ops) {
            disjointPaths.push(await op);
          }
          return disjointPaths;
        }

        case 'sys/touch':
          await touch(path, { workspace, id, clear: true, broadcast: true });
          return;
        case 'ask':
          return askSys(identifier, options);
        case 'deleteFile':
          return deleteFile(options, path);
        case 'log':
          return log(entry);
        case 'notes':
          {
            const { id, path } = sourceLocation;
            const NotebookTextKey = `NotebookText/${path}`;

            if (this.state[NotebookTextKey] === undefined) {
              // These notes are for an unloaded module.
            }

            const NotebookAdvice = this.Notebook.ensureAdvice(path);
            const { domElementByHash, notebookNotes, notebookDefinitions } =
              NotebookAdvice;

            const ensureNotebookNote = (note) => {
              if (!notebookNotes[note.hash]) {
                notebookNotes[note.hash] = note;
              }
              return notebookNotes[note.hash];
            };

            const domElement = document.createElement('div');
            // Attach the domElement invisibly so that we can compute the size.
            // Add it at the top so that it doesn't extend the bottom of the page.
            document.body.prepend(domElement);
            domElement.style.display = 'block';
            domElement.style.visibility = 'hidden';
            domElement.style.position = 'absolute';

            let nthView = 0;
            for (const note of notes) {
              if (note.hash === undefined) {
                continue;
              }
              const entry = ensureNotebookNote(note);
              if (entry.view) {
                nthView += 1;
                if (entry.sourceLocation) {
                  entry.sourceLocation.nthView = nthView;
                }
                const { orbitView } = NotebookAdvice;
                entry.openView = false;
                if (orbitView) {
                  if (
                    orbitView.sourceLocation.id === id &&
                    orbitView.sourceLocation.nthView === nthView
                  ) {
                    entry.openView = true;
                  }
                }
              }
              if (domElementByHash.has(entry.hash)) {
                // Reuse the element we built earlier
                console.log(`Re-appending ${entry.hash} to ${path}/${id}`);
                domElement.appendChild(domElementByHash.get(entry.hash));
              } else {
                // We need to build the element.
                if (entry.view && !entry.url) {
                  const { path, view } = entry;
                  const { width, height } = view;
                  const canvas = document.createElement('canvas');
                  canvas.width = width;
                  canvas.height = height;
                  const offscreenCanvas = canvas.transferControlToOffscreen();
                  const render = async () => {
                    try {
                      console.log(`Ask render for ${path}/${id}`);
                      const url = await this.ask(
                        {
                          op: 'app/staticView',
                          path,
                          workspace,
                          view,
                          offscreenCanvas,
                        },
                        { path },
                        [offscreenCanvas]
                      );
                      console.log(`Finished render for ${path}/${id}`);
                      const element = domElementByHash.get(entry.hash);
                      if (element && element.firstChild) {
                        element.firstChild.src = url;
                      }
                    } catch (error) {
                      if (error.message === 'Terminated') {
                        // Try again.
                        return render();
                      } else {
                        window.alert(error.stack);
                      }
                    }
                  };
                  // Render the image asynchronously -- it won't affect layout.
                  console.log(`Schedule render for ${path}/${id}`);
                  render();
                }

                const element = toDomElement([entry], {
                  onClickView: ({ path, view, workspace, sourceLocation }) =>
                    this.Notebook.clickView({
                      path,
                      view,
                      workspace,
                      sourceLocation,
                    }),
                  onClickMake: ({ path, workspace, sourceLocation }) =>
                    this.Notebook.clickMake({
                      path,
                      workspace,
                      sourceLocation,
                    }),
                  workspace,
                });
                domElementByHash.set(entry.hash, element);
                console.log(`Appending ${entry.hash} to ${path}/${id}`);
                domElement.appendChild(element);
                console.log(`Marking ${entry.hash} in ${path}/${id}`);
              }
            }

            await animationFrame();

            notebookDefinitions[id] = {
              notes,
              domElement,
            };

            if (NotebookAdvice.onUpdate) {
              await NotebookAdvice.onUpdate();
            }
          }
          return;
        case 'info':
          return;
        default:
          throw Error(`Unknown operation ${op}`);
      }
    };

    this.serviceSpec = {
      webWorker: `./webworker.js#${sha}`,
      agent: this.agent,
      workerType: 'module',
    };

    this.ask = async (question, context, transfer) =>
      askService(this.serviceSpec, question, transfer, context).answer;

    this.layoutRef = React.createRef();

    this.Clipboard = {};

    this.Clipboard.change = (data) => {
      const { Clipboard } = this.state;
      this.setState({ Clipboard: { ...Clipboard, code: data } });
    };

    this.Clipboard.run = () => {};

    this.Clipboard.save = () => {};

    this.Files = {};

    this.Files.deleteCachedFiles = async () => {
      const { workspace } = this.props;
      await clearCacheDb({ workspace });
      window.alert('Cached files deleted');
    };

    this.Files.deleteSourceFiles = async () => {
      const { workspace } = this.props;
      const { WorkspaceFiles } = this.state;
      const nonRegenerableFiles = WorkspaceFiles.filter(
        (file) => !isRegenerable(file)
      );
      for (const file of nonRegenerableFiles) {
        console.log(`QQ/Deleting: ${file}`);
        await deleteFile({ workspace }, file);
      }
    };

    this.Layout = {};

    this.Layout.action = (action) => {
      console.log(JSON.stringify(action));
      return action;
    };

    this.Layout.buildSpinners = (path) => {
      const pieces = ['<span>&nbsp;&nbsp;</span>'];
      const count = this.servicesActiveCounts[path];
      for (let nth = 0; nth < count; nth++) {
        pieces.push(
          '<span id="spinner" style={{display: "inline-block", width: "10px"}}/>'
        );
      }
      return pieces.join('');
    };

    this.Layout.updateSpinners = (path) => {
      const spinners = document.getElementById(`Spinners/Notebook/${path}`);
      if (spinners) {
        spinners.innerHTML = this.Layout.buildSpinners(path);
      }
    };

    this.Layout.renderTab = (tabNode, { buttons }) => {
      const id = tabNode.getId();
      if (id.startsWith('Notebook/')) {
        const path = id.substring(9);
        buttons.push(
          <span
            id={`Spinners/${id}`}
            dangerouslySetInnerHTML={this.Layout.buildSpinners(path)}
          />
        );
      }
    };

    this.Log = {};

    this.Log.clear = async () => {
      this.updateState({ LogMessages: [] });
    };

    this.Log.pendingMessages = [];

    this.Log.updating = false;

    this.Model = {};

    this.Model.change = async () => {
      if (this.Model.changing) {
        return;
      }
      try {
        this.Model.changing = true;
        await this.Model.store();
      } finally {
        this.Model.changing = false;
      }
    };

    this.Model.store = async (json) => {
      if (this.Model.saving) {
        return;
      }
      try {
        this.Model.saving = true;
        const { workspace } = this.props;
        const { model } = this.state;
        await write(
          'config/Model',
          { persistentModelConfig: json || model.toJson() },
          { workspace }
        );
      } finally {
        this.Model.saving = false;
      }
    };

    this.Model.reset = async () => {
      await this.Model.store(defaultModelConfig);
      await this.Model.restore();
    };

    this.Model.restore = async () => {
      const { persistentModelConfig = defaultModelConfig } =
        (await read('config/Model', { workspace })) || {};
      // Reconstruct WorkspaceOpenPaths from the layout, so they stay in sync.
      const WorkspaceOpenPaths = [];
      for (const tabset of persistentModelConfig.layout.children) {
        if (tabset.id !== 'Notebooks') {
          continue;
        }
        for (const { id } of tabset.children) {
          WorkspaceOpenPaths.push(id.substring(9));
        }
      }
      for (const path of WorkspaceOpenPaths) {
        await this.Notebook.load(path);
      }
      const model = FlexLayout.Model.fromJson(persistentModelConfig);
      await this.updateState({ model, WorkspaceOpenPaths });
      // Now that layout is in place, run the notebooks we just loaded.
      for (const path of WorkspaceOpenPaths) {
        await this.Notebook.run(path);
      }
    };

    this.Notebook = {};

    this.Notebook.clickView = async ({ path, view, sourceLocation }) => {
      const { model } = this.state;
      await this.updateState({ View: { path, view, sourceLocation } });
      // This is a bit of a hack, since selectTab toggles.
      model.getNodeById('View').getParent()._setSelected(-1);
      model.doAction(FlexLayout.Actions.selectTab('View'));
      this.View.store();
    };

    this.Notebook.clickMake = async ({ path, id, sourceLocation }) => {
      await this.updateState({ Make: { path, id, sourceLocation } });
    };

    this.Notebook.runStart = {};

    this.Notebook.run = async (path, options) => {
      logInfo('app/App', `Request notebook run ${path}`);
      // Note the time that this run started.
      // This can be used to note which assets are obsoleted by the completion of the run.
      this.Notebook.runStart[path] = new Date();

      const { sha, workspace } = this.props;
      const NotebookAdvice = this.Notebook.ensureAdvice(path);
      const NotebookPath = path;
      const topLevel = new Map();
      try {
        logInfo('app/App', `Run/1 ${path}`);
        await this.updateState({ NotebookState: 'running' });
        // Terminate any services running for this path, since we're going to restart evaluating it.
        await terminateActiveServices((context) => context.path === path);
        logInfo('app/App', `Run/2 ${path}`);
        // CHECK: Can we get rid of this?
        clearEmitted();
        logInfo('app/App', `Run/3 ${path}`);

        const NotebookText = await this.Notebook.save(path);
        logInfo('app/App', `Run/4 ${path}`);

        if (!NotebookPath.endsWith('.js') && !NotebookPath.endsWith('.nb')) {
          // We don't know how to run anything else.
          return;
        }
        logInfo('app/App', `Run/5 ${path}`);

        // FIX: This is a bit awkward.
        // The responsibility for updating the control values ought to be with what
        // renders the notebook.
        const notebookControlData = await getNotebookControlData();
        await write(`control/${NotebookPath}`, notebookControlData, {
          workspace,
        });
        logInfo('app/App', `Run/6 ${path}`);

        let script = NotebookText;
        const evaluate = async (script) => {
          try {
            logInfo('app/App', `Distribute eval for ${path}`);
            const result = await this.ask(
              {
                op: 'app/evaluate',
                script,
                workspace,
                path: NotebookPath,
                sha,
              },
              { path }
            );
            if (result) {
              return result;
            } else {
              // The error will have come back via a note.
              throw Error('Evaluation failed');
            }
          } catch (error) {
            throw error;
          }
        };
        const replay = async (script) => {
          try {
            logInfo('app/App', `Distribute eval for ${path}`);
            const result = await this.ask(
              {
                op: 'app/evaluate',
                script,
                workspace,
                path: NotebookPath,
                sha,
              },
              { path }
            );
            if (result) {
              return result;
            } else {
              // The error will have come back via a note.
              throw Error('Evaluation failed');
            }
          } catch (error) {
            throw error;
          }
        };
        NotebookAdvice.definitions = topLevel;
        logInfo('app/App', `Execute notebook run ${path}`);
        await execute(script, {
          evaluate,
          replay,
          path: NotebookPath,
          topLevel,
        });
        await resolvePending();
      } catch (error) {
        // Include any high level notebook errors in the output.
        window.alert(error.stack);
      } finally {
        await this.updateState({ NotebookState: 'idle' });
        logInfo('app/App', `Completed notebook run ${path}`);
      }
    };

    this.Notebook.load = async (path) => {
      const { workspace } = this.props;
      const notebookPath = path;
      const notebookFile = `source/${notebookPath}`;
      await ensureFile(notebookFile, notebookPath, { workspace });
      const data = await read(notebookFile, { workspace });
      const notebookText =
        typeof data === 'string' ? data : new TextDecoder('utf8').decode(data);

      this.Notebook.ensureAdvice(path);
      console.log(`QQ/Notebook.load/path: ${path}`);
      await this.updateState({ [`NotebookText/${path}`]: notebookText });

      // Let state propagate.
      await animationFrame();

      // Automatically run the notebook on load. The user can hit Stop.
      // await this.Notebook.run(path);
    };

    this.Notebook.save = async (path) => {
      logInfo('app/App/Notebook/save', `Saving Notebook ${path}`);
      const { workspace } = this.props;
      const { [`NotebookText/${path}`]: NotebookText } = this.state;
      const NotebookPath = path;
      const NotebookFile = `source/${NotebookPath}`;
      const getCleanText = (data) => {
        if (NotebookPath.endsWith('.js') || NotebookPath.endsWith('.nb')) {
          // Just make a best attempt to reformat.
          data = Prettier.format(NotebookText, {
            trailingComma: 'es5',
            singleQuote: true,
            parser: 'babel',
            plugins: [PrettierParserBabel],
          });
        }
        return data;
      };
      logInfo('app/App/Notebook/save', `Cleaning Notebook ${path}`);
      const cleanText = getCleanText(NotebookText);
      logInfo('app/App/Notebook/save', `Writing Notebook ${path}`);
      await write(NotebookFile, new TextEncoder('utf8').encode(cleanText), {
        workspace,
      });
      console.log(`QQ/Notebook.save/path: ${path} ${cleanText}`);
      logInfo('app/App/Notebook/save', `Updating state for Notebook ${path}`);
      await this.updateState({ [`NotebookText/${path}`]: cleanText });

      // Let state propagate.
      await animationFrame();

      logInfo('app/App/Notebook/save', `Saving complete for ${path}`);
      return cleanText;
    };

    this.Notebook.change = (path, data) => {
      console.log(`QQ/Notebook.change/path: ${path} ${data}`);
      this.setState({ [`NotebookText/${path}`]: data });
    };

    this.Notebook.clickLink = async (path, link) => {
      const { model } = this.state;
      await this.Workspace.loadWorkingPath(link);
      // This is a bit of a hack, since selectTab toggles.
      const nodeId = `Notebook/${link}`;
      model.getNodeById(nodeId).getParent()._setSelected(-1);
      model.doAction(FlexLayout.Actions.selectTab(nodeId));
      this.View.store();
    };

    this.Notebook.close = async (closedPath) => {
      const { WorkspaceOpenPaths = [] } = this.state;
      console.log(`QQ/Notebook.close/path: ${closedPath}`);
      await this.updateState({
        [`NotebookText/${closedPath}`]: undefined,
        [`NotebookAdvice/${closedPath}`]: undefined,
        WorkspaceOpenPaths: WorkspaceOpenPaths.filter(
          (path) => path !== closedPath
        ),
      });
      this.Workspace.store();
    };

    this.Notebook.ensureAdvice = (path) => {
      const key = `NotebookAdvice/${path}`;
      const existingAdvice = this.state[key];
      if (existingAdvice) {
        return existingAdvice;
      }
      const createdAdvice = {
        notebookNotes: {},
        notebookDefinitions: {},
        domElementByHash: new Map(),
      };
      this.setState({ [key]: createdAdvice });
      return createdAdvice;
    };

    this.View = {};

    this.View.pendingOperations = [];
    this.View.operationsScheduled = false;

    this.View.executeOperations = async () => {
      try {
        while (this.View.pendingOperations.length > 0) {
          const paths = new Set();
          // Run a complete update cycle.
          while (this.View.pendingOperations.length > 0) {
            const operations = this.View.pendingOperations;
            this.View.pendingOperations = [];
            for (const { path, operation } of operations) {
              await operation();
              if (path) {
                paths.add(path);
              }
            }
          }
          // We defer the rerun of the notebook to the user, but we save at this point.
          for (const path of paths) {
            await this.Notebook.save(path);
          }
          // See if we got more ops while while we were working.
        }
      } finally {
        this.View.operationsScheduled = false;
      }
    };

    this.View.scheduleOperation = ({ path, operation }) => {
      this.View.pendingOperations.push({ path, operation });
      if (this.View.operationsScheduled) {
        // We're already processing these.
        return;
      }
      // Start processing.
      this.View.operationsScheduled = true;
      this.View.executeOperations();
    };

    this.View.jogPendingUpdate = new Map();

    this.View.jog = async (update) => {
      const { object, path } = update;

      if (object) {
        this.View.jogPendingUpdate.set(object, update);
      }

      const operation = async () => {
        if (!this.View.jogPendingUpdate.has(object)) {
          // We already handled this jog.
          return;
        }
        const { sourceLocation, at, to, up } =
          this.View.jogPendingUpdate.get(object);
        const { viewId } = object.userData;
        this.View.jogPendingUpdate.delete(object);
        const request = {
          viewId,
          nth: object.parent.children.findIndex((value) => value === object),
          at: getWorldPosition(at, 0.01),
          to: getWorldPosition(to, 0.01),
          up: getWorldPosition(up, 0.01),
        };
        if (request.nth === undefined) {
          return;
        }
        console.log(JSON.stringify(request));
        const { path } = sourceLocation;
        const { [`NotebookText/${path}`]: NotebookText } = this.state;
        const newNotebookText = rewriteViewGroupOrient(NotebookText, request);
        console.log(`QQ/Notebook.jog/path: ${path} ${newNotebookText}`);
        await this.updateState({
          [`NotebookText/${path}`]: newNotebookText,
        });
      };

      this.View.scheduleOperation({ path, operation });
    };

    this.View.keydown = async ({
      deleteObject,
      event,
      object,
      sourceLocation,
      at,
      to,
      up,
      placeObject,
    }) => {
      switch (event.key) {
        case 'Backspace':
        case 'Delete': {
          if (deleteObject && object) {
            deleteObject(object);
          }
          const { path } = sourceLocation;
          const { viewId } = object.userData;
          const operation = async () => {
            const { [`NotebookText/${path}`]: NotebookText } = this.state;
            const newNotebookText = deleteViewGroupCode(NotebookText, {
              viewId,
              nth: object.parent.children.findIndex(
                (value) => value === object
              ),
            });
            console.log(`QQ/postDelete: ${newNotebookText}`);
            await this.updateState({
              [`NotebookText/${path}`]: newNotebookText,
            });
          };
          this.View.scheduleOperation({ path, operation });
          return false;
        }

        case 'c':
          if (!event.getModifierState('Control')) {
            break;
          }
        // fall through to Copy
        case 'Copy': {
          const { path } = sourceLocation;
          const operation = async () => {
            // We should have already extracted the source into userData.
            // Other operations may have made this introspection out of date.
            const { [`NotebookText/${path}`]: NotebookText } = this.state;
            const { viewId } = object.userData;
            const nth = object.parent.children.findIndex(
              (value) => value === object
            );
            const { code } = extractViewGroupCode(NotebookText, {
              viewId,
              nth,
            });
            await this.updateState({
              Clipboard: { path, code, viewId, nth, object },
            });
          };
          this.View.scheduleOperation({ path, operation });
          return false;
        }

        case 'x':
          if (!event.getModifierState('Control')) {
            break;
          }
        // fall through to Cut
        case 'Cut': {
          if (deleteObject && object) {
            deleteObject(object);
          }
          const { path } = sourceLocation;
          const { viewId } = object.userData;
          const operation = async () => {
            const { [`NotebookText/${path}`]: NotebookText } = this.state;
            const nth = object.parent.children.findIndex(
              (value) => value === object
            );
            const { code } = extractViewGroupCode(NotebookText, {
              viewId,
              nth,
            });
            const newNotebookText = deleteViewGroupCode(NotebookText, {
              viewId,
              nth,
            });
            console.log(`QQ/Notebook.cut/path: ${path} ${newNotebookText}`);
            await this.updateState({
              [`NotebookText/${path}`]: newNotebookText,
              Clipboard: { code, viewId, object },
            });
          };
          this.View.scheduleOperation({ path, operation });
          return false;
        }

        case 'v':
          if (!event.getModifierState('Control')) {
            break;
          }
        // fall through to Paste
        case 'Insert':
        case 'Paste': {
          const { path } = sourceLocation;
          const { Clipboard = {} } = this.state;
          const { code, viewId, object } = Clipboard;
          if (!code) {
            return;
          }
          if (placeObject && object) {
            placeObject(object, { at });
          }
          const request = {
            viewId,
            code,
            at: getWorldPosition(at, 0.01),
            to: getWorldPosition(to, 0.01),
            up: getWorldPosition(up, 0.01),
          };
          const operation = async () => {
            const { [`NotebookText/${path}`]: NotebookText } = this.state;
            const newNotebookText = appendViewGroupCode(NotebookText, request);
            await this.updateState({
              [`NotebookText/${path}`]: newNotebookText,
            });
          };
          this.View.scheduleOperation({ path, operation });
          return false;
        }
      }
    };

    this.View.move = async ({ path, position, up, target, zoom }) => {
      if (this.View.moving) {
        return;
      }
      try {
        this.View.moving = true;
        await this.View.trackballState.store(path, {
          position,
          up,
          target,
          zoom,
        });
      } finally {
        this.View.moving = false;
      }
    };

    this.View.state = { anchorObject: null, anchors: [] };

    this.View.store = async () => {
      const { workspace } = this.props;
      const { View } = this.state;
      await write('config/View', View, { workspace });
    };

    this.View.restore = async () => {
      const { workspace } = this.props;
      const View = await read('config/View', { workspace });
      await this.updateState({ View });
    };

    this.View.updateGeometry = async ({
      geometryPath,
      path,
      updateGeometry,
      workspace,
    }) => {
      const geometry = await read(geometryPath, { workspace });
      console.log(`QQ/update geometry`);
      await updateGeometry(geometry, {
        timestamp: this.Notebook.runStart[path],
      });
    };

    this.View.trackballState = {};

    this.View.trackballState.store = async (
      path,
      { position, up, target, zoom }
    ) => {
      if (this.View.saving) {
        return;
      }
      try {
        this.View.saving = true;
        const { workspace } = this.props;
        await write(
          `config/View/trackballState/${path}`,
          { position, up, target, zoom },
          { workspace }
        );
      } finally {
        this.View.saving = false;
      }
    };

    this.View.trackballState.load = async (path) => {
      const { workspace } = this.props;
      const { position, up, target, zoom } =
        (await read(`config/View/trackballState/${path}`, { workspace })) || {};
      return { position, up, target, zoom };
    };

    this.Workspace = {};

    this.Workspace.loadWorkingPath = async (path) => {
      const { WorkspaceOpenPaths = [] } = this.state;
      if (WorkspaceOpenPaths.includes(path)) {
        // FIX: Add indication?
        return;
      }
      await this.updateState({
        WorkspaceOpenPaths: [...WorkspaceOpenPaths, path],
      });
      await this.Notebook.load(path);
      this.layoutRef.current.addTabToTabSet('Notebooks', {
        id: `Notebook/${path}`,
        type: 'tab',
        name: path,
        component: 'Notebook',
      });
      await this.Workspace.store();
      await this.Notebook.run(path);
    };

    this.Workspace.openWorkingFile = async (file) => {
      const { WorkspaceOpenPaths = [] } = this.state;
      const path = file.substring(7);
      if (WorkspaceOpenPaths.includes(path)) {
        // FIX: Add indication?
        return;
      }
      await this.updateState({
        WorkspaceOpenPaths: [...WorkspaceOpenPaths, path],
      });
      await this.Notebook.load(path);
      this.layoutRef.current.addTabToTabSet('Notebooks', {
        id: `Notebook/${path}`,
        type: 'tab',
        name: path,
        component: 'Notebook',
      });
      await this.Workspace.store();
      await this.Notebook.run(path);
    };

    this.Workspace.store = async () => {
      if (this.Workspace.saving) {
        return;
      }
      try {
        this.Model.saving = true;
        const { workspace } = this.props;
        const { WorkspaceOpenPaths } = this.state;
        const config = {
          WorkspaceOpenPaths,
        };
        await write('config/Workspace', config, { workspace });
      } finally {
        this.Workspace.saving = false;
      }
    };

    this.Workspace.restore = async () => {
      // We restore these via Model.restore.
    };

    this.factory = (node) => {
      switch (node.getComponent()) {
        case 'Workspace': {
          const { WorkspaceFiles, WorkspaceOpenPaths = [] } = this.state;
          const isDisabled = (file) =>
            WorkspaceOpenPaths.includes(file.substring(7));
          const computeListItemVariant = (file) =>
            isDisabled(file) ? 'secondary' : 'primary';
          return (
            <div>
              <Card>
                <Card.Body>
                  <Card.Title>Load Working Path</Card.Title>
                  <Card.Text>
                    <Form>
                      <Row>
                        <Col>
                          <Form.Group controlId="WorkspaceLoadPathId">
                            <Form.Control placeholder="URL or Path" />
                          </Form.Group>
                        </Col>
                        <Col xs="auto">
                          <Button
                            variant="primary"
                            onClick={() => {
                              const pathControl = document.getElementById(
                                'WorkspaceLoadPathId'
                              );
                              const path = pathControl.value;
                              this.Workspace.loadWorkingPath(path);
                            }}
                          >
                            Add
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card>
                <Card.Body>
                  <Card.Title>Open Working Path</Card.Title>
                  <Card.Text>
                    <ListGroup>
                      {WorkspaceFiles.filter((file) =>
                        file.startsWith('source/')
                      ).map((file, index) => (
                        <ListGroup.Item
                          variant={computeListItemVariant(file)}
                          key={index}
                          action
                          disabled={isDisabled(file)}
                          active={false}
                          onClick={(event) => {
                            event.target.blur();
                            this.Workspace.openWorkingFile(file);
                          }}
                        >
                          {file.substring(7)}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Text>
                </Card.Body>
              </Card>
            </div>
          );
        }
        case 'Notebook': {
          const path = node.getName();
          const { [`NotebookText/${path}`]: NotebookText } = this.state;
          const NotebookAdvice = this.Notebook.ensureAdvice(path);
          return (
            <JsEditorUi
              onRun={() => this.Notebook.run(path)}
              onSave={() => this.Notebook.save(path)}
              onChange={(data) => this.Notebook.change(path, data)}
              onClickLink={(link) => this.Notebook.clickLink(path, link)}
              onClose={() => this.Notebook.close(path)}
              data={NotebookText}
              advice={NotebookAdvice}
            />
          );
        }
        case 'Clipboard': {
          const { Clipboard = {} } = this.state;
          const { code } = Clipboard;
          return (
            <JsEditorUi
              onRun={() => this.Clipboard.run()}
              onSave={() => this.Clipboard.save()}
              onChange={(data) => this.Clipboard.change(data)}
              data={code}
            />
          );
        }
        case 'View': {
          const { workspace } = this.props;
          const { View = {} } = this.state;
          const trackballState = this.View.trackballState.load(View.path);
          return (
            <OrbitView
              path={View.path}
              view={View.view}
              sourceLocation={View.sourceLocation}
              workspace={workspace}
              onJog={this.View.jog}
              onKeydown={this.View.keydown}
              onMove={this.View.move}
              onUpdateGeometry={this.View.updateGeometry}
              trackballState={trackballState}
            />
          );
        }
        case 'Files': {
          const { WorkspaceFiles } = this.state;
          return (
            <div>
              <Card>
                <Card.Body>
                  <Card.Title>Clear Cached Files</Card.Title>
                  <Card.Text>
                    <Button
                      variant="primary"
                      onClick={this.Files.deleteCachedFiles}
                    >
                      Delete Regeneable Files
                    </Button>
                  </Card.Text>
                </Card.Body>
                <Card.Body>
                  <Card.Title>Delete Source Files</Card.Title>
                  <Card.Text>
                    <Button
                      variant="primary"
                      onClick={this.Files.deleteSourceFiles}
                    >
                      Delete Source Files Forever
                    </Button>
                    <ListGroup>
                      {WorkspaceFiles.filter(
                        (file) => !isRegenerable(file)
                      ).map((file, index) => (
                        <ListGroup.Item key={index} disabled>
                          {file}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Text>
                </Card.Body>
                <Card.Body>
                  <Card.Title>Reset Layout</Card.Title>
                  <Card.Text>
                    <Button variant="primary" onClick={this.Model.reset}>
                      Reset
                    </Button>
                  </Card.Text>
                </Card.Body>
              </Card>
            </div>
          );
        }
        case 'Log': {
          const { LogMessages = [] } = this.state;
          return (
            <div>
              <Card>
                <Card.Body>
                  <Card.Title>Log Messages</Card.Title>
                  <Card.Text>
                    <Button variant="primary" onClick={this.Log.clear}>
                      Clear
                    </Button>
                    <ListGroup>
                      {LogMessages.map(({ type, source, text }, index) => (
                        <ListGroup.Item key={index} disabled>
                          {text}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Text>
                </Card.Body>
              </Card>
            </div>
          );
        }
      }
    };

    this.fileUpdater = async () => {
      await this.updateState({
        WorkspaceFiles: await listFiles({ workspace }),
      });
    };

    this.logUpdater = ({ type, source, text }) => {
      this.Log.pendingMessages.unshift({ type, source, text });
      if (this.Log.updating) {
        return;
      }
      const spool = async () => {
        try {
          while (this.Log.pendingMessages.length > 0) {
            const commit = this.Log.pendingMessages;
            this.Log.pendingMessages = [];
            const { LogMessages = [] } = this.state;
            await this.updateState({
              LogMessages: [...commit, ...LogMessages],
            });
          }
        } finally {
          this.Log.updating = false;
        }
      };
      this.Log.updating = true;
      spool();
    };

    this.servicesUpdater = () => {
      const { WorkspaceOpenPaths = [] } = this.state;
      const servicesActiveCounts = {};
      for (const path of WorkspaceOpenPaths) {
        servicesActiveCounts[path] = 0;
      }
      for (const { context } of getActiveServices()) {
        if (context && context.path) {
          servicesActiveCounts[context.path] += 1;
        }
      }
      this.servicesActiveCounts = servicesActiveCounts;
      console.log(`QQ/SAC: ${JSON.stringify(this.servicesActiveCounts)}`);
      for (const path of WorkspaceOpenPaths) {
        this.Layout.updateSpinners(path);
      }
    };

    this.creationWatcher = await watchFileCreation(this.fileUpdater);
    this.deletionWatcher = await watchFileDeletion(this.fileUpdater);
    this.logWatcher = watchLog(this.logUpdater);
    this.servicesWatcher = watchServices(this.servicesUpdater);

    window.onhashchange = ({ newURL }) => {
      const hash = new URL(newURL).hash.substring(1);
      const [workspace, path] = hash.split('@');
      console.log({ workspace, path });
      this.Notebook.clickLink(undefined, path);
    };

    this.servicesActiveCounts = {};

    await this.Workspace.restore();
    await this.View.restore();
    await this.Model.restore();
  }

  async updateState(state) {
    return new Promise((resolve, reject) => {
      this.setState(state, () => resolve());
    });
  }

  render() {
    const { model } = this.state;
    if (!model) {
      return;
    }
    return (
      <FlexLayout.Layout
        ref={this.layoutRef}
        model={model}
        factory={this.factory}
        onAction={this.Layout.action}
        onRenderTab={this.Layout.renderTab}
        onModelChange={this.Model.change}
      />
    );
  }
}

export const installUi = async ({ document, workspace, sha }) => {
  await boot();
  ReactDOM.render(
    <App sha={'master'} workspace={'JSxCAD'} />,
    document.getElementById('container')
  );
};