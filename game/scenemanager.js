define(['scenefactory'], (SceneFactory) => {
  'use strict';

  return function(sceneFactory) {
    sceneFactory = sceneFactory || new SceneFactory(this);

    let sceneObjects = {};
    let nameMap = {};
    let nextObjId = 1;

    this.load = function() {};

    this.init = function() {};

    this.update = function() {};

    this.destroy = function() {};

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
      if (obj.name) {
        nameMap[obj.name] = nameMap[obj.name] || new Set();
        nameMap[obj.name].add(id);
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
      value: 'sceneManager'
    });

    Object.defineProperty(this, 'objects', {
      enumerable: true,
      get: function() {
        return sceneObjects;
      },
    });
  };
});
