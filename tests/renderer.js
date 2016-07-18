define(['testutils', 'renderer', 'scenemanager'], (utils, Renderer, SceneManager) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Gestionnaire de rendu', () => {
    it('peut être instancié', () => {
      let renderer = new Renderer({});
      expect(renderer).instanceof(Renderer);
    });

    it('a un nom', () => {
      let renderer = new Renderer({});
      expect(renderer).property('name');
      expect(renderer.name).equal('renderer');
    });

    describe('Fonction "update"', () => {
      it('existe', () => {
        let renderer = new Renderer({});
        expect(renderer).respondTo('update');
      });

      const tests = [{
        name: 'exécute les fonctions de rendu des composants de la scène',
        check: function(renderer, objects) {
          return renderer.update(123)
            .then(() => {
              expect(objects).have.lengthOf(2);
              objects.forEach((o) => {
                expect(o.c1.delta).equals(123);
                expect(o.c2.delta).equals(123);
              });
            });
        },
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          function objectRender(delta) {
            return delayPromise(10)
              .then(() => {
                this.delta = delta;
              });
          }

          let objects = [{
            c1: {
              render: objectRender,
            },
            c2: {
              render: objectRender,
            },
          }, {
            c1: {
              render: objectRender,
            },
            c2: {
              render: objectRender,
            },
          }];

          let mgr = new SceneManager();
          let renderer = new Renderer(mgr);
          objects.forEach((o) => {
            mgr.addObject(o);
          });

          t.check(renderer, objects)
            .then(done)
            .catch(done);
        });
      });
    });
  });
});
