'use strict';

const uuid = require('node-uuid');

/*
 * Status: available ->
 */
class Task {
  constructor(name, userId) {
    this.id = uuid.v4();
    this.name = name;

    this.status = 'available';
    this.modifiedBy = userId;
  }

  take(userId) {
    if (this.status !== 'available') {
      throw 'taskNotAvailable';
    }

    this.status = 'taken';
    this.modifiedBy = userId;
  }

  release(userId) {
    if (this.modifiedBy !== userId || this.status !== 'taken') {
      throw 'taskNotTakeByUser';
    }

    this.status = 'available';
    this.modifiedBy = userId;
  }

  complete(userId) {
    if (this.modifiedBy !== userId || this.status !== 'taken') {
      throw 'taskNotTakeByUser';
    }

    this.status = 'completed';
    this.modifiedBy = userId;
  }

  archive(userId) {
    if (this.status !== 'completed') {
      throw 'taskNotCompleted'
    }

    this.status = 'archived';
    this.modifiedBy = userId;
  }
}

module.exports = Task;
