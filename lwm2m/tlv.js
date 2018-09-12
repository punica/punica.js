/**
 * Represents LwM2M variable (identifier) types (OBJECT_INSTANCE,
 * MULTIPLE_RESOURCE, RESOURCE_INSTANCE, RESOURCE).
*/
const TYPE = {
  OBJECT_INSTANCE: 0b00,
  MULTIPLE_RESOURCE: 0b10,
  RESOURCE_INSTANCE: 0b01,
  RESOURCE: 0b11,
};

/**
 * Represents resource type (NONE, BOOLEAN, INTEGER, FLOAT, STRING, OPAQUE).
 */
const RESOURCE_TYPE = {
  NONE: 0,
  BOOLEAN: 1,
  INTEGER: 2,
  FLOAT: 3,
  STRING: 4,
  OPAQUE: 5,
};

/**
 * Converts bytes to integer.
 * @private
 * @param {object} binaryData - Buffer which will be converted.
 * @returns {number} integer - Integer value.
 */
function binaryToInteger(binaryData) {
  return parseInt(binaryData.toString('hex'), 16);
}

/**
 * Converts bytes to string.
 * @private
 * @param {object} binaryData - Buffer which will be converted.
 * @returns {string} string - String value.
 */
function binaryToBitString(binaryData) {
  return binaryToInteger(binaryData).toString(2);
}

/**
 * Changes buffer size.
 * @private
 * @param {object} buffer - Buffer which size will be changed.
 * @param {number} start - Buffer's start index.
 * @param {number} end - Buffer's end index.
 * @returns {object} buffer - New size buffer.
 */
function changeBufferSize(buffer, start, end = buffer.length) {
  const bufferArray = [];
  let index = start;

  if (!(buffer instanceof Buffer)) {
    throw Error('Given argument is not a buffer');
  }

  if (start < 0) {
    throw Error('Wanted buffer start is negative number');
  }

  if (buffer.length < end) {
    throw Error('Buffer length is smaller than wanted buffer end');
  }

  if (start > end) {
    throw Error('Wanted buffer start is larger number than end');
  }

  while (index < end) {
    bufferArray.push(buffer[index]);
    index += 1;
  }

  return Buffer.from(bufferArray);
}

/**
 * Gets dictionary by given name of the key and value.
 * @param {object} dictionaryList - Dictionary list.
 * @param {Object|string} keyName - Name of the key
 * @param {Object|string|number} value - Value
 * @returns {Object|string|number} dictionary
 */
function getDictionaryByValue(dictionaryList, keyName, value) {
  return dictionaryList.find(dictionary => (dictionary[keyName] === value));
}

/**
 * Encodes value of the resource.
 * @param {object} resource - Object which stores resource value and value's type.
 * @returns {object} buffer - Buffer of encoded value.
 * @example
 * const resource = {
 *  type: TLV.RESOURCE_TYPE.INTEGER,
 *  value: 1
 * };
 *
 * const encodedValue = encodeResourceValue(resource);
 * // encodedValue = <Buffer 01>
 */
