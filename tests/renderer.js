define([
  'testutils',
  'objectfactory',
  'scenemanager',
  'renderer',
], (
  utils,
  ObjectFactory,
  SceneManager,
  Renderer
) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Gestionnaire de rendu', () => {
    const componentTemplate = () => {
      return {
        create: function(sceneManager, owner, descr) {
          return delayPromise(10)
            .then(() => {
              return {
                d: descr,
                render: descr.render,
              };
            });
        }
      };
    };

    define('components/test-renderer', [], componentTemplate);
    define('components/test-renderer2', [], componentTemplate);

    it('peut être instancié', () => {
      const renderer = new Renderer({});
      expect(renderer).instanceof(Renderer);
    });

    it('a un nom', () => {
      const renderer = new Renderer({});
      expect(renderer).property('name');
      expect(renderer.name).equal('renderer');
    });

    describe('Fonction "update"', () => {
      it('existe', () => {
        const renderer = new Renderer({});
        expect(renderer).respondTo('update');
      });

      const tests = [{
        name: 'exécute les fonctions de rendu des composants de la scène',
        check: function(renderer, objects) {
          return renderer.update(123)
            .then(() => {
              expect(objects).have.lengthOf(2);
              objects.forEach((o) => {
                expect(o.components['test-renderer'].delta).equals(123);
                expect(o.components['test-renderer2'].delta).equals(123);
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

          const objDescriptions = [{
            'test-renderer': {
              render: objectRender,
            },
            'test-renderer2': {
              render: objectRender,
            },
          }, {
            'test-renderer': {
              render: objectRender,
            },
            'test-renderer2': {
              render: objectRender,
            },
          }];

          const objects = [];

          const mgr = new SceneManager();
          const objFactory = new ObjectFactory(mgr);
          const renderer = new Renderer(mgr);

          let p = Promise.resolve();
          objDescriptions.forEach((descr) => {
            p = p.then(() => {
                return objFactory.create(descr);
              })
              .then((obj) => {
                objects.push(obj);
              });
          });

          p.then(() => {
              expect(objects).have.lengthOf(objDescriptions.length);
              objects.forEach((o) => {
                mgr.addObject(o);
              });
            })
            .then(() => {
              return t.check(renderer, objects);
            })
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });
  });
});
