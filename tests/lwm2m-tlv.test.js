const chai = require('chai');

const { expect } = chai;

const { TLV } = require('../lwm2m');

describe('LwM2M TLV', () => {
  describe('encodeResourceValue', () => {
    const encode = TLV.encodeResourceValue;
    it('should throw an error if resource type is not recognized or supported', (done) => {
      try {
        const res = {
          value: 'NAN',
          type: TLV.RESOURCE_TYPE.UNRECOGNIZABLE
        };
        encode(res);
      } catch (e) {
        done();
      }
    });

    it('should throw an error if resource type is a number which is not defined in resource type dictionary', (done) => {
      try {
        const res = {
          value: 'NAN',
          type: 99
        };
        encode(res);
      } catch (e) {
        done();
      }
    });

    it('should return empty buffer if resource type is set to none', () => {
      const res = {
        type: TLV.RESOURCE_TYPE.NONE,
        value: 0x80000000
      };

      expect(encode(res)).to.be.eql(Buffer.from([]));
    });

    it('should throw an error if resource type is set to none and value is not a number', (done) => {
      try {
        const res = {
          type: TLV.RESOURCE_TYPE.NONE,
          value: 'NAN'
        };
        encode(res);
      } catch (e) {
        done();
      }
    });

    it('should encode integer (0)', () => {
      const res = {
        type: TLV.RESOURCE_TYPE.INTEGER,
        value: 0
      };

      expect(encode(res)).to.be.eql(Buffer.from([0x00]));
    });

    it('should encode integer (1)', () => {
      const res = {
        type: TLV.RESOURCE_TYPE.INTEGER,
        value: 1
      };

      expect(encode(res)).to.be.eql(Buffer.from([0x01]));
    });

    it('should encode integer (-1)', () => {
      const res = {
        type: TLV.RESOURCE_TYPE.INTEGER,
        value: -1
      };

      expect(encode(res)).to.be.eql(Buffer.from([0xff]));
    });

    it('should encode integer (2^7 - 1)', () => {
      const res = {
        type: TLV.RESOURCE_TYPE.INTEGER,
        value: 127
      };

      expect(encode(res)).to.be.eql(Buffer.from([0x7f]));
    });

    it('should encode integer (-2^7)', () => {
      const res = {
        type: TLV.RESOURCE_TYPE.INTEGER,
        value: -128
      };

      expect(encode(res)).to.be.eql(Buffer.from([0x80]));
    });

    it('should encode integer (2^7)', () => {
      const res = {
        type: TLV.RESOURCE_TYPE.INTEGER,
        value: 128
      };

      expect(encode(res)).to.be.eql(Buffer.from([0x00, 0x80]));
    });

    it('should encode integer (2^15 - 1)', () => {
      const res = {
        type: TLV.RESOURCE_TYPE.INTEGER,
        value: 32767
      };

      expect(encode(res)).to.be.eql(Buffer.from([0x7f, 0xff]));
    });

    it('should encode integer (-2^15)', () => {
      const res = {
        type: TLV.RESOURCE_TYPE.INTEGER,
        value: -0x8000
      };

      expect(encode(res)).to.be.eql(Buffer.from([0x80, 0x00]));
    });

    it('should encode integer (2^15)', () => {
      const res = {
        type: TLV.RESOURCE_TYPE.INTEGER,
        value: 0x8000
      };

      expect(encode(res)).to.be.eql(Buffer.from([0x00, 0x00, 0x80, 0x00]));
    });

    it('should encode integer (2^31 - 1)', () => {
      const res = {
        type: TLV.RESOURCE_TYPE.INTEGER,
        value: 0x7fffffff
      };

      expect(encode(res)).to.be.eql(Buffer.from([0x7f, 0xff, 0xff, 0xff]));
    });

    it('should encode integer (-2^31)', () => {
      const res = {
        type: TLV.RESOURCE_TYPE.INTEGER,
        value: -0x80000000
      };

      expect(encode(res)).to.be.eql(Buffer.from([0x80, 0x00, 0x00, 0x00]));
    });

    it('should throw an error if resource type is set to integer and value is not a number', (done) => {
      try {
        const res = {
          type: TLV.RESOURCE_TYPE.INTEGER,
          value: 'NAN'
        };
        encode(res);
      } catch (e) {
        done();
      }
    });

    it('should throw an error if value is set as 64-bit integer', (done) => {
      try {
        const res = {
          type: TLV.RESOURCE_TYPE.INTEGER,
          value: 0x7ffffffff
        };
        encode(res);
      } catch (e) {
        done();
      }
    });

    it('should encode float (1.23)', () => {
      const res = {
        type: TLV.RESOURCE_TYPE.FLOAT,
        value: 1.23
      };

      expect(encode(res)).to.be.eql(Buffer.from([0x3f, 0x9d, 0x70, 0xa4]));
    });

    it('should throw an error if resource type is set to float and value is not a number', (done) => {
      try {
        const res = {
          type: TLV.RESOURCE_TYPE.FLOAT,
          value: 'NAN'
        };
        encode(res);
      } catch (e) {
        done();
      }
    });

    it('should encode boolean (true)', () => {
      const res = {
        type: TLV.RESOURCE_TYPE.BOOLEAN,
        value: true
      };

      expect(encode(res)).to.be.eql(Buffer.from([0x01]));
    });

    it('should throw an error if resource type is set to boolean and value is not a boolean', (done) => {
      try {
        const res = {
          type: TLV.RESOURCE_TYPE.BOOLEAN,
          value: 'Not boolean'
        };
        encode(res);
      } catch (e) {
        done();
      }
    });

    it('should encode string (text)', () => {
      const res = {
        type: TLV.RESOURCE_TYPE.STRING,
        value: 'text'
      };

      expect(encode(res)).to.be.eql(Buffer.from([0x74, 0x65, 0x78, 0x74]));
    });

    it('should throw an error if resource type is set to string and value is not a string', (done) => {
      try {
        const res = {
          type: TLV.RESOURCE_TYPE.STRING,
          value: 123
        };
        encode(res);
      } catch (e) {
        done();
      }
    });

    it('should handle opaque (Buffer <0x74, 0x65, 0x78, 0x74>)', () => {
      const buffer = Buffer.from([0x74, 0x65, 0x78, 0x74]);
      const res = {
        type: TLV.RESOURCE_TYPE.OPAQUE,
        value: buffer
      };

      expect(encode(res)).to.be.eql(buffer);
    });

    it('should throw an error if resource type is set to opaque and value is not a buffer', (done) => {
      try {
        const res = {
          type: TLV.RESOURCE_TYPE.OPAQUE,
          value: 'text'
        };
        encode(res);
      } catch (e) {
        done();
      }
    });
  });

  describe('decodeResourceValue', () => {
    const decode = TLV.decodeResourceValue;
    it('return 0 if given buffer is empty', () => {
      const buffer = Buffer.from([]);
      const res = {
        type: TLV.RESOURCE_TYPE.INTEGER,
      };

      expect(decode(buffer, res)).to.be.eql(0);
    });

    it('should decode buffer to 8 bit integer', () => {
      const buffer = Buffer.from([0x01]);
      const res = {
        type: TLV.RESOURCE_TYPE.INTEGER,
      };

      expect(decode(buffer, res)).to.be.eql(1);
    });

    it('should decode buffer to 16 bit integer', () => {
      const buffer = Buffer.from([0x00, 0x80]);
      const res = {
        type: TLV.RESOURCE_TYPE.INTEGER,
      };

      expect(decode(buffer, res)).to.be.eql(128);
    });

    it('should decode buffer to 32 bit integer', () => {
      const buffer = Buffer.from([0x7f, 0xff, 0xff, 0xff]);
      const res = {
        type: TLV.RESOURCE_TYPE.INTEGER,
      };

      expect(decode(buffer, res)).to.be.eql(0x7FFFFFFF);
    });

    it('should throw an error if given buffer length does not meet 8, 16, 32 bit integer', (done) => {
      try {
        const buffer = Buffer.from([0x7f, 0xff, 0xff]);
        const res = {
          type: TLV.RESOURCE_TYPE.INTEGER,
        };
        decode(buffer, res);
      } catch (e) {
        done();
      }
    });

    it('should decode buffer to float', () => {
      const buffer = Buffer.from([0x3f, 0x9d, 0x70, 0xa4]);
      const res = {
        type: TLV.RESOURCE_TYPE.FLOAT,
      };

      expect(Number(decode(buffer, res).toPrecision(7))).to.be.eql(1.23);
    });

    it('should decode buffer to double', () => {
      const buffer = Buffer.from([0x3f, 0xf3, 0xae, 0x14, 0x7a, 0xe1, 0x47, 0xae]);
      const res = {
        type: TLV.RESOURCE_TYPE.FLOAT,
      };

      expect(decode(buffer, res)).to.be.eql(1.23);
    });

    it('should throw an error if given buffer length does not meet float or double', (done) => {
      try {
        const buffer = Buffer.from([0x7f, 0xff, 0xff]);
        const res = {
          type: TLV.RESOURCE_TYPE.FLOAT,
        };
        decode(buffer, res);
      } catch (e) {
        done();
      }
    });

    it('should throw an error if resource type is a number which is not defined in resource type dictionary', (done) => {
      try {
        const buffer = Buffer.from([0x3f, 0x9d, 0x70, 0xa4]);
        const res = {
          type: 99,
        };
        decode(buffer, res);
      } catch (e) {
        done();
      }
    });

    it('should decode buffer to string', () => {
      const buffer = Buffer.from([0x74, 0x65, 0x78, 0x74]);
      const res = {
        type: TLV.RESOURCE_TYPE.STRING,
      };

      expect(decode(buffer, res)).to.be.eql('text');
    });

    it('should decode buffer to boolean', () => {
      const buffer = Buffer.from([0x01]);
      const res = {
        type: TLV.RESOURCE_TYPE.BOOLEAN,
      };

      expect(decode(buffer, res)).to.be.eql(true);
    });

    it('should handle opaque resource type and return buffer', () => {
      const buffer = Buffer.from([0x02]);
      const res = {
        type: TLV.RESOURCE_TYPE.OPAQUE,
      };

      expect(decode(buffer, res)).to.be.eql(Buffer.from([0x02]));
    });
  });

  describe('encodeTLV', () => {
    const { encode } = TLV;
    it('should encode resource with 16 bit value length and return a buffer', () => {
      const res = {
        identifier: 5850,
        type: TLV.TYPE.RESOURCE,
        value: Buffer.alloc(256),
      };
      const encoded = encode(res);
      const expectedBuffer = Buffer.concat([
        Buffer.from([0xF0, 0x16, 0xda, 0x01, 0x00]),
        Buffer.alloc(256)
      ]);
      expect(encoded).to.be.eql(expectedBuffer);
    });

    it('should encode resource with 24 bit value length and return a buffer', () => {
      const res = {
        identifier: 5850,
        type: TLV.TYPE.RESOURCE,
        value: Buffer.alloc(0x3987D),
      };
      const encoded = encode(res);
      const expectedBuffer = Buffer.concat([
        Buffer.from([0xF8, 0x16, 0xda, 0x03, 0x98, 0x7d]),
        Buffer.alloc(0x3987D)
      ]);
      expect(encoded).to.be.eql(expectedBuffer);
    });

    it('should throw an error if given value is not a buffer', (done) => {
      try {
        const res = {
          identifier: 5850,
          type: TLV.TYPE.RESOURCE,
          value: 'Not a buffer'
        };
        encode(res);
      } catch (e) {
        done();
      }
    });

    it('should throw an error if given identifier is not a number', (done) => {
      try {
        const res = {
          identifier: 'NAN',
          type: TLV.TYPE.RESOURCE,
          value: Buffer.from([0x74, 0x65, 0x78, 0x74])
        };
        encode(res);
      } catch (e) {
        done();
      }
    });
  });

  describe('decodeTLV', () => {
    const { decode } = TLV;
    it('should throw an error if given value is not a buffer', (done) => {
      try {
        const buffer = 'Not a buffer';
        decode(buffer);
      } catch (e) {
        done();
      }
    });
  });

  describe('encodeResourceTLV', () => {
    const encode = TLV.encodeResource;
    it('should encode resource and return a buffer', () => {
      const res = {
        identifier: 5850,
        type: TLV.RESOURCE_TYPE.BOOLEAN,
        value: true
      };
      expect(encode(res)).to.be.eql(Buffer.from([0xe1, 0x16, 0xda, 0x01]));
    });

    it('should encode multiple resources instance and return a buffer', () => {
      const res = {
        identifier: 5850,
        type: TLV.RESOURCE_TYPE.BOOLEAN,
        value: [true, false]
      };
      const expectedBuffer = Buffer.from([0xa6, 0x16, 0xda, 0x41, 0x00, 0x01, 0x41, 0x01, 0x00]);
      expect(encode(res)).to.be.eql(expectedBuffer);
    });
  });

  describe('decodeResourceTLV', () => {
    const decode = TLV.decodeResource;
    it('should decode resource and return its identifier, type, value, tlv size', () => {
      const buffer = Buffer.from([0xe1, 0x16, 0xda, 0x01]);
      const res = {
        identifier: 5850,
        type: TLV.RESOURCE_TYPE.BOOLEAN,
      };
      const decoded = decode(buffer, res);
      expect(typeof decoded).to.be.eql('object');
      expect(decoded.identifier).to.be.eql(5850);
      expect(decoded.type).to.be.eql(1);
      expect(decoded.value).to.be.eql(true);
      expect(decoded.tlvSize).to.be.eql(4);
    });

    it('should decode multiple resources and return its identifier, type, value, tlv size', () => {
      const buffer = Buffer.from([0xa6, 0x16, 0xda, 0x41, 0x00, 0x01, 0x41, 0x01, 0x00]);
      const res = {
        identifier: 5850,
        type: TLV.RESOURCE_TYPE.BOOLEAN,
      };
      const decoded = decode(buffer, res);
      expect(typeof decoded).to.be.eql('object');
      expect(decoded.identifier).to.be.eql(5850);
      expect(decoded.type).to.be.eql(1);
      expect(decoded.value).to.be.eql([true, false]);
      expect(decoded.tlvSize).to.be.eql(9);
    });
  });

  describe('encodeResourceInstanceTLV', () => {
    const encode = TLV.encodeResourceInstance;
    it('should encode resource instance and return a buffer', () => {
      const res = {
        identifier: 5850,
        type: TLV.RESOURCE_TYPE.BOOLEAN,
        value: true
      };
      expect(encode(res)).to.be.eql(Buffer.from([0x61, 0x16, 0xda, 0x01]));
    });
  });

  describe('decodeResourceInstanceTLV', () => {
    const decode = TLV.decodeResourceInstance;
    it('should decode resource instance', () => {
      const buffer = Buffer.from([0x61, 0x16, 0xda, 0x01]);
      const res = {
        identifier: 5850,
        type: TLV.RESOURCE_TYPE.BOOLEAN,
      };
      const decoded = decode(buffer, res);
      expect(decoded).to.be.eql({
        identifier: 5850,
        tlvSize: 4,
        type: TLV.RESOURCE_TYPE.BOOLEAN,
        value: true
      });
    });
  });

  describe('encodeObjectTLV', () => {
    const encode = TLV.encodeObject;
    it('should encode object with its instaces and resources', () => {
      const obj = {
        identifier: 3305,
        objectInstances: [{
          identifier: 0,
          resources: [
            {
              identifier: 5800,
              type: TLV.RESOURCE_TYPE.FLOAT,
              value: 0
            },
            {
              identifier: 5805,
              type: TLV.RESOURCE_TYPE.FLOAT,
              value: 1
            },
            {
              identifier: 5810,
              type: TLV.RESOURCE_TYPE.FLOAT,
              value: 1.23
            },
            {
              identifier: 5815,
              type: TLV.RESOURCE_TYPE.FLOAT,
              value: 999.99
            },
          ]
        }]
      };
      const encoded = encode(obj);
      const buffer = Buffer.from([0x08, 0x00, 0x1c,
        0xe4, 0x16, 0xa8, 0x00, 0x00, 0x00, 0x00,
        0xe4, 0x16, 0xad, 0x3f, 0x80, 0x00, 0x00,
        0xe4, 0x16, 0xb2, 0x3f, 0x9d, 0x70, 0xa4,
        0xe4, 0x16, 0xb7, 0x44, 0x79, 0xff, 0x5c]);
      expect(encoded).to.be.eql(buffer);
    });
  });

  describe('decodeObjectTLV', () => {
    const decode = TLV.decodeObject;
    it('should decode object with its instaces and resources', () => {
      const buffer = Buffer.from([0x08, 0x00, 0x1c,
        0xe4, 0x16, 0xa8, 0x00, 0x00, 0x00, 0x00,
        0xe4, 0x16, 0xad, 0x3f, 0x9d, 0x70, 0xa4,
        0xe4, 0x16, 0xb2, 0x44, 0x79, 0xff, 0x5c,
        0xe4, 0x16, 0xb7, 0x3f, 0x80, 0x00, 0x00]);
      const obj = {
        identifier: 3305,
        objectInstances: [{
          identifier: 0,
          resources: [
            {
              identifier: 5800,
              type: TLV.RESOURCE_TYPE.FLOAT,
            },
            {
              identifier: 5805,
              type: TLV.RESOURCE_TYPE.FLOAT,
            },
            {
              identifier: 5810,
              type: TLV.RESOURCE_TYPE.FLOAT,
            },
            {
              identifier: 5815,
              type: TLV.RESOURCE_TYPE.FLOAT,
            },
          ]
        }]
      };
      const decoded = decode(buffer, obj);
      const values = [];
      for (let i = 0; i < decoded.objectInstances[0].resources.length; i += 1) {
        values.push(decoded.objectInstances[0].resources[i].value);
      }
      expect(Number(values[0].toPrecision(7))).to.be.eql(0);
      expect(Number(values[1].toPrecision(7))).to.be.eql(1.23);
      expect(Number(values[2].toPrecision(7))).to.be.eql(999.99);
      expect(Number(values[3].toPrecision(7))).to.be.eql(1);
    });
  });
});
