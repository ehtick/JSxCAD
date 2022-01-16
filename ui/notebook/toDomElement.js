/* global Blob, alert, fetch */

import Base64ArrayBuffer from 'base64-arraybuffer';
import marked from 'marked';
import { orbitDisplay } from '@jsxcad/ui-threejs';
import { readOrWatch } from '@jsxcad/sys';
import saveAs from 'file-saver';

const downloadFile = async ({ filename, path, data, type, workspace }) => {
  if (path && !data) {
    data = await readOrWatch(path, { workspace });
  }
  const blob = new Blob([data], { type });
  saveAs(blob, filename);
};

const sendFile = async ({ event, filename, path, data, type, workspace }) => {
  if (path && !data) {
    data = await readOrWatch(path, { workspace });
  }
  const url = 'http://192.168.31.235:88/';
  try {
    const response = await fetch(url, {
      mode: 'cors',
      method: 'post',
      body: data,
    });
    if (response.ok) {
      alert('Print ok');
    } else {
      alert(`Print failed: ${response.status}`);
    }
  } catch (error) {
    alert(error);
  }
};

marked.use({
  renderer: {
    code(code, language) {
      if (language === 'mermaid') {
        return '<div class="mermaid">' + code + '</div>';
      } else {
        return '<pre><code>' + code + '</code></pre>';
      }
    },
  },
});

