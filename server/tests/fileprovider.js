'use strict';

const path = require('path');
const fs = require('fs');
const expect = require('chai').expect;
const FileProvider = require('../fileprovider');

describe('FileProvider', () => {
  it('peut être instancié', () => {
    const fp = new FileProvider(__dirname, {
      registerRequestHandler: () => {}
    });
    expect(fp).instanceof(FileProvider);
  });

  it('s\'enregistre auprès du serveur', () => {
    let registered = undefined;

    const mockServer = {
      registerRequestHandler: function(method, handler) {
        registered = {
          m: method,
          h: handler
        };
      },
    };

    new FileProvider(__dirname, mockServer);
    expect(registered).to.exist;
    expect(registered.m).equals('GET');
    expect(registered.h).a('function');
  });

  describe('Gère correctement les requêtes', () => {
    const tests = [{
      name: 'renvoie le contenu d\'un fichier valide et configure ses entêtes',
      req: {
        url: '/' + path.basename(__filename) + '?param=123#456',
      },
      check: function(headers, bufArray, p) {
        const fileContent = fs.readFileSync(__filename);

        return p.then(() => {
          expect(headers).property('Content-Length');
          expect(headers['Content-Length']).equals(fileContent.length);
          const bufData = Buffer.concat(bufArray);
          expect(bufData.toString('utf8')).equals(fileContent.toString('utf8'));
        });
      },
    }, {
      name: 'charge le fichier index.html si le chemin est vide',
      req: {
        url: '/',
      },
      check: function(headers, bufArray, p) {
        const fileContent = fs.readFileSync(path.join(__dirname, 'index.html'));

        return p.then(() => {
          expect(headers).property('Content-Length');
          expect(headers['Content-Length']).equals(fileContent.length);
          const bufData = Buffer.concat(bufArray);
          expect(bufData.toString('utf8')).equals(fileContent.toString('utf8'));
        });
      },
    }, {
      name: 'charge le fichier index.html d\'un dossier si le chemin se termine par un /',
      root: path.join(__dirname, '..'),
      req: {
        url: '/tests/',
      },
      check: function(headers, bufArray, p) {
        const fileContent = fs.readFileSync(path.join(__dirname, 'index.html'));

        return p.then(() => {
          expect(headers).property('Content-Length');
          expect(headers['Content-Length']).equals(fileContent.length);
          const bufData = Buffer.concat(bufArray);
          expect(bufData.toString('utf8')).equals(fileContent.toString('utf8'));
        });
      },
    }, ];

    tests.forEach((t) => {
      it(t.name, (done) => {
        let reqHandler = undefined;
        const mockServer = {
          registerRequestHandler: function(method, handler) {
            reqHandler = handler;
          },
        };

        const headers = {};
        const bufArray = [];

        const res = new require('stream').Writable({
          write(chunk, encoding, callback) {
            bufArray.push(chunk);
            callback();
          },
        });
        res.setHeader = function(key, val) {
          headers[key] = val;
        };

        new FileProvider(t.root || __dirname, mockServer);
        const reqP = reqHandler(t.req, res)
          .then(() => {
            return new Promise((resolve, reject) => {
              res.on('finish', resolve);
              res.on('error', reject);
            });
          });

        t.check(headers, bufArray, reqP)
          .then(done)
          .catch((err) => {
            done(err || new Error('Erreur'));
          });
      });
    });
  });
});
