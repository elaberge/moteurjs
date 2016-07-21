define(['utils'], (utils) => {
  'use strict';

  return function(sceneManager, componentRoot = 'components') {
    if (!sceneManager) {
      throw new Error('sceneManager ne peut être vide!');
    }

    this.create = function(owner, name, descr) {
      return utils.require([componentRoot + '/' + name])
        .then((comp) => {
          return comp.create(sceneManager, owner, descr);
        });
    };
  };
});
