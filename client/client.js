'use strict';
const statusMessage = document.getElementById('statusMessage');
const messageList = document.getElementById('messageList');
const connectBtn = document.getElementById('connectBtn')
const disconnectBtn = document.getElementById('disconnectBtn')
const commandForm = document.getElementById('commandForm');

let socket;

function createSocket () {
  socket = new WebSocket('ws://localhost:8080', 'echo-protocol');
  socket.onopen = () => {
    console.log('Connected.');
    statusMessage.textContent = 'Connected';

    socket.onmessage = (event) => {
      if (!event.data) {
        return;
      }

      let data = JSON.parse(event.data);

      switch (data.type) {
        case "connectionId":
          socket.connectionId = data.message;
          statusMessage.textContent += ' with connection ID ' + socket.connectionId;
          break;
        case "add":
          addTask(data.id, data.message);
          break;
        case "tasks":
          let tasks = data.message;
          Object.keys(tasks).forEach((id) => {
            addTask(id, tasks[id]);
          });
          break;
        default:
          console.log(event.data);
      }
    }

    socket.onclose = () => {
      console.log('Disconnected.');
      statusMessage.textContent = 'Disconnected';
    }
  };
}

connectBtn.onclick = () => {
  if (!socket || socket.readyState >= 2) {
    createSocket();
  }
};

disconnectBtn.onclick = () => {
  if (socket && socket.readyState < 2) {
    socket.close();
  }
};

function addTask(id, task) {
  let newMessageItem = document.createElement('li');
  newMessageItem.textContent = task;
  newMessageItem.setAttribute('id', id);
  messageList.appendChild(newMessageItem);
}

function sendCommand(commandTxt) {
  if (!commandTxt) {
    return;
  }

  let commandObj = {
    type: 'add',
    message: commandTxt
  };

  if (socket) {
    socket.send(JSON.stringify(commandObj));
  }
}
