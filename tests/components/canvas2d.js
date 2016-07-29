define([
  'testutils',
  'scenemanager',
  'components/children',
  'components/canvas2d',
], (
  utils,
  SceneManager,
  ChildrenComponent,
  CanvasComponent
) => {
  'use strict';

  const expect = utils.expect;
  const callLog = utils.callLog;
  const delayPromise = utils.delayPromise;

  describe('Composant "Canvas2D"', () => {
    const canvasName = 'test canvas';

    const componentTemplate = () => {
      return {
        create: function(sceneManager, owner, descr) {
          return delayPromise(10)
            .then(() => {
              return {
                owner: owner,
                d: descr,
                display: descr.display,
              };
            });
        }
      };
    };

    define('components/test-canvas2d', [], componentTemplate);


    describe('Fonction "getHTMLElement"', () => {
      it('existe', () => {
        expect(CanvasComponent).respondTo('getHTMLElement');
      });

      it('récupère un élément HTML', () => {
        const mochaElement = CanvasComponent.getHTMLElement('mocha');
        expect(mochaElement).not.null;
        expect(mochaElement).property('nodeName');
        expect(mochaElement.nodeName.toLowerCase()).equals('div');
      });
    });

    function createTestCanvas(descr, owner, log) {
      descr = descr || {
        htmlTarget: canvasName
      };
      owner = owner || {};
      owner.components = owner.components || {};
      log = log || [];

      CanvasComponent.getHTMLElement = function(id) {
        expect(id).equals(canvasName);
        const canvas = document.createElement('canvas');
        const origGetCtx = canvas.getContext;
        canvas.getContext = function() {
          const ctx = origGetCtx.apply(this, arguments);
          return callLog(ctx, log);
        };
        return canvas;
      };

      let canvasComp = undefined;
      return CanvasComponent.create(null, owner)
        .then((comp) => {
          canvasComp = comp;
          return canvasComp.onLoad(descr);
        })
        .then(() => {
          return canvasComp;
        });
    }

    describe('Fonction "create"', () => {
      it('existe', () => {
        expect(CanvasComponent).respondTo('create');
      });

      it('crée le composant correctement', (done) => {
        const obj = {
          a: 123
        };
        const descr = {
          htmlTarget: canvasName,
        };

        createTestCanvas(descr, obj)
          .then((comp) => {
            expect(comp).property('owner');
            expect(comp.owner).equals(obj);
            expect(comp).property('context');
            expect(comp.context).property('fillStyle');
            done();
          })
          .catch((err) => {
            done(err || new Error('Erreur'));
          });
      });
    });

    describe('Fonction "render"', () => {
      it('existe', (done) => {
        createTestCanvas()
          .then((comp) => {
            expect(comp).respondTo('render');
            done();
          })
          .catch((err) => {
            done(err || new Error('Erreur'));
          });
      });

      const tests = [{
        name: 'remplit le canvas avec la couleur d\'arrière plan',
        descr: {
          background: '#000'
        },
        expected: [{
          p: 'fillStyle',
          t: 'set',
          v: '#000',
        }, {
          p: 'fillRect',
          t: 'call',
          a: [0, 0, 300, 150],
        }, ],
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          t.descr.htmlTarget = canvasName;
          const log = [];
          createTestCanvas(t.descr, {}, log)
            .then((comp) => {
              return comp.render(123);
            })
            .then(() => {
              expect(log).have.lengthOf(t.expected.length);
              expect(log).deep.equals(t.expected);
              done();
            })
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });

      it('appelle les méthodes "display" de ses enfants, récursivement', (done) => {
        const displayLog = [];

        function display(delta, ctx) {
          displayLog.push(this.owner.name);
          return delayPromise(10)
            .then(() => {
              this._delta = delta;
              this._context = ctx;
            });
        }

        const grandChild1Descr = {
          name: 'grandChild1',
          'test-canvas2d': {
            display: display
          },
        };
        const child1Descr = {
          name: 'child1',
          'test-canvas2d': {
            display: display
          },
          children: [grandChild1Descr.name],
        };
        const child2Descr = {
          name: 'child2',
          'test-canvas2d': {
            display: display
          },
        };
        const objDescr = {
          name: 'root',
          children: [child1Descr.name, child2Descr.name],
        };
        const expectedOrder = [child1Descr.name, grandChild1Descr.name, child2Descr.name];
        const sceneDescr = [grandChild1Descr, child1Descr, child2Descr, objDescr];

        let context = undefined;

        const mgr = new SceneManager();
        mgr.loadScene(sceneDescr)
          .then(() => {
            const obj = mgr.findObject(objDescr.name);
            return createTestCanvas(null, obj);
          })
          .then((comp) => {
            context = comp.context;
            return comp.render(123);
          })
          .then(() => {
            expect(displayLog).deep.equals(expectedOrder);
            expectedOrder.forEach((name) => {
              const o = mgr.findObject(name);
              expect(o.components['test-canvas2d']._delta).equals(123);
              expect(o.components['test-canvas2d']._context).equals(context);
            });
            done();
          })
          .catch((err) => {
            done(err || new Error('Erreur'));
          });
      });
    });
  });
});
