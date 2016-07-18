define(['componentfactory'], (ComponentFactory) => {
  'use strict';

  return function(sceneManager, componentFactory) {
    if (!sceneManager) {
      throw new Error('sceneManager ne peut être vide!');
    }
    componentFactory = componentFactory || new ComponentFactory(sceneManager);

    this.create = function(descr) {
      let components = [];
      let newObj = {};

      function addComponent(compName) {
        let compDescr = descr[compName];
        let p = componentFactory.create(newObj, compName, compDescr)
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
