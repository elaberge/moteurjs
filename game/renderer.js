define(() => {
  'use strict';

  return function(sceneManager) {
    if (!sceneManager) {
      throw new Error('sceneManager ne peut être vide!');
    }

    this.update = function(delta) {
      let sceneObjects = sceneManager.objects;
      let renderCalls = [];

      function renderComp(obj, compName) {
        const comp = obj[compName];
        if (comp && comp.render) {
          renderCalls.push(comp.render(delta));
        }
      }

      function renderObj(objId) {
        const obj = sceneObjects[objId];
        const renderObjComp = renderComp.bind(this, obj);
        Object.keys(obj).forEach(renderObjComp);
      }

      Object.keys(sceneObjects).forEach(renderObj);

      return Promise.all(renderCalls);
    };

    Object.defineProperty(this, 'name', {
      enumerable: true,
      value: 'renderer',
    });
  };
});
