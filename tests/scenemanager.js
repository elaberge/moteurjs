define(['testutils', 'components/name', 'scenemanager'], (utils, NameComponent, SceneManager) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Gestionnaire de scènes', () => {
    it('peut être instancié', () => {
      let mgr = new SceneManager();
      expect(mgr).instanceof(SceneManager);
    });

    it('possède les fonctions et propriétés d\'un sous-système', () => {
      let mgr = new SceneManager();
      expect(mgr).property('name');
      expect(mgr.name).equal('sceneManager');
      expect(mgr).respondTo('update');
      expect(mgr).respondTo('destroy');
    });

    it('possède les fonctions et propriétés nécessaires', () => {
      let mgr = new SceneManager();
      expect(mgr).respondTo('loadScene');
      expect(mgr).respondTo('unloadScene');
      expect(mgr).respondTo('appendScene');
      expect(mgr).respondTo('addObject');
      expect(mgr).respondTo('findObject');
      expect(mgr).respondTo('findObjects');
    });

    it('fonction update se propage aux composants de la scène', (done) => {
      let obj1 = {
        c1: {
          update: function(delta) {
            return delayPromise(10)
              .then(() => {
                this.delta = delta;
              });
          },
        },
        c2: {
          update: function(delta) {
            return delayPromise(10)
              .then(() => {
                this.delta = delta;
              });
          },
        },
      };
      let obj2 = {
        c1: {
          update: function(delta) {
            return delayPromise(10)
              .then(() => {
                this.delta = delta;
              });
          },
        },
        c2: {
          update: function(delta) {
            return delayPromise(10)
              .then(() => {
                this.delta = delta;
              });
          },
        },
      };

      let mgr = new SceneManager();
      mgr.addObject(obj1);
      mgr.addObject(obj2);
      mgr.update(123)
        .then(() => {
          expect(obj1.c1.delta).equals(123);
          expect(obj1.c2.delta).equals(123);
          expect(obj2.c1.delta).equals(123);
          expect(obj2.c2.delta).equals(123);
          done();
        })
        .catch(done);
    });

    it('fonction appendScene ajoute des objets à la scène courante', (done) => {
      let descr = {
        a: 1
      };
      let mgr;
      let sceneFactory = {
        append: (d, sceneMgr) => {
          expect(d).equals(descr);
          let obj = {
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
      expect(mgr.objects).to.be.empty;
      mgr.appendScene(descr)
        .then(() => {
          expect(Object.keys(mgr.objects)).lengthOf(1);
          const obj1 = mgr.findObject('obj1');
          expect(obj1).to.exist;
          expect(obj1.val).to.be.true;
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
          done();
        })
        .catch(done);
    });

    it('fonction unloadScene supprime tous les objets de la scène courante', (done) => {
      let mgr;
      let sceneFactory = {
        append: (d, sceneMgr) => {
          let objA = {
            val: true
          };
          let objB = {
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
      mgr.appendScene(null)
        .then(() => {
          expect(Object.keys(mgr.objects)).lengthOf(2);
          return mgr.unloadScene();
        })
        .then(() => {
          expect(mgr.objects).to.be.empty;
          done();
        })
        .catch(done);
    });

    it('fonction loadScene supprime tous les objets et en charge de nouveaux', (done) => {
      let descr = {
        a: 1
      };
      let mgr;
      let sceneFactory = {
        append: (d, sceneMgr) => {
          expect(d).equals(descr);
          let obj = {
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
      expect(mgr.objects).to.be.empty;
      mgr.appendScene(descr)
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
          done();
        })
        .catch(done);
    });
  });
});
