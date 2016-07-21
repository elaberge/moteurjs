define(() => {
  'use strict';

  return function(sceneManager, inputEmitter = document) {
    if (!sceneManager) {
      throw new Error('sceneManager ne peut être vide!');
    }

    const keyDown = {};
    const keyUpdate = [];

    inputEmitter.addEventListener('keydown', (evt) => {
      keyDown[evt.code] = true;
      keyUpdate.push({
        code: evt.code,
        key: evt.key,
        type: 'down'
      });
    }, false);

    inputEmitter.addEventListener('keyup', (evt) => {
      keyDown[evt.code] = false;
      keyUpdate.push({
        code: evt.code,
        key: evt.key,
        type: 'up'
      });
    }, false);

    this.isKeyDown = function(code) {
      return keyDown[code] || false;
    };

    this.update = function() {
      if (keyUpdate.length === 0) {
        return Promise.resolve();
      }

      const sceneObjects = sceneManager.objects;
      const keyCalls = [];

      function updateCompKeys(obj, compName) {
        const comp = obj[compName];
        if (!comp) {
          return;
        }
        if (comp.onKeyDown) {
          keyUpdate.forEach((evt) => {
            if (evt.type === 'down') {
              keyCalls.push(comp.onKeyDown(evt.key, evt.code));
            }
          });
        }
        if (comp.onKeyUp) {
          keyUpdate.forEach((evt) => {
            if (evt.type === 'up') {
              keyCalls.push(comp.onKeyUp(evt.key, evt.code));
            }
          });
        }
      }

      function updateObjKeys(objId) {
        const obj = sceneObjects[objId];
        const updateObjCompKeys = updateCompKeys.bind(this, obj);
        Object.keys(obj).forEach(updateObjCompKeys);
      }

      Object.keys(sceneObjects).forEach(updateObjKeys);
      keyUpdate.length = 0;

      return Promise.all(keyCalls);
    };

    Object.defineProperty(this, 'name', {
      enumerable: true,
      value: 'input',
    });
  };
});
