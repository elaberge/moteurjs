define([
  'testutils',
  'objectfactory',
], (
  utils,
  ObjectFactory
) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Fabrique d\'objets', () => {
    const componentTemplate = () => {
      return {
        create: function(sceneManager, owner, descr) {
          return delayPromise(10)
            .then(() => {
              return {
                owner: owner,
                descr: descr,
              };
            });
        }
      };
    };

    define('components/test-ofactory', [], componentTemplate);
    define('components/test-ofactory2', [], componentTemplate);

    it('peut être instanciée', () => {
      const factory = new ObjectFactory({});
      expect(factory).instanceof(ObjectFactory);
    });

    function createTestObject(descr) {
      descr = descr || {};
      const factory = new ObjectFactory({});
      return factory.create(descr);
    }

    describe('Fonction "create"', () => {
      it('existe', () => {
        const factory = new ObjectFactory({});
        expect(factory).respondTo('create');
      });

      const tests = [{
        name: 'crée un nouvel objet',
        descr: {},
        check: function(factory) {
          return factory.create(this.descr)
            .then((obj) => {
              expect(obj).property('components');
              expect(obj.components).an('object');
              expect(obj.components).to.be.empty;
            });
        }
      }, {
        name: 'assigne un nom par défaut à l\'objet',
        descr: {},
        check: function(factory) {
          return factory.create(this.descr)
            .then((obj) => {
              expect(obj).property('name');
              expect(obj.name).a('string');
              expect(obj.name).to.not.be.empty;
            });
        }
      }, {
        name: 'assigne un nom spécifié à l\'objet',
        descr: {
          name: 'patate'
        },
        check: function(factory) {
          return factory.create(this.descr)
            .then((obj) => {
              expect(obj).property('name');
              expect(obj.name).a('string');
              expect(obj.name).equals(this.descr.name);
            });
        }
      }, {
        name: 'ajoute des composants depuis les descriptions',
        descr: {
          'test-ofactory': 123,
          'test-ofactory2': 456,
        },
        check: function(factory) {
          return factory.create(this.descr)
            .then((obj) => {
              expect(obj).property('components');
              expect(obj.components).an('object');
              expect(obj.components).have.keys(['test-ofactory', 'test-ofactory2']);
              expect(obj.components['test-ofactory']).deep.equals({
                owner: obj,
                descr: this.descr['test-ofactory'],
              });
              expect(obj.components['test-ofactory2']).deep.equals({
                owner: obj,
                descr: this.descr['test-ofactory2'],
              });
            });
        }
      }];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const factory = new ObjectFactory({});
          t.check(factory)
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });
  });
});