function encodeResourceValue(resource) {
  const MIN_INT8 = -0x80;
  const MAX_INT8 = 0x7f;
  const MIN_INT16 = -0x8000;
  const MAX_INT16 = 0x7fff;
  const MIN_INT32 = -0x80000000;
  const MAX_INT32 = 0x7fffffff;

  let buffer;

  if (typeof (resource.type) !== 'number') {
    throw Error(`Unrecognised type (${typeof (resource.type)})`);
  }

  switch (resource.type) {
    case RESOURCE_TYPE.NONE:
      if (typeof (resource.value) !== 'number') {
        throw Error(`Unrecognised value type (${typeof (resource.value)})`);
      }

      return Buffer.from([]);

    case RESOURCE_TYPE.INTEGER:
      if (typeof (resource.value) !== 'number') {
        throw Error(`Cannot encode ${typeof (resource.value)} as integer`);
      }


      if (resource.value >= MIN_INT8 && resource.value <= MAX_INT8) {
        buffer = Buffer.alloc(1);
        buffer.writeInt8(resource.value);
      } else if (resource.value >= MIN_INT16 && resource.value <= MAX_INT16) {
        buffer = Buffer.alloc(2);
        buffer.writeInt16BE(resource.value);
      } else if (resource.value >= MIN_INT32 && resource.value <= MAX_INT32) {
        buffer = Buffer.alloc(4);
        buffer.writeInt32BE(resource.value);
      } else {
        // XXX: this could be implemented with long.js module,
        // but until there's a real issue no need to add another dependency
        throw Error('64-bit integers are not supported');
      }

      return buffer;

    case RESOURCE_TYPE.FLOAT: {
      if (typeof (resource.value) !== 'number') {
        throw Error(`Cannot encode ${typeof (resource.value)} as float`);
      }

      buffer = Buffer.alloc(4);
      buffer.writeFloatBE(resource.value);
      return buffer;
    }

    case RESOURCE_TYPE.BOOLEAN:
      if (typeof (resource.value) !== 'boolean') {
        throw Error(`Cannot encode ${typeof (resource.value)} as boolean`);
      }

      return resource.value ? Buffer.from([1]) : Buffer.from([0]);

    case RESOURCE_TYPE.STRING:
      if (typeof (resource.value) !== 'string') {
        throw Error(`Cannot encode ${typeof (resource.value)} as string`);
      }

      return Buffer.from(resource.value, 'ascii');

    case RESOURCE_TYPE.OPAQUE:
      if (!(resource.value instanceof Buffer)) {
        throw Error(`Cannot encode ${typeof (resource.value)} as Buffer`);
      }

      return resource.value;

    default:
      throw Error(`Unrecognised type (${resource.type})`);
  }
}

/**
 * Decodes value of the resource.
 * @param {object} buffer - Buffer which will be decoded.
 * @param {object} resource - Object which stores resource value's type.
 * @returns {Object|string|number|boolean} value - Decoded value in specified type
 * @example
 * const buffer = Buffer.from([0x01]);
 * const resource = {
 *   type: TLV.RESOURCE_TYPE.INTEGER,
 * };
 *
 * const decodedValue = decodeResourceValue(buffer, resource);
 * // decodedValue = 1
 */
function decodeResourceValue(buffer, resource) {
  switch (resource.type) {
    case RESOURCE_TYPE.INTEGER:
      switch (buffer.length) {
        case 0:
          return 0;

        case 1:
          return buffer.readInt8();

        case 2:
          return buffer.readInt16BE();

        case 4:
          return buffer.readInt32BE();

        default:
          throw Error(`Incorrect integer value length (${buffer.length})`);
      }

    case RESOURCE_TYPE.FLOAT:
      switch (buffer.length) {
        case 4:
          return buffer.readFloatBE();

        case 8:
          return buffer.readDoubleBE();

        default:
          throw Error(`Incorrect float value length (${buffer.length})`);
      }

    case RESOURCE_TYPE.STRING:
      return buffer.toString('ascii');

    case RESOURCE_TYPE.BOOLEAN:
      return binaryToBitString(buffer) !== '0';

    case RESOURCE_TYPE.OPAQUE:
      return buffer;

    default:
      throw Error(`Unrecognised resource type (${resource.type})`);
  }
}

/**
 * Encodes ant type of instance (Object instance, multiple resources, resources instance, resource).
 * @param {object} object - object which stores type, identifier and value.
 * @returns {object} buffer - encoded TLV buffer.
 * @example
 * const resource = {
 *   identifier: 5850,
 *   type: TLV.RESOURCE_TYPE.BOOLEAN,
 *   value: true
 * };
 *
 * const encoded = encode({
 *   type: TYPE.RESOURCE,
 *   identifier: resource.identifier,
 *   value: encodeResourceValue(resource),
 * });
 * // encoded = <Buffer e1 16 da 01>
 */
