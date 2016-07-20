define(['require', 'components/children'], (require, ChildrenComponent) => {
  'use strict';

  return {
    create: function(sceneManager, owner) {
      // Dépendance circulaire possible
      ChildrenComponent = ChildrenComponent || require('components/children');

      let parent;

      let parentComp = {
        onLoad: function(descr) {
          if (typeof descr === 'string') {
            descr = sceneManager.findObject(descr);
          }
          parent = descr;

          let p = Promise.resolve();

          if (parent) {
            if (!parent.children) {
              const createChildren = ChildrenComponent.create.bind(ChildrenComponent, sceneManager, parent);
              p = p.then(createChildren)
                .then((comp) => {
                  parent.children = comp;
                  return comp.onLoad();
                });
            }
            p = p.then(() => {
              return parent.children.add(owner);
            });
          }

          Object.defineProperty(parentComp, 'parent', {
            enumerable: true,
            value: parent,
          });

          return p;
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
