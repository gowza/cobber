'use strict';

const WebSocketServer = require('websocket').server;
const http = require('http');
const uuid = require('node-uuid');
const Task = require('./Class/Task');

let connections = [];
let tasks = {};

const server = http.createServer((req, res) => {
  console.log(`${new Date()} Received request for ${req.url}`);
  res.writeHead(404);
  res.end();
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

  send({
    type: 'tasks',
    message: tasks
  });

  console.log(`${new Date()} Connection accepted.`);
  console.log(connection.remoteAddress);

  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      let data;

      console.log(`${new Date()} ${connection.id} ${message.utf8Data}`);

      try {
        data = JSON.parse(message.utf8Data);
      } catch (e) {
        console.log(`ERROR: Invalid message from client.`);
        return;
      }

      if (/^(add|take|release|complete)/.test(data.type)) {
        let task;
        let type = 'update';

        try {
          switch(data.type) {
            case 'add':
              task = new Task(data.value, connection.id);
              tasks[task.id] = task;
              type = 'add';
              break;
            case 'take':
              task = tasks[data.value];
              task.takeBy(connection.id);
              break;
            case 'release':
              task = tasks[data.value];
              task.releaseBy(connection.id);
              break;
            case 'complete':
              task = tasks[data.value];
              task.completeBy(connection.id);
              break;
          }

          broadcast({
            type: type,
            id: task.id,
            task: task
          });
        } catch (e) {
          send({
            type: 'error',
            message: e
          });
        }
      }
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
  });
});

//setInterval(() => {
//  broadcast({
//    type: 'time',
//    message: (new Date()).toString()
//  });
//}, 5e3);

function broadcast(messageObj) {
  const message = JSON.stringify(messageObj);

  Object.keys(connections).forEach((key) => {
    if (messageObj.type === 'message' && messageObj.sender === key) {
      return;
    }

    connections[key].sendUTF(message);
  });
}