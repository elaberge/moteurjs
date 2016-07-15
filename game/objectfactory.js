define(['componentfactory'], (ComponentFactory) => {
  'use strict';

  return function(componentFactory) {
    componentFactory = componentFactory || new ComponentFactory();

    this.create = function(descr) {
      let components = [];
      let newObj = {};

      function addComponent(compName) {
        let compDescr = descr[compName];
        let p = componentFactory.create(compName, compDescr)
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
