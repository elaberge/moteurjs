define(['utils', 'gameloop'], (utils, GameLoop) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Boucle', () => {
    it('peut être instanciée', () => {
      let loop = new GameLoop();
      expect(loop).instanceof(GameLoop);
    });

    it('possède les fonctions et propriétés nécessaires', () => {
      let loop = new GameLoop();
      expect(loop).property('modules');
      expect(loop.modules).an('object');
      expect(loop.modules).to.be.empty;
      expect(loop).respondTo('init');
      expect(loop).respondTo('iterate');
      expect(loop).respondTo('quit');
    });

    it('fonction init configure correctement les modules', (done) => {
      let mod1 = {
        name: 'a',
        load: function(modMap) {
          expect(modMap).deep.equal(moduleMap);
          return delayPromise(10).then(() => {
            this._load = true;
          });
        },
        init: function(modMap) {
          expect(modMap).deep.equal(moduleMap);
          expect(mod1._load).to.be.true;
          expect(mod2._load).to.be.true;
          return delayPromise(10).then(() => {
            this._init = true;
          });
        },
      };
      let mod2 = {
        name: 'b',
        load: function(modMap) {
          expect(modMap).deep.equal(moduleMap);
          return delayPromise(10).then(() => {
            this._load = true;
          });
        },
        init: function(modMap) {
          expect(modMap).deep.equal(moduleMap);
          expect(mod1._load).to.be.true;
          expect(mod2._load).to.be.true;
          return delayPromise(10).then(() => {
            this._init = true;
          });
        },
      };
      let moduleMap = {
        a: {
          module: mod1,
          rank: 0
        },
        b: {
          module: mod2,
          rank: 1
        }
      };

      let loop = new GameLoop();
      expect(loop.modules).to.be.empty;
      loop.init([mod1, mod2])
        .then(() => {
          expect(loop.modules).to.exist;
          expect(loop.modules).an('object');
          expect(loop.modules).deep.equal(moduleMap);
          expect(mod1._load).to.be.true;
          expect(mod2._load).to.be.true;
          expect(mod1._init).to.be.true;
          expect(mod2._init).to.be.true;
          done();
        })
        .catch(done);
    });

    it('fonction iterate appelle tous les modules dans l\'ordre', (done) => {
      let calls = [];

      let mod1 = {
        name: 'a',
        update: function(modMap) {
          expect(modMap).deep.equal(moduleMap);
          calls.push(this);
          return delayPromise(10).then(() => {
            this._update = true;
          });
        }
      };
      let mod2 = {
        name: 'b',
        update: function(modMap) {
          expect(modMap).deep.equal(moduleMap);
          calls.push(this);
          return delayPromise(10).then(() => {
            this._update = true;
          });
        }
      };
      let moduleMap = {
        a: {
          module: mod1,
          rank: 0
        },
        b: {
          module: mod2,
          rank: 1
        }
      };

      let loop = new GameLoop();
      expect(loop.modules).to.be.empty;
      loop.init([mod1, mod2])
        .then(() => {
          return loop.iterate();
        })
        .then(() => {
          expect(mod1._update).to.be.true;
          expect(mod2._update).to.be.true;
          expect(calls).length(2);
          expect(calls[0]).equals(mod1);
          expect(calls[1]).equals(mod2);
          done();
        })
        .catch(done);
    });

    it('fonction quit termine les modules', (done) => {
      let mod1 = {
        name: 'a',
        destroy: function(modMap) {
          expect(modMap).deep.equal(moduleMap);
          return delayPromise(10).then(() => {
            this._destroy = true;
          });
        }
      };
      let mod2 = {
        name: 'b',
        destroy: function(modMap) {
          expect(modMap).deep.equal(moduleMap);
          return delayPromise(10).then(() => {
            this._destroy = true;
          });
        }
      };
      let moduleMap = {
        a: {
          module: mod1,
          rank: 0
        },
        b: {
          module: mod2,
          rank: 1
        }
      };

      let loop = new GameLoop();
      expect(loop.modules).to.be.empty;
      loop.init([mod1, mod2])
        .then(() => {
          return loop.quit();
        })
        .then(() => {
          expect(loop).property('modules');
          expect(loop.modules).an('object');
          expect(loop.modules).to.be.empty;
          expect(mod1._destroy).to.be.true;
          expect(mod2._destroy).to.be.true;
          done();
        })
        .catch(done);
    });
  });
});
