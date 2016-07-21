define(['testutils', 'components/children'], (utils, ChildrenComponent) => {
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
            expect(c).property('parent');
            expect(c.parent).an('object');
            expect(c.parent).property('parent');
            expect(c.parent.parent).equals(obj);
          });
          return Promise.resolve();
        },
      }];

      tests.forEach((t) => {
        it(t.name, (done) => {
          function defaultCheck() {
            return Promise.resolve();
          }

          const parent = {
            name: 'test parent',
            a: 123
          };
          const children = [{
            name: 'test child 1',
            b: 456
          }, {
            name: 'test child 2',
            c: 789
          }, ];
          const sceneManager = {
            objects: {},
            findObject: function(name) {
              return this.objects[name];
            },
          };

          t.createCheck = t.createCheck || defaultCheck;
          t.loadCheck = t.loadCheck || defaultCheck;

          let createCheck = undefined;
          let loadCheck = undefined;
          let load = undefined;

          let childrenComp = undefined;
          ChildrenComponent.create(sceneManager, parent)
            .then((comp) => {
              childrenComp = comp;
              createCheck = t.createCheck.bind(t, parent, comp, children);
              loadCheck = t.loadCheck.bind(t, parent, comp, children);
              load = comp.onLoad.bind(comp, t.descr);
              return createCheck();
            })
            .then(() => {
              sceneManager.objects[parent.name] = parent;
              children.forEach((c) => {
                sceneManager.objects[c.name] = c;
              });
              parent.children = childrenComp;
            })
            .then(() => {
              return load();
            })
            .then(() => {
              return loadCheck();
            })
            .then(done)
            .catch(done);
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
          .catch(done);
      });

      const tests = [{
        name: 'ajoute un enfant par son nom quand il n\'y en a pas',
        param: 'test child',
        obj: {
          x: 987
        },
        setup: function(mgr) {
          mgr.objects[this.param] = this.obj;
        },
        children: [],
        check: function(obj, comp) {
          expect(comp.children).have.lengthOf(1);
          expect(comp.children[0]).equals(this.obj);
          return Promise.resolve();
        },
      }, {
        name: 'ajoute un enfant quand il n\'y en a pas',
        param: {
          x: 987
        },
        setup: function() {},
        children: [],
        check: function(obj, comp) {
          expect(comp.children).have.lengthOf(1);
          expect(comp.children[0]).equals(this.param);
          return Promise.resolve();
        },
      }, {
        name: 'ajoute un enfant par son nom quand il en existe déjà',
        param: 'test child',
        obj: {
          x: 987
        },
        setup: function(mgr) {
          mgr.objects[this.param] = this.obj;
        },
        children: [{
          name: 'test child 1',
          b: 456
        }, {
          name: 'test child 2',
          c: 789
        }, ],
        check: function(obj, comp) {
          expect(comp.children).have.lengthOf(3);
          expect(comp.children[0]).equals(this.children[0]);
          expect(comp.children[1]).equals(this.children[1]);
          expect(comp.children[2]).equals(this.obj);
          return Promise.resolve();
        },
      }, {
        name: 'ajoute un enfant quand il en existe déjà',
        param: {
          x: 987
        },
        setup: function() {},
        children: [{
          name: 'test child 1',
          b: 456
        }, {
          name: 'test child 2',
          c: 789
        }, ],
        check: function(obj, comp) {
          expect(comp.children).have.lengthOf(3);
          expect(comp.children[0]).equals(this.children[0]);
          expect(comp.children[1]).equals(this.children[1]);
          expect(comp.children[2]).equals(this.param);
          return Promise.resolve();
        },
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const parent = {
            name: 'test parent',
            a: 123
          };
          const sceneManager = {
            objects: {},
            findObject: function(name) {
              return this.objects[name];
            },
          };
          t.setup(sceneManager);

          let check = undefined;
          let load = undefined;
          let add = undefined;

          let childrenComp = undefined;

          ChildrenComponent.create(sceneManager, parent)
            .then((comp) => {
              childrenComp = comp;
              check = t.check.bind(t, parent, comp);
              load = comp.onLoad.bind(comp, t.children);
              add = comp.add.bind(comp, t.param);
              sceneManager.objects[parent.name] = parent;
              t.children.forEach((c) => {
                sceneManager.objects[c.name] = c;
              });
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
            .catch(done);
        });
      });
    });
  });
});
