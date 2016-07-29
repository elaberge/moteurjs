define(['scenefactory'], (SceneFactory) => {
  'use strict';

  return function(deferredSceneFactory = false) {
    let sceneFactory = undefined;

    let sceneObjects = {};
    const nameMap = {};
    let nextObjId = 1;

    this.init = function(modules) {
      Object.defineProperty(this, 'modules', {
        enumerable: true,
        value: modules,
      });

      return Promise.resolve();
    };

    this.update = function(delta) {
      const updateCalls = [];

      function updateComp(obj, compName) {
        const comp = obj.components[compName];
        if (comp && comp.update) {
          updateCalls.push(comp.update(delta));
        }
      }

      function updateObj(objId) {
        const obj = sceneObjects[objId];
        const updateObjComp = updateComp.bind(this, obj);
        Object.keys(obj.components).forEach(updateObjComp);
      }

      Object.keys(sceneObjects).forEach(updateObj);

      return Promise.all(updateCalls);
    };

    this.loadScene = function(descr) {
      const append = this.appendScene.bind(this, descr);
      return this.unloadScene()
        .then(append);
    };

    this.unloadScene = function() {
      sceneObjects = {};
      return Promise.resolve();
    };

    this.appendScene = function(descr) {
      return sceneFactory.append(descr, this);
    };

    this.addObject = function(obj) {
      const id = nextObjId++;
      sceneObjects[id] = obj;
      const name = obj.name;
      nameMap[name] = nameMap[name] || new Set();
      nameMap[name].add(id);
      return id;
    };

    this.findObjects = function(name) {
      const match = [];

      const entries = nameMap[name];
      if (!entries) {
        return [];
      }

      entries.forEach((id) => {
        const obj = sceneObjects[id];
        if (obj) {
          match.push(obj);
        } else {
          entries.delete(id);
        }
      });

      return match;
    };

    this.findObject = function(name) {
      return this.findObjects(name)[0];
    };

    Object.defineProperty(this, 'name', {
      enumerable: true,
      value: 'sceneManager',
    });

    Object.defineProperty(this, 'objects', {
      enumerable: true,
      get: function() {
        return sceneObjects;
      },
    });

    // Pour les tests unitaires
    if (deferredSceneFactory) {
      Object.defineProperty(this, 'sceneFactory', {
        set: function(factory) {
          sceneFactory = factory;
        },
      });
    } else {
      sceneFactory = new SceneFactory(this);
    }
  };
});
