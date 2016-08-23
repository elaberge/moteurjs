'use strict';

const http = require('http');
const expect = require('chai').expect;
const HttpServer = require('../httpserver');

describe('HttpServer', () => {
  const TestPort = 13465;

  it('peut être instancié', () => {
    const server = new HttpServer();
    expect(server).instanceof(HttpServer);
  });

  it('possède la propriété "server" qui renvoie vers un objet serveur Node.js', () => {
    const server = new HttpServer();
    expect(server).property('server');
    expect(server.server).instanceOf(http.Server);
  });

  describe('Fonction "listen"', () => {
    it('existe', () => {
      const server = new HttpServer();
      expect(server).respondTo('listen');
    });
  });

  describe('Fonction "close"', () => {
    it('existe', () => {
      const server = new HttpServer();
      expect(server).respondTo('close');
    });
  });

  describe('Fonction "registerRequestHandler"', () => {
    it('existe', () => {
      const server = new HttpServer();
      expect(server).respondTo('registerRequestHandler');
    });
  });

  describe('Réponds aux requêtes', () => {
    function query(uri) {
      return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:' + TestPort + '/' + uri, resolve);
        req.on('error', reject);
      });
    }

    function readAll(stream) {
      return new Promise((resolve) => {
        const bufArray = [];
        stream.on('data', (d) => {
          bufArray.push(d);
        });
        stream.on('end', () => {
          resolve(Buffer.concat(bufArray));
        });
      });
    }

    const tests = [{
      name: 'Erreur 404 fonctionne',
      uri: 'missing',
      check: function(res) {
        expect(res.statusCode).equals(404);
        return Promise.resolve();
      },
    }, {
      name: 'Enregistre et traite une requête',
      uri: 'test',
      handlers: [{
        method: 'GET',
        fn: function() {
          return Promise.reject();
        },
      }, {
        method: 'GET',
        fn: function(req, res) {
          expect(req.method).equals('GET');
          expect(req.url).equals('/test');
          res.write('bla');
          res.end();
          return Promise.resolve();
        },
      }, {
        method: 'GET',
        fn: function(res) {
          res.write('wrong');
          res.end();
          return Promise.resolve();
        },
      }, ],
      check: function(res) {
        expect(res.statusCode).equals(200);
        return readAll(res)
          .then((data) => {
            expect(data.toString('utf8')).equals('bla');
          });
      },
    }, ];

    let server = undefined;
    beforeEach(() => {
      server = new HttpServer();
      return server.listen(TestPort);
    });
    afterEach(() => {
      const p = server.close();
      server = undefined;
      return p;
    });

    tests.forEach((t) => {
      it(t.name, (done) => {
        t.handlers = t.handlers || [];
        t.handlers.forEach((h) => {
          server.registerRequestHandler(h.method, h.fn.bind(h));
        });

        query(t.uri)
          .then(t.check)
          .then(done)
          .catch((err) => {
            done(err || new Error('Erreur'));
          });
      });
    });
  });
});
