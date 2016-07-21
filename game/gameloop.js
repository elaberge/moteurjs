define(() => {
  'use strict';

  return function() {
    let modules = [];
    let moduleMap = {};

    function updateModuleMap() {
      moduleMap = {};
      modules.forEach((mod, i) => {
        if (mod.name) {
          moduleMap[mod.name] = {
            module: mod,
            rank: i
          };
        }
      });
    }

    function runOnModules(fnName, ...args) {
      args.push(moduleMap);

      const moduleCalls = [];
      modules.forEach((m) => {
        if (m[fnName]) {
          moduleCalls.push(m[fnName].apply(m, args));
        }
      });
      return Promise.all(moduleCalls);
    }

    function runSequence(fnNames) {
      if (fnNames.length === 0) {
        return Promise.resolve();
      }

      const fn = fnNames.shift();
      const nextCall = runSequence.bind(this, fnNames);

      return runOnModules(fn)
        .then(nextCall);
    }

    this.init = function(mod) {
      modules = mod;
      updateModuleMap();
      return runSequence(['load', 'init']);
    };

    this.iterate = function(delta) {
      return runOnModules('update', delta);
    };

    this.quit = function() {
      const clear = () => {
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
