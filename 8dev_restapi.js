'use strict';

const EventEmitter = require('events');
const Client = require('node-rest-client').Client;


class Endpoint extends EventEmitter {
  constructor(service, id) {
    super();

    this.service = service;
    this.id = id;
    this.observations = [];

    this.service.on('async-response', resp => {
      let id = resp['id'];
      let code = resp['status'];
      let data = resp['payload'];

      if (this.observations[id] !== undefined) {
        this.observations[id](code, data);
      }
    });
  }

  getObjects() {
    return new Promise((fulfill, reject) => {
      this.service.get('/endpoints/' + this.id, (data, resp) => {
        if (resp.statusCode == 200) {
          fulfill(data);
        } else {
          reject(resp.statusCode);
        }
      });
    });
  }

  observe(path, callback) {
    return new Promise((fulfill, reject) => {
      this.service.put('/subscriptions/' + this.id + path, (data, resp) => {
        if (resp.statusCode === 202) {
          let id = data['async-response-id'];
          console.log('Observe id', data, id);
          this.observations[id] = callback;
          fulfill(id);
        } else {
          reject(resp.statusCode);
        }
      });
    });
  }
}

class Service extends EventEmitter {
  constructor(opts) {
    super();
    console.log('Init service', opts);
    this.config = opts;
    this.client = new Client(); 
    this.endpoints = [];

    this.pollTimer = setInterval(() => {
      this.client.get(this.config['host'] + '/notification/pull', (data, resp) => {
        this._processEvents(data);
      });
    }, 1234);
  }

  get(path, callback) {
    let url = this.config['host'] + path;
    console.log('Getting URL', url);
    this.client.get(url, callback);
  }

  put(path, callback, data) {
    let args = {
      data: data
    };
    let url = this.config['host'] + path;
    console.log('Putting URL', url);
    this.client.put(url, args, callback);
  }

  _processEvents(events) {
    for (let i = 0; i < events['registrations'].length; i++) {
      let id = events['registrations'][i]['name'];
      console.log('Registration from', id);
      if (this.endpoints[id]) {
        this.endpoints[id].emit('register');
      }
    }

    for (let i = 0; i < events['reg-updates'].length; i++) {
      let id = events['reg-updates'][i]['name'];
      console.log('Update from', id);
      if (this.endpoints[id]) {
        this.endpoints[id].emit('update');
      }
    }

    for (let i = 0; i < events['de-registrations'].length; i++) {
      let id = events['de-registrations'][i]['name'];
      console.log('Deregistration from', id);
      if (this.endpoints[id]) {
        this.endpoints[id].emit('deregister');
      }
    }

    for (let i = 0; i < events['async-responses'].length; i++) {
      let res = events['async-responses'][i];
      console.log('Async-response:', res);
      this.emit('async-response', res);
    }
  }

  createNode(id) {
    if (!this.endpoints[id]) {
      console.log('Creating endpoint', id);
      this.endpoints[id] = new Endpoint(this, id);
    }

    return this.endpoints[id]; 
  }
}

module.exports.Service = Service;
