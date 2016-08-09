define([
  'testutils',
  'objectfactory',
  'scenemanager',
  'components/audiofile',
], (
  utils,
  ObjectFactory,
  SceneManager,
  AudioFileComponent
) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Composant "AudioFile"', () => {
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

    define('components/test-audiofile-listener', [], componentTemplate);

    describe('Fonction "create"', () => {
      it('existe', () => {
        expect(AudioFileComponent).respondTo('create');
      });

      const tests = [{
        name: 'assigne la propriété "owner"',
        createCheck: function(obj, comp) {
          expect(comp).property('owner');
          expect(comp.owner).equals(obj);
          return Promise.resolve();
        },
      }, {
        name: 'crée la source WebAudio',
        createBufferSource: function() {
          this.created = true;
          return {
            connect: function() {},
            start: function() {},
          };
        },
        startCheck: function() {
          expect(this.created).to.be.true;
          return Promise.resolve();
        },
      }, {
        name: 'connecte la source à la destination audio',
        destination: 'dummyDestination',
        createBufferSource: function() {
          const connect = (target) => {
            this.connectTarget = target;
          };
          return {
            connect: connect,
            start: function() {},
          };
        },
        startCheck: function() {
          expect(this.connectTarget).equals(this.destination);
          return Promise.resolve();
        },
      }, {
        name: 'assigne un fichier à la source audio',
        descr: {
          file: 'tests/sounds/dummy.wav',
        },
        initCheck: function(obj, comp) {
          expect(comp).property('buffer');
          expect(comp.buffer).instanceOf(ArrayBuffer);
          expect(comp.buffer.byteLength).above(0);
          return Promise.resolve();
        },
        createBufferSource: function() {
          this.bufferSource = {
            connect: function() {},
            start: function() {},
          };
          return this.bufferSource;
        },
        startCheck: function(obj, comp) {
          expect(comp.buffer).instanceOf(ArrayBuffer);
          expect(comp.buffer.byteLength).above(0);
          expect(this.bufferSource.buffer).equals(comp.buffer);
          return Promise.resolve();
        }
      }, {
        name: 'applique la propriété de boucle à la source audio',
        descr: {
          loop: true,
        },
        loadCheck: function(obj, comp) {
          expect(comp).property('loop');
          expect(comp.loop).equals(this.descr.loop);
          return Promise.resolve();
        },
        createBufferSource: function() {
          this.bufferSource = {
            connect: function() {},
            start: function() {},
          };
          return this.bufferSource;
        },
        startCheck: function(obj, comp) {
          expect(comp.loop).equals(this.descr.loop);
          expect(this.bufferSource.loop).equals(this.descr.loop);
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
          t.initCheck = t.initCheck || defaultCheck;
          t.startCheck = t.startCheck || defaultCheck;
          t.createBufferSource = t.createBufferSource || function() {
            return {
              connect: function() {},
              start: function() {},
            };
          };

          const sceneManager = new SceneManager();
          const objFactory = new ObjectFactory(sceneManager);

          const parentDescr = {
            name: 'listener',
            'test-audiofile-listener': {
              audioNode: t.destination,
              audioContext: {
                createBufferSource: t.createBufferSource.bind(t),
                decodeAudioData: (data) => {
                  return Promise.resolve(data);
                },
              }
            },
          };

          const childDescr = {
            name: 'child',
            parent: 'listener',
          };

          let createCheck = undefined;
          let loadCheck = undefined;
          let initCheck = undefined;
          let startCheck = undefined;
          let load = undefined;
          let init = undefined;

          let child = undefined;

          objFactory.create(parentDescr)
            .then((obj) => {
              sceneManager.addObject(obj);
              return objFactory.create(childDescr);
            })
            .then((obj) => {
              child = obj;
              sceneManager.addObject(obj);
              return AudioFileComponent.create(sceneManager, child);
            })
            .then((comp) => {
              child.components.audiofile = comp;
              createCheck = t.createCheck.bind(t, child, comp);
              loadCheck = t.loadCheck.bind(t, child, comp);
              initCheck = t.initCheck.bind(t, child, comp);
              startCheck = t.startCheck.bind(t, child, comp);
              load = comp.onLoad.bind(comp, t.descr);
              init = comp.onInit.bind(comp, t.descr);
              return createCheck();
            })
            .then(() => {
              return Promise.all([load(), child.components.parent.onLoad(childDescr.parent)]);
            })
            .then(() => {
              return loadCheck();
            })
            .then(() => {
              return Promise.all([init()]);
            })
            .then(() => {
              return initCheck();
            })
            .then(() => {
              child.components.audiofile.start();
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
        AudioFileComponent.create()
          .then((comp) => {
            expect(comp).respondTo('start');
            expect(comp).respondTo('stop');
            done();
          })
          .catch((err) => {
            done(err || new Error('Erreur'));
          });
      });

      const tests = [{
        name: 'appelle la méthode "start" de la source WebAudio',
        nativeBufferSource: {
          connect: () => {},
          start: function() {
            this.startCalled = true;
          },
        },
        action: function(comp) {
          comp.start();
        },
        check: function() {
          expect(this.nativeBufferSource.startCalled).to.be.true;
          return Promise.resolve();
        },
      }, {
        name: 'appelle la méthode "stop" de la source WebAudio',
        nativeBufferSource: {
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
          expect(this.nativeBufferSource.stopCalled).to.be.true;
          return Promise.resolve();
        },
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const sceneDescr = [{
            name: 'listener',
            'test-audiofile-listener': {
              audioNode: {},
              audioContext: {
                createBufferSource: () => {
                  return t.nativeBufferSource;
                },
                decodeAudioData: (data) => {
                  return Promise.resolve(data);
                },
              }
            },
          }, {
            name: 'source',
            parent: 'listener',
            audiofile: {
              file: 'tests/sounds/dummy.wav',
            },
          }, ];

          const sceneManager = new SceneManager();
          sceneManager.loadScene(sceneDescr)
            .then(() => {
              const source = sceneManager.findObject('source');
              t.action(source.components.audiofile);
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
