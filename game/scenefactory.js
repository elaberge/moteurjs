define(['objectfactory'], (ObjectFactory) => {
  'use strict';

  return function(sceneManager, objectFactory = new ObjectFactory(sceneManager)) {
    if (!sceneManager) {
      throw new Error('sceneManager ne peut être vide!');
    }

    this.append = function(descr) {
      const objects = [];

      function queueObjects() {
        descr.forEach((d) => {
          objects.push({
            descr: d
          });
        });
      }

      function createObject(methodCalls, o) {
        methodCalls.push(objectFactory.create(o.descr)
          .then((newObj) => {
            o.obj = newObj;
          }));
      }

      function registerObjects() {
        objects.forEach((o) => {
          sceneManager.addObject(o.obj);
        });
      }

      function callFn(fnName, methodCalls, o) {
        Object.keys(o.obj.components).forEach((compName) => {
          const comp = o.obj.components[compName];
          if (!comp || !comp[fnName]) {
            return;
          }

          methodCalls.push(comp[fnName](o.descr[compName]));
        });
      }
      const callLoad = callFn.bind(this, 'onLoad');
      const callInit = callFn.bind(this, 'onInit');

      function iterateObjects(fn) {
        const methodCalls = [];

        const callFn = fn.bind(this, methodCalls);
        objects.forEach(callFn);
        return Promise.all(methodCalls);
      }

      const createAllObjects = iterateObjects.bind(this, createObject);
      const loadAllObjects = iterateObjects.bind(this, callLoad);
      const initAllObjects = iterateObjects.bind(this, callInit);

      queueObjects();
      return createAllObjects()
        .then(registerObjects)
        .then(loadAllObjects)
        .then(initAllObjects)
        .then(() => {});
    };
  };
});
