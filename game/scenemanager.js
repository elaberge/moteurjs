define(['scenefactory'], (SceneFactory) => {
  'use strict';

  return function(sceneFactory) {
    sceneFactory = sceneFactory || new SceneFactory(this);

    let sceneObjects = {};
    let nameMap = {};
    let nextObjId = 1;

    this.update = function(delta) {
      let updateCalls = [];

      function updateComp(obj, compName) {
        const comp = obj[compName];
        if (comp && comp.update) {
          updateCalls.push(comp.update(delta));
        }
      }

      function updateObj(objId) {
        const obj = sceneObjects[objId];
        const updateObjComp = updateComp.bind(this, obj);
        Object.keys(obj).forEach(updateObjComp);
      }

      Object.keys(sceneObjects).forEach(updateObj);

      return Promise.all(updateCalls);
    };

    this.loadScene = function(descr) {
      let append = this.appendScene.bind(this, descr);
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
      const nameComp = obj.name;
      if (nameComp) {
        nameMap[nameComp.name] = nameMap[nameComp.name] || new Set();
        nameMap[nameComp.name].add(id);
      }
      return id;
    };

    this.findObjects = function(name) {
      let match = [];

      const entries = nameMap[name];
      if (!entries) {
        return [];
      }

      for (let id of entries) {
        const obj = sceneObjects[id];
        if (obj) {
          match.push(obj);
        } else {
          entries.delete(id);
        }
      }

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
  };
});
