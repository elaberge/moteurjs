define(['testutils', 'components/canvas2d'], (utils, CanvasComponent) => {
  'use strict';

  const expect = utils.expect;
  const callLog = utils.callLog;
  const delayPromise = utils.delayPromise;

  describe('Composant "Canvas2D"', () => {
    const canvasName = 'test canvas';

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
          displayLog.push(this.owner);
          return delayPromise(10)
            .then(() => {
              this._delta = delta;
              this._context = ctx;
            });
        }

        const grandChild1 = {
          name: 'grandChild1',
          test: {
            display: display
          },
        };
        const child1 = {
          name: 'child1',
          test: {
            display: display
          },
          children: {
            children: [grandChild1]
          },
        };
        const child2 = {
          name: 'child2',
          test: {
            display: display
          },
        };
        const obj = {
          children: {
            children: [child1, child2]
          },
        };
        const expectedOrder = [child1, grandChild1, child2];
        expectedOrder.forEach((o) => {
          o.test.owner = o;
        });

        let context = undefined;
        createTestCanvas(null, obj)
          .then((comp) => {
            context = comp.context;
            return comp.render(123);
          })
          .then(() => {
            expect(displayLog).deep.equals(expectedOrder);
            expectedOrder.forEach((o) => {
              expect(o.test._delta).equals(123);
              expect(o.test._context).equals(context);
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
