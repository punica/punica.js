const chai = require('chai');

const { expect } = chai;

const { TLV } = require('../lwm2m');

describe('LwM2M TLV', () => {
  describe('encodeResourceValue', () => {
    const encode = TLV.encodeResourceValue;

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
  });
});
