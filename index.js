'use strict';


const restapi = require('./8dev_restapi.js');

const SENSOR_STATE_CLOSED = 'closed',
      SENSOR_STATE_OPEN   = 'open',
      SENSOR_STATE_ERROR  = 'error',
      SENSOR_STATE_MISSED = 'missed';

class Sensor4400 extends restapi.Device {

  constructor(service, id) {
    super(service, id);

    /* Register device events */
    this.on('register', () => {
      console.log('[Sensor4400-%s] Received registration event', this.id);
      this.configure();
    });

    this.on('update', () => {
      // XXX: should we watchdog updates or value updates???
      this.restartWatchdog();
    });

    this.on('deregister', () => {
      console.error('Error! Sensor unregistered!');
      this.emit('state', SENSOR_STATE_ERROR);
    });

    // If it's already registered the register event (and therefore configuration) won't be called.
    // Explicitly check if sensor is registered, by trying to read device objects.
    this.getObjects().then((objects) => {
      console.log('[Sensor4400-%s] Sensor is already registered', this.id);
      this.configure();
    }).catch(err => {
      if (err == 404) {
        console.log('[Sensor4400-%s] Sensor is not yet registered. Waiting for registration event...', this.id);
      } else {
        throw err;
      }
    });

    console.log('[Sensor4400-%s] Initialized sensor', this.id);
  }

  configure() {
    console.log('[Sensor4400-%s] Configuring sensor', this.id);
    this.ok = false;

    this.observe('/3200/0/5500', (err, value) => {
      if (err != 200) {
        console.error('Sensor error! Bad observe response:', err);
        this.emit('state', SENSOR_STATE_ERROR);
        return;
      }

      const buf = Buffer.from(value, 'base64');
      let state = buf[3]; // TODO: parse TLV
      let counter = 0; // TODO: implement counter

      // counter difference larger than 1 indicates that hall sensor was triggered,
      // but we didn't get the message.
      if (this.lastState !== undefined) {
        if (counter - this.lastCounter !== 1) {
          this.emit('state', SENSOR_STATE_MISSED);
        }
      }

      this.emit('state', state === 0 ? SENSOR_STATE_CLOSED : SENSOR_STATE_OPEN); 
      this.lastState = state;
      this.lastCounter = counter;
    }).then(id => {
      console.log('[Sensor4400-%s] Received observation id %s', this.id, id);
    }).catch(err => {
      console.error('Service error! Failed to register observation!');
      console.error('Error:', err);
      this.emit('state', SENSOR_STATE_ERROR);
    });
  }

  restartWatchdog() {
    // This provides a local watchdog, which triggers after a configured time interval of
    // no updates from the sensor. Missing (or late) updates may be caused by packet loss,
    // noisy (busy) channel, sensor or gateway equipment crash or power loss. This may 
    // be used to increase system sensitivity with the drawback of false positive triggers.
    if (this.updateTimeout !== undefined) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      this.ok = false;
      this.emit('state', 'watchdog');
    }, 65*1000);
  }
}


/* Demo scenario */
/* Arm/disarm system every 15 seconds */
/* Alarm is triggered if system is armed and any of the sensors becomes not closed (open or error) */
/* System is not armed if any of the sensors are not closed */

const service = new restapi.Service({ host: 'http://localhost:8888'});
const ids = ['eui64-41001f00-76656438', 'eui64-19003c00-76656438'];

var sensors = Array(ids.length);
var systemArmed = false;

/* Initialize all sensors, that belong to demo zone */
for (let i = 0; i < ids.length; i++) {
  const sensor = new Sensor4400(service, ids[i]);

  sensors[i] = sensor;

  sensor.on('state', state => {
    console.log('Sensor "%s" state: %s', sensor.id, state);
    sensor.state = state;

    if (systemArmed && state !== SENSOR_STATE_CLOSED) {
      console.log('ALARM!!!!! System is armed, but the sensor is not closed anymore!');
    }
  });
}

setInterval(() => {
  if (!systemArmed) {
    let triggered = [];
    for (let i = 0; i < sensors.length; i++) {
      if (sensors[i].state !== SENSOR_STATE_CLOSED) {
        triggered.push(sensors[i]);
      }
    }

    systemArmed = triggered.length === 0;

    console.log('System arm:', systemArmed ? 'SUCCESS' : 'FAILED');
    if (!systemArmed) {
      let s = [];
      triggered.forEach(sensor => { s.push(sensor.id + ' (' + sensor.state + ')') });
      console.log('Failing sensors:', s.join(', '));
    }
  } else {
    systemArmed = false;
    console.log('System disarmed');
  }
}, 15*1000);

