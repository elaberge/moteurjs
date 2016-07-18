define(['testutils', 'components/name'], (utils, NameComponent) => {
  'use strict';

  const expect = utils.expect;

  describe('Composant "Name"', () => {
    it('possède les fonctions et propriétés néceassaires', () => {
      expect(NameComponent).respondTo('create');
    });

    it('fonction create crée le composant correctement', (done) => {
      let descr = 'test component';
      let obj = {
        a: 123
      };

      NameComponent.create(null, obj, descr)
        .then((comp) => {
          expect(comp).property('owner');
          expect(comp.owner).equals(obj);
          expect(comp).property('name');
          expect(comp.name).equals(descr);
          done();
        })
        .catch(done);
    });
  });
});
