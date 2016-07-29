define([
  'testutils',
  'objectfactory',
  'scenemanager',
  'scenefactory',
], (
  utils,
  ObjectFactory,
  SceneManager,
  SceneFactory
) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Fabrique de scènes', () => {
    const componentTemplate = () => {
      return {
        create: function(sceneManager, owner, descr) {
          return delayPromise(10)
            .then(() => {
              return {
                d: descr,
                onLoad: descr.onLoad,
                onInit: descr.onInit,
              };
            });
        }
      };
    };

    define('components/test-sfactory', [], componentTemplate);

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
        create: function(objFactoryCreate, descr) {
          return objFactoryCreate(descr);
        },
        check: function(factory, sceneMgr) {
          return factory.append(this.descr)
            .then(() => {
              expect(Object.keys(sceneMgr.objects)).lengthOf(2);
              expect(sceneMgr.findObject('a')).to.exist;
              expect(sceneMgr.findObject('b')).to.exist;
            });
        }
      }, {
        name: 'appelle les méthodes de chargement et d\'initialisation, dans le bon ordre',
        descr: [{
          'test-sfactory': {
            a: 'patate',
          },
        }],
        calls: [],
        create: function(objFactoryCreate, descr) {
          const calls = this.calls;
          descr['test-sfactory'].onLoad = function(d) {
            expect(d).equals(descr['test-sfactory']);
            calls.push('onLoad');
            return delayPromise(10);
          };
          descr['test-sfactory'].onInit = function(d) {
            expect(d).equals(descr['test-sfactory']);
            calls.push('onInit');
            return delayPromise(10);
          };
          return objFactoryCreate(descr);
        },
        check: function(factory) {
          return factory.append(this.descr)
            .then(() => {
              expect(this.calls).deep.equals(['onLoad', 'onInit']);
            });
        }
      }, {
        name: 'appelle les méthodes de chargement de chaque objet avant celles d\'initialisation',
        descr: [{
          'test-sfactory': {},
        }, {
          'test-sfactory': {},
        }],
        loadCount: 0,
        initCount: 0,
        create: function(objFactoryCreate, descr) {
          const self = this;
          descr['test-sfactory'].onLoad = function() {
            expect(self.initCount).equals(0);
            self.loadCount++;
            return delayPromise(10);
          };
          descr['test-sfactory'].onInit = function() {
            expect(self.loadCount).equals(2);
            self.initCount++;
            return delayPromise(10);
          };
          return objFactoryCreate(descr);
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
          const mgr = new SceneManager(true);
          const objFactory = new ObjectFactory(mgr);
          const objFactoryCreate = objFactory.create.bind(objFactory);
          objFactory.create = t.create.bind(t, objFactoryCreate);
          const factory = new SceneFactory(mgr, objFactory);

          t.check(factory, mgr)
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });
  });
});