export const toDomElement = (
  notebook = [],
  {
    onClickView,
    onClickMake = sendFile,
    onClickDownload = downloadFile,
    workspace,
  } = {}
) => {
  const definitions = {};

  const showOrbitView = async ({ path, view, workspace }) => {
    if (!path) {
      return;
    }
    const data = await readOrWatch(path, { workspace });
    const { target, up, position, withAxes, withGrid } = view;
    const div = document.createElement('div');
    div.classList.add('note', 'orbitView');
    const containers = window.document.getElementsByClassName(
      'orbit-view-container'
    );
    const container =
      containers.length === 0 ? window.document.body : containers[0];
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(div, container.firstChild);
    await orbitDisplay(
      {
        view: { target, up, position },
        geometry: data,
        withAxes,
        withGrid,
        definitions,
      },
      div
    );
    const onKeyDown = async (event) => {
      if (
        event.key === 'Escape' ||
        event.key === 'Esc' ||
        event.keyCode === 27
      ) {
        container.removeEventListener('keydown', onKeyDown, true);
        container.removeChild(div);
      }
    };
    container.addEventListener('keydown', onKeyDown, true);
  };

  const container = document.createElement('div');
  container.classList.add('notebook');

  for (const note of notebook) {
    if (note.define) {
      // NOTE: This can have interesting effects if definitions are redefined incompatibly while rendering, since some operations are async and might occur out of order.
      let entry = definitions[note.define.tag];
      if (entry === undefined) {
        entry = {};
        definitions[note.define.tag] = entry;
      }
      Object.assign(entry, note.define.data);
    }
    if (note.view) {
      const { url, view, sourceLocation } = note;
      const { height, width } = view;
      const image = document.createElement('img');
      image.style.display = 'block';
      image.style.height = `${height}px`;
      image.style.width = `${width}px`;
      image.style.background =
        'url(https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif) no-repeat center;';
      image.classList.add('note', 'view');

      if (url) {
        image.src = url;
      }

      image.addEventListener('click', (event) => {
        if (onClickView) {
          onClickView({
            event,
            path: note.path,
            view: note.view,
            workspace,
            sourceLocation,
          });
        } else {
          showOrbitView({
            event,
            path: note.path,
            view: note.view,
            workspace,
            sourceLocation,
          });
        }
      });
      container.appendChild(image);
    }
    if (note.md) {
      const markup = document.createElement('div');
      // Use ''' and '' instead of ``` and `` to avoid escaping.
      // FIX: Do this in a more principled fashion.
      const data = note.md.replace(/'''/g, '```').replace(/''/g, '``');
      markup.classList.add('note', 'markdown');
      markup.innerHTML = marked(data);
      container.appendChild(markup);
    }
    if (note.log) {
      const entry = document.createElement('div');
      const text = document.createTextNode(note.log.text);
      entry.appendChild(text);
      entry.classList.add('note', 'log');
      container.appendChild(entry);
    }
    if (note.error) {
      const entry = document.createElement('div');
      const text = document.createTextNode(note.error.text);
      entry.appendChild(text);
      entry.classList.add('note', 'error');
      container.appendChild(entry);
    }
    if (note.download) {
      for (let { path, base64Data, data, filename, type } of note.download
        .entries) {
        if (base64Data) {
          data = Base64ArrayBuffer.decode(base64Data);
        }
        {
          const button = document.createElement('button');
          button.classList.add('note', 'download');
          const text = document.createTextNode(`Download "${filename}"`);
          button.appendChild(text);
          button.addEventListener('click', (event) =>
            onClickDownload({ event, filename, path, data, type, workspace })
          );
          container.appendChild(button);
        }
        if (filename.endsWith('gcode')) {
          const button = document.createElement('button');
          button.classList.add('note', 'print');
          const text = document.createTextNode(`Make "${filename}"`);
          button.appendChild(text);
          button.addEventListener('click', (event) =>
            onClickMake({ event, filename, path, data, type, workspace })
          );
          container.appendChild(button);
        }
      }
    }
    if (note.control) {
      const div = document.createElement('div');
      const { type, label, value, options } = note.control;
      switch (type) {
        case 'input': {
          const input = document.createElement('input');
          input.classList.add('note', 'control', 'input', 'box');
          input.name = label;
          input.value = value;
          div.appendChild(input);
          break;
        }
        case 'check': {
          const input = document.createElement('input');
          input.classList.add('note', 'control', 'input', 'checkbox');
          input.name = label;
          input.type = 'checkbox';
          input.checked = value;
          div.appendChild(input);
          break;
        }
        case 'select': {
          const input = document.createElement('select');
          input.classList.add('note', 'control', 'input', 'checkbox');
          input.name = label;
          input.value = value;
          for (const optionValue of options.options || []) {
            const option = document.createElement('option');
            option.value = optionValue;
            if (optionValue === value) {
              option.selected = true;
            }
            option.innerText = optionValue;
            input.appendChild(option);
          }
          div.appendChild(input);
          break;
        }
        case 'slider': {
          const { min = 0, max = 100, step = 1 } = options;
          const output = document.createElement('span');
          output.innerText = value;
          div.appendChild(output);
          const input = document.createElement('input');
          input.classList.add('note', 'control', 'input', 'slider');
          input.name = label;
          input.type = 'range';
          input.min = min;
          input.max = max;
          input.step = step;
          input.value = value;
          div.appendChild(input);
          input.addEventListener('change', () => {
            output.innerText = input.value;
          });
          input.addEventListener('input', () => {
            output.innerText = input.value;
          });
          break;
        }
      }
      const labelNode = document.createElement('label');
      labelNode.htmlFor = label;
      labelNode.appendChild(document.createTextNode(label));
      div.appendChild(labelNode);
      container.appendChild(div);
    }
  }
  return container;
};

export const getNotebookControlData = async () => {
  const data = {};
  const notebooks = document.getElementsByClassName('notebook');
  for (let nthNotebook = 0; nthNotebook < notebooks.length; nthNotebook++) {
    const notebook = notebooks[nthNotebook];
    const inputs = notebook.getElementsByClassName('note control input');
    for (let nthInput = 0; nthInput < inputs.length; nthInput++) {
      const input = inputs[nthInput];
      const label = input.name;
      if (input.type === 'checkbox') {
        data[label] = input.checked;
      } else {
        data[label] = input.value;
      }
    }
  }
  return data;
};
