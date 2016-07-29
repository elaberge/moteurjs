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
        const transform = owner.components.transform;
        const halfHeight = transform.height / 2;
        const playerTransform = player.components.transform;
        const playerHalfHeight = playerTransform.height / 2;

        dX *= -1;

        if ((transform.y - halfHeight > playerTransform.y + playerHalfHeight) ||
          (transform.y + halfHeight < playerTransform.y - playerHalfHeight)) {
          transform.x = defaultX;
          transform.y = defaultY;
          other.components['pong/player'].score();
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
          defaultX = owner.components.transform.x;
          defaultY = owner.components.transform.y;
          return Promise.resolve();
        },

        update: function(dT) {
          const canvasTransform = sceneManager.findObject('canvas').components.transform;
          const transform = owner.components.transform;
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

          if (transform.x - halfWidth < player1.components.transform.x + player1.components.transform.width / 2) {
            checkCollision(player1, player2);
          }
          if (transform.x + halfWidth > player2.components.transform.x - player2.components.transform.width / 2) {
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
