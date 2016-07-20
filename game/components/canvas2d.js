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

        render: function(delta) {
          commands.forEach((cmd) => {
            cmd();
          });

          function displayRecursive() {
            let p = Promise.resolve();
            Object.keys(this).forEach((compName) => {
              const comp = this[compName];
              if (comp.display) {
                p = p.then(() => {
                    ctx.save();
                    return comp.display(delta, ctx);
                  })
                  .then(() => {
                    ctx.restore();
                  });
              }
            });

            if (this.children) {
              this.children.children.forEach((c) => {
                p = p.then(() => {
                  return displayRecursive.apply(c);
                });
              });
            }
            return p;
          }

          return displayRecursive.apply(owner);
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
