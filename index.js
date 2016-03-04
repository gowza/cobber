'use strict';

const WebSocketServer = require('websocket').server;
const http = require('http');
const uuid = require('node-uuid');

let connections = [];

const server = http.createServer((request, response) => {
  console.log(`${new Date()} Received request for ${request.url}`);
  response.writeHead(404);
  response.end();
});

server.listen(8080, () => {
  console.log(`${new Date()} Server is listening on port 8080`);
});

const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

wsServer.on('request', (request) => {
  let connection = request.accept('echo-protocol', request.origin);
  connection.id = uuid.v4();

  function send(messageObj) {
    connection.sendUTF(JSON.stringify(messageObj));
  }

  connections[connection.id] = connection;
  send({
    type: 'connectionId',
    message: connection.id
  });

  console.log(`${new Date()} Connection accepted.`);
  console.log(connection.remoteAddress);

  connection.on('message', (message) => {
    if (message.type === 'utf8') {
        console.log(`${new Date()} ${connection.id} ${message.utf8Data}`);

        broadcast({
          type: 'message',
          message: message.utf8Data,
          sender: connection.id
        });
    }
  });

  connection.on('close', (reasonCode, description) => {
    Object.keys(connections).forEach((key) => {
      if (connections[key] === connection) {
        delete connections[key];
      }
    });

    console.log(Object.keys(connections));
    console.log(`${new Date()} Peer ${connection.remoteAddress} disconnected.`);
  })
});

setInterval(() => {
  broadcast({
    type: 'time',
    message: (new Date()).toString()
  });
}, 5e3);

function broadcast(messageObj) {
  const message = JSON.stringify(messageObj);

  Object.keys(connections).forEach((key) => {
    if (messageObj.type === 'message' && messageObj.sender === key) {
      return;
    }

    connections[key].sendUTF(message);
  });
}
