define(() => {
  'use strict';

  return function(sceneManager, webSocketFactory) {
    if (!sceneManager) {
      throw new Error('sceneManager ne peut être vide!');
    }

    if (!webSocketFactory) {
      webSocketFactory = function() {
        return new(WebSocket.bind.apply(WebSocket, arguments));
      };
    }

    const messages = [];

    this.connect = function(url) {
      return new Promise((resolve, reject) => {
        const socket = webSocketFactory(url);

        const connection = {
          send: function(data) {
            socket.send(data);
          },
          close: function() {
            socket.close();
          },
        };

        const defaultError = socket.onerror;
        socket.onerror = reject;
        socket.onopen = () => {
          socket.onerror = defaultError;
          resolve(connection);
        };
        socket.onmessage = (evt) => {
          messages.push({
            data: evt.data,
            source: connection,
          });
        };
      });
    };

    this.update = function() {
      if (messages.length === 0) {
        return Promise.resolve();
      }

      const sceneObjects = sceneManager.objects;
      const msgCalls = [];

      function updateCompMessages(obj, compName) {
        const comp = obj.components[compName];
        if (!comp) {
          return;
        }
        if (comp.onNetworkMessage) {
          messages.forEach((evt) => {
            msgCalls.push(comp.onNetworkMessage(evt.data, evt.source));
          });
        }
      }

      function updateObjMessages(objId) {
        const obj = sceneObjects[objId];
        const updateObjCompMessages = updateCompMessages.bind(this, obj);
        Object.keys(obj.components).forEach(updateObjCompMessages);
      }

      Object.keys(sceneObjects).forEach(updateObjMessages);
      messages.length = 0;

      return Promise.all(msgCalls);
    };

    Object.defineProperty(this, 'name', {
      enumerable: true,
      value: 'network',
    });
  };
});
