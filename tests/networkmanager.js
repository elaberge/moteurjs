define([
  'testutils',
  'objectfactory',
  'scenemanager',
  'networkmanager',
], (
  utils,
  ObjectFactory,
  SceneManager,
  NetworkManager
) => {
  'use strict';

  const expect = utils.expect;
  const delayPromise = utils.delayPromise;

  describe('Gestionnaire de réseau', () => {
    const componentTemplate = () => {
      return {
        create: function(sceneManager, owner, descr) {
          return delayPromise(10)
            .then(() => {
              return {
                d: descr,
                onNetworkMessage: descr.onNetworkMessage,
              };
            });
        }
      };
    };

    define('components/test-network', [], componentTemplate);
    define('components/test-network2', [], componentTemplate);

    it('peut être instancié', () => {
      const mgr = new NetworkManager({});
      expect(mgr).instanceof(NetworkManager);
    });

    it('a un nom', () => {
      const mgr = new NetworkManager({});
      expect(mgr).property('name');
      expect(mgr.name).equal('network');
    });

    describe('Fonction "connect"', () => {
      it('existe', () => {
        const mgr = new NetworkManager({});
        expect(mgr).respondTo('connect');
      });

      const tests = [{
        name: 'renvoie une promesse avec un objet représentant la connexion réseau',
        mock: {
          send: () => {},
          close: () => {},
          create: function(url) {
            expect(url).equals('dummy');
            return this;
          },
          exec: function() {
            this.onopen();
          },
        },
        check: function(p) {
          return p.then((conn) => {
            expect(conn).an('object');
            expect(conn).respondTo('send');
            expect(conn).respondTo('close');
          });
        },
      }, {
        name: 'renvoie une promesse qui échoue en cas d\'échec de connexion',
        mock: {
          send: () => {
            throw new Error('Ne devrait pas passer ici');
          },
          close: () => {
            throw new Error('Ne devrait pas passer ici');
          },
          create: function() {
            return this;
          },
          exec: function() {
            this.onerror();
          },
        },
        check: function(p) {
          let error = undefined;
          return p.then(() => {
              error = new Error('ne devrait pas fonctionner');
            })
            .catch(() => {})
            .then(() => {
              if (error)
                throw error;
            });
        },
      }, {
        name: 'la méthode "send" de la connexion appelle celle du socket',
        mock: {
          send: function() {
            this._send = arguments;
          },
          close: () => {},
          create: function() {
            return this;
          },
          exec: function() {
            this.onopen();
          },
        },
        check: function(p) {
          const data = 'patate';
          return p.then((conn) => {
            conn.send(data);
            expect(this.mock._send).to.exist;
            expect(this.mock._send[0]).equals(data);
          });
        },
      }, {
        name: 'la méthode "close" de la connexion appelle celle du socket',
        mock: {
          send: () => {},
          close: function() {
            this._close = arguments;
          },
          create: function() {
            return this;
          },
          exec: function() {
            this.onopen();
          },
        },
        check: function(p) {
          return p.then((conn) => {
            conn.close();
            expect(this.mock._close).to.exist;
          });
        },
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          const mgr = new SceneManager();
          const networkMgr = new NetworkManager(mgr, t.mock.create.bind(t.mock));

          const connectP = networkMgr.connect('dummy');

          t.mock.exec();

          t.check(connectP)
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });

    describe('Fonction "update"', () => {
      it('existe', () => {
        const mgr = new NetworkManager({});
        expect(mgr).respondTo('update');
      });

      const tests = [{
        name: 'renvoie les événements de messages',
        events: [{
          val: 'first'
        }, {
          val: 'second'
        }, ],
        check: function(mgr, objects) {
          const o1c1 = objects[0].components['test-network'].log;
          const o1c2 = objects[0].components['test-network2'].log;
          const o2c1 = objects[1].components['test-network'].log;
          const o2c2 = objects[1].components['test-network2'].log;
          [o1c1, o1c2, o2c1, o2c2].forEach((log) => {
            const val1 = this.events[0].val;
            const val2 = this.events[1].val;
            expect(log).have.lengthOf(2);
            expect(log[0].val).equals(val1);
            expect(log[1].val).equals(val2);
          });
          return Promise.resolve();
        },
      }, ];

      tests.forEach((t) => {
        it(t.name, (done) => {
          let connection = undefined;

          function objectEvent(data, source) {
            expect(source).equals(connection);
            this.log = this.log || [];
            return delayPromise(10)
              .then(() => {
                this.log.push(data);
              });
          }

          const objDescriptions = [{
            'test-network': {
              onNetworkMessage: objectEvent,
            },
            'test-network2': {
              onNetworkMessage: objectEvent,
            },
          }, {
            'test-network': {
              onNetworkMessage: objectEvent,
            },
            'test-network2': {
              onNetworkMessage: objectEvent,
            },
          }];

          const mockSocket = {
            onerror: () => {},
            onopen: () => {},
            onmessage: () => {},
            send: () => {},
            close: () => {},
            play: function(events) {
              events.forEach((e) => {
                this.onmessage({
                  data: e
                });
              });
            },
            create: function() {
              return mockSocket;
            },
            connect: function() {
              this.onopen();
            },
          };

          const objects = [];

          const mgr = new SceneManager();
          const objFactory = new ObjectFactory(mgr);
          const networkMgr = new NetworkManager(mgr, mockSocket.create);

          let p = Promise.resolve();
          objDescriptions.forEach((descr) => {
            p = p.then(() => {
                return objFactory.create(descr);
              })
              .then((obj) => {
                objects.push(obj);
              });
          });

          p.then(() => {
              expect(objects).have.lengthOf(objDescriptions.length);
              objects.forEach((o) => {
                mgr.addObject(o);
              });
            })
            .then(() => {
              const connectP = networkMgr.connect('dummy');
              mockSocket.connect();
              return connectP;
            })
            .then((newConnection) => {
              connection = newConnection;
              mockSocket.play(t.events);
              return networkMgr.update(123);
            })
            .then(() => {
              return t.check(networkMgr, objects);
            })
            .then(done)
            .catch((err) => {
              done(err || new Error('Erreur'));
            });
        });
      });
    });
  });
});
