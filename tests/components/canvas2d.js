define(['testutils', 'components/canvas2d'], (utils, CanvasComponent) => {
  'use strict';

  const expect = utils.expect;
  const callLog = utils.callLog;

  describe('Composant "Canvas2D"', () => {
    const canvasName = 'test canvas';

    describe('Fonction "getHTMLElement"', () => {
      it('existe', () => {
        expect(CanvasComponent).respondTo('getHTMLElement');
      });

      it('récupère un élément HTML', () => {
        let mochaElement = CanvasComponent.getHTMLElement('mocha');
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
        let canvas = document.createElement('canvas');
        let origGetCtx = canvas.getContext;
        canvas.getContext = function() {
          let ctx = origGetCtx.apply(this, arguments);
          return callLog(ctx, log);
        };
        return canvas;
      };

      let canvasComp;
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
        let obj = {
          a: 123
        };
        let descr = {
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
          .catch(done);
      });
    });

    describe('Fonction "render"', () => {
      it('existe', (done) => {
        createTestCanvas()
          .then((comp) => {
            expect(comp).respondTo('render');
            done();
          })
          .catch(done);
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
          let log = [];
          createTestCanvas(t.descr, {}, log)
            .then((comp) => {
              return comp.render(123);
            })
            .then(() => {
              expect(log).have.lengthOf(t.expected.length);
              expect(log).deep.equals(t.expected);
              done();
            })
            .catch(done);
        });
      });
    });
  });
});
