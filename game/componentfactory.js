define(['utils'], (utils) => {
  'use strict';

  return function(sceneManager, componentRoot) {
    if (!sceneManager) {
      throw new Error('sceneManager ne peut être vide!');
    }
    componentRoot = componentRoot || 'components';

    this.create = function(owner, name, descr) {
      return utils.require([componentRoot + '/' + name])
        .then((comp) => {
          return comp.create(sceneManager, owner, descr);
        });
    };
  };
});
