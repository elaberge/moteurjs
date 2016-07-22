define(() => {
  'use strict';

  return {
    create: function(sceneManager, owner) {
      let defaultX = undefined;
      let defaultY = undefined;
      let speed = undefined;
      let player1 = undefined;
      let player2 = undefined;
      let dX = 1;
      let dY = 1;

      function checkCollision(player, other) {
        const transform = owner.transform;
        const halfHeight = transform.height / 2;
        const playerTransform = player.transform;
        const playerHalfHeight = playerTransform.height / 2;

        dX *= -1;

        if ((transform.y - halfHeight > playerTransform.y + playerHalfHeight) ||
          (transform.y + halfHeight < playerTransform.y - playerHalfHeight)) {
          transform.x = defaultX;
          transform.y = defaultY;
          other['pong/player'].score();
        }
      }

      const ballComp = {
        onLoad: function(descr) {
          speed = descr.speed || 1;
          return Promise.resolve();
        },

        onInit: function(descr) {
          player1 = sceneManager.findObject(descr.player1);
          player2 = sceneManager.findObject(descr.player2);
          defaultX = owner.transform.x;
          defaultY = owner.transform.y;
          return Promise.resolve();
        },

        update: function(dT) {
          const canvasTransform = sceneManager.findObject('canvas').transform;
          const transform = owner.transform;
          const halfHeight = transform.height / 2;
          const halfWidth = transform.width / 2;

          transform.x += dX * (dT / 1000) * speed;
          transform.y += dY * (dT / 1000) * speed;

          if (transform.y - halfHeight < 0) {
            transform.y = halfHeight;
            dY *= -1;
          }
          if (transform.y + halfHeight > canvasTransform.height) {
            transform.y = canvasTransform.height - halfHeight;
            dY *= -1;
          }

          if (transform.x - halfWidth < player1.transform.x + player1.transform.width / 2) {
            checkCollision(player1, player2);
          }
          if (transform.x + halfWidth > player2.transform.x - player2.transform.width / 2) {
            checkCollision(player2, player1);
          }

          return Promise.resolve();
        },
      };

      Object.defineProperty(ballComp, 'owner', {
        enumerable: true,
        value: owner
      });

      return Promise.resolve(ballComp);
    },
  };
});
