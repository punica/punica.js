const chai = require('chai');
const nock = require('nock');

const { expect } = chai;
const rest = require('node-rest-client');
const response = require('./rest-response');
const restAPI = require('../8dev_restapi.js');

describe('Rest API interface', () => {
  const url = 'http://localhost:8888';
  const deviceName = 'threeSeven';
  const path = '/3312/0/5850';
  const service = new restAPI.Service({ host: url });
  const device = new restAPI.Device(service, deviceName);
  const tlvBuffer = Buffer.from([0xe4, 0x16, 0x44, 0x00, 0x00, 0x00, 0x01]);

  describe('Endpoint interface', () => {
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

      it('should return rejected promise with exception object if connection is not succesfull', () => device.getObjects().catch((err) => {
        expect(typeof err).to.equal('object');
      }));
    });

    describe('read function', () => {
      nock(url)
        .get(`/endpoints/${deviceName}${path}`)
        .times(2)
        .reply(202, response.readRequest);

      it('should return async-response-id ', () => {
        const idRegex = /^\d+#[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}$/g;
        return device.read(path).then((resp) => {
          expect(typeof resp).to.equal('string');
          expect(resp).to.match(idRegex);
        });
      });

      it('should return status code and payload in a callback function which is given as a parameter ', (done) => {
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

      it('should reject promise when connection fails', () => device.read(path).catch((err) => {
        expect(typeof err).to.equal('object');
      }));
    });

    describe('write function', () => {
      nock(url)
        .put(`/endpoints/${deviceName}${path}`)
        .times(2)
        .reply(202, response.writeRequest);

      it('should return async-response-id ', () => {
        const idRegex = /^\d+#[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}$/g;
        return device.write(path, () => {}, tlvBuffer).then((resp) => {
          expect(typeof resp).to.equal('string');
          expect(resp).to.match(idRegex);
        });
      });

      it('should return status code in a callback function which is given as a parameter ', (done) => {
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

      it('should reject promise when connection fails', () => device.write(path, () => {}, tlvBuffer).catch((err) => {
        expect(typeof err).to.equal('object');
      }));
    });

    describe('execute function', () => {
      nock(url)
        .post(`/endpoints/${deviceName}${path}`)
        .times(2)
        .reply(202, response.executeRequest);

      it('should return async-response-id ', () => {
        const idRegex = /^\d+#[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}$/g;
        return device.execute(path, () => {}).then((resp) => {
          expect(typeof resp).to.equal('string');
          expect(resp).to.match(idRegex);
        });
      });

      it('should return status code in a callback function which is given as a parameter ', (done) => {
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

      it('should reject promise when connection fails', () => device.execute(path).catch((err) => {
        expect(typeof err).to.equal('object');
      }));
    });

    describe('observe function', () => {
      nock(url)
        .put(`/subscriptions/${deviceName}${path}`)
        .times(2)
        .reply(202, response.observeRequest);

      it('should return async-response-id ', () => {
        const idRegex = /^\d+#[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}$/g;
        return device.observe(path).then((resp) => {
          expect(typeof resp).to.equal('string');
          expect(resp).to.match(idRegex);
        });
      });

      it('should return status code and payload in a callback function which is given as a parameter ', (done) => {
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

      it('should reject promise when connection fails', () => device.observe(path).catch((err) => {
        expect(typeof err).to.equal('object');
      }));
    });
  });

  describe('Service interface', () => {
    describe('start function', () => {
      it('should send PUT request to register a callback and listen for notifications', (done) => {
        this.client = new rest.Client();
        nock(url)
          .put('/notification/callback')
          .reply(200);
        service.start();
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
        this.client.put('http://localhost:5727/notification', args, () => {});
      });

      it('should send GET requests in order to pull out notifications every interval of time in ms which is set by the parameter', () => {
        const statusCode = 202;
        nock(url)
          .get('/notification/pull')
          .times(4)
          .reply(statusCode, response.oneAsyncResponse);
        const timeError = 20;
        const pullTime = [];
        let timeDifference = null;
        const chosenTime = 200;
        let pulledOnTime = false;
        service.start(chosenTime);
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
    });

    describe('stop function', () => {
      const statusCode = 202;
      nock(url)
        .get('/notification/pull')
        .reply(statusCode, response.oneAsyncResponse);
      it('should stop sending GET requests for notification pulling', (done) => {
        const chosenTime = 200;
        let pulled = false;
        service.on('async-response', () => {
          pulled = true;
        });
        service.start(chosenTime);
        service.stop();
        setTimeout(() => {
          expect(pulled).to.equal(false);
          done();
        }, 300);
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

      it('should reject promise when connection fails', () => service.get(`/endpoints/${deviceName}${path}`).catch((err) => {
        expect(typeof err).to.equal('object');
      }));
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

      it('should reject promise when connection fails', () => service.put(`/endpoints/${deviceName}${path}`, tlvBuffer).catch((err) => {
        expect(typeof err).to.equal('object');
      }));
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

      it('should reject promise when connection fails', () => service.post(`/endpoints/${deviceName}${path}`).catch((err) => {
        expect(typeof err).to.equal('object');
      }));
    });

    describe('createNode function', () => {
      it('should add a new endpoint in service endpoints array if the endpoint does not exist', () => {
        const endpointID = 'testNode';
        const endpoint = service.createNode(endpointID);
        expect(typeof endpoint).to.equal('object');
        expect(endpoint.id).to.equal(endpointID);
        expect(service.endpoints[endpointID]).to.equal(endpoint);
      });

      it('should add endpoint to endponts array which belongs to service class', () => {
        const attachedEndpointID = 'attachedNode';
        const attachedEndpoint = service.createNode(attachedEndpointID);
        service.attachEndpoint(attachedEndpoint);
        expect(typeof service.endpoints[attachedEndpointID]).to.equal('object');
        expect(service.endpoints[attachedEndpointID].id).to.equal(attachedEndpointID);
      });
    });
  });
});

