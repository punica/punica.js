'use strict';

const Sensor4400 = require('./nodes/sensorInstances.js').Sensor4400;

function startState(sensor, state) {
  sensor.hallSensorState(state);
  sensor.register(() => { });
}

function startToggle(sensor, closedDuration, openDuration=closedDuration) {
  const startClosed = function () {
    sensor.hallSensorState(0);
    setTimeout(() => {
      startOpen();
    }, closedDuration);
  };
  const startOpen = function () {
    sensor.hallSensorState(1);
    setTimeout(() => {
      startClosed();
    }, openDuration);
  };
  startClosed();
  sensor.register(() => { });
}

function startRandomToggle(sensor, closedDuration, openDuration) {
  const startClosed = function () {
    const rand = Math.round(Math.random() * closedDuration);
    sensor.hallSensorState(0);
    setTimeout(() => {
      startOpen();
    }, rand);
  };
  const startOpen = function () {
    const rand = Math.round(Math.random() * openDuration);
    sensor.hallSensorState(1);
    setTimeout(() => {
      startClosed();
    }, rand);
  };
  startClosed();
  sensor.register(() => { });
}

const sOpen         = new Sensor4400(600, '8dev4400_open', '::1', 5600);
const sClosed       = new Sensor4400(600, '8dev4400_closed', '::1', 5601);
const sToggle9s     = new Sensor4400(600, '8dev4400_toggle9s', '::1', 5602);
const sToggle47s    = new Sensor4400(600, '8dev4400_toggle47s', '::1', 5603);
const sToggle293s   = new Sensor4400(600, '8dev4400_toggle293s', '::1', 5604);
const sTrigger7s    = new Sensor4400(600, '8dev4400_trigger7s', '::1', 5605);
const sTrigger43s   = new Sensor4400(600, '8dev4400_trigger43s', '::1', 5606);
const sTrigger251s  = new Sensor4400(600, '8dev4400_trigger251s', '::1', 5607);
const sRandom61s    = new Sensor4400(600, '8dev4400_random61s', '::1', 5608);
const sRandom397s   = new Sensor4400(600, '8dev4400_random397s', '::1', 5609);

startState(sOpen, 1);
startState(sClosed, 0);

startToggle(sToggle9s, 9*1000);
startToggle(sToggle47s, 47*1000);
startToggle(sToggle293s, 293*1000);

startToggle(sTrigger7s, 7*1000, 10);
startToggle(sTrigger43s, 43*1000, 10);
startToggle(sTrigger251s, 251*1000, 10);

startRandomToggle(sRandom61s, 61*1000, 100);
startRandomToggle(sRandom397s, 397*1000, 100);
