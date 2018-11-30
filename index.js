

const api = require('./punica.js');
const lwm2m = require('./lwm2m/index.js');

module.exports.Service = api.Service;
module.exports.Device = api.Device;
module.exports.Lwm2m = lwm2m;