function encode(object) {
  let identifierBuffer;
  let lengthBuffer;
  let typeByte = 0;

  if (!(object.value instanceof Buffer)) {
    throw Error('Encodable object value is not a buffer');
  }

  if (typeof (object.identifier) !== 'number') {
    throw Error('Encodable object identifier is not a number');
  }

  typeByte += object.type << 6; // eslint-disable-line no-bitwise

  if (object.identifier >= (1 << 8)) { // eslint-disable-line no-bitwise
    typeByte += 1 << 5; // eslint-disable-line no-bitwise
    identifierBuffer = Buffer.from([
      object.identifier / (1 << 8), // eslint-disable-line no-bitwise
      object.identifier % (1 << 8), // eslint-disable-line no-bitwise
    ]);
  } else {
    identifierBuffer = Buffer.from([object.identifier]);
  }

  if (object.value.length >= (1 << 16)) { // eslint-disable-line no-bitwise
    typeByte += 3 << 3; // eslint-disable-line no-bitwise

    lengthBuffer = Buffer.from([
      object.value.length / (1 << 16), // eslint-disable-line no-bitwise
      object.value.length / (1 << 8), // eslint-disable-line no-bitwise
      object.value.length % (1 << 8), // eslint-disable-line no-bitwise
    ]);
  } else if (object.value.length >= (1 << 8)) { // eslint-disable-line no-bitwise
    typeByte += 2 << 3; // eslint-disable-line no-bitwise

    lengthBuffer = Buffer.from([
      object.value.length / (1 << 8), // eslint-disable-line no-bitwise
      object.value.length % (1 << 8), // eslint-disable-line no-bitwise
    ]);
  } else if (object.value.length >= (1 << 3)) { // eslint-disable-line no-bitwise
    typeByte += 1 << 3; // eslint-disable-line no-bitwise

    lengthBuffer = Buffer.from([object.value.length]);
  } else {
    typeByte += object.value.length;

    lengthBuffer = Buffer.from([]);
  }

  return Buffer.concat([
    Buffer.from([typeByte]),
    identifierBuffer,
    lengthBuffer,
    object.value,
  ]);
}

/**
 * Encodes resource instance to TLV buffer.
 * @param {object} resourceInstance - Object which stores resource identifier, value and it's type.
 * @returns {object} buffer - Buffer in TLV format
 * @example
 * const resourceInstance = {
 *   identifier: 5850,
 *   type: TLV.RESOURCE_TYPE.BOOLEAN,
 *   value: true
 * };
 *
 * const encoded = encodeResourceInstance(resourceInstance);
 * // encoded = <Buffer e1 16 da 01>
 */
function encodeResourceInstance(resourceInstance) {
  return encode({
    type: TYPE.RESOURCE_INSTANCE,
    identifier: resourceInstance.identifier,
    value: encodeResourceValue(resourceInstance),
  });
}

/**
 * Encodes multiple resource values to TLV buffer.
 * @param {object} resources - Object which stores identifier, resource type, and multiple values.
 * @returns {object} buffer - TLV buffer.
 * @example
 * const resources = {
 *   identifier: 5850,
 *   type: TLV.RESOURCE_TYPE.BOOLEAN,
 *   value: [true, false]
 * };
 *
 * const encoded = encodeMultipleResources(resources);
 * // encoded = <Buffer a6 16 da 41 00 01 41 01 00>
 */
function encodeMultipleResourcesTLV(resources) {
  const resourceInstancesBuffers = [];

  for (let index = 0; index < resources.value.length; index += 1) {
    resourceInstancesBuffers.push(encodeResourceInstance({
      type: resources.type,
      identifier: index,
      value: resources.value[index],
    }));
  }

  return encode({
    type: TYPE.MULTIPLE_RESOURCE,
    identifier: resources.identifier,
    value: Buffer.concat(resourceInstancesBuffers),
  });
}

/**
 * Encodes resource to TLV buffer.
 * @param {object} resource - Object which stores resource identifier, type and value.
 * @returns {object} buffer - TLV buffer.
 * @example
 * const resource = {
 *   identifier: 5850,
 *   type: TLV.RESOURCE_TYPE.BOOLEAN,
 *   value: true
 * };
 *
 * const encoded = encodeResourcez(resource);
 * // encoded = <Buffer e1 16 da 01>
 */
function encodeResource(resource) {
  if (resource.value instanceof Array) {
    return encodeMultipleResourcesTLV(resource);
  }

  return encode({
    type: TYPE.RESOURCE,
    identifier: resource.identifier,
    value: encodeResourceValue(resource),
  });
}

