'use strict';

const expect = require('chai').expect;
const WebSocket = require('../websocket');
const WSPlugin = require('ws');
const HttpServer = require('../httpserver');

describe('WebSocket', () => {
  const TestPort = 13465;

  it('peut être instancié', () => {
    const ws = new WebSocket(new HttpServer());
    expect(ws).instanceof(WebSocket);
  });

  [
    'onConnection',
    'onMessage',
    'onClose',
  ].forEach((propName) => {
    it('possède la propriété d\'événement "' + propName + '"', () => {
      const ws = new WebSocket(new HttpServer());
      expect(ws).property(propName);

      function onEvent() {}
      ws[propName] = onEvent;
      expect(ws[propName]).equals(onEvent);
    });
  });

  describe('Réponds aux requêtes', () => {
    function query(uri) {
      return new Promise((resolve, reject) => {
        const req = new WSPlugin('ws://localhost:' + TestPort + '/' + uri);
        req.on('open', () => {
          resolve(req);
        });
        req.on('error', reject);
      });
    }

    const tests = [{
      name: '"onConnection" est déclenché lors d\'une nouvelle connexion, et l\'objet de connexion supporte les méthodes et propriétés nécessaires',
      uri: 'test',
      setup: function() {
        webSocket.onConnection = (connection) => {
          this._connection = connection;
        };
        return Promise.resolve();
      },
      check: function() {
        expect(this._connection).to.exist;
        expect(this._connection).respondTo('send');
        expect(this._connection).respondTo('close');
        expect(this._connection).property('id');
        expect(this._connection.id).not.null;
        return Promise.resolve();
      },
    }, {
      name: 'supporte plusieurs connexions',
      uri: 'test',
      setup: function() {
        this._connections = [];
        webSocket.onConnection = (connection) => {
          this._connections.push(connection);
        };
        return Promise.resolve();
      },
      check: function() {
        return query(this.uri)
          .then(() => {
            expect(this._connections).have.lengthOf(2);
            expect(this._connections[0]).not.null;
            expect(this._connections[1]).not.null;
            expect(this._connections[0]).not.equals(this._connections[1]);
            expect(this._connections[0].id).not.equals(this._connections[1].id);
          });
      },
    }, {
      name: '"onClose" est déclenché lors de la fermeture d\'une connexion',
      uri: 'test',
      setup: function() {
        webSocket.onConnection = (connection) => {
          this._connection = connection;
        };
        webSocket.onClose = (connection, evt) => {
          this._closeConnection = connection;
          this._closeEvt = evt;
          this._closeResolve();
        };
        return Promise.resolve();
      },
      check: function(req) {
        const p = new Promise((resolve) => {
          this._closeResolve = resolve;
        });
        req.close();
        return p.then(() => {
          expect(this._connection).to.exist;
          expect(this._closeConnection).equals(this._connection);
          expect(this._closeEvt).not.null;
        });
      },
    }, {
      name: '"onMessage" est déclenché lors de la réception d\'un message',
      uri: 'test',
      setup: function() {
        webSocket.onConnection = (connection) => {
          this._connection = connection;
        };
        webSocket.onMessage = (connection, evt) => {
          this._msgConnection = connection;
          this._msgEvt = evt;
          this._msgResolve();
        };
        return Promise.resolve();
      },
      check: function(req) {
        const p = new Promise((resolve) => {
          this._msgResolve = resolve;
        });
        req.send('something');
        return p.then(() => {
          expect(this._connection).to.exist;
          expect(this._msgConnection).equals(this._connection);
          expect(this._msgEvt).property('data');
          expect(this._msgEvt.data).equals('something');
        });
      },
    }, ];

    let server = undefined;
    let webSocket = undefined;
    beforeEach(() => {
      server = new HttpServer();
      webSocket = new WebSocket(server);
      return server.listen(TestPort);
    });
    afterEach(() => {
      webSocket.close();
      const p = server.close();
      server = undefined;
      webSocket = undefined;
      return p;
    });

    tests.forEach((t) => {
      it(t.name, (done) => {
        const setup = (t.setup || Promise.resolve).bind(t);
        const check = t.check.bind(t);

        setup()
          .then(() => {
            return query(t.uri);
          })
          .then(check)
          .then(done)
          .catch((err) => {
            done(err || new Error('Erreur'));
          });
      });
    });
  });
});
