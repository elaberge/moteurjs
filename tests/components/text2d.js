define(['testutils', 'components/text2d'], (utils, TextComponent) => {
  'use strict';

  const expect = utils.expect;
  const callLog = utils.callLog;

  describe('Composant "Text2D"', () => {
    function createContext(log) {
      log = log || [];

      const canvas = document.createElement('canvas');
      return callLog(canvas.getContext('2d'), log);
    }

    describe('Fonction "create"', () => {
      it('existe', () => {
        expect(TextComponent).respondTo('create');
      });

      it('assigne la propriété "owner"', (done) => {
        const obj = {
          a: 123
        };
        TextComponent.create(null, obj)
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

    it('possède la propriété "text"', (done) => {
      const descr = {
        text: 'test',
      };
      let textComp = undefined;
      TextComponent.create()
        .then((comp) => {
          textComp = comp;
          return comp.onLoad(descr);
        })
        .then(() => {
          expect(textComp).property('text');
          expect(textComp.text).equals(descr.text);
          done();
        })
        .catch((err) => {
          done(err || new Error('Erreur'));
        });
    });

    it('peut assigner la propriété "text"', (done) => {
      const descr = {
        text: 'test',
      };
      let textComp = undefined;
      TextComponent.create()
        .then((comp) => {
          textComp = comp;
          return comp.onLoad({});
        })
        .then(() => {
          expect(textComp).property('text');
          expect(textComp.text).not.equals(descr.text);
          textComp.text = descr.text;
          expect(textComp.text).equals(descr.text);
          done();
        })
        .catch((err) => {
          done(err || new Error('Erreur'));
        });
    });

    describe('Fonction "display"', () => {
      it('existe', (done) => {
        TextComponent.create()
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
        name: 'align',
        native: 'textAlign',
        val: 'right',
      }, {
        name: 'baseline',
        native: 'textBaseline',
        val: 'top',
      }, {
        name: 'font',
        native: 'font',
        val: 'sans-serif',
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
        }, ],
      }, {
        name: 'dessine un texte rempli',
        descr: {
          fill: '#f00',
          text: 'patate',
        },
        log: [{
          t: 'set',
          p: 'fillStyle',
          v: '#f00',
        }, {
          t: 'call',
          p: 'fillText',
          a: ['patate', 0, 0],
        }],
      }, {
        name: 'dessine un texte vide',
        descr: {
          stroke: '#00f',
          text: 'patate',
        },
        log: [{
          t: 'set',
          p: 'strokeStyle',
          v: '#00f',
        }, {
          t: 'call',
          p: 'strokeText',
          a: ['patate', 0, 0],
        }],
      }, {
        name: 'converti la valeur en chaîne de caractères',
        descr: {
          stroke: '#00f',
          text: 1234,
        },
        log: [{
          t: 'set',
          p: 'strokeStyle',
          v: '#00f',
        }, {
          t: 'call',
          p: 'strokeText',
          a: ['1234', 0, 0],
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
          let textComp = undefined;

          TextComponent.create(null, t.obj)
            .then((comp) => {
              textComp = comp;
              return textComp.onLoad(t.descr);
            })
            .then(() => {
              return textComp.display(0, ctx);
            })
            .then(() => {
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
