define(['testutils', 'components/canvas2d'], (utils, CanvasComponent) => {
  'use strict';

  const expect = utils.expect;
  const callLog = utils.callLog;

  describe('Composant "Canvas2D"', () => {
    const canvasName = 'test canvas';

    it('possède les fonctions et propriétés néceassaires', () => {
      expect(CanvasComponent).respondTo('getHTMLElement');
      expect(CanvasComponent).respondTo('create');
    });

    it('fonction getHTMLElement récupère un élément HTML', () => {
      let mochaElement = CanvasComponent.getHTMLElement('mocha');
      expect(mochaElement).not.null;
      expect(mochaElement).property('nodeName');
      expect(mochaElement.nodeName.toLowerCase()).equals('div');
    });

    function createTestCanvas(descr, owner, log) {
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

    it('fonction create crée le composant correctement', (done) => {
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

    it('fonction render remplit le canvas avec la couleur d\'arrière plan', (done) => {
      let descr = {
        htmlTarget: canvasName,
        background: '#000',
      };

      let expectedCommands = [{
        p: 'fillStyle',
        t: 'set',
        v: descr.background,
      }, {
        p: 'fillRect',
        t: 'call',
        a: [0, 0, 300, 150],
      }, ];

      let log = [];
      createTestCanvas(descr, {}, log)
        .then((comp) => {
          expect(comp).respondTo('render');
          return comp.render(123);
        })
        .then(() => {
          expect(log).have.lengthOf(2);
          expect(log).deep.equals(expectedCommands);
          done();
        })
        .catch(done);
    });
  });
});