/**
 * Encodes LwM2M object instance to TLV buffer.
 * @param {object} objectInstance - LwM2M object.
 * @returns {object} buffer - TLV buffer.
 * @example
 * const objectInstance = {
 *   identifier: 0,
 *   resources: [
 *     {
 *       identifier: 5815,
 *       type: TLV.RESOURCE_TYPE.FLOAT,
 *       value: 999.99
 *     }
 *   ]
 * };
 *
 * const encoded = encodeObjectInstanceTLV(objectInstance);
 * // encoded = <Buffer 07 00 e4 16 b7 44 79 ff 5c>
 */
function encodeObjectInstance(objectInstance) {
  const resourcesBuffers = [];

  for (let index = 0; index < objectInstance.resources.length; index += 1) {
    resourcesBuffers.push(encodeResource(objectInstance.resources[index]));
  }

  return encode({
    type: TYPE.OBJECT_INSTANCE,
    identifier: objectInstance.identifier,
    value: Buffer.concat(resourcesBuffers),
  });
}

/**
 * Encodes LwM2M object to TLV buffer.
 * @param {object} object - LwM2M object.
 * @returns {object} buffer - TLV buffer.
 * @example
 * const object = {
 *   identifier: 3305,
 *   objectInstances: [{
 *     identifier: 0,
 *     resources: [
 *       {
 *         identifier: 5815,
 *         type: TLV.RESOURCE_TYPE.FLOAT,
 *         value: 999.99
 *       }
 *     ]
 *   }]
 * };
 *
 * const encoded = encodeObject(object);
 * // encoded = <Buffer 07 00 e4 16 b7 44 79 ff 5c>
 */
function encodeObject(object) {
  const objectInstancesBuffers = [];

  for (let index = 0; index < object.objectInstances.length; index += 1) {
    objectInstancesBuffers.push(encodeObjectInstance(object.objectInstances[index]));
  }

  return Buffer.concat(objectInstancesBuffers);
}

/**
 * Decodes any TLV buffer.
 * @param {object} buffer - encoded TLV buffer.
 * @returns {object} object - Decoded object.
 * @example
 * const buffer = Buffer.from([0xe1, 0x16, 0xda, 0x01]);
 *
 * const decoded = TLV.decode(buffer);
 * // decoded = { type: 3, identifier: 5850, value: <Buffer 01>, tlvSize: 4 }
 */
function decode(buffer) {
  let i;
  let valueIdentifier;
  let index = 1;
  let valueLength = 0;

  if (!(buffer instanceof Buffer)) {
    throw Error('Given argument is not a buffer');
  }

  if (buffer.length < 2) {
    throw Error('Given buffer is too short to store tlv data');
  }

  valueIdentifier = buffer[index];
  index += 1;

  i = index;
  if ((index + (buffer[0] >> 5) & 0b1) > 0) { // eslint-disable-line no-bitwise
    if (buffer[i] === undefined) {
      throw Error('Given buffer is corrupted (missing data)');
    }

    valueIdentifier = (valueIdentifier << 8) + buffer[i]; // eslint-disable-line no-bitwise
    i += 1;
  }

  index = i;

  if ((buffer[0] >> 3) & 0b11 > 0) { // eslint-disable-line no-bitwise
    while (i < (index + ((buffer[0] >> 3) & 0b11))) { // eslint-disable-line no-bitwise
      if (buffer[i] === undefined) {
        throw Error('Given buffer is corrupted (missing data)');
      }

      valueLength = (valueLength << 8) + buffer[i]; // eslint-disable-line no-bitwise
      i += 1;
    }
  } else {
    valueLength = buffer[0] & 0b111; // eslint-disable-line no-bitwise
  }
  index = i;

  return {
    type: buffer[0] >> 6, // eslint-disable-line no-bitwise
    identifier: valueIdentifier,
    value: changeBufferSize(buffer, index, index + valueLength),
    tlvSize: index + valueLength,
  };
}

/**
 * Decodes resource instance.
 * @param {object} buffer - Resource instance TLV buffer.
 * @param {object} resources - Object which stores resource identifier and resource type.
 * @return {object} decodedResource - Object which stores resource identifier,
 * tlvSize resource type and value.
 * @example
 * const buffer = Buffer.from([0x61, 0x16, 0xda, 0x01]);
 * const resources = {
 *   identifier: 5850,
 *   type: TLV.RESOURCE_TYPE.BOOLEAN,
 * };
 *
 * const decoded = decodeResourceInstance(buffer, resources);
 * // decoded = { identifier: 5850, tlvSize: 4, type: TLV.RESOURCE_TYPE.BOOLEAN, value: true }
 */
