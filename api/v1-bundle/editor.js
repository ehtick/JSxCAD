import { installCSS, installCSSLink } from './css';

import CodeMirror from 'codemirror/src/codemirror.js';

export const installEditorCSS = (display) => {
  installCSSLink(document, 'https://codemirror.net/lib/codemirror.css');
  installCSS(document, `.CodeMirror { border-top: 1px solid black; border-bottom: 1px solid black; font-family: Arial, monospace; font-size: 20px; height: 100% }`);
};

export const installEditor = ({ addPage, document, evaluator, initialScript, nextPage, lastPage }) => {
  let editor;

  // FIX: Need some visual indicator that the script is running.
  const runScript = async () => evaluator(editor.getDoc().getValue('\n'));

  const setupDocument = () => {
    editor = CodeMirror((domElement) => {
      domElement.id = 'editor';
      addPage({
        title: 'Source',
        content: '<div id="editor"></div>',
        contentOverflow: 'hidden',
        size: '1000 600',
        position: 'top-left',
        footerToolbar: `<button class="jsPanel-ftr-btn" id="runScript" style="padding: 5px; margin: 3 px;">Run Script</button>`,
        callback: (panel) => document.getElementById(`runScript`).addEventListener('click', runScript)
      });
      document.getElementById('editor').appendChild(domElement);
    },
                        {
                          autoRefresh: true,
                          mode: 'javascript',
                          theme: 'default',
                          fullScreen: true,
                          lineNumbers: true,
                          gutter: true,
                          lineWrapping: true,
                          extraKeys: { 'Shift-Enter': runScript },
                          value: (typeof initialScript === 'undefined') ? '' : initialScript
                        });
    document.addEventListener('keydown',
                              e => {
                                switch (e.keyCode) {
                                  case 34:
                                    // Page Down.
                                    nextPage();
                                    e.preventDefault();
                                    e.stopPropagation();
                                    break;
                                  case 33:
                                    // Page Up.
                                    lastPage();
                                    e.preventDefault();
                                    e.stopPropagation();
                                    break;
                                }
                              });
    lastPage();
  };
  setupDocument();
  return {};
};