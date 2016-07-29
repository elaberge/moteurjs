define([
  'testutils',
  'objectfactory',
  'scenemanager',
  'inputmanager',
], (
  utils,
  ObjectFactory,
  SceneManager,
  InputManager
) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Gestionnaire d\'entrées', () => {
    const componentTemplate = () => {
      return {
        create: function(sceneManager, owner, descr) {
          return delayPromise(10)
            .then(() => {
              return {
                d: descr,
                onKeyDown: descr.onKeyDown,
                onKeyUp: descr.onKeyUp,
              };
            });
        }
      };
    };

    define('components/test-input', [], componentTemplate);
    define('components/test-input2', [], componentTemplate);

    it('peut être instancié', () => {
      const mgr = new InputManager({});
      expect(mgr).instanceof(InputManager);
    });

    it('a un nom', () => {
      const mgr = new InputManager({});
      expect(mgr).property('name');
      expect(mgr.name).equal('input');
    });

    describe('Fonction "update"', () => {
      it('existe', () => {
        const mgr = new InputManager({});
        expect(mgr).respondTo('update');
      });

      const tests = [{
        name: 'renvoie les événements de touche enfoncée',
        events: [{
          name: 'keydown',
          val: {
            code: 'TestK',
            key: 'k',
          },
        }, ],
        check: function(mgr, objects) {
          const o1c1 = objects[0].components['test-input'].log;
          const o1c2 = objects[0].components['test-input2'].log;
          const o2c1 = objects[1].components['test-input'].log;
          const o2c2 = objects[1].components['test-input2'].log;
          [o1c2, o2c2].forEach((log) => {
            expect(log).not.exist;
          });
          [o1c1, o2c1].forEach((log) => {
            const val = this.events[0].val;
            expect(log).have.lengthOf(1);
            expect(log[0].a).equals('keyDown');
            expect(log[0].k).equals(val.key);
            expect(log[0].c).equals(val.code);
          });
          return Promise.resolve();
        },
      }, {
        name: 'renvoie les événements de touche retirée',
        events: [{
          name: 'keyup',
          val: {
            code: 'TestK',
            key: 'k',
          },
        }, ],
        check: function(mgr, objects) {
          const o1c1 = objects[0].components['test-input'].log;
          const o1c2 = objects[0].components['test-input2'].log;
          const o2c1 = objects[1].components['test-input'].log;
          const o2c2 = objects[1].components['test-input2'].log;
          [o1c2, o2c1].forEach((log) => {
            expect(log).not.exist;
          });
          [o1c1, o2c2].forEach((log) => {
            const val = this.events[0].val;
            expect(log).have.lengthOf(1);
            expect(log[0].a).equals('keyUp');
            expect(log[0].k).equals(val.key);
            expect(log[0].c).equals(val.code);
          });
          return Promise.resolve();
        },
      }, {
        name: 'renvoie les événements pour une combinaison complexe',
        events: [{
          name: 'keydown',
          val: {
            code: 'TestK',
            key: 'k',
          },
        }, {
          name: 'keydown',
          val: {
            code: 'TestL',
            key: 'l',
          },
        }, {
          name: 'keyup',
          val: {
            code: 'TestM',
            key: 'm',
          },
        }, ],
        check: function(mgr, objects) {
          const o1c1 = objects[0].components['test-input'].log;
          const o1c2 = objects[0].components['test-input2'].log;
          const o2c1 = objects[1].components['test-input'].log;
          const o2c2 = objects[1].components['test-input2'].log;

          const val1 = this.events[0].val;
          const val2 = this.events[1].val;
          const val3 = this.events[2].val;

          {
            expect(o1c1).have.lengthOf(3);
            expect(o1c1[0].a).equals('keyDown');
            expect(o1c1[0].k).equals(val1.key);
            expect(o1c1[0].c).equals(val1.code);
            expect(o1c1[1].a).equals('keyDown');
            expect(o1c1[1].k).equals(val2.key);
            expect(o1c1[1].c).equals(val2.code);
            expect(o1c1[2].a).equals('keyUp');
            expect(o1c1[2].k).equals(val3.key);
            expect(o1c1[2].c).equals(val3.code);
          }

          expect(o1c2).not.exist;

          {
            expect(o2c1).have.lengthOf(2);
            expect(o2c1[0].a).equals('keyDown');
            expect(o2c1[0].k).equals(val1.key);
            expect(o2c1[0].c).equals(val1.code);
            expect(o2c1[1].a).equals('keyDown');
            expect(o2c1[1].k).equals(val2.key);
            expect(o2c1[1].c).equals(val2.code);
          }

          {
            expect(o2c2).have.lengthOf(1);
            expect(o2c2[0].a).equals('keyUp');
            expect(o2c2[0].k).equals(val3.key);
            expect(o2c2[0].c).equals(val3.code);
          }
          return Promise.resolve();
        },
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          function objectAction(action, key, code) {
            this.log = this.log || [];
            return delayPromise(10)
              .then(() => {
                this.log.push({
                  a: action,
                  k: key,
                  c: code,
                });
              });
          }

          function keyDown(key, code) {
            return objectAction.call(this, 'keyDown', key, code);
          }

          function keyUp(key, code) {
            return objectAction.call(this, 'keyUp', key, code);
          }

          const objDescriptions = [{
            'test-input': {
              onKeyDown: keyDown,
              onKeyUp: keyUp,
            },
            'test-input2': {},
          }, {
            'test-input': {
              onKeyDown: keyDown,
            },
            'test-input2': {
              onKeyUp: keyUp,
            },
          }];

          const inputEmitter = {
            handlers: {},
            addEventListener: function(evtName, callback) {
              this.handlers[evtName] = callback;
            },
            play: function(events) {
              events.forEach((e) => {
                const callback = this.handlers[e.name];
                if (callback) {
                  callback(e.val);
                }
              });
            },
          };

          const objects = [];

          const mgr = new SceneManager();
          const objFactory = new ObjectFactory(mgr);
          const inputMgr = new InputManager(mgr, inputEmitter);

          let p = Promise.resolve();
          objDescriptions.forEach((descr) => {
            p = p.then(() => {
                return objFactory.create(descr);
              })
              .then((obj) => {
                objects.push(obj);
              });
          });

          p.then(() => {
              expect(objects).have.lengthOf(objDescriptions.length);
              objects.forEach((o) => {
                mgr.addObject(o);
              });
            })
            .then(() => {
              inputEmitter.play(t.events);

              return inputMgr.update(123);
            })
            .then(() => {
              return t.check(inputMgr, objects);
            })
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });

    describe('Fonction "isKeyDown"', () => {
      it('existe', () => {
        const mgr = new InputManager({});
        expect(mgr).respondTo('isKeyDown');
      });

      const tests = [{
        name: 'valide une touche jamais modifiée',
        events: [],
        check: function(mgr) {
          expect(mgr.isKeyDown('TestA')).to.be.false;
          return Promise.resolve();
        }
      }, {
        name: 'valide une touche enfoncée',
        events: [{
          name: 'keydown',
          val: {
            code: 'TestA',
            key: 'a',
          },
        }, ],
        check: function(mgr) {
          expect(mgr.isKeyDown('TestA')).to.be.true;
          return Promise.resolve();
        }
      }, {
        name: 'valide une touche relâchée',
        events: [{
          name: 'keydown',
          val: {
            code: 'TestA',
            key: 'a',
          },
        }, {
          name: 'keyup',
          val: {
            code: 'TestA',
            key: 'a',
          },
        }, ],
        check: function(mgr) {
          expect(mgr.isKeyDown('TestA')).to.be.false;
          return Promise.resolve();
        }
      }, {
        name: 'valide une touche relâchée',
        events: [{
          name: 'keydown',
          val: {
            code: 'TestA',
            key: 'a',
          },
        }, {
          name: 'keydown',
          val: {
            code: 'TestB',
            key: 'b',
          },
        }, {
          name: 'keyup',
          val: {
            code: 'TestA',
            key: 'a',
          },
        }, {
          name: 'keydown',
          val: {
            code: 'TestA',
            key: 'a',
          },
        }, {
          name: 'keyup',
          val: {
            code: 'TestB',
            key: 'b',
          },
        }, ],
        check: function(mgr) {
          expect(mgr.isKeyDown('TestA')).to.be.true;
          expect(mgr.isKeyDown('TestB')).to.be.false;
          return Promise.resolve();
        }
      }, ];
      tests.forEach((t) => {
        it(t.name, (done) => {
          const inputEmitter = {
            handlers: {},
            addEventListener: function(evtName, callback) {
              this.handlers[evtName] = callback;
            },
            play: function(events) {
              events.forEach((e) => {
                const callback = this.handlers[e.name];
                if (callback) {
                  callback(e.val);
                }
              });
            },
          };

          const mgr = new SceneManager();
          const inputMgr = new InputManager(mgr, inputEmitter);

          inputEmitter.play(t.events);

          t.check(inputMgr)
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });
  });
});
