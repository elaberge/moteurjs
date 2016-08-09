define(() => {
  'use strict';

  const AudioContext = window.AudioContext || window.webkitAudioContext;

  return {
    create: function(sceneManager, owner) {
      const context = new AudioContext();

      const audioListenerComp = {

      };

      Object.defineProperty(audioListenerComp, 'owner', {
        enumerable: true,
        value: owner
      });

      Object.defineProperty(audioListenerComp, 'audioContext', {
        enumerable: true,
        value: context
      });

      Object.defineProperty(audioListenerComp, 'audioNode', {
        enumerable: true,
        value: context.destination
      });

      return Promise.resolve(audioListenerComp);
    },
  };
});
