define([
  'testutils',
  'objectfactory',
  'scenemanager',
  'components/children',
], (
  utils,
  ObjectFactory,
  SceneManager,
  ChildrenComponent
) => {
  'use strict';

  const expect = utils.expect;

  describe('Composant "Children"', () => {
    describe('Fonction "create"', () => {
      it('existe', () => {
        expect(ChildrenComponent).respondTo('create');
      });

      const tests = [{
        name: 'assigne la propriété "owner"',
        descr: undefined,
        createCheck: function(obj, comp) {
          expect(comp).property('owner');
          expect(comp.owner).equals(obj);
          return Promise.resolve();
        },
      }, {
        name: 'assigne la propriété "children"',
        descr: ['test child 1', 'test child 2'],
        loadCheck: function(obj, comp, children) {
          expect(comp).property('children');
          expect(comp.children).an('array');
          expect(comp.children).deep.equals(children);
          return Promise.resolve();
        },
      }, {
        name: 'les propriétés "parent" des enfants font référence à cet objet',
        descr: ['test child 1', 'test child 2'],
        loadCheck: function(obj, comp, children) {
          children.forEach((c) => {
            expect(c.components).property('parent');
            expect(c.components.parent).an('object');
            expect(c.components.parent).property('parent');
            expect(c.components.parent.parent).equals(obj);
          });
          return Promise.resolve();
        },
      }];

      tests.forEach((t) => {
        it(t.name, (done) => {
          function defaultCheck() {
            return Promise.resolve();
          }

          const sceneManager = new SceneManager();
          const objFactory = new ObjectFactory(sceneManager);

          const parentDescr = {
            name: 'test parent',
          };
          const childrenDescr = [{
            name: 'test child 1',
          }, {
            name: 'test child 2',
          }, ];

          t.createCheck = t.createCheck || defaultCheck;
          t.loadCheck = t.loadCheck || defaultCheck;

          let createCheck = undefined;
          let loadCheck = undefined;
          let load = undefined;

          let parent = undefined;
          const children = [];

          let childrenComp = undefined;

          let p = Promise.resolve();
          childrenDescr.forEach((descr) => {
            p = p.then(() => {
                return objFactory.create(descr);
              })
              .then((obj) => {
                children.push(obj);
                sceneManager.addObject(obj);
              });
          });
          p.then(() => {
              expect(children).have.lengthOf(childrenDescr.length);
              return objFactory.create(parentDescr);
            })
            .then((obj) => {
              parent = obj;
              sceneManager.addObject(obj);
              return ChildrenComponent.create(sceneManager, parent);
            })
            .then((comp) => {
              childrenComp = comp;
              createCheck = t.createCheck.bind(t, parent, comp, children);
              loadCheck = t.loadCheck.bind(t, parent, comp, children);
              load = comp.onLoad.bind(comp, t.descr);
              return createCheck();
            })
            .then(() => {
              parent.children = childrenComp;
            })
            .then(() => {
              return load();
            })
            .then(() => {
              return loadCheck();
            })
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });

    describe('Fonction "add"', () => {
      it('existe', (done) => {
        ChildrenComponent.create({}, {})
          .then((comp) => {
            expect(comp).respondTo('add');
            done();
          })
          .catch((err) => {
            done(err || new Error('Erreur'));
          });
      });

      const tests = [{
        name: 'ajoute un enfant par son nom quand il n\'y en a pas',
        childDescr: {
          name: 'test child',
        },
        children: [],
        check: function(obj, comp) {
          expect(comp.children).have.lengthOf(1);
          expect(comp.children[0]).equals(this.obj);
          return Promise.resolve();
        },
      }, {
        name: 'ajoute un enfant quand il n\'y en a pas',
        childDescr: {},
        children: [],
        check: function(obj, comp) {
          expect(comp.children).have.lengthOf(1);
          expect(comp.children[0]).equals(this.obj);
          return Promise.resolve();
        },
      }, {
        name: 'ajoute un enfant par son nom quand il en existe déjà',
        childDescr: {
          name: 'test child',
        },
        children: ['test child 1', 'test child 2'],
        check: function(obj, comp) {
          expect(comp.children).have.lengthOf(3);
          expect(comp.children[0]).equals(this.childrenObj[0]);
          expect(comp.children[1]).equals(this.childrenObj[1]);
          expect(comp.children[2]).equals(this.obj);
          return Promise.resolve();
        },
      }, {
        name: 'ajoute un enfant quand il en existe déjà',
        childDescr: {},
        children: ['test child 1', 'test child 2'],
        check: function(obj, comp) {
          expect(comp.children).have.lengthOf(3);
          expect(comp.children[0]).equals(this.childrenObj[0]);
          expect(comp.children[1]).equals(this.childrenObj[1]);
          expect(comp.children[2]).equals(this.obj);
          return Promise.resolve();
        },
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const sceneManager = new SceneManager();
          const objFactory = new ObjectFactory(sceneManager);

          const parentDescr = {
            name: 'test parent',
          };

          let parent = undefined;

          let check = undefined;
          let load = undefined;
          let add = undefined;

          let childrenComp = undefined;
          t.childrenObj = [];

          objFactory.create(parentDescr)
            .then((obj) => {
              parent = obj;
              sceneManager.addObject(obj);
              return objFactory.create(t.childDescr);
            })
            .then((obj) => {
              t.obj = obj;
              sceneManager.addObject(obj);

              const childCreate = [];
              t.children.forEach((name) => {
                const descr = {
                  name: name
                };
                const p = objFactory.create(descr)
                  .then((obj) => {
                    t.childrenObj.push(obj);
                    sceneManager.addObject(obj);
                  });
                childCreate.push(p);
              });

              return Promise.all(childCreate);
            })
            .then(() => {
              return ChildrenComponent.create(sceneManager, parent);
            })
            .then((comp) => {
              childrenComp = comp;
              check = t.check.bind(t, parent, childrenComp);
              load = comp.onLoad.bind(comp, t.children);
              add = comp.add.bind(comp, t.childDescr.name || t.obj);
              parent.children = childrenComp;
            })
            .then(() => {
              return load();
            })
            .then(() => {
              return add();
            })
            .then(() => {
              return check();
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
