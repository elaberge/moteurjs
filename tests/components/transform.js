define(['testutils', 'components/transform'], (utils, TransformComponent) => {
  'use strict';

  const expect = utils.expect;

  describe('Composant "Transform"', () => {
    it('possède les fonctions et propriétés néceassaires', () => {
      expect(TransformComponent).respondTo('create');
    });

    it('fonction create crée le composant correctement', (done) => {
      let emptyDescr = {};
      let fullDescr = {
        x: 123,
        y: 456,
        width: 321,
        height: 654,
      };

      let emptyObj = {
        a: 123
      };
      let fullObj = {
        b: 456
      };

      let emptyComp;
      let fullComp;

      TransformComponent.create(null, emptyObj)
        .then((comp) => {
          emptyComp = comp;
          expect(comp).property('owner');
          expect(comp.owner).equals(emptyObj);
          return comp.onLoad(emptyDescr);
        })
        .then(() => {
          expect(emptyComp).property('x');
          expect(emptyComp).property('y');
          expect(emptyComp).property('width');
          expect(emptyComp).property('height');
          expect(emptyComp.x).equals(0);
          expect(emptyComp.y).equals(0);
          expect(emptyComp.width).equals(0);
          expect(emptyComp.height).equals(0);

          return TransformComponent.create(null, fullObj);
        })
        .then((comp) => {
          fullComp = comp;
          expect(comp).property('owner');
          expect(comp.owner).equals(fullObj);
          return comp.onLoad(fullDescr);
        })
        .then(() => {
          expect(fullComp).property('x');
          expect(fullComp).property('y');
          expect(fullComp).property('width');
          expect(fullComp).property('height');
          expect(fullComp.x).equals(fullDescr.x);
          expect(fullComp.y).equals(fullDescr.y);
          expect(fullComp.width).equals(fullDescr.width);
          expect(fullComp.height).equals(fullDescr.height);

          done();
        })
        .catch(done);
    });
  });
});
