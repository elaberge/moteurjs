define(() => {
  'use strict';

  let CanvasComponent = {
    getHTMLElement: function(id) {
      return document.getElementById(id);
    },
    create: function(sceneManager, owner) {
      let target;
      let ctx;
      let commands = [];

      let canvasComp = {
        onLoad: function(descr) {
          target = CanvasComponent.getHTMLElement(descr.htmlTarget);
          if (!target) {
            return Promise.reject(new Error('Cible du canvas introuvable'));
          }
          ctx = target.getContext('2d');
          if (!ctx) {
            return Promise.reject(new Error('Contexte de rendu introuvable'));
          }

          if (descr.background) {
            const fillStyle = descr.background;
            commands.push(() => {
              ctx.fillStyle = fillStyle;
            });
            commands.push(() => {
              ctx.fillRect(0, 0, target.width, target.height);
            });
          }

          Object.defineProperty(canvasComp, 'context', {
            enumerable: true,
            value: ctx,
          });

          return Promise.resolve();
        },

        render: function() {
          commands.forEach((cmd) => {
            cmd();
          });
        },
      };

      Object.defineProperty(canvasComp, 'owner', {
        enumerable: true,
        value: owner,
      });

      return Promise.resolve(canvasComp);
    },
  };

  return CanvasComponent;
});
