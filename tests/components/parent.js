define(['testutils', 'components/parent'], (utils, ParentComponent) => {
  'use strict';

  const expect = utils.expect;

  describe('Composant "Parent"', () => {
    it('possède les fonctions et propriétés néceassaires', () => {
      expect(ParentComponent).respondTo('create');
    });

    it('fonction create crée le composant correctement', (done) => {
      let descr = 'test parent';
      let parent = {
        a: 123
      };
      let child = {
        b: 456
      };
      let sceneManager = {
        objects: {},
        findObject: function(name) {
          return this.objects[name];
        },
      };

      let parentComp;
      ParentComponent.create(sceneManager, child)
        .then((comp) => {
          parentComp = comp;
          expect(comp).property('owner');
          expect(comp.owner).equals(child);
          sceneManager.objects['child'] = child;
          sceneManager.objects[descr] = parent;
          child.parent = comp;
          return comp.onLoad(descr);
        })
        .then(() => {
          expect(parentComp).property('parent');
          expect(parentComp.parent).equals(parent);
          done();
        })
        .catch(done);
    });
  });
});
