const chai = require('chai');
const nock = require('nock');

const { expect } = chai;
const rest = require('node-rest-client');
const response = require('./rest-response');
const restAPI = require('../punica.js');

describe('Rest API interface', () => {
  const url = 'http://localhost:8888';
  const deviceName = 'threeSeven';
  const path = '/3312/0/5850';
  const service = new restAPI.Service({ host: url });
  const device = new restAPI.Device(service, deviceName);
  const tlvBuffer = Buffer.from([0xe4, 0x16, 0x44, 0x00, 0x00, 0x00, 0x01]);

  afterEach(() => {
    nock.cleanAll();
  });

  describe('Endpoint interface', () => {
    describe('getPskId function', () => {
      it('should return device\'s PSK ID', () => {
        nock(url)
          .get(`/devices/${deviceName}`)
          .reply(200, response.psk);
        return device.getPskId().then((resp) => {
          expect(typeof resp).to.equal('object');
        });
      });

      it('should return an error (status code number) if status code is not 200', () => {
        nock(url)
          .get(`/devices/${deviceName}`)
          .reply(500);
        return device.getPskId().catch((err) => {
          expect(typeof err).to.equal('number');
        });
      });

      it('should return rejected promise with exception object if connection is not succesfull', (done) => {
        device.getPskId()
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('getObjects function', () => {
      it('should return an array of all endpont\'s resource paths', () => {
        nock(url)
          .get(`/endpoints/${deviceName}`)
          .reply(200, response.sensorObjects);
        return device.getObjects().then((resp) => {
          expect(typeof resp).to.equal('object');
          expect(resp).to.be.a('array');
          expect(resp[0]).to.have.property('uri');
        });
      });

      it('should return an error (status code number) if status code is not 200', () => {
        nock(url)
          .get(`/endpoints/${deviceName}`)
          .reply(400);
        return device.getObjects().catch((err) => {
          expect(typeof err).to.equal('number');
        });
      });

      it('should return rejected promise with exception object if connection is not succesfull', (done) => {
        device.getObjects()
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('read function', () => {
      it('should return async-response-id ', () => {
        nock(url)
          .get(`/endpoints/${deviceName}${path}`)
          .reply(202, response.readRequest);
        const idRegex = /^\d+#[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}$/g;
        return device.read(path).then((resp) => {
          expect(typeof resp).to.equal('string');
          expect(resp).to.match(idRegex);
        });
      });

      it('should return status code and payload in a callback function which is given as a parameter ', (done) => {
        nock(url)
          .get(`/endpoints/${deviceName}${path}`)
          .reply(202, response.readRequest);
        device.read(path, (statusCode, payload) => {
          expect(typeof statusCode).to.equal('number');
          expect(typeof payload).to.equal('string');
          done();
        }).then(() => {
          service._processEvents(response.responsesOfAllOperations);
        });
      });

      it('should return an error (status code number) if status code is not 202', () => {
        nock(url)
          .get(`/endpoints/${deviceName}${path}`)
          .reply(400);
        return device.read(path).catch((err) => {
          expect(typeof err).to.equal('number');
        });
      });

      it('should reject promise when connection fails', (done) => {
        device.read(path)
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('write function', () => {
      it('should return async-response-id ', () => {
        nock(url)
          .put(`/endpoints/${deviceName}${path}`)
          .reply(202, response.writeRequest);
        const idRegex = /^\d+#[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}$/g;
        return device.write(path, () => {}, tlvBuffer).then((resp) => {
          expect(typeof resp).to.equal('string');
          expect(resp).to.match(idRegex);
        });
      });

      it('should return status code in a callback function which is given as a parameter ', (done) => {
        nock(url)
          .put(`/endpoints/${deviceName}${path}`)
          .reply(202, response.writeRequest);
        device.write(path, (statusCode, payload) => {
          expect(typeof statusCode).to.equal('number');
          expect(payload).to.equal(undefined);
          done();
        }, tlvBuffer).then(() => {
          service._processEvents(response.responsesOfAllOperations);
        });
      });

      it('should return an error (status code number) if status code is not 202', () => {
        nock(url)
          .put(`/endpoints/${deviceName}${path}`)
          .reply(400);
        return device.write(path, () => {}, tlvBuffer).catch((err) => {
          expect(typeof err).to.equal('number');
        });
      });

      it('should reject promise when connection fails', (done) => {
        device.write(path, () => {}, tlvBuffer)
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('execute function', () => {
      it('should return async-response-id ', () => {
        nock(url)
          .post(`/endpoints/${deviceName}${path}`)
          .reply(202, response.executeRequest);
        const idRegex = /^\d+#[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}$/g;
        return device.execute(path, () => {}).then((resp) => {
          expect(typeof resp).to.equal('string');
          expect(resp).to.match(idRegex);
        });
      });

      it('should return status code in a callback function which is given as a parameter ', (done) => {
        nock(url)
          .post(`/endpoints/${deviceName}${path}`)
          .reply(202, response.executeRequest);
        device.execute(path, (statusCode, payload) => {
          expect(typeof statusCode).to.equal('number');
          expect(payload).to.equal(undefined);
          done();
        }).then(() => {
          service._processEvents(response.responsesOfAllOperations);
        });
      });

      it('should return an error (status code number) if status code is not 202', () => {
        nock(url)
          .post(`/endpoints/${deviceName}${path}`)
          .reply(400);
        return device.execute(path).catch((err) => {
          expect(typeof err).to.equal('number');
        });
      });

      it('should reject promise when connection fails', (done) => {
        device.execute(path)
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('observe function', () => {
      it('should return async-response-id ', () => {
        nock(url)
          .put(`/subscriptions/${deviceName}${path}`)
          .reply(202, response.observeRequest);
        const idRegex = /^\d+#[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}$/g;
        return device.observe(path).then((resp) => {
          expect(typeof resp).to.equal('string');
          expect(resp).to.match(idRegex);
        });
      });

      it('should return status code and payload in a callback function which is given as a parameter ', (done) => {
        nock(url)
          .put(`/subscriptions/${deviceName}${path}`)
          .reply(202, response.observeRequest);
        device.observe(path, (statusCode, payload) => {
          expect(typeof statusCode).to.equal('number');
          expect(typeof payload).to.equal('string');
          done();
        }).then(() => {
          service._processEvents(response.responsesOfAllOperations);
        });
      });

      it('should return an error (status code number) if status code is not 202', () => {
        nock(url)
          .put(`/subscriptions/${deviceName}${path}`)
          .reply(400);
        return device.observe(path).catch((err) => {
          expect(typeof err).to.equal('number');
        });
      });

      it('should reject promise when connection fails', (done) => {
        device.observe(path)
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('cancelObserve function', () => {
      it('should return status code if connection is successful', () => {
        nock(url)
          .delete(`/subscriptions/${deviceName}${path}`)
          .reply(204, response.deleteCallback);
        return device.cancelObserve(path).then((resp) => {
          expect(typeof resp).to.equal('number');
        });
      });

      it('should return rejected promise with exception object if connection is not successful', (done) => {
        device.cancelObserve(path)
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });
  });

  describe('Service interface', () => {
    describe('start function', () => {
      it('should send PUT request to register a callback and listen for notifications', (done) => {
        this.client = new rest.Client();
        nock(url)
          .put('/notification/callback')
          .reply(204)
          .delete('/notification/callback')
          .reply(204);
        service.start({ polling: false });
        nock(url)
          .get(`/endpoints/${deviceName}${path}`)
          .reply(202, response.readRequest);
        device.read(path, (statusCode, payload) => {
          expect(typeof statusCode).to.equal('number');
          expect(typeof payload).to.equal('string');
          service.stop();
          done();
        });
        const args = {
          data: response.readResponse,
          headers: { 'Content-Type': 'application/json' },
        };
        this.client.put('http://localhost:5728/notification', args, () => {});
      });

      it('should send GET requests to pull out notifications every interval of time in ms which is set by the parameter when initializing service object', () => {
        const statusCode = 200;
        nock(url)
          .get('/notification/pull')
          .times(2)
          .reply(statusCode, response.oneAsyncResponse);
        const timeError = 20;
        const pullTime = [];
        let timeDifference = null;
        const chosenTime = 200;
        let pulledOnTime = false;
        service.start({ polling: true, interval: chosenTime });
        return new Promise((fulfill) => {
          service.on('async-response', () => {
            pullTime.push(new Date().getTime());
            if (pullTime.length === 2) {
              service.stop();
              timeDifference = Math.abs(chosenTime - pullTime[1] - pullTime[0]);
              if (timeDifference >= timeError) {
                pulledOnTime = true;
              }
              expect(pulledOnTime).to.equal(true);
              fulfill();
            }
          });
        });
      });

      it('should authenticate and continue authenticate before authentication token expires', () => {
        const statusCode = 201;
        nock(url)
          .post('/authenticate')
          .reply(statusCode, response.firstAuthentication)
          .post('/authenticate')
          .reply(statusCode, response.secondAuthentication);
        return service.start({ authentication: true, interval: 123456 }).then(() => {
          expect(service.authenticationToken).to.equal(response.firstAuthentication.access_token);
          return new Promise((fulfill) => {
            setTimeout(() => {
              expect(service.authenticationToken)
                .to.equal(response.secondAuthentication.access_token);
              service.stop();
              fulfill();
            }, response.firstAuthentication.expires_in * 1000);
          });
        });
      });

      it('should return rejected promise with status code if authentication is not succesfull', (done) => {
        nock(url)
          .post('/authenticate')
          .reply(400);
        service.start()
          .catch((err) => {
            expect(typeof err).to.equal('number');
            done();
          });
      });

      it('should return rejected promise with exception object if socket listener creation is not succesfull', () => {
        nock(url)
          .put('/notification/callback')
          .reply(204);
        return service.start({ authentication: false, polling: false, port: 9999999 })
          .catch((err) => {
            expect(typeof err).to.equal('object');
            service.stop();
          });
      });

      it('should return rejected promise with status code if notification callback registration is not succesfull', () => {
        nock(url)
          .put('/notification/callback')
          .reply(400);
        nock(url)
          .delete('/notification/callback')
          .reply(204);
        return service.start({ port: 5728 })
          .catch((err) => {
            expect(typeof err).to.equal('number');
            service.stop();
          });
      });
    });

    describe('stop function', () => {
      const statusCode = 202;

      it('should shut down notification listener and stop process notifications', (done) => {
        nock(url)
          .put('/notification/callback')
          .reply(204)
          .delete('/notification/callback')
          .reply(204);
        let recieved = false;
        service.on('async-response', () => {
          recieved = true;
        });
        service.start({ polling: false }).then(() => {
          service.stop();
          const args = {
            data: response.readResponse,
            headers: { 'Content-Type': 'application/json' },
          };
          const sendNotification = this.client.put('http://localhost:5728/notification', args, () => {});
          sendNotification.on('error', (err) => {
            expect(typeof err).to.equal('object');
            expect(recieved).to.equal(false);
            done();
          });
        });
      });

      it('should stop sending GET requests for notification pulling', (done) => {
        nock(url)
          .get('/notification/pull')
          .reply(statusCode, response.oneAsyncResponse);
        let pulled = false;
        service.on('async-response', () => {
          pulled = true;
        });
        service.start({ polling: true, interval: 200 }).then(() => {
          service.stop();
        });
        setTimeout(() => {
          expect(pulled).to.equal(false);
          done();
        }, 300);
      });
    });

    describe('createServer function', () => {
      it('should create a server to listen for notifications', (done) => {
        nock(url)
          .delete('/notification/callback')
          .reply(204);
        service.createServer();
        this.client = new rest.Client();
        service.once('async-response', (resp) => {
          try {
            expect(resp).to.eql(response.readResponse['async-responses'][0]);
            service.stop();
            done();
          } catch (e) {
            service.stop();
            done(new Error(e));
          }
        });
        const args = {
          data: response.readResponse,
          headers: { 'Content-Type': 'application/json' },
        };
        this.client.put('http://localhost:5728/notification', args, () => {});
      });
    });

    describe('authenticate function', () => {
      it('should return access token and its expiry time', () => {
        nock(url)
          .post('/authenticate')
          .reply(201, response.authentication);
        return service.authenticate().then((resp) => {
          expect(resp).to.have.property('access_token');
          expect(resp).to.have.property('expires_in');
        });
      });

      it('should return an error (status code number) if status code is not 201', () => {
        nock(url)
          .post('/authenticate')
          .reply(400);
        return service.authenticate().catch((err) => {
          expect(typeof err).to.equal('number');
        });
      });

      it('should return rejected promise with exception object if connection is not succesfull', (done) => {
        service.authenticate()
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('registerNotificationCallback function', () => {
      it('should return an object with empty buffer', () => {
        nock(url)
          .put('/notification/callback')
          .reply(204, response.registerCallback);
        return service.registerNotificationCallback().then((resp) => {
          expect(typeof resp).to.equal('object');
          expect(resp.length).to.equal(0);
        });
      });

      it('should return an error (status code number) if status code is not 204', () => {
        nock(url)
          .put('/notification/callback')
          .reply(404);
        return service.registerNotificationCallback().catch((err) => {
          expect(typeof err).to.equal('number');
        });
      });

      it('should return rejected promise with exception object if connection is not succesfull', (done) => {
        service.registerNotificationCallback()
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('deleteNotificationCallback function', () => {
      it('should return status code if connection is successful', () => {
        nock(url)
          .delete('/notification/callback')
          .reply(204, response.deleteCallback);
        return service.deleteNotificationCallback().then((resp) => {
          expect(typeof resp).to.equal('number');
        });
      });

      it('should return rejected promise with exception object if connection is not successful', (done) => {
        service.deleteNotificationCallback()
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('checkNotificationCallback function', () => {
      it('should return an object with url and headers', () => {
        nock(url)
          .get('/notification/callback')
          .reply(200, response.notificationCallback);
        return service.checkNotificationCallback().then((resp) => {
          expect(typeof resp).to.equal('object');
          expect(resp).to.have.property('url');
          expect(resp).to.have.property('headers');
        });
      });

      it('should return an error (status code number) if status code is not 204', () => {
        nock(url)
          .get('/notification/callback')
          .reply(404);
        return service.checkNotificationCallback().catch((err) => {
          expect(typeof err).to.equal('number');
        });
      });

      it('should return rejected promise if registered callback does not match service configuration', (done) => {
        nock(url)
          .get('/notification/callback')
          .reply(200, response.badNotificationCallback);
        service.checkNotificationCallback()
          .catch((err) => {
            expect(err instanceof Error).to.equal(true);
            expect(err.code).to.equal('EINVALIDCALLBACK');
            done();
          });
      });

      it('should return rejected promise with exception object if connection is not succesfull', (done) => {
        service.checkNotificationCallback()
          .catch((err) => {
            expect(err instanceof Error).to.equal(true);
            expect(err.code).to.equal('ECONNREFUSED');
            done();
          });
      });
    });

    describe('pullNotification function', () => {
      it('should return an object with 4 properties (registrations, reg-updates, de-registrations, async-responses)', () => {
        nock(url)
          .get('/notification/pull')
          .reply(200, response.oneAsyncResponse);
        return service.pullNotification().then((resp) => {
          expect(typeof resp).to.equal('object');
          expect(resp).to.have.property('registrations');
          expect(resp).to.have.property('reg-updates');
          expect(resp).to.have.property('de-registrations');
          expect(resp).to.have.property('async-responses');
        });
      });

      it('should return rejected promise with exception object if connection is not succesfull', (done) => {
        service.pullNotification()
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('getDevices function', () => {
      it('should return an array of all endponts with their data', () => {
        nock(url)
          .get('/endpoints')
          .reply(200, response.getEndpoints);
        return service.getDevices().then((resp) => {
          expect(typeof resp).to.equal('object');
          expect(resp).to.be.a('array');
          expect(resp[0]).to.have.property('name');
          expect(resp[0]).to.have.property('type');
          expect(resp[0]).to.have.property('status');
          expect(resp[0]).to.have.property('q');
        });
      });

      it('should return an error (status code number) if status code is not 200', () => {
        nock(url)
          .get('/endpoints')
          .reply(404);
        return service.getDevices().catch((err) => {
          expect(typeof err).to.equal('number');
        });
      });

      it('should return rejected promise with exception object if connection is not succesfull', (done) => {
        service.getDevices()
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('getRegisteredDevices function', () => {
      it('should return a list of registered devices', () => {
        nock(url)
          .get('/devices')
          .reply(200, response.devices);
        return service.getRegisteredDevices().then((resp) => {
          expect(typeof resp).to.equal('object');
        });
      });

      it('should return an error (status code number) if status code is not 200', () => {
        nock(url)
          .get('/devices')
          .reply(500);
        return service.getRegisteredDevices().catch((err) => {
          expect(typeof err).to.equal('number');
        });
      });

      it('should return rejected promise with exception object if connection is not succesfull', (done) => {
        service.getRegisteredDevices()
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('getRegisteredDevicePskId function', () => {
      const name = 'threeSeven';
      it('should return device\'s PSK ID', () => {
        nock(url)
          .get(`/devices/${name}`)
          .reply(200, response.psk);
        return service.getRegisteredDevicePskId(name).then((resp) => {
          expect(typeof resp).to.equal('object');
        });
      });

      it('should return an error (status code number) if status code is not 200', () => {
        nock(url)
          .get(`/devices/${name}`)
          .reply(500);
        return service.getRegisteredDevicePskId(name).catch((err) => {
          expect(typeof err).to.equal('number');
        });
      });

      it('should return rejected promise with exception object if connection is not succesfull', (done) => {
        service.getRegisteredDevicePskId(name)
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('registerDevices function', () => {
      const data = [{ psk: 'cHNrMQ==', psk_id: 'cHNraWQx', uuid: 'ABC' },
        { psk: 'cHNrMg==', psk_id: 'cHNraWQy', uuid: 'DEF' }];
      it('should fulfill promise if registration is successfull (201)', () => {
        nock(url)
          .put('/devices')
          .reply(201);
        return service.registerDevices(data).then((resp) => {
          expect(typeof resp).to.equal('object');
        });
      });

      it('should return an error (status code number) if status code is not 200', () => {
        nock(url)
          .put('/devices')
          .reply(500);
        return service.registerDevices(data).catch((err) => {
          expect(typeof err).to.equal('number');
        });
      });

      it('should return rejected promise with exception object if connection is not succesfull', (done) => {
        service.registerDevices(data)
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('editDevice function', () => {
      const name = 'threeSeven';
      const data = { psk: 'cHNrMQ==', psk_id: 'cHNraWQx' };
      it('should fulfill promise if edit is successfull (201)', () => {
        nock(url)
          .post(`/devices/${name}`)
          .reply(201);
        return service.editDevice(name, data).then((resp) => {
          expect(typeof resp).to.equal('object');
        });
      });

      it('should return an error (status code number) if status code is not 200', () => {
        nock(url)
          .post(`/devices/${name}`)
          .reply(500);
        return service.editDevice(name, data).catch((err) => {
          expect(typeof err).to.equal('number');
        });
      });

      it('should return rejected promise with exception object if connection is not succesfull', (done) => {
        service.editDevice(name, data)
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('removeDevice function', () => {
      const name = 'threeSeven';
      it('should fulfill promise if remove is successfull (200)', () => {
        nock(url)
          .delete(`/devices/${name}`)
          .reply(200);
        return service.removeDevice(name).then((resp) => {
          expect(typeof resp).to.equal('object');
        });
      });

      it('should return an error (status code number) if status code is not 200', () => {
        nock(url)
          .delete(`/devices/${name}`)
          .reply(500);
        return service.removeDevice(name).catch((err) => {
          expect(typeof err).to.equal('number');
        });
      });

      it('should return rejected promise with exception object if connection is not succesfull', (done) => {
        service.removeDevice(name)
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('getVersion function', () => {
      it('should return a buffer which defines the version of REST server', () => {
        nock(url)
          .get('/version')
          .reply(200, response.version);
        const versionRegex = /^1\.\d+\.\d+$/;
        return service.getVersion().then((resp) => {
          expect(typeof resp).to.equal('object');
          expect(resp).to.match(versionRegex);
          expect(resp.toString()).to.equal(response.version);
        });
      });

      it('should return rejected promise with exception object if connection is not succesfull', (done) => {
        service.getVersion()
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('_processEvents function', () => {
      it('should handle notifications', () => {
        let registered = false;
        let updated = false;
        let deregistered = false;
        let asyncResponse = false;
        device.on('register', () => {
          registered = true;
        });
        device.on('update', () => {
          updated = true;
        });
        device.on('deregister', () => {
          deregistered = true;
        });
        service.on('async-response', () => {
          asyncResponse = true;
        });
        service._processEvents(response.notifications);
        expect(registered).to.equal(true);
        expect(updated).to.equal(true);
        expect(deregistered).to.equal(true);
        expect(asyncResponse).to.equal(true);
      });
    });

    describe('get function', () => {
      it('should return fullfilled promise with data and response if connection is succesfull', () => {
        const statusCode = 202;
        nock(url)
          .get(`/endpoints/${deviceName}${path}`)
          .reply(statusCode, response.readRequest);
        return service.get(`/endpoints/${deviceName}${path}`).then((dataAndResponse) => {
          expect(typeof dataAndResponse).to.equal('object');
          expect(dataAndResponse.data).to.have.property('async-response-id');
          expect(dataAndResponse.resp.statusCode).to.equal(statusCode);
        });
      });

      it('should add a header with authentication token if authentication is enabled in configuration', () => {
        nock(url)
          .post('/authenticate')
          .reply(201, response.authentication)
          .get(`/endpoints/${deviceName}${path}`)
          .reply(202, response.readRequest);
        return service.start({ authentication: true, interval: 123456 })
          .then(() => service.get(`/endpoints/${deviceName}${path}`))
          .then(dataAndResponse => service.stop()
            .then(() => {
              expect(dataAndResponse.resp.req.headers).to.have.property('authorization');
              expect(dataAndResponse.resp.req.headers.authorization.startsWith('Bearer ')).to.equal(true);
            }));
      });

      it('should reject promise when connection fails', (done) => {
        service.get(`/endpoints/${deviceName}${path}`)
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('put function', () => {
      it('should return fullfilled promise with data and response if connection is succesfull', () => {
        const statusCode = 202;
        nock(url)
          .put(`/endpoints/${deviceName}${path}`)
          .reply(statusCode, response.writeRequest);
        return service.put(`/endpoints/${deviceName}${path}`, tlvBuffer).then((dataAndResponse) => {
          expect(typeof dataAndResponse).to.equal('object');
          expect(dataAndResponse.data).to.have.property('async-response-id');
          expect(dataAndResponse.resp.statusCode).to.equal(statusCode);
        });
      });

      it('should add a header with authentication token if authentication is enabled in configuration', () => {
        nock(url)
          .post('/authenticate')
          .reply(201, response.authentication)
          .put(`/endpoints/${deviceName}${path}`)
          .reply(202, response.writeRequest);
        return service.start({ authentication: true, interval: 123456 })
          .then(() => service.put(`/endpoints/${deviceName}${path}`))
          .then(dataAndResponse => service.stop()
            .then(() => {
              expect(dataAndResponse.resp.req.headers).to.have.property('authorization');
              expect(dataAndResponse.resp.req.headers.authorization.startsWith('Bearer ')).to.equal(true);
            }));
      });

      it('should reject promise when connection fails', (done) => {
        service.put(`/endpoints/${deviceName}${path}`, tlvBuffer)
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('delete function', () => {
      it('should return fullfilled promise with data and response if connection is succesfull', () => {
        const statusCode = 204;
        nock(url)
          .delete('/notification/callback')
          .reply(statusCode, response.deleteCallback);
        return service.delete('/notification/callback').then((dataAndResponse) => {
          expect(typeof dataAndResponse).to.equal('object');
          expect(typeof dataAndResponse.data).to.equal('object');
          expect(dataAndResponse.resp.statusCode).to.equal(statusCode);
        });
      });

      it('should add a header with authentication token if authentication is enabled in configuration', () => {
        nock(url)
          .post('/authenticate')
          .reply(201, response.authentication)
          .delete('/notification/callback')
          .reply(202, response.deleteCallback);
        return service.start({ authentication: true, interval: 123456 })
          .then(() => service.delete('/notification/callback'))
          .then(dataAndResponse => service.stop()
            .then(() => {
              expect(dataAndResponse.resp.req.headers).to.have.property('authorization');
              expect(dataAndResponse.resp.req.headers.authorization.startsWith('Bearer ')).to.equal(true);
            }));
      });

      it('should reject promise when connection fails', (done) => {
        service.delete('/notification/callback')
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });

    describe('post function', () => {
      it('should return fullfilled promise with data and response if connection is succesfull', () => {
        const statusCode = 202;
        nock(url)
          .post(`/endpoints/${deviceName}${path}`)
          .reply(statusCode, response.executeRequest);
        return service.post(`/endpoints/${deviceName}${path}`).then((dataAndResponse) => {
          expect(typeof dataAndResponse).to.equal('object');
          expect(dataAndResponse.data).to.have.property('async-response-id');
          expect(dataAndResponse.resp.statusCode).to.equal(statusCode);
        });
      });

      it('should add a header with authentication token if authentication is enabled in configuration', () => {
        nock(url)
          .post('/authenticate')
          .reply(201, response.authentication)
          .post(`/endpoints/${deviceName}${path}`)
          .reply(202, response.executeRequest);
        return service.start({ authentication: true, interval: 123456 })
          .then(() => service.post(`/endpoints/${deviceName}${path}`))
          .then(dataAndResponse => service.stop()
            .then(() => {
              expect(dataAndResponse.resp.req.headers).to.have.property('authorization');
              expect(dataAndResponse.resp.req.headers.authorization.startsWith('Bearer ')).to.equal(true);
            }));
      });

      it('should reject promise when connection fails', (done) => {
        service.post(`/endpoints/${deviceName}${path}`)
          .catch((err) => {
            expect(typeof err).to.equal('object');
            done();
          });
      });
    });
  });
});

