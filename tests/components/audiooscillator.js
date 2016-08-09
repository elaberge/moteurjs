define([
  'testutils',
  'objectfactory',
  'scenemanager',
  'components/audiooscillator',
], (
  utils,
  ObjectFactory,
  SceneManager,
  AudioOscillatorComponent
) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Composant "AudioOscillator"', () => {
    const componentTemplate = () => {
      return {
        create: function(sceneManager, owner, descr) {
          return delayPromise(10)
            .then(() => {
              const obj = {
                d: descr
              };
              Object.keys(descr).forEach((k) => {
                obj[k] = descr[k];
              });
              return obj;
            });
        }
      };
    };

    define('components/test-audiooscillator-listener', [], componentTemplate);

    describe('Fonction "create"', () => {
      it('existe', () => {
        expect(AudioOscillatorComponent).respondTo('create');
      });

      const tests = [{
        name: 'assigne la propriété "owner"',
        createCheck: function(obj, comp) {
          expect(comp).property('owner');
          expect(comp.owner).equals(obj);
          return Promise.resolve();
        },
      }, {
        name: 'crée l\'oscillateur WebAudio',
        createOscillator: function() {
          this.created = true;
          return {
            connect: function() {},
            start: function() {},
            frequency: {},
          };
        },
        startCheck: function() {
          expect(this.created).to.be.true;
          return Promise.resolve();
        },
      }, {
        name: 'connecte l\'oscillateur à la destination audio',
        destination: 'dummyDestination',
        createOscillator: function() {
          const connect = (target) => {
            this.connectTarget = target;
          };
          return {
            connect: connect,
            start: function() {},
            frequency: {},
          };
        },
        startCheck: function() {
          expect(this.connectTarget).equals(this.destination);
          return Promise.resolve();
        },
      }, {
        name: 'applique la propriété du type d\'onde à l\'oscillateur',
        descr: {
          type: 'square',
        },
        loadCheck: function(obj, comp) {
          expect(comp).property('type');
          expect(comp.type).equals(this.descr.type);
          return Promise.resolve();
        },
        createOscillator: function() {
          this.oscillator = {
            connect: function() {},
            frequency: {},
            start: function() {},
          };
          return this.oscillator;
        },
        startCheck: function(obj, comp) {
          expect(comp.type).equals(this.descr.type);
          expect(this.oscillator.type).equals(this.descr.type);
          return Promise.resolve();
        }
      }, {
        name: 'applique la propriété de fréquence à l\'oscillateur',
        descr: {
          frequency: 440,
        },
        loadCheck: function(obj, comp) {
          expect(comp).property('frequency');
          expect(comp.frequency).equals(this.descr.frequency);
          return Promise.resolve();
        },
        createOscillator: function() {
          this.oscillator = {
            connect: function() {},
            frequency: {},
            start: function() {},
          };
          return this.oscillator;
        },
        startCheck: function(obj, comp) {
          expect(comp.frequency).equals(this.descr.frequency);
          expect(this.oscillator.frequency.value).equals(this.descr.frequency);
          return Promise.resolve();
        }
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          function defaultCheck() {
            return Promise.resolve();
          }

          t.descr = t.descr || {};
          t.createCheck = t.createCheck || defaultCheck;
          t.loadCheck = t.loadCheck || defaultCheck;
          t.startCheck = t.startCheck || defaultCheck;
          t.createOscillator = t.createOscillator || function() {
            return {
              connect: function() {},
              frequency: {},
              start: function() {},
            };
          };

          const sceneManager = new SceneManager();
          const objFactory = new ObjectFactory(sceneManager);

          const parentDescr = {
            name: 'listener',
            'test-audiooscillator-listener': {
              audioNode: t.destination,
              audioContext: {
                createOscillator: t.createOscillator.bind(t),
              }
            },
          };

          const childDescr = {
            name: 'child',
            parent: 'listener',
          };

          let createCheck = undefined;
          let loadCheck = undefined;
          let startCheck = undefined;
          let load = undefined;

          let child = undefined;

          objFactory.create(parentDescr)
            .then((obj) => {
              sceneManager.addObject(obj);
              return objFactory.create(childDescr);
            })
            .then((obj) => {
              child = obj;
              sceneManager.addObject(obj);
              return AudioOscillatorComponent.create(sceneManager, child);
            })
            .then((comp) => {
              child.components.audiooscillator = comp;
              createCheck = t.createCheck.bind(t, child, comp);
              loadCheck = t.loadCheck.bind(t, child, comp);
              startCheck = t.startCheck.bind(t, child, comp);
              load = comp.onLoad.bind(comp, t.descr);
              return createCheck();
            })
            .then(() => {
              return Promise.all([load(), child.components.parent.onLoad(childDescr.parent)]);
            })
            .then(() => {
              return loadCheck();
            })
            .then(() => {
              child.components.audiooscillator.start();
              return startCheck();
            })
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });

    describe('Fonctionnalités', () => {
      it('existent', (done) => {
        AudioOscillatorComponent.create()
          .then((comp) => {
            expect(comp).respondTo('start');
            expect(comp).respondTo('stop');
            expect(comp).respondTo('beep');
            done();
          })
          .catch((err) => {
            done(err || new Error('Erreur'));
          });
      });

      const tests = [{
        name: 'appelle la méthode "start" de l\'oscillateur WebAudio',
        nativeOscillator: {
          frequency: {},
          connect: () => {},
          start: function() {
            this.startCalled = true;
          },
        },
        action: function(comp) {
          comp.start();
        },
        check: function() {
          expect(this.nativeOscillator.startCalled).to.be.true;
          return Promise.resolve();
        },
      }, {
        name: 'appelle la méthode "stop" de l\'oscillateur WebAudio',
        nativeOscillator: {
          frequency: {},
          connect: () => {},
          start: function() {},
          stop: function() {
            this.stopCalled = true;
          },
        },
        action: function(comp) {
          comp.start();
          comp.stop();
        },
        check: function() {
          expect(this.nativeOscillator.stopCalled).to.be.true;
          return Promise.resolve();
        },
      }, {
        name: 'la méthode "beep" appelle les méthodes "start" et "stop" de l\'oscillateur WebAudio',
        nativeOscillator: {
          commands: [],
          frequency: {},
          connect: () => {},
          start: function() {
            this.commands.push({
              t: 'start',
              a: arguments
            });
          },
          stop: function() {
            this.commands.push({
              t: 'stop',
              a: arguments
            });
          },
        },
        action: function(comp) {
          comp.beep(2);
        },
        check: function() {
          expect(this.nativeOscillator.commands).lengthOf(2);
          const cmd0 = this.nativeOscillator.commands[0];
          const cmd1 = this.nativeOscillator.commands[1];
          expect(cmd0.t).equals('start');
          expect(cmd0.a).lengthOf(0);
          expect(cmd1.t).equals('stop');
          expect(cmd1.a).lengthOf(1);
          expect(cmd1.a[0]).equals(123 + 2);
          return Promise.resolve();
        },
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const sceneDescr = [{
            name: 'listener',
            'test-audiooscillator-listener': {
              audioNode: {},
              audioContext: {
                createOscillator: () => {
                  return t.nativeOscillator;
                },
                currentTime: 123,
              }
            },
          }, {
            name: 'oscillator',
            parent: 'listener',
            audiooscillator: {},
          }, ];

          const sceneManager = new SceneManager();
          sceneManager.loadScene(sceneDescr)
            .then(() => {
              const oscillator = sceneManager.findObject('oscillator');
              t.action(oscillator.components.audiooscillator);
              return t.check();
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
