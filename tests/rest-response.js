const ip = require('ip');

module.exports = {
  authentication: {
    access_token: 'eyJ0eXMiJ9.eyJppbiJ9.2HBtDz-bzdTPcYu-rNbwG-J9NC3P-f7kT6_YsNA',
    expires_in: 3600
  },
  firstAuthentication: {
    access_token: 'first0eXMiJ9.eyJppbiJ9.2HBtDz-bzdTPcYu-rNbwG-J9NC3P-f7kT6_YsNA',
    expires_in: 1
  },
  secondAuthentication: {
    access_token: 'second0eXMiJ9.eyJppbiJ9.2HBtDz-bzdTPcYu-rNbwG-J9NC3P-f7kT6_YsNA',
    expires_in: 1
  },
  entry: { psk_id: 'cHNraWQy', uuid: 'DEF' },
  devicesEntries: [{ psk_id: 'cHNraWQx', uuid: 'ABC' }, { psk_id: 'cHNraWQy', uuid: 'DEF' }, { psk_id: 'cHNraWQz', uuid: 'GHI' }],
  createdRegisteredDevice: { psk: 'cHNrMQ==', psk_id: 'cHNraWQy', uuid: 'DEF' },
  endpoints: [
    {
      name: 'threeEight', type: '8dev_3800', status: 'ACTIVE', q: true,
    },
    {
      name: 'fourFive', type: '8dev_4500', status: 'ACTIVE', q: true,
    },
    {
      name: 'threeSeven', type: '8dev_3700', status: 'ACTIVE', q: true,
    },
    {
      name: 'fourFour', type: '8dev_4400', status: 'ACTIVE', q: true,
    },
    {
      name: 'fourFour1', type: '8dev_4400', status: 'ACTIVE', q: true,
    },
  ],
  sensorObjects: [
    { uri: '/1/0' },
    { uri: '/2/0' },
    { uri: '/3/0' },
    { uri: '/4/0' },
    { uri: '/5/0' },
    { uri: '/6/0' },
    { uri: '/7/0' },
    { uri: '/3305/0' },
    { uri: '/3312/0' },
  ],
  readRequest: {
    'async-response-id': '1521817656#367da52f-6d0c-8550-b218-571b',
  },
  writeRequest: {
    'async-response-id': '1521817656#367da52f-6d0c-8550-b218-571w',
  },
  executeRequest: {
    'async-response-id': '1521817656#367da52f-6d0c-8550-b218-571e',
  },
  observeRequest: {
    'async-response-id': '1521817656#367da52f-6d0c-8550-b218-571o',
  },
  readResponse: {
    registrations: [],
    'reg-updates': [],
    'de-registrations': [],
    'async-responses': [
      {
        timestamp: 1400009933, id: '1521817656#367da52f-6d0c-8550-b218-571b', status: 200, payload: '5Ba3AAAAAA==',
      },
    ],
  },
  responsesOfAllOperations: {
    registrations: [],
    'reg-updates': [],
    'de-registrations': [],
    'async-responses': [
      {
        timestamp: 1400009933, id: '1521817656#367da52f-6d0c-8550-b218-571b', status: 200, payload: '5Ba3AAAAAA==',
      },
      {
        timestamp: 1400009933, id: '1521817656#367da52f-6d0c-8550-b218-571w', status: 200,
      },
      {
        timestamp: 1400009933, id: '1521817656#367da52f-6d0c-8550-b218-571e', status: 200,
      },
      {
        timestamp: 1400009933, id: '1521817656#367da52f-6d0c-8550-b218-571o', status: 200, payload: '5Ba3AAAAAA==',
      },
    ],
  },
  notifications: {
    registrations: [
      { name: 'fourFive' },
      { name: 'fourFour1' },
      { name: 'fourFour' },
      { name: 'threeEight' },
      { name: 'threeSeven' },
    ],
    'reg-updates': [
      { name: 'fourFive' },
      { name: 'fourFour1' },
      { name: 'fourFour' },
      { name: 'threeEight' },
      { name: 'threeSeven' },
    ],
    'de-registrations': [
      { name: 'fourFive' },
      { name: 'fourFour1' },
      { name: 'fourFour' },
      { name: 'threeEight' },
      { name: 'threeSeven' },
    ],
    'async-responses': [
      {
        timestamp: 1400009933, id: '1521817656#367da52f-6d0c-8550-b218-571b', status: 200, payload: '5Ba3AAAAAA==',
      },
      {
        timestamp: 1400009934, id: '1521817656#367da52f-6d0c-8550-b218-571c', status: 200, payload: '5Ba3AAAAAA==',
      },
    ],
  },
  notificationCallback: { url: `http://${ip.address()}:5728/notification`, headers: {} },
  badNotificationCallback: { url: 'http://1.1.1.1:7777/notification', headers: {} },
  deleteCallback: Buffer.alloc(0),
  registerCallback: Buffer.alloc(0),
  getEndpoints: [{
    name: 'threeSeven',
    type: '8dev_3700',
    status: 'ACTIVE',
    q: true
  },
  {
    name: 'threeEight',
    type: '8dev_3800',
    status: 'ACTIVE',
    q: true
  },
  {
    name: 'fourFour',
    type: '8dev_4400',
    status: 'ACTIVE',
    q: true
  },
  {
    name: 'fourFour1',
    type: '8dev_4400',
    status: 'ACTIVE',
    q: true
  },
  {
    name: 'fourFive',
    type: '8dev_4500',
    status: 'ACTIVE',
    q: true
  }],
  version: '1.0.0',
  oneAsyncResponse: {
    registrations: [
      { name: 'fourFive' },
      { name: 'fourFour1' },
      { name: 'fourFour' },
      { name: 'threeEight' },
      { name: 'threeSeven' },
    ],
    'reg-updates': [
      { name: 'fourFive' },
      { name: 'fourFour1' },
      { name: 'fourFour' },
      { name: 'threeEight' },
      { name: 'threeSeven' },
    ],
    'de-registrations': [
      { name: 'fourFive' },
      { name: 'fourFour1' },
      { name: 'fourFour' },
      { name: 'threeEight' },
      { name: 'threeSeven' },
    ],
    'async-responses': [
      {
        timestamp: 1400009935, id: '1521817656#367da52f-6d0c-8550-b218-571d', status: 200, payload: '5Ba3AAAAAA==',
      },
    ],
  },
};
