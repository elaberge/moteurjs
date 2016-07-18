define(['testutils', 'renderer', 'scenemanager'], (utils, Renderer, SceneManager) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Gestionnaire de rendu', () => {
    it('peut être instancié', () => {
      let renderer = new Renderer({});
      expect(renderer).instanceof(Renderer);
    });

    it('possède les fonctions et propriétés d\'un sous-système', () => {
      let renderer = new Renderer({});
      expect(renderer).property('name');
      expect(renderer.name).equal('renderer');
      expect(renderer).respondTo('update');
    });

    it('fonction update exécute les fonctions render des composants de la scène', (done) => {
      let obj1 = {
        c1: {
          render: function(delta) {
            return delayPromise(10)
              .then(() => {
                this.delta = delta;
              });
          },
        },
        c2: {
          render: function(delta) {
            return delayPromise(10)
              .then(() => {
                this.delta = delta;
              });
          },
        },
      };
      let obj2 = {
        c1: {
          render: function(delta) {
            return delayPromise(10)
              .then(() => {
                this.delta = delta;
              });
          },
        },
        c2: {
          render: function(delta) {
            return delayPromise(10)
              .then(() => {
                this.delta = delta;
              });
          },
        },
      };

      let mgr = new SceneManager();
      let renderer = new Renderer(mgr);
      mgr.addObject(obj1);
      mgr.addObject(obj2);
      renderer.update(123)
        .then(() => {
          expect(obj1.c1.delta).equals(123);
          expect(obj1.c2.delta).equals(123);
          expect(obj2.c1.delta).equals(123);
          expect(obj2.c2.delta).equals(123);
          done();
        })
        .catch(done);
    });
  });
});
