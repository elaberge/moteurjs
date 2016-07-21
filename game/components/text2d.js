define(() => {
  'use strict';

  return {
    create: function(sceneManager, owner) {
      const ctxProperties = {
        fill: 'fillStyle',
        stroke: 'strokeStyle',
        align: 'textAlign',
        baseline: 'textBaseline',
        font: 'font',
      };

      const commands = [];
      let text = undefined;

      const textComp = {
        onLoad: function(descr) {
          Object.keys(ctxProperties).forEach((name) => {
            const val = descr[name];
            const prop = ctxProperties[name];
            if (val) {
              commands.push((ctx) => {
                ctx[prop] = val;
              });
            }
          });

          text = descr.text || '';

          if (descr.fill) {
            commands.push((ctx) => {
              if (text.length > 0) {
                ctx.fillText(text, 0, 0);
              }
            });
          }
          if (descr.stroke) {
            commands.push((ctx) => {
              if (text.length > 0) {
                ctx.strokeText(text, 0, 0);
              }
            });
          }
        },
        display: function(delta, context) {
          if (owner.transform) {
            context.translate(owner.transform.x, owner.transform.y);
          }
          commands.forEach((cmd) => {
            cmd(context);
          });
        },
      };

      Object.defineProperty(textComp, 'owner', {
        enumerable: true,
        value: owner,
      });

      return Promise.resolve(textComp);
    },
  };
});