function decodeResourceInstance(buffer, resources) {
  const decodedResourceInstance = decode(buffer);

  if (decodedResourceInstance.type !== TYPE.RESOURCE_INSTANCE) {
    throw Error('Decoded resource TLV type is not resource instance');
  }

  return {
    type: resources.type,
    identifier: decodedResourceInstance.identifier,
    value: decodeResourceValue(decodedResourceInstance.value, resources),
    tlvSize: decodedResourceInstance.tlvSize,
  };
}

/**
 * Decodes resource instance value
 * @param {object} buffer - Resource instance value TLV buffer
 * @param {object} resourceInstance - Object which stores resource type
 * @return {object} decodedResourceValue - Decoded resource value
 * @example
 * const buffer = Buffer.from([0x01]);
 * const resourceInstance = {
 *   type: TLV.RESOURCE_TYPE.INTEGER,
 * };
 *
 * const decoded = decodeResourceInstance(buffer, resources);
 * // decoded = 1
 */
function decodeResourceInstanceValue(buffer, resourceInstance) {
  const decodedResourceInstance = decode(buffer);

  if (decodedResourceInstance.type !== TYPE.RESOURCE_INSTANCE) {
    throw Error('Decoded resource TLV type is not resource instance');
  }

  return {
    value: decodeResourceValue(decodedResourceInstance.value, resourceInstance),
    tlvSize: decodedResourceInstance.tlvSize,
  };
}

/**
 * Decodes multiple resource TLV buffer
 * @private
 * @param {object} buffer - TLV buffer.
 * @param {object} resources - Object which stores identifier and resource type.
 * @returns {object} buffer - decoded resource.
 * @example
 * const buffer = Buffer.from([0xa6, 0x16, 0xda, 0x41, 0x00, 0x01, 0x41, 0x01, 0x00]);
 * const resource = {
 *   identifier: 5850,
 *   type: TLV.RESOURCE_TYPE.BOOLEAN,
 * };
 *
 * const decoded = decodeMultipleResourceInstancesTLV(buffer, resource);
 * // decoded = { identifier: 5850, type: 1, value: [true, false], tlvSize: 9 }
 */
function decodeMultipleResourceInstancesTLV(buffer, resources) {
  const decodedResourceValues = [];
  let decodedResourceInstance;
  let index = 0;

  while (index < buffer.length) {
    decodedResourceInstance = decodeResourceInstanceValue(
      changeBufferSize(buffer, index),
      resources
    );
    decodedResourceValues.push(decodedResourceInstance.value);
    index += decodedResourceInstance.tlvSize;
  }

  return {
    identifier: resources.identifier,
    type: resources.type,
    value: decodedResourceValues,
  };
}

/**
 * Decodes resource.
 * @param {object} buffer - Resource TLV buffer
 * @param {object} resource - Object which stores identifier and resource type.
 * @returns {object} buffer - Decoded resource.
 * @example
 * const buffer = Buffer.from([0xe1, 0x16, 0xda, 0x01]);
 * const resource = {
 *   identifier: 5850,
 *   type: TLV.RESOURCE_TYPE.BOOLEAN,
 * };
 *
 * const decoded = decodeResource(buffer, resource);
 * // decoded = { identifier: 5850, type: 1, value: true, tlvSize: 4 }
 */
function decodeResource(buffer, resource) {
  const decodedResource = decode(buffer);
  let resourceValue;

  if (resource.identifier !== decodedResource.identifier) {
    throw Error('Decoded resource TLV identifier and description identifiers do not match');
  }

  if (decodedResource.type === TYPE.RESOURCE) {
    resourceValue = decodeResourceValue(decodedResource.value, resource);
  } else if (decodedResource.type === TYPE.MULTIPLE_RESOURCE) {
    resourceValue = decodeMultipleResourceInstancesTLV(decodedResource.value, resource).value;
  } else {
    throw Error('TLV type is not resource or multiple resource');
  }

  return {
    identifier: resource.identifier,
    type: resource.type,
    value: resourceValue,
    tlvSize: decodedResource.tlvSize,
  };
}

