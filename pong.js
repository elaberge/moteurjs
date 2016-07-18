(function() {
  'use strict';

  require.config({
    baseUrl: 'game',
    paths: {
      json: '../lib/require/json',
      text: '../lib/require/text',
    },
    config: {
      main: {
        baseScene: '../scenes/pong.json'
      }
    },
  });

  require(['main']);

})();
