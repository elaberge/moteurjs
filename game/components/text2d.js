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
              const asString = String(text);
              if (asString.length > 0) {
                ctx.fillText(asString, 0, 0);
              }
            });
          }
          if (descr.stroke) {
            commands.push((ctx) => {
              const asString = String(text);
              if (asString.length > 0) {
                ctx.strokeText(asString, 0, 0);
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

      Object.defineProperty(textComp, 'text', {
        enumerable: true,
        get: function() {
          return text;
        },
        set: function(val) {
          text = val;
        },
      });

      return Promise.resolve(textComp);
    },
  };
});
