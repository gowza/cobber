'use strict';
const statusMessage = document.getElementById('statusMessage');
const messageList = document.getElementById('messageList');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const commandForm = document.getElementById('commandForm');

let socket = {
  ws: null,
  open() {
    if (this.ws) {
      console.log('Already connected.');
      return;
    }

    let socket = this.ws = new WebSocket('ws://localhost:8080', 'echo-protocol');

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
          case "error":
            statusMessage.textContent = data.message;
            break;
          case "add":
            taskList.add(data.id, data.task);
            break;
          case "update":
            taskList.update(data.id, data.task);
            break;
          case "tasks":
            let tasks = data.message;
            Object.keys(tasks).forEach((id) => {
              taskList.add(id, tasks[id]);
            });
            break;
          default:
            console.log(event.data);
        }
      };

      socket.onclose = () => {
        taskList.clear();
        console.log('Disconnected.');
        statusMessage.textContent = 'Disconnected';
        this.ws = null;
      }
    };
  },
  close() {
    if (!this.ws) {
      console.log('Already disconnected.');
      return;
    }

    this.ws.close();
  },
  send(command, value) {
    if (!value) {
      return;
    }

    let commandObj = {
      type: command,
      value: value
    };

    if (this.ws) {
      this.ws.send(JSON.stringify(commandObj));
    }
  }
};

class Task {
  constructor(id, task) {
    const item = document.createElement('li');
    const name = document.createElement('span');
    const take = document.createElement('a');
    const release = document.createElement('a');
    const complete = document.createElement('a');
    const description = document.createElement('div');

    item.setAttribute('id', id);

    name.textContent = task.name;

    take.textContent = 'Take';
    take.setAttribute('href', '#');
    take.onclick = (event) => {
      event.preventDefault();
      socket.send('take', id);
    };

    release.textContent = 'Release';
    release.setAttribute('href', '#');
    release.onclick = (event) => {
      event.preventDefault();
      socket.send('release', id);
    };

    complete.textContent = 'Complete';
    complete.setAttribute('href', '#');
    complete.onclick = (event) => {
      event.preventDefault();
      socket.send('complete', id);
    };

    item.appendChild(name);
    item.appendChild(complete);
    item.appendChild(release);
    item.appendChild(take);
    item.appendChild(description);

    messageList.appendChild(item);

    this.item = item;
    this.description = description;
  }

  update(task) {
    switch (task.lastAction) {
      case 'add':
        this.description.textContent = 'Added by ' + task.modifiedBy;
        this.item.className = 'available';
        break;
      case 'take':
        this.description.textContent = 'Taken by ' + task.modifiedBy;
        this.item.className = socket.ws.connectionId === task.modifiedBy ? 'taken-by-me' : 'taken';
        break;
      case 'release':
        this.description.textContent = 'Taken by ' + task.modifiedBy;
        this.item.className = 'available';
        break;
      case 'complete':
        this.description.textContent = 'Completed by ' + task.modifiedBy;
        this.item.className = 'completed';
        break;
      case 'archive':
        this.description.textContent = 'Archived';
        this.item.className = 'archived';
        break;
    }
  }
}

let taskList = {
  add(id, task) {
    this[id] = new Task(id, task);
    this[id].update(task);
  },
  update(id, task) {
    this[id].update(task);
  },
  clear() {
    while (messageList.firstChild) {
      messageList.removeChild(messageList.firstChild);
    }
  }
};

connectBtn.onclick = () => {
  socket.open();
};

disconnectBtn.onclick = () => {
  socket.close();
};

// Submit Task
commandForm.onsubmit = (event) => {
  event.preventDefault();
  socket.send('add', event.target.firstElementChild.value);
  commandForm.reset();
};
