define(['testutils', 'scenefactory'], (utils, SceneFactory) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Fabrique de scènes', () => {
    it('peut être instanciée', () => {
      const factory = new SceneFactory({});
      expect(factory).instanceof(SceneFactory);
    });

    describe('Fonction "append"', () => {
      it('existe', () => {
        const factory = new SceneFactory({});
        expect(factory).respondTo('append');
      });

      const tests = [{
        name: 'ajoute des objets à la scène',
        descr: [{
          name: 'a'
        }, {
          name: 'b'
        }],
        create: function(descr) {
          return Promise.resolve({
            name: descr.name
          });
        },
        check: function(factory, sceneMgr) {
          return factory.append(this.descr)
            .then(() => {
              const objects = sceneMgr.objects;
              expect(objects).have.keys(['a', 'b']);
            });
        }
      }, {
        name: 'appelle les méthodes de chargement et d\'initialisation, dans le bon ordre',
        descr: [{
          test: 'patate'
        }],
        calls: [],
        create: function(descr) {
          const calls = this.calls;
          return Promise.resolve({
            test: {
              onLoad: function(d) {
                expect(d).equals(descr.test);
                calls.push('onLoad');
                return delayPromise(10);
              },
              onInit: function(d) {
                expect(d).equals(descr.test);
                calls.push('onInit');
                return delayPromise(10);
              },
            },
          });
        },
        check: function(factory) {
          return factory.append(this.descr)
            .then(() => {
              expect(this.calls).deep.equals(['onLoad', 'onInit']);
            });
        }
      }, {
        name: 'appelle les méthodes de chargement de chaque objet avant celles d\'initialisation',
        descr: [{}, {}],
        loadCount: 0,
        initCount: 0,
        create: function() {
          const self = this;
          return Promise.resolve({
            test: {
              onLoad: function() {
                expect(self.initCount).equals(0);
                self.loadCount++;
                return delayPromise(10);
              },
              onInit: function() {
                expect(self.loadCount).equals(2);
                self.initCount++;
                return delayPromise(10);
              },
            },
          });
        },
        check: function(factory) {
          return factory.append(this.descr)
            .then(() => {
              expect(this.loadCount).equals(2);
              expect(this.initCount).equals(2);
            });
        }
      }];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const sceneMgr = {
            objects: {},
            addObject: function(obj) {
              this.objects[obj.name] = obj;
            },
          };

          const factory = new SceneFactory(sceneMgr, t);
          t.check(factory, sceneMgr)
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });
  });
});
