define(['testutils', 'components/transform'], (utils, TransformComponent) => {
  'use strict';

  const expect = utils.expect;

  describe('Composant "Transform"', () => {
    describe('Fonction "create"', () => {
      it('existe', () => {
        expect(TransformComponent).respondTo('create');
      });

      const tests = [{
        name: 'assigne la propriété "owner"',
        descr: {},
        createCheck: function(obj, comp) {
          expect(comp).property('owner');
          expect(comp.owner).equals(obj);
          return Promise.resolve();
        },
      }, {
        name: 'crée les valeurs par défaut',
        descr: {},
        loadCheck: function(obj, comp) {
          const expected = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
          };
          Object.keys(expected).forEach((k) => {
            expect(comp).property(k);
            expect(comp[k]).equals(expected[k]);
          });
          return Promise.resolve();
        },
      }, {
        name: 'configure les valeurs spécifiée',
        descr: {
          x: 123,
          y: 456,
          width: 321,
          height: 654,
          junk: 'patate'
        },
        loadCheck: function(obj, comp) {
          const expected = {
            x: 123,
            y: 456,
            width: 321,
            height: 654
          };
          Object.keys(expected).forEach((k) => {
            expect(comp).property(k);
            expect(comp[k]).equals(expected[k]);
          });
          expect(comp).not.property('junk');
          return Promise.resolve();
        },
      }, {
        name: 'peut assigner de nouvelles valeurs',
        descr: {},
        loadCheck: function(obj, comp) {
          const newVal = {
            x: 123,
            y: 456,
            width: 321,
            height: 654
          };
          Object.keys(newVal).forEach((k) => {
            expect(comp).property(k);
            comp[k] = newVal[k];
            expect(comp[k]).equals(newVal[k]);
          });
          return Promise.resolve();
        },
      }];

      tests.forEach((t) => {
        it(t.name, (done) => {
          function defaultCheck() {
            return Promise.resolve();
          }

          const obj = {
            a: 123
          };

          t.createCheck = t.createCheck || defaultCheck;
          t.loadCheck = t.loadCheck || defaultCheck;

          let createCheck = undefined;
          let loadCheck = undefined;
          let load = undefined;

          TransformComponent.create(null, obj)
            .then((comp) => {
              createCheck = t.createCheck.bind(t, obj, comp);
              loadCheck = t.loadCheck.bind(t, obj, comp);
              load = comp.onLoad.bind(comp, t.descr);
              return createCheck();
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
