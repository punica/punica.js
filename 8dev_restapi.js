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

    service.attachEndpoint(this);
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

  read(path, callback) {
    return new Promise((fulfill, reject) => {
      this.service.get('/endpoints/' + this.id + path, (data, resp) => {
        if (resp.statusCode === 202) {
          this.service.on('async-response', (asyncResponse) => {
            if (data['async-response-id'] === asyncResponse['id']) {
              callback(asyncResponse.status, asyncResponse.payload);
            }
          });
          let id = data['async-response-id'];
          fulfill(id);
        } else {
          reject(resp.statusCode);
        }
      });
    });
  }

  write(path, callback, tlvBuffer) {
    return new Promise((fulfill, reject) => {
      this.service.put('/endpoints/' + this.id + path, (data, resp) => {
        if (resp.statusCode === 202) {
          this.service.on('async-response', (asyncResponse) => {
            if (data['async-response-id'] === asyncResponse['id']) {
              callback(asyncResponse.status, asyncResponse.payload);
            }
          });
          let id = data['async-response-id'];
          fulfill(id);
        } else {
          reject(resp.statusCode);
        }
      }, tlvBuffer);
    });
  }

  observe(path, callback) {
    return new Promise((fulfill, reject) => {
      this.service.put('/subscriptions/' + this.id + path, (data, resp) => {
        if (resp.statusCode === 202) {
          let id = data['async-response-id'];
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
    this.config = opts;
    this.client = new Client(); 
    this.endpoints = [];
    this.addTlvSerializer();

    this.pollTimer = setInterval(() => {
      this.client.get(this.config['host'] + '/notification/pull', (data, resp) => {
        this._processEvents(data);
      });
    }, 1234);
  }

  addTlvSerializer() {
    this.client.serializers.add({
      name: 'buffer-serializer',
      isDefault: false,
      match: (request) => {
        return request.headers['Content-Type'] === 'application/vnd.oma.lwm2m+tlv';
      },
      serialize: (data, nrcEventEmitter, serializedCallback) => {
        if (data instanceof Buffer) {
          nrcEventEmitter('serialized', data);
          serializedCallback(data);
        }
      },
    });
  }

  get(path, callback) {
    let args = {
      headers: { 'Content-Type': 'application/vnd.oma.lwm2m+tlv' },
    };
    let url = this.config['host'] + path;
    this.client.get(url, args, callback);
  }

  put(path, callback, tlvBuffer) {
    let args = {
      headers: { 'Content-Type': 'application/vnd.oma.lwm2m+tlv' },
      data: tlvBuffer
    };
    let url = this.config['host'] + path;
    this.client.put(url, args, callback);
  }

  _processEvents(events) {
    for (let i = 0; i < events['registrations'].length; i++) {
      let id = events['registrations'][i]['name'];
      if (this.endpoints[id]) {
        this.endpoints[id].emit('register');
      }
    }

    for (let i = 0; i < events['reg-updates'].length; i++) {
      let id = events['reg-updates'][i]['name'];
      if (this.endpoints[id]) {
        this.endpoints[id].emit('update');
      }
    }

    for (let i = 0; i < events['de-registrations'].length; i++) {
      let id = events['de-registrations'][i]['name'];
      if (this.endpoints[id]) {
        this.endpoints[id].emit('deregister');
      }
    }

    let responses = events['async-responses'].sort((x, y) => {
      return x['timestamp'] - y['timestamp'];
    });
    for (let i = 0; i < responses.length; i++) {
      let res = responses[i];
      this.emit('async-response', res);
    }
  }

  createNode(id) {
    if (!this.endpoints[id]) {
      this.endpoints[id] = new Endpoint(this, id);
    }

    return this.endpoints[id]; 
  }

  attachEndpoint(ep) {
    this.endpoints[ep.id] = ep;
  }
}

module.exports.Service = Service;
module.exports.Device = Endpoint;
