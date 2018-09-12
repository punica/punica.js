[![Build Status](https://travis-ci.org/8devices/restserver-api.svg?branch=master)](https://travis-ci.org/8devices/restserver-api)
[![codecov](https://codecov.io/gh/8devices/restserver-api/branch/master/graph/badge.svg)](https://codecov.io/gh/8devices/restserver-api)
# restserver-api
**Example program**
This example shows basic restserver-api usage.
```js
const restAPI = require('restserver-api');

const { Lwm2m } = restAPI;
const { RESOURCE_TYPE, encodeResource, decodeResource } = Lwm2m.TLV;

console.log('Initialize service and endpoint');
const service = new restAPI.Service();
const device = new restAPI.Device(service, 'urn:uuid:17200d69-ec9b-43b3-9051-73df2207907c');

console.log('Encode resource to TLV format');
const tlvBuffer = encodeResource({
  identifier: 3,
  type: RESOURCE_TYPE.INTEGER,
  value: 60
});

console.log('Start service');
service.start().then(() => {
  console.log('Service started');
  console.log('Writing into device\'s resource');
  device.write('/3/0/7', (status) => {
    console.log('Received response with status: ', status);
    console.log('Stopping service');
    service.stop().then(() => {
      console.log('Service stopped');
    });
  }, tlvBuffer);
});
```
## Classes

<dl>
<dt><a href="#Endpoint">Endpoint</a></dt>
<dd><p>This class represents endpoint (device).</p>
</dd>
<dt><a href="#Service">Service</a></dt>
<dd><p>This class represents REST API service.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#TYPE">TYPE</a></dt>
<dd><p>Represents LwM2M variable (identifier) types (OBJECT_INSTANCE,
MULTIPLE_RESOURCE, RESOURCE_INSTANCE, RESOURCE).</p>
</dd>
<dt><a href="#RESOURCE_TYPE">RESOURCE_TYPE</a></dt>
<dd><p>Represents resource type (NONE, BOOLEAN, INTEGER, FLOAT, STRING, OPAQUE).</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#getDictionaryByValue">getDictionaryByValue(dictionaryList, keyName, value)</a> ⇒ <code>Object</code> | <code>string</code> | <code>number</code></dt>
<dd><p>Gets dictionary by given name of the key and value.</p>
</dd>
<dt><a href="#encodeResourceValue">encodeResourceValue(resource)</a> ⇒ <code>object</code></dt>
<dd><p>Encodes value of the resource.</p>
</dd>
<dt><a href="#decodeResourceValue">decodeResourceValue(buffer, resource)</a> ⇒ <code>Object</code> | <code>string</code> | <code>number</code> | <code>boolean</code></dt>
<dd><p>Decodes value of the resource.</p>
</dd>
<dt><a href="#encode">encode(object)</a> ⇒ <code>object</code></dt>
<dd><p>Encodes ant type of instance (Object instance, multiple resources, resources instance, resource).</p>
</dd>
<dt><a href="#encodeResourceInstance">encodeResourceInstance(resourceInstance)</a> ⇒ <code>object</code></dt>
<dd><p>Encodes resource instance to TLV buffer.</p>
</dd>
<dt><a href="#encodeMultipleResourcesTLV">encodeMultipleResourcesTLV(resources)</a> ⇒ <code>object</code></dt>
<dd><p>Encodes multiple resource values to TLV buffer.</p>
</dd>
<dt><a href="#encodeResource">encodeResource(resource)</a> ⇒ <code>object</code></dt>
<dd><p>Encodes resource to TLV buffer.</p>
</dd>
<dt><a href="#encodeObjectInstance">encodeObjectInstance(objectInstance)</a> ⇒ <code>object</code></dt>
<dd><p>Encodes LwM2M object instance to TLV buffer.</p>
</dd>
<dt><a href="#encodeObject">encodeObject(object)</a> ⇒ <code>object</code></dt>
<dd><p>Encodes LwM2M object to TLV buffer.</p>
</dd>
<dt><a href="#decode">decode(buffer)</a> ⇒ <code>object</code></dt>
<dd><p>Decodes any TLV buffer.</p>
</dd>
<dt><a href="#decodeResourceInstance">decodeResourceInstance(buffer, resources)</a> ⇒ <code>object</code></dt>
<dd><p>Decodes resource instance.</p>
</dd>
<dt><a href="#decodeResourceInstanceValue">decodeResourceInstanceValue(buffer, resourceInstance)</a> ⇒ <code>object</code></dt>
<dd><p>Decodes resource instance value</p>
</dd>
<dt><a href="#decodeResource">decodeResource(buffer, resource)</a> ⇒ <code>object</code></dt>
<dd><p>Decodes resource.</p>
</dd>
<dt><a href="#decodeObjectInstance">decodeObjectInstance(buffer, objectInstance)</a> ⇒ <code>object</code></dt>
<dd><p>Decodes object instance from TLV buffer.</p>
</dd>
<dt><a href="#decodeObject">decodeObject(buffer, object)</a> ⇒ <code>object</code></dt>
<dd><p>Decodes LwM2M object to TLV buffer.</p>
</dd>
</dl>

<a name="Endpoint"></a>

## Endpoint
This class represents endpoint (device).

**Kind**: global class  

* [Endpoint](#Endpoint)
    * [new Endpoint(service, id)](#new_Endpoint_new)
    * [.getObjects()](#Endpoint+getObjects) ⇒ <code>Promise</code>
    * [.read(path, callback)](#Endpoint+read) ⇒ <code>Promise</code>
    * [.write(path, callback, tlvBuffer)](#Endpoint+write) ⇒ <code>Promise</code>
    * [.execute(path, callback)](#Endpoint+execute) ⇒ <code>Promise</code>
    * [.observe(path, callback)](#Endpoint+observe) ⇒ <code>Promise</code>
    * [.cancelObserve(path)](#Endpoint+cancelObserve) ⇒ <code>Promise</code>

<a name="new_Endpoint_new"></a>

### new Endpoint(service, id)
Constructor initiliazes given service object, endpoint's id
and starts listening for events emited by service (when endpoint
registers, updates, deregisters, sends data), handles "async
responses" and emits "register", "update", "deregister" events.


| Param | Type | Description |
| --- | --- | --- |
| service | <code>object</code> | Service object |
| id | <code>string</code> | Endpoint id |

**Example**  
```js
const restAPI = require('restserver-api');

const service = new restAPI.Service(serviceOptions);
const endpoint = new restAPI.Endpoint(service, 'endpointId');
```
<a name="Endpoint+getObjects"></a>

### endpoint.getObjects() ⇒ <code>Promise</code>
Sends request to get all endpoint's objects.

**Kind**: instance method of [<code>Endpoint</code>](#Endpoint)  
**Returns**: <code>Promise</code> - Promise object with endpoint's objects  
**Example**  
```js
endpoint.getObjects().then((resp) => {
  // resp = [ { uri: '/1/0' }, { uri: '/2/0' }, ... ]
}).catch((err) => {
  // err - exception message object or status code
});
```
<a name="Endpoint+read"></a>

### endpoint.read(path, callback) ⇒ <code>Promise</code>
Sends request to read endpoint's resource data.

**Kind**: instance method of [<code>Endpoint</code>](#Endpoint)  
**Returns**: <code>Promise</code> - Promise with async response id  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Resource path |
| callback | <code>function</code> | Callback which will be called when async response is received |

**Example**  
```js
endpoint.read(path, (status, payload) => {
  // status = 200
  // payload = 4RbaAA==
}).then((asyncResponseId) => {
  // asyncResponseId = 1533889157#42f26784-1a8d-4861-36aa-d88f
}).catch((err) => {
  // err - exception object or status code
});
```
<a name="Endpoint+write"></a>

### endpoint.write(path, callback, tlvBuffer) ⇒ <code>Promise</code>
Sends request to write a value into endpoint's resource.

**Kind**: instance method of [<code>Endpoint</code>](#Endpoint)  
**Returns**: <code>Promise</code> - Promise with async response id  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Resource path |
| callback | <code>function</code> | Callback which will be called when async response is received |
| tlvBuffer | <code>buffer</code> | Data in TLV format |

**Example**  
```js
endpoint.write(path, (status) => {
  // status = 202
}, tlvBuffer).then((asyncResponseId) => {
  // asyncResponseId = 1533889926#870a3f17-3e21-b6ad-f63d-5cfe
}).catch((err) => {
  // err - exception object or status code
});
```
<a name="Endpoint+execute"></a>

### endpoint.execute(path, callback) ⇒ <code>Promise</code>
Sends request to execute endpoint's resource.

**Kind**: instance method of [<code>Endpoint</code>](#Endpoint)  
**Returns**: <code>Promise</code> - Promise with async response id  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Resource path |
| callback | <code>function</code> | Callback which will be called when async response is received |

**Example**  
```js
endpoint.execute(path, (status) => {
  // status = 202
}).then((asyncResponseId) => {
  // asyncResponseId = 1533889926#870a3f17-3e21-b6ad-f63d-5cfe
}).catch((err) => {
  // err - exception object or status code
});
```
<a name="Endpoint+observe"></a>

### endpoint.observe(path, callback) ⇒ <code>Promise</code>
Sends request to subscribe to resource.

**Kind**: instance method of [<code>Endpoint</code>](#Endpoint)  
**Returns**: <code>Promise</code> - Promise with async response id  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Resource path |
| callback | <code>function</code> | Callback which will be called when async response is received |

**Example**  
```js
endpoint.observe(path, (status, payload) => {
  // status = 200
  // payload = 4RbaAA==
}).then((asyncResponseId) => {
  // asyncResponseId = 1533889157#42f26784-1a8d-4861-36aa-d88f
}).catch((err) => {
  // err - exception object or status code
});
```
<a name="Endpoint+cancelObserve"></a>

### endpoint.cancelObserve(path) ⇒ <code>Promise</code>
Sends request to cancel subscriptions.

**Kind**: instance method of [<code>Endpoint</code>](#Endpoint)  
**Returns**: <code>Promise</code> - Promise with HTTP status code  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Resource path |

**Example**  
```js
endpoint.cancelObserve(path).then((status) => {
  // status - status code
}).catch((err) => {
  // err - exception object
});
```
<a name="Service"></a>

## Service
This class represents REST API service.

**Kind**: global class  

* [Service](#Service)
    * [new Service(opts)](#new_Service_new)
    * [.start(opts)](#Service+start) ⇒ <code>Promise</code>
    * [.stop()](#Service+stop) ⇒ <code>Promise</code>
    * [.authenticate()](#Service+authenticate) ⇒ <code>Promise</code>
    * [.registerNotificationCallback()](#Service+registerNotificationCallback) ⇒ <code>Promise</code>
    * [.deleteNotificationCallback()](#Service+deleteNotificationCallback) ⇒ <code>Promise</code>
    * [.checkNotificationCallback()](#Service+checkNotificationCallback) ⇒ <code>Promise</code>
    * [.pullNotification()](#Service+pullNotification) ⇒ <code>Promise</code>
    * [.getDevices()](#Service+getDevices) ⇒ <code>Promise</code>
    * [.getVersion()](#Service+getVersion) ⇒ <code>Promise</code>
    * [.get(path)](#Service+get) ⇒ <code>Promise</code>
    * [.put(path, argument, type)](#Service+put) ⇒ <code>Promise</code>
    * [.delete(path)](#Service+delete) ⇒ <code>Promise</code>
    * [.post(path, argument, type)](#Service+post) ⇒ <code>Promise</code>

<a name="new_Service_new"></a>

### new Service(opts)
Initializes default configurations. Reconfigures with given options.


| Param | Type | Description |
| --- | --- | --- |
| opts | <code>object</code> | Options object (optional) |

**Example**  
```js
const options = {
  // REST server's address
  host: 'http://localhost:8888',
  // CA certificate
  ca: '',
  // authentication (true or false)
  authentication: false,
  username: '',
  password: '',
  // notification polling (true or false)
  polling: false,
  // time between each poll in miliseconds
  interval: 1234,
  // port for socket listener (not relevant if polling is enabled)
  port: 5728,
};
new Service(options);
```
<a name="Service+start"></a>

### service.start(opts) ⇒ <code>Promise</code>
(Re)starts authentication,
socket listener creation and notification callback registration
or notification polling processes.

**Kind**: instance method of [<code>Service</code>](#Service)  
**Returns**: <code>Promise</code> - Promise which fulfills when service is started  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>object</code> | Options object (optional) |

**Example**  
```js
service.start().then(() => {
  // started service
}).catch((err) => {
  // err - exception object
});
```
**Example** *(Passing options object)*  
```js
const options = {
  // REST server's address
  host: 'http://localhost:8888',
  // CA certificate
  ca: '',
  // authentication (true or false)
  authentication: false,
  username: '',
  password: '',
  // notification polling (true or false)
  polling: false,
  // time between each poll in miliseconds
  interval: 1234,
  // port for socket listener (not relevant if polling is enabled)
  port: 5728,
};
service.start(options);
```
<a name="Service+stop"></a>

### service.stop() ⇒ <code>Promise</code>
Stops receiving and processing events
Stops this service and all it's subservices
that were started in start().
Cleans up resources

**Kind**: instance method of [<code>Service</code>](#Service)  
**Returns**: <code>Promise</code> - Promise which fulfills when service is stopped  
**Example**  
```js
service.stop().then(() => {
  // stopped service
});
```
<a name="Service+authenticate"></a>

### service.authenticate() ⇒ <code>Promise</code>
Sends request to authenticate user.

**Kind**: instance method of [<code>Service</code>](#Service)  
**Returns**: <code>Promise</code> - Promise with authentication data (token and after what time it expires)  
**Example**  
```js
service.authenticate().then((resp) => {
  // resp = { access_token: 'token-value', expires_in: 3600 }
}).catch((err) => {
  // err - exception message object or status code
});
```
<a name="Service+registerNotificationCallback"></a>

### service.registerNotificationCallback() ⇒ <code>Promise</code>
Sends request to register notification callback.

**Kind**: instance method of [<code>Service</code>](#Service)  
**Returns**: <code>Promise</code> - Promise which fulfills when notification callback is registered  
**Example**  
```js
service.registerNotificationCallback().then(() => {
  // notification callback has been registered
}).catch((err) => {
  // err - exception object or status code
});
```
<a name="Service+deleteNotificationCallback"></a>

### service.deleteNotificationCallback() ⇒ <code>Promise</code>
Sends request to delete notification callback.

**Kind**: instance method of [<code>Service</code>](#Service)  
**Returns**: <code>Promise</code> - Promise with HTTP status code  
**Example**  
```js
service.deleteNotificationCallback().then((status) => {
  // status - status code
}).catch((err) => {
  // err - exception object
});
```
<a name="Service+checkNotificationCallback"></a>

### service.checkNotificationCallback() ⇒ <code>Promise</code>
Sends request to check whether or not notification callback is registered.

**Kind**: instance method of [<code>Service</code>](#Service)  
**Returns**: <code>Promise</code> - Promise with notification callback data  
**Example**  
```js
service.checkNotificationCallback().then((resp) => {
  // resp = { url: 'http://localhost:5728/notification', headers: {} }
}).catch((err) => {
  // err - exception message object or status code
});
```
<a name="Service+pullNotification"></a>

### service.pullNotification() ⇒ <code>Promise</code>
Sends request to get pending/queued notifications.

**Kind**: instance method of [<code>Service</code>](#Service)  
**Returns**: <code>Promise</code> - Promise with notification data (registrations,
deregistrations, updates, async responses)  
**Example**  
```js
service.pullNotification().then((resp) => {
  // resp = { registrations: [...], 'reg-updates': [...], ... }
}).catch((err) => {
  // err - exception object
});
```
<a name="Service+getDevices"></a>

### service.getDevices() ⇒ <code>Promise</code>
Sends request to get all registered endpoints.

**Kind**: instance method of [<code>Service</code>](#Service)  
**Returns**: <code>Promise</code> - Promise with a list of endpoints  
**Example**  
```js
service.getDevices().then((resp) => {
  // resp = [ { name: 'uuid-4567', type: '8dev_3700', ... }, ... ]
}).catch((err) => {
  // err - exception message object or status code
});
```
<a name="Service+getVersion"></a>

### service.getVersion() ⇒ <code>Promise</code>
Sends request to get REST server version.

**Kind**: instance method of [<code>Service</code>](#Service)  
**Returns**: <code>Promise</code> - Promise with REST server's version  
**Example**  
```js
service.getVersion().then((resp) => {
  // resp = '1.0.0'
}).catch((err) => {
  // err - exception object
});
```
<a name="Service+get"></a>

### service.get(path) ⇒ <code>Promise</code>
Performs GET requests with given path.

**Kind**: instance method of [<code>Service</code>](#Service)  
**Returns**: <code>Promise</code> - Promise with data and response object  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Request path |

**Example**  
```js
service.get(path).then((dataAndResponse) => {
  // dataAndResponse.data - data object
  // dataAndResponse.resp - response object
}).catch((err) => {
  // err - exception object
});
```
<a name="Service+put"></a>

### service.put(path, argument, type) ⇒ <code>Promise</code>
Performs PUT requests with given path, data and data type.

**Kind**: instance method of [<code>Service</code>](#Service)  
**Returns**: <code>Promise</code> - Promise with data and response object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| path | <code>string</code> |  | Request path |
| argument | <code>object</code> |  | Data which will be sent (optional) |
| type | <code>string</code> | <code>&quot;application/vnd.oma.lwm2m+tlv&quot;</code> | Data type (optional) |

<a name="Service+delete"></a>

### service.delete(path) ⇒ <code>Promise</code>
Performs DELETE requests with given path.

**Kind**: instance method of [<code>Service</code>](#Service)  
**Returns**: <code>Promise</code> - Promise with data and response object  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Request path |

<a name="Service+post"></a>

### service.post(path, argument, type) ⇒ <code>Promise</code>
Performs POST requests with given path, data and data type.

**Kind**: instance method of [<code>Service</code>](#Service)  
**Returns**: <code>Promise</code> - Promise with data and response object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| path | <code>string</code> |  | Request path |
| argument | <code>object</code> |  | Data which will be sent (optional) |
| type | <code>string</code> | <code>&quot;application/vnd.oma.lwm2m+tlv&quot;</code> | Data type (optional) |

<a name="TYPE"></a>

## TYPE
Represents LwM2M variable (identifier) types (OBJECT_INSTANCE,
MULTIPLE_RESOURCE, RESOURCE_INSTANCE, RESOURCE).

**Kind**: global constant  
<a name="RESOURCE_TYPE"></a>

## RESOURCE_TYPE
Represents resource type (NONE, BOOLEAN, INTEGER, FLOAT, STRING, OPAQUE).

**Kind**: global constant  
<a name="getDictionaryByValue"></a>

## getDictionaryByValue(dictionaryList, keyName, value) ⇒ <code>Object</code> \| <code>string</code> \| <code>number</code>
Gets dictionary by given name of the key and value.

**Kind**: global function  
**Returns**: <code>Object</code> \| <code>string</code> \| <code>number</code> - dictionary  

| Param | Type | Description |
| --- | --- | --- |
| dictionaryList | <code>object</code> | Dictionary list. |
| keyName | <code>Object</code> \| <code>string</code> | Name of the key |
| value | <code>Object</code> \| <code>string</code> \| <code>number</code> | Value |

<a name="encodeResourceValue"></a>

## encodeResourceValue(resource) ⇒ <code>object</code>
Encodes value of the resource.

**Kind**: global function  
**Returns**: <code>object</code> - buffer - Buffer of encoded value.  

| Param | Type | Description |
| --- | --- | --- |
| resource | <code>object</code> | Object which stores resource value and value's type. |

**Example**  
```js
const resource = {
 type: TLV.RESOURCE_TYPE.INTEGER,
 value: 1
};

const encodedValue = encodeResourceValue(resource);
// encodedValue = <Buffer 01>
```
<a name="decodeResourceValue"></a>

## decodeResourceValue(buffer, resource) ⇒ <code>Object</code> \| <code>string</code> \| <code>number</code> \| <code>boolean</code>
Decodes value of the resource.

**Kind**: global function  
**Returns**: <code>Object</code> \| <code>string</code> \| <code>number</code> \| <code>boolean</code> - value - Decoded value in specified type  

| Param | Type | Description |
| --- | --- | --- |
| buffer | <code>object</code> | Buffer which will be decoded. |
| resource | <code>object</code> | Object which stores resource value's type. |

**Example**  
```js
const buffer = Buffer.from([0x01]);
const resource = {
  type: TLV.RESOURCE_TYPE.INTEGER,
};

const decodedValue = decodeResourceValue(buffer, resource);
// decodedValue = 1
```
<a name="encode"></a>

## encode(object) ⇒ <code>object</code>
Encodes ant type of instance (Object instance, multiple resources, resources instance, resource).

**Kind**: global function  
**Returns**: <code>object</code> - buffer - encoded TLV buffer.  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>object</code> | object which stores type, identifier and value. |

**Example**  
```js
const resource = {
  identifier: 5850,
  type: TLV.RESOURCE_TYPE.BOOLEAN,
  value: true
};

const encoded = encode({
  type: TYPE.RESOURCE,
  identifier: resource.identifier,
  value: encodeResourceValue(resource),
});
// encoded = <Buffer e1 16 da 01>
```
<a name="encodeResourceInstance"></a>

## encodeResourceInstance(resourceInstance) ⇒ <code>object</code>
Encodes resource instance to TLV buffer.

**Kind**: global function  
**Returns**: <code>object</code> - buffer - Buffer in TLV format  

| Param | Type | Description |
| --- | --- | --- |
| resourceInstance | <code>object</code> | Object which stores resource identifier, value and it's type. |

**Example**  
```js
const resourceInstance = {
  identifier: 5850,
  type: TLV.RESOURCE_TYPE.BOOLEAN,
  value: true
};

const encoded = encodeResourceInstance(resourceInstance);
// encoded = <Buffer e1 16 da 01>
```
<a name="encodeMultipleResourcesTLV"></a>

## encodeMultipleResourcesTLV(resources) ⇒ <code>object</code>
Encodes multiple resource values to TLV buffer.

**Kind**: global function  
**Returns**: <code>object</code> - buffer - TLV buffer.  

| Param | Type | Description |
| --- | --- | --- |
| resources | <code>object</code> | Object which stores identifier, resource type, and multiple values. |

**Example**  
```js
const resources = {
  identifier: 5850,
  type: TLV.RESOURCE_TYPE.BOOLEAN,
  value: [true, false]
};

const encoded = encodeMultipleResources(resources);
// encoded = <Buffer a6 16 da 41 00 01 41 01 00>
```
<a name="encodeResource"></a>

## encodeResource(resource) ⇒ <code>object</code>
Encodes resource to TLV buffer.

**Kind**: global function  
**Returns**: <code>object</code> - buffer - TLV buffer.  

| Param | Type | Description |
| --- | --- | --- |
| resource | <code>object</code> | Object which stores resource identifier, type and value. |

**Example**  
```js
const resource = {
  identifier: 5850,
  type: TLV.RESOURCE_TYPE.BOOLEAN,
  value: true
};

const encoded = encodeResourcez(resource);
// encoded = <Buffer e1 16 da 01>
```
<a name="encodeObjectInstance"></a>

## encodeObjectInstance(objectInstance) ⇒ <code>object</code>
Encodes LwM2M object instance to TLV buffer.

**Kind**: global function  
**Returns**: <code>object</code> - buffer - TLV buffer.  

| Param | Type | Description |
| --- | --- | --- |
| objectInstance | <code>object</code> | LwM2M object. |

**Example**  
```js
const objectInstance = {
  identifier: 0,
  resources: [
    {
      identifier: 5815,
      type: TLV.RESOURCE_TYPE.FLOAT,
      value: 999.99
    }
  ]
};

const encoded = encodeObjectInstanceTLV(objectInstance);
// encoded = <Buffer 07 00 e4 16 b7 44 79 ff 5c>
```
<a name="encodeObject"></a>

## encodeObject(object) ⇒ <code>object</code>
Encodes LwM2M object to TLV buffer.

**Kind**: global function  
**Returns**: <code>object</code> - buffer - TLV buffer.  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>object</code> | LwM2M object. |

**Example**  
```js
const object = {
  identifier: 3305,
  objectInstances: [{
    identifier: 0,
    resources: [
      {
        identifier: 5815,
        type: TLV.RESOURCE_TYPE.FLOAT,
        value: 999.99
      }
    ]
  }]
};

const encoded = encodeObject(object);
// encoded = <Buffer 07 00 e4 16 b7 44 79 ff 5c>
```
<a name="decode"></a>

## decode(buffer) ⇒ <code>object</code>
Decodes any TLV buffer.

**Kind**: global function  
**Returns**: <code>object</code> - object - Decoded object.  

| Param | Type | Description |
| --- | --- | --- |
| buffer | <code>object</code> | encoded TLV buffer. |

**Example**  
```js
const buffer = Buffer.from([0xe1, 0x16, 0xda, 0x01]);

const decoded = TLV.decode(buffer);
// decoded = { type: 3, identifier: 5850, value: <Buffer 01>, tlvSize: 4 }
```
<a name="decodeResourceInstance"></a>

## decodeResourceInstance(buffer, resources) ⇒ <code>object</code>
Decodes resource instance.

**Kind**: global function  
**Returns**: <code>object</code> - decodedResource - Object which stores resource identifier,
tlvSize resource type and value.  

| Param | Type | Description |
| --- | --- | --- |
| buffer | <code>object</code> | Resource instance TLV buffer. |
| resources | <code>object</code> | Object which stores resource identifier and resource type. |

**Example**  
```js
const buffer = Buffer.from([0x61, 0x16, 0xda, 0x01]);
const resources = {
  identifier: 5850,
  type: TLV.RESOURCE_TYPE.BOOLEAN,
};

const decoded = decodeResourceInstance(buffer, resources);
// decoded = { identifier: 5850, tlvSize: 4, type: TLV.RESOURCE_TYPE.BOOLEAN, value: true }
```
<a name="decodeResourceInstanceValue"></a>

## decodeResourceInstanceValue(buffer, resourceInstance) ⇒ <code>object</code>
Decodes resource instance value

**Kind**: global function  
**Returns**: <code>object</code> - decodedResourceValue - Decoded resource value  

| Param | Type | Description |
| --- | --- | --- |
| buffer | <code>object</code> | Resource instance value TLV buffer |
| resourceInstance | <code>object</code> | Object which stores resource type |

**Example**  
```js
const buffer = Buffer.from([0x01]);
const resourceInstance = {
  type: TLV.RESOURCE_TYPE.INTEGER,
};

const decoded = decodeResourceInstance(buffer, resources);
// decoded = 1
```
<a name="decodeResource"></a>

## decodeResource(buffer, resource) ⇒ <code>object</code>
Decodes resource.

**Kind**: global function  
**Returns**: <code>object</code> - buffer - Decoded resource.  

| Param | Type | Description |
| --- | --- | --- |
| buffer | <code>object</code> | Resource TLV buffer |
| resource | <code>object</code> | Object which stores identifier and resource type. |

**Example**  
```js
const buffer = Buffer.from([0xe1, 0x16, 0xda, 0x01]);
const resource = {
  identifier: 5850,
  type: TLV.RESOURCE_TYPE.BOOLEAN,
};

const decoded = decodeResource(buffer, resource);
// decoded = { identifier: 5850, type: 1, value: true, tlvSize: 4 }
```
<a name="decodeObjectInstance"></a>

## decodeObjectInstance(buffer, objectInstance) ⇒ <code>object</code>
Decodes object instance from TLV buffer.

**Kind**: global function  
**Returns**: <code>object</code> - object - Decoded object instance.  

| Param | Type | Description |
| --- | --- | --- |
| buffer | <code>object</code> | TLV buffer. |
| objectInstance | <code>object</code> | Object which stores object instance identifier and resources. |

**Example**  
```js
const buffer = Buffer.from([0x07, 0x00, 0xe4, 0x16, 0xb7, 0x44, 0x79, 0xff, 0x5c]);
const objectInstance: {
  identifier: 0,
  resources: [
    {
      identifier: 5815,
      type: TLV.RESOURCE_TYPE.FLOAT,
    },
  ]
};

const decoded = decodeObjectInstance(buffer, objectInstance);
// decoded = { identifier: 0, resources: [ { identifier: 5815, type: 3 } ] }
```
<a name="decodeObject"></a>

## decodeObject(buffer, object) ⇒ <code>object</code>
Decodes LwM2M object to TLV buffer.

**Kind**: global function  
**Returns**: <code>object</code> - object - Decoded object.  

| Param | Type | Description |
| --- | --- | --- |
| buffer | <code>object</code> | TLV buffer. |
| object | <code>object</code> | Object which stores object instances with their resources. |

**Example**  
```js
const buffer = Buffer.from([0x07, 0x00, 0xe4, 0x16, 0xb7, 0x44, 0x79, 0xff, 0x5c]);
const object = {
  identifier: 3305,
  objectInstances: [{
    identifier: 0,
    resources: [
      {
        identifier: 5815,
        type: TLV.RESOURCE_TYPE.FLOAT,
      },
    ]
  }]
};

const decoded = decodeObject(buffer, object);
/*
decoded = {
  identifier: 3305,
  objectInstances: [
    {
      identifier: 0,
      resources: [
        {
          identifier: 5815,
          type: 3,
          value: 999.989990234375,
          tlvSize: 7
        }
      ]
    }
  ]
}
*/
```
