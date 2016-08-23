(function() {
  'use strict';

  require.config({
    baseUrl: '../game',
    paths: {
      json: '../lib/require/json',
      text: '../lib/require/text',
      'components/pong': '../pong',
    },
    config: {
      main: {
        baseScene: '../pong/pong.json'
      }
    },
    packages: ['components/pong']
  });

  require(['main']);

})();
