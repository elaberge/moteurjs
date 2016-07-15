define(['require'], (require) => {
  'use strict';

  return function() {
    this.create = function(name, descr) {
      return new Promise((resolve, reject) => {
        require([name], (comp) => {
          resolve(comp.create(descr));
        }, reject);
      });
    };
  };
});
