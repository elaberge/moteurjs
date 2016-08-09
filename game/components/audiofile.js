define([
  'utils',
], (
  utils
) => {
  'use strict';

  return {
    create: function(sceneManager, owner) {
      let source = undefined;
      let audioBuffer = undefined;
      let loop = false;
      let context = undefined;

      function propFilter(propName, obj) {
        let match = undefined;
        Object.keys(obj.components).forEach((name) => {
          const comp = obj.components[name];
          if (comp[propName]) {
            match = comp[propName];
          }
        });
        return match;
      }

      function createSource() {
        source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = loop;

        const nodeFilter = propFilter.bind(this, 'audioNode');
        const node = owner.findParentByFilter(nodeFilter, true);

        source.connect(node);
      }

      const audioFileComp = {
        onLoad: function(descr) {
          loop = descr.loop;
          return Promise.resolve();
        },
        onInit: function(descr) {
          const ctxFilter = propFilter.bind(this, 'audioContext');
          context = owner.findParentByFilter(ctxFilter, true);

          return utils.require(['bin!' + descr.file])
            .then((audioFile) => {
              return context.decodeAudioData(audioFile.slice(0));
            })
            .then((buf) => {
              audioBuffer = buf;
            });
        },
        start: function() {
          createSource();
          source.start.apply(source, arguments);
        },
        stop: function() {
          source.stop.apply(source, arguments);
        }
      };

      Object.defineProperty(audioFileComp, 'owner', {
        enumerable: true,
        value: owner
      });

      Object.defineProperty(audioFileComp, 'loop', {
        enumerable: true,
        get: function() {
          return loop;
        },
      });

      Object.defineProperty(audioFileComp, 'buffer', {
        enumerable: true,
        get: function() {
          return audioBuffer;
        },
      });

      return Promise.resolve(audioFileComp);
    },
  };
});
