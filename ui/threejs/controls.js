// import * as dat from 'dat.gui';

import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';

export const buildTrackballControls = ({
  camera,
  render,
  viewerElement,
  view = {},
}) => {
  const { target = [0, 0, 0] } = view;
  const trackball = new TrackballControls(camera, viewerElement);
  trackball.keys = [65, 83, 68];
  // trackball.addEventListener('change', render);
  trackball.target.set(...target);
  trackball.update();
  trackball.zoomSpeed = 2.5;
  trackball.panSpeed = 1.25;
  trackball.rotateSpeed = 2.5;
  trackball.staticMoving = true;
  return { trackball };
};

/*
export const buildGui = ({ viewerElement }) => {
  const gui = new dat.GUI({ autoPlace: false, closed: true });
  gui.domElement.style = 'padding: 5px; z-index: 3';
  viewerElement.appendChild(gui.domElement);

  return { gui };
};

export const buildGuiControls = ({ datasets, gui }) => {
  let count = 0;
  const controllers = {};
  for (const dataset of datasets) {
    if (dataset.name === undefined) {
      continue;
    }
    let controller = controllers[dataset.name];
    if (controller === undefined) {
      const ui = gui.add({ visible: true }, 'visible').name(`${dataset.name}`);
      count += 1;
      controller = { ui, datasets: [] };
      controllers[dataset.name] = controller;
      controller.ui.listen().onChange((value) =>
        controller.datasets.forEach((dataset) => {
          dataset.mesh.visible = value;
        })
      );
    }
    controller.datasets.push(dataset);
    dataset.controller = controller;
  }

  return count;
};
*/