/**
 * Decodes object instance from TLV buffer.
 * @param {object} buffer - TLV buffer.
 * @param {object} objectInstance - Object which stores object instance identifier and resources.
 * @returns {object} object - Decoded object instance.
 * @example
 * const buffer = Buffer.from([0x07, 0x00, 0xe4, 0x16, 0xb7, 0x44, 0x79, 0xff, 0x5c]);
 * const objectInstance: {
 *   identifier: 0,
 *   resources: [
 *     {
 *       identifier: 5815,
 *       type: TLV.RESOURCE_TYPE.FLOAT,
 *     },
 *   ]
 * };
 *
 * const decoded = decodeObjectInstance(buffer, objectInstance);
 * // decoded = { identifier: 0, resources: [ { identifier: 5815, type: 3 } ] }
 */
function decodeObjectInstance(buffer, objectInstance) {
  const decodedObjectInstance = decode(buffer);
  const decodedResources = [];
  let remainingBuffer;
  let resourceIdentifier;
  let resourceDescription;
  let decodedResource;
  let index = 0;

  while (index < decodedObjectInstance.value.length) {
    remainingBuffer = changeBufferSize(decodedObjectInstance.value, index);
    resourceIdentifier = decode(remainingBuffer).identifier;

    resourceDescription = getDictionaryByValue(objectInstance.resources, 'identifier', resourceIdentifier);

    if (resourceDescription === undefined) {
      throw Error(`No resource description found (x/${objectInstance.identifier}/${resourceIdentifier})`);
    }

    decodedResource = decodeResource(remainingBuffer, resourceDescription);
    decodedResources.push(decodedResource);
    index += decodedResource.tlvSize;
  }

  return {
    identifier: objectInstance.identifier,
    resources: decodedResources,
  };
}

/**
 * Decodes LwM2M object to TLV buffer.
 * @param {object} buffer - TLV buffer.
 * @param {object} object - Object which stores object instances with their resources.
 * @returns {object} object - Decoded object.
 * @example
 * const buffer = Buffer.from([0x07, 0x00, 0xe4, 0x16, 0xb7, 0x44, 0x79, 0xff, 0x5c]);
 * const object = {
 *   identifier: 3305,
 *   objectInstances: [{
 *     identifier: 0,
 *     resources: [
 *       {
 *         identifier: 5815,
 *         type: TLV.RESOURCE_TYPE.FLOAT,
 *       },
 *     ]
 *   }]
 * };
 *
 * const decoded = decodeObject(buffer, object);
 * /*
 * decoded = {
 *   identifier: 3305,
 *   objectInstances: [
 *     {
 *       identifier: 0,
 *       resources: [
 *         {
 *           identifier: 5815,
 *           type: 3,
 *           value: 999.989990234375,
 *           tlvSize: 7
 *         }
 *       ]
 *     }
 *   ]
 * }
 * *\/
 */
function decodeObject(buffer, object) {
  const decodedObjectInstances = [];
  let remainingBuffer;
  let objectInstanceIdentifier;
  let objectInstanceDescription;
  let decodedObjectInstance;
  let index = 0;

  while (index < buffer.length) {
    remainingBuffer = changeBufferSize(buffer, index);
    objectInstanceIdentifier = decode(remainingBuffer).identifier;

    objectInstanceDescription = getDictionaryByValue(object.objectInstances, 'identifier', objectInstanceIdentifier);

    if (objectInstanceDescription === undefined) {
      throw Error(`No object instance description found (/${object.identifier}/${objectInstanceIdentifier})`);
    }

    decodedObjectInstance = decodeObjectInstance(remainingBuffer, objectInstanceDescription);
    decodedObjectInstances.push(decodedObjectInstance);
    index += decodedObjectInstance.tlvSize;
  }

  return {
    identifier: object.identifier,
    objectInstances: decodedObjectInstances,
  };
}

module.exports = {
  TYPE,
  RESOURCE_TYPE,
  getDictionaryByValue,
  encode,
  decode,
  encodeResourceValue,
  decodeResourceValue,
  encodeResource,
  decodeResource,
  encodeResourceInstance,
  decodeResourceInstance,
  encodeObjectInstance,
  decodeObjectInstance,
  encodeObject,
  decodeObject,
};
