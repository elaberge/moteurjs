define(() => {
  'use strict';

  return {
    create: function(sceneManager, owner) {
      let oscillator = undefined;
      let waveType = 'sine';
      let frequency = 262;
      let context = undefined;

      function createOscillator() {
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

        const ctxFilter = propFilter.bind(this, 'audioContext');
        context = owner.findParentByFilter(ctxFilter, true);
        oscillator = context.createOscillator();
        oscillator.type = waveType;
        oscillator.frequency.value = frequency;

        const nodeFilter = propFilter.bind(this, 'audioNode');
        const node = owner.findParentByFilter(nodeFilter, true);

        oscillator.connect(node);
      }

      const audioOscillatorComp = {
        onLoad: function(descr) {
          waveType = descr.type || waveType;
          frequency = descr.frequency || frequency;
          return Promise.resolve();
        },
        start: function() {
          createOscillator();
          oscillator.start.apply(oscillator, arguments);
        },
        stop: function() {
          oscillator.stop.apply(oscillator, arguments);
        },
        beep: function(duration) {
          this.start();
          this.stop(context.currentTime + duration);
        },
      };

      Object.defineProperty(audioOscillatorComp, 'owner', {
        enumerable: true,
        value: owner
      });

      Object.defineProperty(audioOscillatorComp, 'type', {
        enumerable: true,
        get: function() {
          return waveType;
        },
      });

      Object.defineProperty(audioOscillatorComp, 'frequency', {
        enumerable: true,
        get: function() {
          return frequency;
        },
      });

      return Promise.resolve(audioOscillatorComp);
    },
  };
});
