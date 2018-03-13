'use strict';

const api = require('./8dev_restapi.js');
const emulate = require('./8dev_emulate/nodes/index.js');

module.exports.Service = api.Service;
module.exports.Device = api.Device;
module.exports.Emulate = emulate;
