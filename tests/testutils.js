define(['chai'], (chai) => {
  'use strict';

  function delayPromise(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  function callLog(target, log) {
    let handler = {
      get: (target, property) => {
        let result = target[property];
        if (typeof result === 'function') {
          return function(...args) {
            log.push({
              t: 'call',
              p: property,
              a: args,
            });
            return result.apply(target, args);
          };
        }
        return result;
      },
      set: (target, property, value) => {
        log.push({
          t: 'set',
          p: property,
          v: value,
        });
        try {
          target[property] = value;
          return true;
        } catch (e) {
          return false;
        }
      },
      deleteProperty: (target, property) => {
        log.push({
          t: 'delete',
          p: property,
        });
        try {
          delete target[property];
          return true;
        } catch (e) {
          return false;
        }
      },
    };

    return new Proxy(target, handler);
  }

  return {
    expect: chai.expect,
    delayPromise: delayPromise,
    callLog: callLog,
  };
});
