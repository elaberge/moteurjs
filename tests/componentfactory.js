define(['testutils', 'componentfactory'], (utils, ComponentFactory) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Fabrique de composants', () => {
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

    it('peut être instanciée', () => {
      let factory = new ComponentFactory({});
      expect(factory).instanceof(ComponentFactory);
    });

    describe('Fonction "create"', () => {
      it('existe', () => {
        let factory = new ComponentFactory({});
        expect(factory).respondTo('create');
      });

      it('instancie un composant', (done) => {
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

      it('retourne une erreur via une promesse si le composant est introuvable', (done) => {
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
        factory.create(obj, 'test-missing', descr)
          .then(() => {
            done(new Error('Trouvé un composant inexistant?'));
          })
          .catch(() => {
            done();
          });
      });
    });
  });
});
