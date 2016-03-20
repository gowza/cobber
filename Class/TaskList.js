'use strict';

class TaskList {
  constructor() {
    this.tasks = new Map();
  }

  add(task) {
    this.tasks.set(task.id, task);
    console.log(this.tasks.values());
  }

  find(id) {
    console.log(id);
    return this.tasks.get(id);
  }

  all() {
    return this.tasks;
  }
  
  allAsObject() {
    let obj = {};
    
    for (let k of this.tasks.keys()) {
      obj[k] = this.tasks.get(k);
    }
    
    return obj;
  }
}

module.exports = TaskList;
