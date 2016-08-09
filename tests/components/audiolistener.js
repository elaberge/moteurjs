define([
  'testutils',
  'components/audiolistener',
], (
  utils,
  AudioListenerComponent
) => {
  'use strict';

  const expect = utils.expect;

  describe('Composant "AudioListener"', () => {
    describe('Fonction "create"', () => {
      it('existe', () => {
        expect(AudioListenerComponent).respondTo('create');
      });

      const tests = [{
        name: 'assigne la propriété "owner"',
        createCheck: function(obj, comp) {
          expect(comp).property('owner');
          expect(comp.owner).equals(obj);
          return Promise.resolve();
        },
      }, {
        name: 'crée un contexte audio dans la propriété "audioContext"',
        createCheck: function(obj, comp) {
          const audioContext = window.AudioContext || window.webkitAudioContext;
          expect(comp).property('audioContext');
          expect(comp.audioContext).instanceOf(audioContext);
          expect(comp.audioContext).property('destination');
          return Promise.resolve();
        },
      }, {
        name: 'définit une propriété de connexion audio, "audioNode", qui correspond à la sortie du contexte audio',
        createCheck: function(obj, comp) {
          expect(comp).property('audioNode');
          expect(comp.audioNode).equals(comp.audioContext.destination);
          return Promise.resolve();
        },
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const obj = {
            a: 123
          };

          AudioListenerComponent.create(null, obj)
            .then((comp) => {
              return t.createCheck(obj, comp);
            })
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });
  });
});
