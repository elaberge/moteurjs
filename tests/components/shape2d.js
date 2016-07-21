define(['testutils', 'components/shape2d'], (utils, ShapeComponent) => {
  'use strict';

  const expect = utils.expect;
  const callLog = utils.callLog;

  describe('Composant "Shape2D"', () => {
    function createContext(log) {
      log = log || [];

      const canvas = document.createElement('canvas');
      return callLog(canvas.getContext('2d'), log);
    }

    describe('Fonction "create"', () => {
      it('existe', () => {
        expect(ShapeComponent).respondTo('create');
      });

      it('assigne la propriété "owner"', (done) => {
        const obj = {
          a: 123
        };
        ShapeComponent.create(null, obj)
          .then((comp) => {
            expect(comp).property('owner');
            expect(comp.owner).equals(obj);
            done();
          })
          .catch((err) => {
            done(err || new Error('Erreur'));
          });
      });
    });

    describe('Fonction "display"', () => {
      it('existe', (done) => {
        ShapeComponent.create()
          .then((comp) => {
            expect(comp).respondTo('display');
            done();
          })
          .catch((err) => {
            done(err || new Error('Erreur'));
          });
      });

      const propertyTests = [{
        name: 'fill',
        native: 'fillStyle',
        val: '#f00',
      }, {
        name: 'stroke',
        native: 'strokeStyle',
        val: '#00f',
      }, {
        name: 'lineWidth',
        native: 'lineWidth',
        val: 4,
      }, {
        name: 'lineDash',
        native: 'lineDash',
        val: [16, 4],
      }, ];

      const tests = [{
        name: 'applique une transformation initiale',
        obj: {
          transform: {
            x: 123,
            y: 456,
          },
        },
        log: [{
          t: 'call',
          p: 'translate',
          a: [123, 456],
        }],
      }, {
        name: 'dessine un chemin SVG rempli',
        descr: {
          fill: '#f00',
          path: 'm 1,2 h 3 v 4',
        },
        logFilter: function(log) {
          expect(log[1].a).have.lengthOf(1);
          expect(log[1].a[0]).instanceOf(Path2D);
          this.log[1].a[0] = log[1].a[0];
        },
        log: [{
          t: 'set',
          p: 'fillStyle',
          v: '#f00',
        }, {
          t: 'call',
          p: 'fill',
          a: [],
        }],
      }, {
        name: 'dessine un chemin SVG vide',
        descr: {
          stroke: '#00f',
          path: 'm 1,2 h 3 v 4',
        },
        logFilter: function(log) {
          expect(log[1].a).have.lengthOf(1);
          expect(log[1].a[0]).instanceOf(Path2D);
          this.log[1].a[0] = log[1].a[0];
        },
        log: [{
          t: 'set',
          p: 'strokeStyle',
          v: '#00f',
        }, {
          t: 'call',
          p: 'stroke',
          a: [],
        }],
      }];

      propertyTests.forEach((t) => {
        const testConf = {
          name: 'configure la propriété "' + t.name + '"',
          log: [{
            t: 'set',
            p: t.native,
            v: t.val,
          }],
          descr: {},
        };
        testConf.descr[t.name] = t.val;
        tests.push(testConf);
      });

      tests.forEach((t) => {
        t.obj = t.obj || {};
        t.descr = t.descr || {};

        it(t.name, (done) => {
          const log = [];
          const ctx = createContext(log);
          let shapeComp = undefined;

          ShapeComponent.create(null, t.obj)
            .then((comp) => {
              shapeComp = comp;
              return shapeComp.onLoad(t.descr);
            })
            .then(() => {
              return shapeComp.display(0, ctx);
            })
            .then(() => {
              if (t.logFilter) {
                t.logFilter(log);
              }
              expect(log).deep.equals(t.log);
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
