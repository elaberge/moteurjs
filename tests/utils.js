define(['testutils', 'utils'], (testUtils, utils) => {
  'use strict';

  const expect = testUtils.expect;

  describe('Fonctions utilitaires', () => {
    it('fonction require retourne un module via une promesse', (done) => {
      define('test-require', [], () => {
        return 123;
      });

      expect(utils).respondTo('require');
      let p = utils.require(['test-require']);
      expect(p).instanceof(Promise);
      p.then((mod) => {
          expect(mod).equals(123);
          done();
        })
        .catch(done);
    });

    it('fonction require retourne une erreur via une promesse en cas de module introuvable', (done) => {
      expect(utils).respondTo('require');
      let p = utils.require(['test-missing']);
      expect(p).instanceof(Promise);
      p.then(() => {
          done(new Error('Trouvé un module inexistant?'));
        })
        .catch(() => {
          done();
        });
    });
  });
});
