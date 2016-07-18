define(['require'], (require) => {
  'use strict';

  function requirePromise(args) {
    return new Promise((resolve, reject) => {
      require(args, resolve, reject);
    });
  }

  return {
    require: requirePromise,
  };
});
