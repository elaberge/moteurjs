define(
  ['module', 'utils', 'gameloop', 'scenemanager', 'renderer'],
  (module, utils, GameLoop, SceneManager, Renderer) => {
    'use strict';

    function requestAnimationFrame() {
      return new Promise((resolve) => {
        window.requestAnimationFrame(resolve);
      });
    }

    let baseScene = module.config().baseScene;
    let loop = new GameLoop();
    let sceneManager = new SceneManager();
    let renderer = new Renderer(sceneManager);

    function infiniteLoop(delta) {
      delta = delta || 0;
      return loop.iterate(delta)
        .then(requestAnimationFrame)
        .then(infiniteLoop);
    }

    loop.init([sceneManager, renderer])
      .then(() => {
        return utils.require(['json!' + baseScene]);
      })
      .then((descr) => {
        return sceneManager.loadScene(descr);
      })
      .then(infiniteLoop)
      .catch((e) => {
        console.error(e);
        return loop.quit();
      });
  });
