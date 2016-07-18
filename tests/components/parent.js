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
        }
      }];

      tests.forEach((t) => {
        it(t.name, (done) => {
          function defaultCheck() {
            return Promise.resolve();
          }

          let parent = {
            a: 123
          };
          let child = {
            b: 456
          };
          let sceneManager = {
            objects: {},
            findObject: function(name) {
              return this.objects[name];
            },
          };

          t.createCheck = t.createCheck || defaultCheck;
          t.loadCheck = t.loadCheck || defaultCheck;

          let createCheck;
          let loadCheck;
          let load;

          let parentComp;
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
            .catch(done);
        });
      });
    });
  });
});
