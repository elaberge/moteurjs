define(['testutils', 'components/parent'], (utils, ParentComponent) => {
  'use strict';

  const expect = utils.expect;

  describe('Composant "Parent"', () => {
    describe('Fonction "create"', () => {
      it('existe', () => {
        expect(ParentComponent).respondTo('create');
      });

      const tests = [{
        name: 'assigne la propriété "owner"',
        descr: null,
        createCheck: function(obj, comp) {
          expect(comp).property('owner');
          expect(comp.owner).equals(obj);
          return Promise.resolve();
        },
      }, {
        name: 'assigne la propriété "parent"',
        descr: 'test parent',
        loadCheck: function(obj, comp, parent) {
          expect(comp).property('parent');
          expect(comp.parent).equals(parent);
          return Promise.resolve();
        },
      }, {
        name: 'la propriété "children" du parent fait référence à cet objet',
        descr: 'test parent',
        loadCheck: function(obj, comp, parent) {
          expect(parent).property('children');
          expect(parent.children).an('object');
          expect(parent.children).property('children');
          expect(parent.children.children).an('array');
          let found = false;
          parent.children.children.forEach((c) => {
            if (c === obj) {
              found = true;
            }
          });
          expect(found).to.be.true;
          return Promise.resolve();
        },
      }];

      tests.forEach((t) => {
        it(t.name, (done) => {
          function defaultCheck() {
            return Promise.resolve();
          }

          const parent = {
            a: 123
          };
          const child = {
            b: 456
          };
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

          let parentComp = undefined;
          ParentComponent.create(sceneManager, child)
            .then((comp) => {
              parentComp = comp;
              createCheck = t.createCheck.bind(t, child, comp, parent);
              loadCheck = t.loadCheck.bind(t, child, comp, parent);
              load = comp.onLoad.bind(comp, t.descr);
              return createCheck();
            })
            .then(() => {
              sceneManager.objects['child'] = child;
              sceneManager.objects[t.descr] = parent;
              child.parent = parentComp;
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
  });
});
