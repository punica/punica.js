

const EventEmitter = require('events');
const rest = require('node-rest-client');
const express = require('express');
const parser = require('body-parser');

class Endpoint extends EventEmitter {
  constructor(service, id) {
    super();

    this.service = service;
    this.id = id;
    this.transactions = {};
    this.observations = {};

    this.service.on('async-response', (resp) => {
      const ID = resp.id;
      const code = resp.status;
      const data = resp.payload;
      if (this.transactions[ID] !== undefined) {
        this.transactions[ID](code, data);
        delete this.transactions[ID];
      }

      if (this.observations[ID] !== undefined) {
        this.observations[ID](code, data);
      }
    });

    service.attachEndpoint(this);
  }

  getObjects() {
    return new Promise((fulfill, reject) => {
      this.service.get(`/endpoints/${this.id}`).then((dataAndResponse) => {
        if (dataAndResponse.resp.statusCode === 200) {
          fulfill(dataAndResponse.data);
        } else {
          reject(dataAndResponse.resp.statusCode);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

  addAsyncCallback(id, callback) {
    this.transactions[id] = callback;
  }

  read(path, callback) {
    return new Promise((fulfill, reject) => {
      this.service.get(`/endpoints/${this.id}${path}`).then((dataAndResponse) => {
        if (dataAndResponse.resp.statusCode === 202) {
          const id = dataAndResponse.data['async-response-id'];
          this.addAsyncCallback(id, callback);
          fulfill(id);
        } else {
          reject(dataAndResponse.resp.statusCode);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

  write(path, callback, tlvBuffer) {
    return new Promise((fulfill, reject) => {
      this.service.put(`/endpoints/${this.id}${path}`, tlvBuffer).then((dataAndResponse) => {
        if (dataAndResponse.resp.statusCode === 202) {
          const id = dataAndResponse.data['async-response-id'];
          this.addAsyncCallback(id, callback);
          fulfill(id);
        } else {
          reject(dataAndResponse.resp.statusCode);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

  execute(path, callback) {
    return new Promise((fulfill, reject) => {
      this.service.post(`/endpoints/${this.id}${path}`).then((dataAndResponse) => {
        if (dataAndResponse.resp.statusCode === 202) {
          const id = dataAndResponse.data['async-response-id'];
          this.addAsyncCallback(id, callback);
          fulfill(id);
        } else {
          reject(dataAndResponse.resp.statusCode);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

  observe(path, callback) {
    return new Promise((fulfill, reject) => {
      this.service.put(`/subscriptions/${this.id}${path}`).then((dataAndResponse) => {
        if (dataAndResponse.resp.statusCode === 202) {
          const id = dataAndResponse.data['async-response-id'];
          this.observations[id] = callback;
          fulfill(id);
        } else {
          reject(dataAndResponse.resp.statusCode);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

class Service extends EventEmitter {
  constructor(opts) {
    super();
    this.config = {
      host: 'http://localhost:8888',
      interval: 1234,
      polling: false,
      port: 5728,
    };
    this.configure(opts);
    this.client = new rest.Client();
    this.endpoints = [];
    this.addTlvSerializer();
    this.express = express();
    this.express.use(parser.json());
  }

  configure(opts) {
    Object.keys(opts).forEach((opt) => {
      this.config[opt] = opts[opt];
    });
  }

  start(opts) {
    this.stop();
    if (opts !== undefined) {
      this.configure(opts);
    }
    if (!this.config.polling) {
      this.createServer();
      this.registerNotificationCallback()
        .catch((err) => {
          console.error(`Failed to set notification callback: ${err}`);
        });
    } else {
      this.pollTimer = setInterval(() => {
        this.pullNotification().then((data) => {
          this._processEvents(data);
        }).catch((err) => {
          console.error(`Failed to pull notifications: ${err}`);
        });
      }, this.config.interval);
    }
  }

  stop() {
    if (this.server !== undefined) {
      this.server.close();
      this.server = undefined;
      this.deleteNotificationCallback();
    }
    if (this.pollTimer !== undefined) {
      clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }
  }

  createServer() {
    this.express.put('/notification', (req, resp) => {
      this._processEvents(req.body);
      resp.send();
    });
    this.server = this.express.listen(this.config.port);
  }

  registerNotificationCallback() {
    return new Promise((fulfill, reject) => {
      const data = {
        url: `http://localhost:${this.config.port}/notification`,
        headers: {},
      };
      const type = 'application/json';
      this.put('/notification/callback', data, type).then((dataAndResponse) => {
        if (dataAndResponse.resp.statusCode === 204) {
          fulfill(dataAndResponse.data);
        } else {
          reject(dataAndResponse.resp.statusCode);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

  deleteNotificationCallback() {
    return new Promise((fulfill, reject) => {
      this.delete('/notification/callback').then((dataAndResponse) => {
        if (dataAndResponse.resp.statusCode === 204) {
          fulfill(dataAndResponse.data);
        } else {
          reject(dataAndResponse.resp.statusCode);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

  checkNotificationCallback() {
    return new Promise((fulfill, reject) => {
      this.get('/notification/callback').then((dataAndResponse) => {
        if (dataAndResponse.resp.statusCode === 200) {
          fulfill(dataAndResponse.data);
        } else {
          reject(dataAndResponse.resp.statusCode);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

  pullNotification() {
    return new Promise((fulfill, reject) => {
      this.get('/notification/pull').then((dataAndResponse) => {
        fulfill(dataAndResponse.data);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  getDevices() {
    return new Promise((fulfill, reject) => {
      this.get('/endpoints').then((dataAndResponse) => {
        if (dataAndResponse.resp.statusCode === 200) {
          fulfill(dataAndResponse.data);
        } else {
          reject(dataAndResponse.resp.statusCode);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

  getVersion() {
    return new Promise((fulfill, reject) => {
      this.get('/version').then((dataAndResponse) => {
        fulfill(dataAndResponse.data);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  addTlvSerializer() {
    this.client.serializers.add({
      name: 'buffer-serializer',
      isDefault: false,
      match: request => request.headers['Content-Type'] === 'application/vnd.oma.lwm2m+tlv',
      serialize: (data, nrcEventEmitter, serializedCallback) => {
        if (data instanceof Buffer) {
          nrcEventEmitter('serialized', data);
          serializedCallback(data);
        }
      },
    });
  }

  get(path) {
    return new Promise((fulfill, reject) => {
      const args = {
        headers: { 'Content-Type': 'application/vnd.oma.lwm2m+tlv' },
      };
      const url = this.config.host + path;
      const getRequest = this.client.get(url, args, (data, resp) => {
        const dataAndResponse = {};
        dataAndResponse.data = data;
        dataAndResponse.resp = resp;
        fulfill(dataAndResponse);
      });
      getRequest.on('error', (err) => {
        reject(err);
      });
    });
  }

  put(path, argument, type = 'application/vnd.oma.lwm2m+tlv') {
    return new Promise((fulfill, reject) => {
      const args = {
        headers: { 'Content-Type': type },
        data: argument,
      };
      const url = this.config.host + path;
      const putRequest = this.client.put(url, args, (data, resp) => {
        const dataAndResponse = {};
        dataAndResponse.data = data;
        dataAndResponse.resp = resp;
        fulfill(dataAndResponse);
      });
      putRequest.on('error', (err) => {
        reject(err);
      });
    });
  }

  delete(path) {
    return new Promise((fulfill, reject) => {
      const url = this.config.host + path;
      const postRequest = this.client.delete(url, (data, resp) => {
        const dataAndResponse = {};
        dataAndResponse.data = data;
        dataAndResponse.resp = resp;
        fulfill(dataAndResponse);
      });
      postRequest.on('error', (err) => {
        reject(err);
      });
    });
  }

  post(path) {
    return new Promise((fulfill, reject) => {
      const url = this.config.host + path;
      const postRequest = this.client.post(url, (data, resp) => {
        const dataAndResponse = {};
        dataAndResponse.data = data;
        dataAndResponse.resp = resp;
        fulfill(dataAndResponse);
      });
      postRequest.on('error', (err) => {
        reject(err);
      });
    });
  }

  _processEvents(events) {
    for (let i = 0; i < events.registrations.length; i += 1) {
      const id = events.registrations[i].name;
      if (this.endpoints[id]) {
        this.endpoints[id].emit('register');
      }
    }

    for (let i = 0; i < events['reg-updates'].length; i += 1) {
      const id = events['reg-updates'][i].name;
      if (this.endpoints[id]) {
        this.endpoints[id].emit('update');
      }
    }

    for (let i = 0; i < events['de-registrations'].length; i += 1) {
      const id = events['de-registrations'][i].name;
      if (this.endpoints[id]) {
        this.endpoints[id].emit('deregister');
      }
    }

    const responses = events['async-responses'].sort((x, y) => x.timestamp - y.timestamp);
    for (let i = 0; i < responses.length; i += 1) {
      const res = responses[i];
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
