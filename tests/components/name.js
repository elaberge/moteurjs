define(['testutils', 'components/name'], (utils, NameComponent) => {
  'use strict';

  const expect = utils.expect;

  describe('Composant "Name"', () => {
    describe('Fonction "create"', () => {
      it('existe', () => {
        expect(NameComponent).respondTo('create');
      });

      const tests = [{
        name: 'assigne la propriété "owner"',
        descr: {},
        check: function(obj, comp) {
          expect(comp).property('owner');
          expect(comp.owner).equals(obj);
          return Promise.resolve();
        }
      }, {
        name: 'assigne le nom de l\'objet',
        descr: 'test component',
        check: function(obj, comp) {
          expect(comp).property('name');
          expect(comp.name).equals(this.descr);
          return Promise.resolve();
        }
      }];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const obj = {
            a: 123
          };

          NameComponent.create(null, obj, t.descr)
            .then((comp) => {
              return t.check(obj, comp);
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
