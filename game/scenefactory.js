define(() => {
  'use strict';

  return function(sceneManager, objectFactory) {
    if (!sceneManager) {
      throw new Error('sceneManager ne peut être vide!');
    }

    this.append = function(descr) {
      let objects = [];

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
        if (!o.obj[fnName]) {
          return;
        }

        methodCalls.push(o.obj[fnName](o.descr));
      }
      const callLoad = callFn.bind(this, 'onLoad');
      const callInit = callFn.bind(this, 'onInit');

      function iterateObjects(fn) {
        let methodCalls = [];

        let callFn = fn.bind(this, methodCalls);
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
        .then(initAllObjects);
    };
  };
});
