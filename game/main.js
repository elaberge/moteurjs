define(
  ['module', 'utils', 'gameloop', 'scenemanager', 'inputmanager', 'renderer'],
  (module, utils, GameLoop, SceneManager, InputManager, Renderer) => {
    'use strict';

    function requestAnimationFrame() {
      return new Promise((resolve) => {
        window.requestAnimationFrame(resolve);
      });
    }

    const baseScene = module.config().baseScene;
    const loop = new GameLoop();
    const sceneManager = new SceneManager();
    const inputManager = new InputManager(sceneManager);
    const renderer = new Renderer(sceneManager);

    let lastTime = 0;

    function infiniteLoop(time = 0) {
      const delta = time - lastTime;
      lastTime = time;
      return loop.iterate(delta)
        .then(requestAnimationFrame)
        .then(infiniteLoop);
    }

    loop.init([inputManager, sceneManager, renderer])
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
