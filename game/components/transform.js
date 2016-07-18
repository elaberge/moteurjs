define(() => {
  'use strict';

  return {
    create: function(sceneManager, owner) {
      let transform = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };

      const transformMembers = Object.keys(transform);

      let transformComp = {
        onLoad: function(descr) {
          transformMembers.forEach((k) => {
            transform[k] = descr[k] || transform[k];
          });
          return Promise.resolve();
        },
      };

      transformMembers.forEach((k) => {
        Object.defineProperty(transformComp, k, {
          enumerable: true,
          get: function() {
            return transform[k];
          },
        });
      });

      Object.defineProperty(transformComp, 'owner', {
        enumerable: true,
        value: owner
      });

      return Promise.resolve(transformComp);
    },
  };
});
