'use strict';
const statusMessage = document.getElementById('statusMessage');
const connectBtn = document.getElementById('connectBtn')
const disconnectBtn = document.getElementById('disconnectBtn')
const commandForm = document.getElementById('commandForm');

let socket;

function createSocket () {
  socket = new WebSocket('ws://localhost:8080', 'echo-protocol');
  socket.onopen = () => {
    console.log('Connected.');

    socket.onmessage = (event) => {
      if (!event.data) {
        return;
      }

      let data = JSON.parse(event.data);

      switch (data.type) {
        case "connectionId":
          socket.connectionId = data.message;
          break;
        default:
          console.log(event.data);
      }
    }

    socket.onclose = () => {
      console.log('Disconnected.');
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

function sendCommand(commandTxt) {
  if (!commandTxt) {
    return;
  }

  if (socket) {
    socket.send(commandTxt);
  }
}
