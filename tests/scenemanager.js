define(['testutils', 'components/name', 'scenemanager'], (utils, NameComponent, SceneManager) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Gestionnaire de scènes', () => {
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
        check: function(mgr) {
          const obj = {
            a: 123
          };
          const id = mgr.addObject(obj);
          expect(id).not.null;
          expect(mgr.objects).property(id);
          expect(mgr.objects[id]).equals(obj);
          return Promise.resolve();
        }
      }, {
        name: 'ajoute un objet nommé',
        check: function(mgr) {
          const obj = {
            a: 123
          };
          return NameComponent.create(mgr, obj, 'test')
            .then((comp) => {
              obj.name = comp;
              const id = mgr.addObject(obj);
              expect(id).not.null;
              expect(mgr.objects).property(id);
              expect(mgr.objects[id]).equals(obj);
              expect(mgr.findObject('test')).equals(obj);
            });
        }
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const mgr = new SceneManager();
          t.check(mgr)
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
        check: function(mgr) {
          const obj = {
            a: 123
          };
          return NameComponent.create(mgr, obj, 'test')
            .then((comp) => {
              obj.name = comp;
              mgr.addObject(obj);
              expect(mgr.findObject('test')).equals(obj);
            });
        }
      }, {
        name: 'trouve un des objets nommés lorsque plusieurs partagent le même nom',
        check: function(mgr) {
          const obj1 = {
            a: 123
          };
          const obj2 = {
            b: 456
          };
          return NameComponent.create(mgr, obj1, 'test')
            .then((comp) => {
              obj1.name = comp;
              mgr.addObject(obj1);
              return NameComponent.create(mgr, obj2, 'test');
            })
            .then((comp) => {
              obj2.name = comp;
              mgr.addObject(obj2);
              const found = mgr.findObject('test');
              expect(found === obj1 || found === obj2).true;
            });
        }
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const mgr = new SceneManager();
          t.check(mgr)
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
        check: function(mgr) {
          const obj = {
            a: 123
          };
          return NameComponent.create(mgr, obj, 'test')
            .then((comp) => {
              obj.name = comp;
              mgr.addObject(obj);
              const found = mgr.findObjects('test');
              expect(found).an('array');
              expect(found).have.lengthOf(1);
              expect(found[0]).equals(obj);
            });
        }
      }, {
        name: 'trouve des objets nommés lorsque plusieurs partagent le même nom',
        check: function(mgr) {
          const obj1 = {
            a: 123
          };
          const obj2 = {
            b: 456
          };
          return NameComponent.create(mgr, obj1, 'test')
            .then((comp) => {
              obj1.name = comp;
              mgr.addObject(obj1);
              return NameComponent.create(mgr, obj2, 'test');
            })
            .then((comp) => {
              obj2.name = comp;
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
          t.check(mgr)
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
                expect(o.c1.delta).equals(123);
                expect(o.c2.delta).equals(123);
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

          const objects = [{
            c1: {
              update: objectUpdate,
            },
            c2: {
              update: objectUpdate,
            },
          }, {
            c1: {
              update: objectUpdate,
            },
            c2: {
              update: objectUpdate,
            },
          }];

          const mgr = new SceneManager();
          objects.forEach((o) => {
            mgr.addObject(o);
          });

          t.check(mgr, objects)
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
              expect(obj1.val).to.be.true;
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
              expect(obj1.val).to.be.true;
              const obj2 = mgr.findObject('obj2');
              expect(obj2).to.exist;
              expect(obj2.val).to.be.true;
            });
        },
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const descr = {
            a: 1
          };
          let mgr = undefined;
          const sceneFactory = {
            append: (d, sceneMgr) => {
              expect(d).equals(descr);
              const obj = {
                val: true
              };

              return delayPromise(10)
                .then(() => {
                  return NameComponent.create(mgr, obj, 'obj' + d.a);
                })
                .then((nameComp) => {
                  obj.name = nameComp;
                  sceneMgr.addObject(obj);
                  d.a++;
                });
            },
          };

          mgr = new SceneManager(sceneFactory);
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
          return mgr.appendScene(null)
            .then(() => {
              expect(Object.keys(mgr.objects)).lengthOf(2);
              return mgr.unloadScene();
            })
            .then(() => {
              expect(mgr.objects).to.be.empty;
            });
        }
      }];

      tests.forEach((t) => {
        it(t.name, (done) => {
          let mgr = undefined;
          const sceneFactory = {
            append: (d, sceneMgr) => {
              const objA = {
                val: true
              };
              const objB = {
                val: true
              };
              return NameComponent.create(mgr, objA, 'a')
                .then((aName) => {
                  objA.name = aName;
                  sceneMgr.addObject(objA);
                  return NameComponent.create(mgr, objB, 'b');
                })
                .then((bName) => {
                  objB.name = bName;
                  sceneMgr.addObject(objB);
                });
            },
          };

          mgr = new SceneManager(sceneFactory);
          t.check(mgr)
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
              expect(obj1.val).to.be.true;
              return mgr.loadScene(descr);
            })
            .then(() => {
              expect(Object.keys(mgr.objects)).lengthOf(1);
              expect(mgr.findObject('obj1')).to.not.exist;
              const obj2 = mgr.findObject('obj2');
              expect(obj2).to.exist;
              expect(obj2.val).to.be.true;
            });
        }
      }];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const descr = {
            a: 1
          };
          let mgr = undefined;
          const sceneFactory = {
            append: (d, sceneMgr) => {
              expect(d).equals(descr);
              const obj = {
                val: true
              };

              return delayPromise(10)
                .then(() => {
                  return NameComponent.create(mgr, obj, 'obj' + d.a);
                })
                .then((nameComp) => {
                  obj.name = nameComp;
                  sceneMgr.addObject(obj);
                  d.a++;
                });
            },
          };

          mgr = new SceneManager(sceneFactory);
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
