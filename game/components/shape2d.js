define(() => {
  'use strict';

  return {
    create: function(sceneManager, owner) {
      const ctxProperties = {
        fill: 'fillStyle',
        stroke: 'strokeStyle',
        lineWidth: 'lineWidth',
        lineDash: 'lineDash',
      };

      const commands = [];
      let path = undefined;

      const shapeComp = {
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

          if (descr.path) {
            path = new Path2D(descr.path);

            if (descr.fill) {
              commands.push((ctx) => {
                ctx.fill(path);
              });
            }
            if (descr.stroke) {
              commands.push((ctx) => {
                ctx.stroke(path);
              });
            }
          }
        },
        display: function(delta, context) {
          if (owner.components.transform) {
            context.translate(owner.components.transform.x, owner.components.transform.y);
          }
          commands.forEach((cmd) => {
            cmd(context);
          });
        },
      };

      Object.defineProperty(shapeComp, 'owner', {
        enumerable: true,
        value: owner,
      });

      return Promise.resolve(shapeComp);
    },
  };
});
