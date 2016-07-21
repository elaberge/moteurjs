define(() => {
  'use strict';

  return {
    create: function(sceneManager, owner, descr) {
      const name = descr;
      const nameComp = {};

      Object.defineProperty(nameComp, 'owner', {
        enumerable: true,
        value: owner,
      });

      Object.defineProperty(nameComp, 'name', {
        enumerable: true,
        value: name,
      });

      return Promise.resolve(nameComp);
    },
  };
});
