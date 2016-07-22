define(() => {
  'use strict';

  return {
    create: function(sceneManager, owner) {
      let speed = undefined;
      let upKey = undefined;
      let downKey = undefined;
      let scoreComp = undefined;
      let score = 0;

      const playerComp = {
        onLoad: function(descr) {
          speed = descr.speed || 1;
          upKey = descr.up;
          downKey = descr.down;

          return Promise.resolve();
        },

        onInit: function(descr) {
          scoreComp = sceneManager.findObject(descr.score).text2d;
          return Promise.resolve();
        },

        update: function(dT) {
          const canvasTransform = sceneManager.findObject('canvas').transform;
          const inputModule = sceneManager.modules.input.module;
          const transform = owner.transform;
          const halfHeight = transform.height / 2;

          let dY = 0;
          if (inputModule.isKeyDown(upKey)) {
            dY--;
          }
          if (inputModule.isKeyDown(downKey)) {
            dY++;
          }

          transform.y += dY * (dT / 1000) * speed;
          if (transform.y < halfHeight) {
            transform.y = halfHeight;
          }
          if (transform.y > canvasTransform.height - halfHeight) {
            transform.y = canvasTransform.height - halfHeight;
          }

          return Promise.resolve();
        },

        score: function() {
          score++;
          scoreComp.text = score;
        },
      };

      Object.defineProperty(playerComp, 'owner', {
        enumerable: true,
        value: owner
      });

      return Promise.resolve(playerComp);
    },
  };
});
