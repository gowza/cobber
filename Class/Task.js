'use strict';

const uuid = require('node-uuid');

class Task {
  constructor(name, userId) {
    this.id = uuid.v4();
    this.name = name;

    this.type = 'available';
    this.lastAction = 'add';
    this.modifiedBy = userId;
    this.modifiedBy = userId;
  }

  takeBy(userId) {
    if (this.type !== 'available') {
      throw 'taskNotAvailable';
    }

    this.type = 'taken';
    this.lastAction = 'take';
    this.modifiedBy = userId;
  }

  releaseBy(userId) {
    if (this.modifiedBy !== userId || this.type !== 'taken') {
      throw 'taskNotTakeByUser';
    }

    this.type = 'available';
    this.lastAction = 'release';
    this.modifiedBy = userId;
  }

  completeBy(userId) {
    if (this.modifiedBy !== userId || this.type !== 'taken') {
      throw 'taskNotTakeByUser';
    }

    this.type = 'completed';
    this.lastAction = 'complete';
    this.modifiedBy = userId;
  }
}

module.exports = Task;
