'use strict';

const PORT = 8081;

const HttpServer = require('../httpserver');
const FileProvider = require('../fileprovider');
const WebSocket = require('../websocket');

const server = new HttpServer();
new FileProvider(__dirname, server);
const ws = new WebSocket(server);

ws.onConnection = function(connection) {
  console.log('Nouvelle connexion de ' + connection.id);
  setTimeout(()=>connection.send('Message!'), 3000);
};

ws.onMessage = function(connection, evt) {
  console.log('Message de ' + connection.id, evt.data);
};

ws.onClose = function(connection, evt) {
  console.log('Fermeture de ' + connection.id, evt.reason);
};

server.listen(PORT)
  .then(() => {
    console.log('HTTP server ready on port ' + PORT);
  });
