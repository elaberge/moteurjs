(function() {
  'use strict';

  require.config({
    baseUrl: '../game',
    paths: {
      tests: '../../tests',
      mocha: '../lib/mocha/mocha',
      chai: '../lib/mocha/chai',
    },
    shim: {
      mocha: {
        init: function() {
          this.mocha.setup('bdd');
          return this.mocha;
        }
      }
    }
  });

  require(['mocha', 'tests/all'], (mocha) => {
    mocha.run();
  });
})();
