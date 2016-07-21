define(['testutils', 'utils'], (testUtils, utils) => {
  'use strict';

  const expect = testUtils.expect;

  describe('Fonctions utilitaires', () => {
    describe('Fonction "require"', () => {
      define('test-require', [], () => {
        return 123;
      });

      it('existe', () => {
        expect(utils).respondTo('require');
      });

      it('retourne un module via une promesse', (done) => {
        utils.require(['test-require'])
          .then((mod) => {
            expect(mod).equals(123);
            done();
          })
          .catch((err) => {
            done(err || new Error('Erreur'));
          });
      });

      it('retourne une erreur via une promesse en cas de module introuvable', (done) => {
        utils.require(['test-missing'])
          .then(() => {
            done(new Error('Trouvé un module inexistant?'));
          })
          .catch(() => {
            done();
          });
      });
    });
  });
});
