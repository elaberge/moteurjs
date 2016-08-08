define([
  'testutils',
  'scenemanager',
  'objectfactory',
], (
  utils,
  SceneManager,
  ObjectFactory
) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Fabrique d\'objets', () => {
    const componentTemplate = () => {
      return {
        create: function(sceneManager, owner, descr) {
          return delayPromise(10)
            .then(() => {
              return {
                owner: owner,
                descr: descr,
              };
            });
        }
      };
    };

    define('components/test-ofactory', [], componentTemplate);
    define('components/test-ofactory2', [], componentTemplate);

    it('peut être instanciée', () => {
      const factory = new ObjectFactory({});
      expect(factory).instanceof(ObjectFactory);
    });

    function createTestObject(descr) {
      descr = descr || {};
      const factory = new ObjectFactory({});
      return factory.create(descr);
    }

    describe('Fonction "create"', () => {
      it('existe', () => {
        const factory = new ObjectFactory({});
        expect(factory).respondTo('create');
      });

      const tests = [{
        name: 'crée un nouvel objet',
        descr: {},
        check: function(factory) {
          return factory.create(this.descr)
            .then((obj) => {
              expect(obj).property('components');
              expect(obj.components).an('object');
              expect(obj.components).to.be.empty;
            });
        }
      }, {
        name: 'assigne un nom par défaut à l\'objet',
        descr: {},
        check: function(factory) {
          return factory.create(this.descr)
            .then((obj) => {
              expect(obj).property('name');
              expect(obj.name).a('string');
              expect(obj.name).to.not.be.empty;
            });
        }
      }, {
        name: 'assigne un nom spécifié à l\'objet',
        descr: {
          name: 'patate'
        },
        check: function(factory) {
          return factory.create(this.descr)
            .then((obj) => {
              expect(obj).property('name');
              expect(obj.name).a('string');
              expect(obj.name).equals(this.descr.name);
            });
        }
      }, {
        name: 'ajoute des composants depuis les descriptions',
        descr: {
          'test-ofactory': 123,
          'test-ofactory2': 456,
        },
        check: function(factory) {
          return factory.create(this.descr)
            .then((obj) => {
              expect(obj).property('components');
              expect(obj.components).an('object');
              expect(obj.components).have.keys(['test-ofactory', 'test-ofactory2']);
              expect(obj.components['test-ofactory']).deep.equals({
                owner: obj,
                descr: this.descr['test-ofactory'],
              });
              expect(obj.components['test-ofactory2']).deep.equals({
                owner: obj,
                descr: this.descr['test-ofactory2'],
              });
            });
        }
      }];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const factory = new ObjectFactory({});
          t.check(factory)
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });

    describe('Fonction "findParentComponent"', () => {
      it('existe', (done) => {
        createTestObject()
          .then((comp) => {
            expect(comp).respondTo('findParentComponent');
            done();
          })
          .catch((err) => {
            done(err || new Error('Erreur'));
          });
      });

      const tests = [{
        name: 'retourne une valeur nulle si aucun parent',
        sceneDescr: [{
          name: 'root',
        }],
        objName: 'root',
        targetName: null,
        compName: 'invalid',
        recursive: false,
      }, {
        name: 'retourne une valeur nulle si aucun parent, même si l\'objet a le composant',
        sceneDescr: [{
          name: 'root',
          'test-ofactory': {},
        }],
        objName: 'root',
        targetName: null,
        compName: 'test-ofactory',
        recursive: false,
      }, {
        name: 'retourne une valeur nulle si le parent n\'a pas le composant',
        sceneDescr: [{
          name: 'parent',
        }, {
          name: 'child',
          parent: 'parent',
        }],
        objName: 'child',
        targetName: null,
        compName: 'invalid',
        recursive: false,
      }, {
        name: 'retourne le composant si le parent le possède',
        sceneDescr: [{
          name: 'parent',
          'test-ofactory': {},
        }, {
          name: 'child',
          parent: 'parent',
        }],
        objName: 'child',
        targetName: 'parent',
        compName: 'test-ofactory',
        recursive: false,
      }, {
        name: 'retourne une valeur nulle si le grand parent a le composant, sans récursion',
        sceneDescr: [{
          name: 'grandparent',
          'test-ofactory': {},
        }, {
          name: 'parent',
          parent: 'grandparent',
        }, {
          name: 'child',
          parent: 'parent',
        }],
        objName: 'child',
        targetName: null,
        compName: 'test-ofactory',
        recursive: false,
      }, {
        name: 'retourne le composant si le grand parent le possède, avec récursion',
        sceneDescr: [{
          name: 'grandparent',
          'test-ofactory': {},
        }, {
          name: 'parent',
          parent: 'grandparent',
        }, {
          name: 'child',
          parent: 'parent',
        }],
        objName: 'child',
        targetName: 'grandparent',
        compName: 'test-ofactory',
        recursive: true,
      }, {
        name: 'retourne le composant du parent, si le parent et le grand parent le possède, avec récursion',
        sceneDescr: [{
          name: 'grandparent',
          'test-ofactory': {},
        }, {
          name: 'parent',
          parent: 'grandparent',
          'test-ofactory': {},
        }, {
          name: 'child',
          parent: 'parent',
        }],
        objName: 'child',
        targetName: 'parent',
        compName: 'test-ofactory',
        recursive: true,
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const mgr = new SceneManager();
          mgr.loadScene(t.sceneDescr)
            .then(() => {
              const obj = mgr.findObject(t.objName);
              const found = obj.findParentComponent(t.compName, t.recursive);
              if (t.targetName) {
                const target = mgr.findObject(t.targetName);
                const comp = target.components[t.compName];
                expect(found).equals(comp);
              } else {
                expect(found).to.be.null;
              }
            })
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });

    describe('Fonction "findParentByFilter"', () => {
      it('existe', (done) => {
        createTestObject()
          .then((comp) => {
            expect(comp).respondTo('findParentByFilter');
            done();
          })
          .catch((err) => {
            done(err || new Error('Erreur'));
          });
      });

      const tests = [{
        name: 'retourne une valeur nulle si aucun parent',
        sceneDescr: [{
          name: 'root',
        }],
        objName: 'root',
        targetName: null,
        recursive: false,
      }, {
        name: 'retourne une valeur nulle si aucun parent, même si le filtre est valide sur l\'objet',
        sceneDescr: [{
          name: 'root',
          'test-ofactory': {
            val: true
          },
        }],
        objName: 'root',
        targetName: null,
        recursive: false,
      }, {
        name: 'retourne une valeur nulle si le filtre n\'est pas valide sur le parent',
        sceneDescr: [{
          name: 'parent',
          'test-ofactory': {
            val: false
          },
        }, {
          name: 'child',
          parent: 'parent',
          'test-ofactory': {
            val: true
          },
        }],
        objName: 'child',
        targetName: null,
        recursive: false,
      }, {
        name: 'retourne le composant si le filtre est valide sur le parent',
        sceneDescr: [{
          name: 'parent',
          'test-ofactory': {
            val: true
          },
        }, {
          name: 'child',
          parent: 'parent',
          'test-ofactory': {
            val: true
          },
        }],
        objName: 'child',
        targetName: 'parent',
        recursive: false,
      }, {
        name: 'retourne une valeur nulle si le filtre est valide sur le grand parent, sans récursion',
        sceneDescr: [{
          name: 'grandparent',
          'test-ofactory': {
            val: true
          },
        }, {
          name: 'parent',
          parent: 'grandparent',
          'test-ofactory': {
            val: false
          },
        }, {
          name: 'child',
          parent: 'parent',
          'test-ofactory': {
            val: true
          },
        }],
        objName: 'child',
        targetName: null,
        recursive: false,
      }, {
        name: 'retourne la valeur du filtre si il est valide sur le grand parent, avec récursion',
        sceneDescr: [{
          name: 'grandparent',
          'test-ofactory': {
            val: true
          },
        }, {
          name: 'parent',
          parent: 'grandparent',
          'test-ofactory': {
            val: false
          },
        }, {
          name: 'child',
          parent: 'parent',
          'test-ofactory': {
            val: true
          },
        }],
        objName: 'child',
        targetName: 'grandparent',
        recursive: true,
      }, {
        name: 'retourne la valeur du filtre du parent, si le filtre est valide sur le parent et le grand parent, avec récursion',
        sceneDescr: [{
          name: 'grandparent',
          'test-ofactory': {
            val: true
          },
        }, {
          name: 'parent',
          parent: 'grandparent',
          'test-ofactory': {
            val: true
          },
        }, {
          name: 'child',
          parent: 'parent',
          'test-ofactory': {
            val: true
          },
        }],
        objName: 'child',
        targetName: 'parent',
        recursive: true,
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const mgr = new SceneManager();
          mgr.loadScene(t.sceneDescr)
            .then(() => {
              function filter(obj) {
                if (obj.components['test-ofactory'] && obj.components['test-ofactory'].descr.val === true)
                  return obj;
              }

              const obj = mgr.findObject(t.objName);
              const found = obj.findParentByFilter(filter, t.recursive);
              if (t.targetName) {
                const target = mgr.findObject(t.targetName);
                expect(found).equals(target);
              } else {
                expect(found).to.be.null;
              }
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
