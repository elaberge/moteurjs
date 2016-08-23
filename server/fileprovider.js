'use strict';

module.exports = function(root, server) {
  const fs = require('fs');
  const path = require('path');

  if (!root) {
    throw new Error('La racine des fichiers doit être spécifiée!');
  }

  if (!server) {
    throw new Error('Le serveur doit être spécifié!');
  }

  function fsStat(filePath) {
    return new Promise((resolve, reject) => {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          return reject(err);
        }
        resolve(stats);
      });
    });
  }

  function onGetRequest(req, res) {
    let url = req.url.split(/[?#]/)[0];
    if (url.slice(-1) === '/') {
      url += 'index.html';
    }

    const filePath = path.join(root, url);
    return fsStat(filePath)
      .then((stat) => {
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Cache-Control', 'max-age=-1');
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
      });
  }

  server.registerRequestHandler('GET', onGetRequest);
};
