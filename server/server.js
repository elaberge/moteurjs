'use strict';

const PORT = 8081;

const HttpServer = require('./httpserver');
const FileProvider = require('./fileprovider');
const WebSocket = require('./websocket');

const server = new HttpServer();
new FileProvider(__dirname, server);
const ws = new WebSocket(server);

ws.onConnection = function(connection) {
  console.log('Nouvelle connexion de ' + connection.id);
};

ws.onMessage = function(connection, evt) {
  console.log('Message de ' + connection.id, evt);
};

ws.onClose = function(connection, evt) {
  console.log('Fermeture de ' + connection.id, evt);
};

server.listen(PORT)
  .then(() => {
    console.log('HTTP server ready on port ' + PORT);
  });
