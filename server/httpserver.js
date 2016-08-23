'use strict';

module.exports = function() {
  const http = require('http');

  const methodHandlers = {};

  function onRequest(req, res) {
    const handlers = methodHandlers[req.method] || [];
    let p = Promise.reject();
    handlers.forEach((h) => {
      p = p.catch(() => {
        return h(req, res);
      });
    });

    return p.catch(() => {
      res.statusCode = 404;
      res.end();
    });
  }

  const server = http.createServer(onRequest);

  this.registerRequestHandler = function(method, handler) {
    if (!methodHandlers[method]) {
      methodHandlers[method] = [];
    }

    methodHandlers[method].push(handler);
  };

  this.listen = function(port) {
    return new Promise((resolve) => {
      server.listen(port, resolve);
    });
  };

  this.close = function() {
    return new Promise((resolve) => {
      server.close(resolve);
    });
  };

  Object.defineProperty(this, 'server', {
    enumerable: true,
    value: server,
  });
};
