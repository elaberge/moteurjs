define(['componentfactory'], (ComponentFactory) => {
  'use strict';

  return function(sceneManager, componentFactory = new ComponentFactory(sceneManager)) {
    if (!sceneManager) {
      throw new Error('sceneManager ne peut être vide!');
    }

    this.create = function(descr) {
      const components = [];
      const newObj = {};

      function addComponent(compName) {
        const compDescr = descr[compName];
        const p = componentFactory.create(newObj, compName, compDescr)
          .then((comp) => {
            newObj[compName] = comp;
          });
        components.push(p);
      }

      Object.keys(descr).forEach(addComponent);

      return Promise.all(components)
        .then(() => {
          return newObj;
        });
    };
  };
});
