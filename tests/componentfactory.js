define(['testutils', 'componentfactory'], (utils, ComponentFactory) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Fabrique de composants', () => {
    it('peut être instanciée', () => {
      let factory = new ComponentFactory({});
      expect(factory).instanceof(ComponentFactory);
    });

    it('possède les fonctions et propriétés néceassaires', () => {
      let factory = new ComponentFactory({});
      expect(factory).respondTo('create');
    });

    it('fonction create instancie un composant', (done) => {
      define('components/test-component', [], () => {
        return {
          create: function(sceneManager, owner, descr) {
            return delayPromise(10)
              .then(() => {
                return {
                  test_manager: sceneManager,
                  owner: owner,
                  d: descr
                };
              });
          }
        };
      });

      let descr = {
        patate: 'frite'
      };

      let obj = {
        a: 123
      };

      let mgr = {
        b: 456
      };

      let factory = new ComponentFactory(mgr);
      factory.create(obj, 'test-component', descr)
        .then((comp) => {
          expect(comp).deep.equals({
            test_manager: mgr,
            owner: obj,
            d: descr
          });
          done();
        })
        .catch(done);
    });
  });
});
