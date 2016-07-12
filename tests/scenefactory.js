define(['utils', 'scenefactory'], (utils, SceneFactory) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Fabrique de scènes', () => {
    it('peut être instanciée', () => {
      let factory = new SceneFactory({});
      expect(factory).instanceof(SceneFactory);
    });

    it('possède les fonctions et propriétés néceassaires', () => {
      let factory = new SceneFactory({});
      expect(factory).respondTo('append');
    });

    it('fonction append ajoute des objets à la scène', (done) => {
      let descr = [{
        name: 'a',
        val: 1
      }, {
        name: 'b',
        val: 2
      }, ];
      let objStep = 0;

      let objFactory = {
        create: (descr) => {
          objStep++;
          return Promise.resolve({
            name: descr.name,
            val: descr.val,
            onLoad: function(d) {
              expect((objStep == 2) || (objStep == 3)).to.be.true;
              expect(d).equals(descr);
              objStep++;
              return delayPromise(10)
                .then(() => {
                  this._load = true;
                });
            },
            onInit: function(d) {
              expect((objStep == 4) || (objStep == 5)).to.be.true;
              expect(d).equals(descr);
              expect(this._load).to.be.true;
              objStep++;
              return delayPromise(10)
                .then(() => {
                  this._init = true;
                });
            },
          });
        },
      };

      let sceneMgr = {
        objects: {},
        addObject: function(obj) {
          this.objects[obj.name] = obj;
        },
      };

      let factory = new SceneFactory(sceneMgr, objFactory);
      factory.append(descr)
        .then(() => {
          const objects = sceneMgr.objects;
          expect(objects).have.keys(['a', 'b']);
          expect(objects.a._load).to.be.true;
          expect(objects.b._load).to.be.true;
          expect(objects.a._init).to.be.true;
          expect(objects.b._init).to.be.true;
          expect(objStep).equals(6);
          done();
        })
        .catch(done);
    });
  });
});
