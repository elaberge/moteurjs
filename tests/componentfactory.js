define(['utils', 'componentfactory'], (utils, ComponentFactory) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Fabrique de composants', () => {
    it('peut être instanciée', () => {
      let factory = new ComponentFactory();
      expect(factory).instanceof(ComponentFactory);
    });

    it('possède les fonctions et propriétés néceassaires', () => {
      let factory = new ComponentFactory();
      expect(factory).respondTo('create');
    });

    it('fonction create instancie un composant', (done) => {
      define('test-component', [], () => {
        return {
          create: function(descr) {
            return delayPromise(10)
              .then(() => {
                return {
                  d: descr
                };
              });
          }
        };
      });

      let descr = {
        patate: 'frite'
      };

      let factory = new ComponentFactory();
      factory.create('test-component', descr)
        .then((comp) => {
          expect(comp).deep.equals({
            d: descr
          });
          done();
        })
        .catch(done);
    });
  });
});
