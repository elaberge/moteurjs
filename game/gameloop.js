define(() => {
  'use strict';

  return function() {
    let modules = [];
    let moduleMap = {};

    function updateModuleMap() {
      moduleMap = {};
      for (let i = 0; i < modules.length; ++i) {
        let mod = modules[i];
        if (mod.name) {
          moduleMap[mod.name] = {
            module: mod,
            rank: i
          };
        }
      }
    }

    function runOnModules(fnName) {
      let moduleCalls = [];
      modules.forEach((m) => {
        if (m[fnName]) {
          moduleCalls.push(m[fnName](moduleMap));
        }
      });
      return Promise.all(moduleCalls);
    }

    function runSequence(fnNames) {
      if (fnNames.length == 0) {
        return Promise.resolve();
      }

      let fn = fnNames.shift();
      let nextCall = runSequence.bind(this, fnNames);

      return runOnModules(fn)
        .then(nextCall);
    }

    this.init = function(mod) {
      modules = mod;
      updateModuleMap();
      return runSequence(['load', 'init']);
    };

    this.iterate = function() {
      return runOnModules('update');
    };

    this.quit = function() {
      let clear = () => {
        modules = [];
        updateModuleMap();
      };

      return runOnModules('destroy')
        .then(clear)
        .catch((e) => {
          clear();
          throw e;
        });
    };

    Object.defineProperty(this, 'modules', {
      enumerable: true,
      get: function() {
        return moduleMap;
      },
    });
  };
});
