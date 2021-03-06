define([
  'testutils',
  'objectfactory',
  'scenefactory',
  'scenemanager',
], (
  utils,
  ObjectFactory,
  SceneFactory,
  SceneManager
) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Gestionnaire de scènes', () => {
    const componentTemplate = () => {
      return {
        create: function(sceneManager, owner, descr) {
          return delayPromise(10)
            .then(() => {
              return {
                d: descr,
                update: descr.update,
              };
            });
        }
      };
    };

    define('components/test-scene', [], componentTemplate);
    define('components/test-scene2', [], componentTemplate);

    it('peut être instancié', () => {
      const mgr = new SceneManager();
      expect(mgr).instanceof(SceneManager);
    });

    it('a un nom', () => {
      const mgr = new SceneManager();
      expect(mgr).property('name');
      expect(mgr.name).equal('sceneManager');
    });

    it('a la propriété "objects"', () => {
      const mgr = new SceneManager();
      expect(mgr).property('objects');
      expect(mgr.objects).an('object');
    });

    it('a la propriété "modules"', (done) => {
      const mgr = new SceneManager();
      const modules = {
        a: 123
      };
      expect(mgr).respondTo('init');
      mgr.init(modules)
        .then(() => {
          expect(mgr).property('modules');
          expect(mgr.modules).deep.equals(modules);
          done();
        })
        .catch((err) => {
          done(err || new Error('Erreur'));
        });
    });

    describe('Fonction "addObject"', () => {
      it('existe', () => {
        const mgr = new SceneManager();
        expect(mgr).respondTo('addObject');
      });

      const tests = [{
        name: 'ajoute un objet sans nom',
        check: function(mgr, objFactory) {
          const objDescr = {
            'test-scene': 123,
          };
          return objFactory.create(objDescr)
            .then((obj) => {
              const id = mgr.addObject(obj);
              expect(id).not.null;
              expect(mgr.objects).property(id);
              expect(mgr.objects[id]).equals(obj);
            });
        }
      }, {
        name: 'ajoute un objet nommé',
        check: function(mgr, objFactory) {
          const objDescr = {
            name: 'test',
            'test-scene': 123,
          };
          return objFactory.create(objDescr)
            .then((obj) => {
              const id = mgr.addObject(obj);
              expect(id).not.null;
              expect(mgr.objects).property(id);
              expect(mgr.objects[id]).equals(obj);
              expect(mgr.findObject(objDescr.name)).equals(obj);
            });
        }
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const mgr = new SceneManager();
          const objFactory = new ObjectFactory(mgr);
          t.check(mgr, objFactory)
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });

    describe('Fonction "findObject"', () => {
      it('existe', () => {
        const mgr = new SceneManager();
        expect(mgr).respondTo('findObject');
      });

      const tests = [{
        name: 'renvoie une valeur indéfinie si aucun objet n\'est trouvé',
        check: function(mgr) {
          expect(mgr.findObject('test')).equals(undefined);
          return Promise.resolve();
        }
      }, {
        name: 'trouve un objet nommé',
        check: function(mgr, objFactory) {
          const objDescr = {
            name: 'test',
            'test-scene': 123,
          };
          return objFactory.create(objDescr)
            .then((obj) => {
              mgr.addObject(obj);
              expect(mgr.findObject(objDescr.name)).equals(obj);
            });
        }
      }, {
        name: 'trouve un des objets nommés lorsque plusieurs partagent le même nom',
        check: function(mgr, objFactory) {
          const objDescr1 = {
            name: 'test',
            'test-scene': 123,
          };
          const objDescr2 = {
            name: 'test',
            'test-scene': 456,
          };
          let obj1 = undefined;
          let obj2 = undefined;
          return objFactory.create(objDescr1)
            .then((obj) => {
              obj1 = obj;
              mgr.addObject(obj1);
              return objFactory.create(objDescr2);
            })
            .then((obj) => {
              obj2 = obj;
              mgr.addObject(obj2);
              const found = mgr.findObject('test');
              expect(found === obj1 || found === obj2).true;
            });
        }
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const mgr = new SceneManager();
          const objFactory = new ObjectFactory(mgr);
          t.check(mgr, objFactory)
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });

    describe('Fonction "findObjects"', () => {
      it('existe', () => {
        const mgr = new SceneManager();
        expect(mgr).respondTo('findObjects');
      });

      const tests = [{
        name: 'renvoie un tableau vide si aucun objet n\'est trouvé',
        check: function(mgr) {
          const found = mgr.findObjects('test');
          expect(found).an('array');
          expect(found).have.lengthOf(0);
          return Promise.resolve();
        }
      }, {
        name: 'trouve un objet nommé',
        check: function(mgr, objFactory) {
          const objDescr = {
            name: 'test',
            'test-scene': 123,
          };
          return objFactory.create(objDescr)
            .then((obj) => {
              mgr.addObject(obj);
              const found = mgr.findObjects('test');
              expect(found).an('array');
              expect(found).have.lengthOf(1);
              expect(found[0]).equals(obj);
            });
        }
      }, {
        name: 'trouve des objets nommés lorsque plusieurs partagent le même nom',
        check: function(mgr, objFactory) {
          const objDescr1 = {
            name: 'test',
            'test-scene': 123,
          };
          const objDescr2 = {
            name: 'test',
            'test-scene': 456,
          };
          let obj1 = undefined;
          let obj2 = undefined;
          return objFactory.create(objDescr1)
            .then((obj) => {
              obj1 = obj;
              mgr.addObject(obj1);
              return objFactory.create(objDescr2);
            })
            .then((obj) => {
              obj2 = obj;
              mgr.addObject(obj2);
              const found = mgr.findObjects('test');
              expect(found).an('array');
              expect(found).have.lengthOf(2);
              expect(found).members([obj1, obj2]);
            });
        }
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const mgr = new SceneManager();
          const objFactory = new ObjectFactory(mgr);
          t.check(mgr, objFactory)
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });

    describe('Fonction "update"', () => {
      it('existe', () => {
        const mgr = new SceneManager();
        expect(mgr).respondTo('update');
      });

      const tests = [{
        name: 'se propage aux composants de la scène',
        check: function(mgr, objects) {
          return mgr.update(123)
            .then(() => {
              expect(objects).have.lengthOf(2);
              objects.forEach((o) => {
                expect(o.components['test-scene'].delta).equals(123);
                expect(o.components['test-scene2'].delta).equals(123);
              });
            });
        },
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          function objectUpdate(delta) {
            return delayPromise(10)
              .then(() => {
                this.delta = delta;
              });
          }

          const objDescriptions = [{
            'test-scene': {
              update: objectUpdate,
            },
            'test-scene2': {
              update: objectUpdate,
            },
          }, {
            'test-scene': {
              update: objectUpdate,
            },
            'test-scene2': {
              update: objectUpdate,
            },
          }];

          const objects = [];

          const mgr = new SceneManager();
          const objFactory = new ObjectFactory(mgr);

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
              return t.check(mgr, objects);
            })
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });

    describe('Fonction "appendScene"', () => {
      it('existe', () => {
        const mgr = new SceneManager();
        expect(mgr).respondTo('appendScene');
      });

      const tests = [{
        name: 'la scène est initialement vide',
        check: function(mgr) {
          expect(mgr.objects).to.be.empty;
          return Promise.resolve();
        },
      }, {
        name: 'ajoute des objets à une scène vide',
        check: function(mgr, descr) {
          return mgr.appendScene(descr)
            .then(() => {
              expect(Object.keys(mgr.objects)).lengthOf(1);
              const obj1 = mgr.findObject('obj1');
              expect(obj1).to.exist;
              expect(obj1.components['test-scene'].d).equals(1);
            });
        },
      }, {
        name: 'ajoute des objets à une scène remplie',
        check: function(mgr, descr) {
          return mgr.appendScene(descr)
            .then(() => {
              return mgr.appendScene(descr);
            })
            .then(() => {
              expect(Object.keys(mgr.objects)).lengthOf(2);
              const obj1 = mgr.findObject('obj1');
              expect(obj1).to.exist;
              expect(obj1.components['test-scene'].d).equals(1);
              const obj2 = mgr.findObject('obj2');
              expect(obj2).to.exist;
              expect(obj2.components['test-scene'].d).equals(2);
            });
        },
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const descr = [{
            'test-scene': 1
          }];

          const mgr = new SceneManager(true);
          const sceneFactory = new SceneFactory(mgr);
          const baseAppend = sceneFactory.append;
          sceneFactory.append = function(d) {
            expect(d).equals(descr);
            d[0].name = 'obj' + d[0]['test-scene'];
            return delayPromise(10)
              .then(() => {
                return baseAppend.call(this, d);
              })
              .then(() => {
                d[0]['test-scene']++;
              });
          };
          mgr.sceneFactory = sceneFactory;

          t.check(mgr, descr)
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });

    describe('Fonction "unloadScene"', () => {
      it('existe', () => {
        const mgr = new SceneManager();
        expect(mgr).respondTo('unloadScene');
      });

      const tests = [{
        name: 'supprime tous les objets de la scène courante',
        check: function(mgr) {
          expect(Object.keys(mgr.objects)).lengthOf(2);
          return mgr.unloadScene()
            .then(() => {
              expect(mgr.objects).to.be.empty;
            });
        }
      }];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const objDescr1 = {
            name: 'a',
          };
          const objDescr2 = {
            name: 'b',
          };

          const mgr = new SceneManager();
          const objFactory = new ObjectFactory(mgr);
          objFactory.create(objDescr1)
            .then(mgr.addObject)
            .then(() => {
              return objFactory.create(objDescr2);
            })
            .then(mgr.addObject)
            .then(() => {
              return t.check(mgr);
            })
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });

    describe('Fonction "loadScene"', () => {
      it('existe', () => {
        const mgr = new SceneManager();
        expect(mgr).respondTo('loadScene');
      });

      const tests = [{
        name: 'la scène est initialement vide',
        check: function(mgr) {
          expect(mgr.objects).to.be.empty;
          return Promise.resolve();
        },
      }, {
        name: 'supprime tous les objets et en charge de nouveaux',
        check: function(mgr, descr) {
          return mgr.appendScene(descr)
            .then(() => {
              expect(Object.keys(mgr.objects)).lengthOf(1);
              const obj1 = mgr.findObject('obj1');
              expect(obj1).to.exist;
              expect(obj1.components['test-scene'].d).equals(1);
              return mgr.loadScene(descr);
            })
            .then(() => {
              expect(Object.keys(mgr.objects)).lengthOf(1);
              expect(mgr.findObject('obj1')).to.not.exist;
              const obj2 = mgr.findObject('obj2');
              expect(obj2).to.exist;
              expect(obj2.components['test-scene'].d).equals(2);
            });
        }
      }];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const descr = [{
            'test-scene': 1
          }];

          const mgr = new SceneManager(true);
          const sceneFactory = new SceneFactory(mgr);
          const baseAppend = sceneFactory.append;
          sceneFactory.append = function(d) {
            expect(d).equals(descr);
            d[0].name = 'obj' + d[0]['test-scene'];
            return delayPromise(10)
              .then(() => {
                return baseAppend.call(this, d);
              })
              .then(() => {
                d[0]['test-scene']++;
              });
          };
          mgr.sceneFactory = sceneFactory;

          t.check(mgr, descr)
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });
  });
});
