define(['gameloop'], (GameLoop) => {
  'use strict';

  function requestAnimationFrame() {
    return new Promise((resolve) => {
      window.requestAnimationFrame(resolve);
    });
  }

  let loop = new GameLoop();

  function infiniteLoop(delta) {
    delta = delta || 0;
    return loop.iterate(delta)
      .then(requestAnimationFrame)
      .then(infiniteLoop);
  }

  loop.init([])
    .then(infiniteLoop)
    .catch((e) => {
      console.error(e);
      return loop.quit();
    });
});
