define(['testutils', 'objectfactory'], (utils, ObjectFactory) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Fabrique d\'objets', () => {
    it('peut être instanciée', () => {
      let factory = new ObjectFactory({});
      expect(factory).instanceof(ObjectFactory);
    });

    it('possède les fonctions et propriétés néceassaires', () => {
      let factory = new ObjectFactory({});
      expect(factory).respondTo('create');
    });

    it('fonction create crée un nouvel objet', (done) => {
      let descr = {};

      let factory = new ObjectFactory({});
      factory.create(descr)
        .then((obj) => {
          expect(obj).an('object');
          expect(obj).to.be.empty;
          done();
        })
        .catch(done);
    });

    it('ajoute des composants depuis les descriptions', (done) => {
      let compFactory = {
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

      let descr = {
        first: 123,
        second: 456,
      };

      let factory = new ObjectFactory({}, compFactory);
      factory.create(descr)
        .then((obj) => {
          expect(obj).an('object');
          expect(obj).have.keys(['first', 'second']);
          expect(obj.first).deep.equals({
            owner: obj,
            name: 'first',
            descr: descr.first
          });
          expect(obj.second).deep.equals({
            owner: obj,
            name: 'second',
            descr: descr.second
          });
          done();
        })
        .catch(done);
    });
  });
});
