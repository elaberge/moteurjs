define(['testutils', 'gameloop'], (utils, GameLoop) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Boucle', () => {
    it('peut être instanciée', () => {
      const loop = new GameLoop();
      expect(loop).instanceof(GameLoop);
    });

    it('a la propriété "modules"', () => {
      const loop = new GameLoop();
      expect(loop).property('modules');
      expect(loop.modules).an('object');
    });

    describe('Fonction "init"', () => {
      it('existe', () => {
        const loop = new GameLoop();
        expect(loop).respondTo('init');
      });

      const tests = [{
        name: 'il  n\'y a aucun module par défaut',
        check: function(loop) {
          expect(loop.modules).to.be.empty;
          return Promise.resolve();
        }
      }, {
        name: 'ajoute les modules au gestionnaire',
        descr: [{
          name: 'a'
        }, {
          name: 'b'
        }],
        check: function(loop) {
          const moduleMap = {
            a: {
              module: this.descr[0],
              rank: 0
            },
            b: {
              module: this.descr[1],
              rank: 1
            }
          };

          return loop.init(this.descr)
            .then(() => {
              expect(loop.modules).to.exist;
              expect(loop.modules).an('object');
              expect(loop.modules).deep.equal(moduleMap);
            });
        }
      }, {
        name: 'appelle les méthodes de configuration avec la liste des modules en paramètres',
        descr: [{
          name: 'a',
          init: function(modMap) {
            this._init = modMap;
          },
          load: function(modMap) {
            this._load = modMap;
          },
        }, {
          name: 'b',
          init: function(modMap) {
            this._init = modMap;
          },
          load: function(modMap) {
            this._load = modMap;
          },
        }],
        check: function(loop) {
          const moduleMap = {
            a: {
              module: this.descr[0],
              rank: 0
            },
            b: {
              module: this.descr[1],
              rank: 1
            }
          };

          return loop.init(this.descr)
            .then(() => {
              expect(this.descr[0]._init).deep.equals(moduleMap);
              expect(this.descr[0]._load).deep.equals(moduleMap);
              expect(this.descr[1]._init).deep.equals(moduleMap);
              expect(this.descr[1]._load).deep.equals(moduleMap);
            });
        }
      }, {
        name: 'appelle les méthodes de chargement et d\'initialisation, dans le bon ordre',
        descr: [{
          name: 'a',
          load: function() {
            expect(this._load).to.not.exist;
            expect(this._init).to.not.exist;
            this._load = true;
          },
          init: function() {
            expect(this._load).to.be.true;
            expect(this._init).to.not.exist;
            this._init = true;
          },
        }],
        check: function(loop) {
          return loop.init(this.descr)
            .then(() => {
              expect(this.descr[0]._load).to.be.true;
              expect(this.descr[0]._init).to.be.true;
            });
        }
      }, {
        name: 'appelle les méthodes de chargement de chaque module avant celles d\'initialisation',
        descr: [{
          name: 'a'
        }, {
          name: 'b'
        }],
        check: function(loop) {
          let loadCount = 0;
          let initCount = 0;

          function load() {
            expect(initCount).equals(0);
            loadCount++;
            return delayPromise(10);
          }

          function init() {
            expect(loadCount).equals(2);
            initCount++;
            return delayPromise(10);
          }

          this.descr.forEach((d) => {
            d.init = init;
            d.load = load;
          });

          return loop.init(this.descr)
            .then(() => {
              expect(loadCount).equals(2);
              expect(initCount).equals(2);
            });
        }
      }];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const loop = new GameLoop();
          t.check(loop)
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });

    describe('Fonction "iterate"', () => {
      it('existe', () => {
        const loop = new GameLoop();
        expect(loop).respondTo('iterate');
      });

      const tests = [{
        name: 'appelle la méthode "update" des modules',
        descr: [{
          update: function(delta) {
            this._delta = delta;
          }
        }],
        check: function(loop) {
          return loop.iterate(123)
            .then(() => {
              expect(this.descr[0]._delta).equals(123);
            });
        }
      }, {
        name: 'appelle la méthode "update" avec la liste des modules en paramètres',
        descr: [{
          name: 'a',
          update: function(delta, modMap) {
            this._modMap = modMap;
          }
        }, {
          name: 'b',
          update: function(delta, modMap) {
            this._modMap = modMap;
          }
        }],
        check: function(loop) {
          const moduleMap = {
            a: {
              module: this.descr[0],
              rank: 0
            },
            b: {
              module: this.descr[1],
              rank: 1
            }
          };
          return loop.iterate(123)
            .then(() => {
              expect(this.descr[0]._modMap).deep.equals(moduleMap);
              expect(this.descr[1]._modMap).deep.equals(moduleMap);
            });
        }
      }, {
        name: 'appelle la méthode "update" des modules dans l\'ordre',
        descr: [{
          name: 'a'
        }, {
          name: 'b'
        }],
        check: function(loop) {
          const calls = [];

          function update() {
            return delayPromise(10)
              .then(() => {
                calls.push(this);
              });
          }

          this.descr.forEach((d) => {
            d.update = update;
          });

          return loop.iterate(123)
            .then(() => {
              expect(calls).have.lengthOf(2);
              expect(calls).deep.equals(this.descr);
            });
        }
      }];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const loop = new GameLoop();
          const check = t.check.bind(t, loop);

          expect(loop.modules).to.be.empty;
          loop.init(t.descr)
            .then(check)
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });

    describe('Fonction "quit"', () => {
      it('existe', () => {
        const loop = new GameLoop();
        expect(loop).respondTo('quit');
      });

      const tests = [{
        name: 'appelle la méthode "destroy" des modules',
        descr: [{
          destroy: function() {
            return delayPromise(10).then(() => {
              this._destroy = true;
            });
          }
        }],
        check: function(loop) {
          return loop.quit()
            .then(() => {
              expect(this.descr[0]._destroy).to.be.true;
            });
        }
      }, {
        name: 'appelle la méthode "destroy" avec la liste des modules en paramètres',
        descr: [{
          name: 'a',
          destroy: function(modMap) {
            this._modMap = modMap;
          }
        }, {
          name: 'b',
          destroy: function(modMap) {
            this._modMap = modMap;
          }
        }],
        check: function(loop) {
          const moduleMap = {
            a: {
              module: this.descr[0],
              rank: 0
            },
            b: {
              module: this.descr[1],
              rank: 1
            }
          };
          return loop.quit()
            .then(() => {
              expect(this.descr[0]._modMap).deep.equals(moduleMap);
              expect(this.descr[1]._modMap).deep.equals(moduleMap);
            });
        }
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const loop = new GameLoop();
          const check = t.check.bind(t, loop);

          expect(loop.modules).to.be.empty;
          loop.init(t.descr)
            .then(check)
            .then(() => {
              expect(loop).property('modules');
              expect(loop.modules).an('object');
              expect(loop.modules).to.be.empty;
              done();
            })
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });
  });
});
