'use strict';

module.exports = function(httpServer) {
  if (!httpServer) {
    throw new Error('Le serveur doit être spécifié!');
  }

  let nextId = 1;
  let onConnection = function() {};
  let onMessage = function() {};
  let onClose = function() {};

  const WSPlugin = require('ws');
  const wsServer = new WSPlugin.Server({
    server: httpServer.server,
  });

  wsServer.on('connection', (socket) => {
    Object.defineProperty(socket, 'id', {
      enumerable: true,
      value: nextId++,
    });
    socket.onmessage = (evt) => {
      onMessage(socket, evt);
    };
    socket.onclose = (evt) => {
      onClose(socket, evt);
    };
    onConnection(socket);
  });

  this.close = function() {
    wsServer.close();
  };

  Object.defineProperty(this, 'onConnection', {
    enumerable: true,
    get: function() {
      return onConnection;
    },
    set: function(handler) {
      onConnection = handler;
    },
  });

  Object.defineProperty(this, 'onMessage', {
    enumerable: true,
    get: function() {
      return onMessage;
    },
    set: function(handler) {
      onMessage = handler;
    },
  });

  Object.defineProperty(this, 'onClose', {
    enumerable: true,
    get: function() {
      return onClose;
    },
    set: function(handler) {
      onClose = handler;
    },
  });
};
