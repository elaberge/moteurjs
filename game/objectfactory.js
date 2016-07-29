define(['componentfactory'], (ComponentFactory) => {
  'use strict';

  return function(sceneManager) {
    if (!sceneManager) {
      throw new Error('sceneManager ne peut être vide!');
    }

    const componentFactory = new ComponentFactory(sceneManager);

    let i = 0;

    this.create = function(descr) {
      const components = [];
      const newObj = {
        components: {}
      };
      let objName = '(Object ' + (i++) + ')';

      function addComponent(compName) {
        const compDescr = descr[compName];
        if (compName === 'name') {
          objName = compDescr;
          return;
        }

        const p = componentFactory.create(newObj, compName, compDescr)
          .then((comp) => {
            newObj.components[compName] = comp;
          });
        components.push(p);
      }

      Object.keys(descr).forEach(addComponent);

      Object.defineProperty(newObj, 'name', {
        enumerable: true,
        get: () => {
          return objName;
        },
      });

      return Promise.all(components)
        .then(() => {
          return newObj;
        });
    };
  };
});
