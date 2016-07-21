define(['testutils', 'objectfactory'], (utils, ObjectFactory) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Fabrique d\'objets', () => {
    it('peut être instanciée', () => {
      const factory = new ObjectFactory({});
      expect(factory).instanceof(ObjectFactory);
    });

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
              expect(obj).an('object');
              expect(obj).to.be.empty;
            });
        }
      }, {
        name: 'ajoute des composants depuis les descriptions',
        descr: {
          first: 123,
          second: 456,
        },
        check: function(factory) {
          return factory.create(this.descr)
            .then((obj) => {
              expect(obj).an('object');
              expect(obj).have.keys(['first', 'second']);
              expect(obj.first).deep.equals({
                owner: obj,
                name: 'first',
                descr: this.descr.first
              });
              expect(obj.second).deep.equals({
                owner: obj,
                name: 'second',
                descr: this.descr.second
              });
            });
        }
      }];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const compFactory = {
            create: (obj, compName, compDescr) => {
              return delayPromise(10)
                .then(() => {
                  return {
                    owner: obj,
                    name: compName,
                    descr: compDescr
                  };
                });
            },
          };

          const factory = new ObjectFactory({}, compFactory);
          t.check(factory)
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });
  });
});
