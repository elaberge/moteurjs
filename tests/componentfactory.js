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
      const factory = new ComponentFactory({});
      expect(factory).instanceof(ComponentFactory);
    });

    describe('Fonction "create"', () => {
      it('existe', () => {
        const factory = new ComponentFactory({});
        expect(factory).respondTo('create');
      });

      it('instancie un composant', (done) => {
        const descr = {
          patate: 'frite'
        };

        const obj = {
          a: 123
        };

        const mgr = {
          b: 456
        };

        const factory = new ComponentFactory(mgr);
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
        const descr = {
          patate: 'frite'
        };

        const obj = {
          a: 123
        };

        const mgr = {
          b: 456
        };

        const factory = new ComponentFactory(mgr);
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
