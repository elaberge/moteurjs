define(
  ['module', 'utils', 'gameloop', 'scenemanager', 'renderer'],
  (module, utils, GameLoop, SceneManager, Renderer) => {
    'use strict';

    function requestAnimationFrame() {
      return new Promise((resolve) => {
        window.requestAnimationFrame(resolve);
      });
    }

    const baseScene = module.config().baseScene;
    const loop = new GameLoop();
    const sceneManager = new SceneManager();
    const renderer = new Renderer(sceneManager);

    function infiniteLoop(delta = 0) {
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
