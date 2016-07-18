define(() => {
  'use strict';

  return {
    create: function(sceneManager, owner) {
      let parent;

      let parentComp = {
        onLoad: function(descr) {
          parent = sceneManager.findObject(descr);

          Object.defineProperty(parentComp, 'parent', {
            enumerable: true,
            value: parent,
          });

          return Promise.resolve();
        },
      };

      Object.defineProperty(parentComp, 'owner', {
        enumerable: true,
        value: owner
      });

      return Promise.resolve(parentComp);
    },
  };
});
