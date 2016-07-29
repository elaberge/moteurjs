define(['require', 'components/parent'], (require, ParentComponent) => {
  'use strict';

  return {
    create: function(sceneManager, owner) {
      // Dépendance circulaire possible
      ParentComponent = ParentComponent || require('components/parent');

      const children = new Set();

      const childrenComp = {
        add: function(child) {
          if (typeof child === 'string') {
            child = sceneManager.findObject(child);
          }
          if (children.has(child)) {
            return Promise.resolve();
          }

          if (!child) {
            return Promise.reject(new Error('Impossible de trouver l\'enfant'));
          }

          if (child.components.parent && child.components.parent.parent && child.components.parent.parent !== owner) {
            return Promise.reject(new Error('Parent already set'));
          }

          let p = Promise.resolve();

          if (!child.components.parent) {
            const createParent = ParentComponent.create.bind(ParentComponent, sceneManager, child);
            p = p.then(createParent)
              .then((comp) => {
                child.components.parent = comp;
              });
          }
          p = p.then(() => {
            return child.components.parent.onLoad(owner);
          });

          children.add(child);
          return p;
        },

        onLoad: function(descr = []) {
          const childrenSetup = [];
          descr.forEach((name) => {
            childrenSetup.push(this.add(name));
          });

          Object.defineProperty(childrenComp, 'children', {
            enumerable: true,
            get: () => {
              return Array.from(children);
            },
          });

          return Promise.all(childrenSetup);
        },
      };

      Object.defineProperty(childrenComp, 'owner', {
        enumerable: true,
        value: owner
      });

      return Promise.resolve(childrenComp);
    },
  };
});
