define(['componentfactory'], (ComponentFactory) => {
  'use strict';

  return function(sceneManager) {
    if (!sceneManager) {
      throw new Error('sceneManager ne peut être vide!');
    }

    const componentFactory = new ComponentFactory(sceneManager);

    let i = 0;

    function findParentByFilter(filter, recursive = false) {
      const parentComp = this.components.parent;
      if (!parentComp) {
        return null;
      }

      const parent = parentComp.parent;
      const found = filter(parent);
      if (found !== undefined) {
        return found;
      }

      if (recursive) {
        return parent.findParentByFilter(filter, recursive);
      }

      return null;
    }

    function findParentComponent(compName, recursive = false) {
      function filter(obj) {
        return obj.components[compName];
      }

      return this.findParentByFilter(filter, recursive);
    }

    this.create = function(descr) {
      const components = [];
      const newObj = {
        components: {},
        findParentByFilter: findParentByFilter,
        findParentComponent: findParentComponent,
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
