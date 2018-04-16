

const restapi = require('./8dev_restapi.js');

const SENSOR4400_STATE_CLOSED = 'closed';
const SENSOR4400_STATE_OPEN = 'open';
const SENSOR4400_STATE_ERROR = 'error';
const SENSOR4400_STATE_MISSED = 'missed';
const SENSOR4400_STATE_WATCHDOG = 'watchdog';

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
      this.emit('state', SENSOR4400_STATE_ERROR);
    });

    // If it's already registered the register event (and therefore configuration) won't be called.
    // Explicitly check if sensor is registered, by trying to read device objects.
    this.getObjects().then(() => {
      console.log('[Sensor4400-%s] Sensor is already registered', this.id);
      this.configure();
    }).catch((err) => {
      if (err === 404) {
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
      if (err !== 200) {
        console.error('Sensor error! Bad observe response:', err);
        this.emit('state', SENSOR4400_STATE_ERROR);
        return;
      }

      const buf = Buffer.from(value, 'base64');
      const state = buf[3]; // TODO: parse TLV
      const counter = 0; // TODO: implement counter

      // counter difference larger than 1 indicates that hall sensor was triggered,
      // but we didn't get the message.
      if (this.lastState !== undefined) {
        if (counter - this.lastCounter !== 1) {
          // this.emit('state', SENSOR4400_STATE_MISSED);
        }
      }

      this.emit('state', state === 0 ? SENSOR4400_STATE_CLOSED : SENSOR4400_STATE_OPEN);
      this.lastState = state;
      this.lastCounter = counter;
    }).then((id) => {
      console.log('[Sensor4400-%s] Received observation id %s', this.id, id);
    }).catch((err) => {
      console.error('Service error! Failed to register observation!');
      console.error('Error:', err);
      this.emit('state', SENSOR4400_STATE_ERROR);
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
      this.emit('state', SENSOR4400_STATE_WATCHDOG);
    }, 65 * 1000);
  }
}

module.exports = {
  SENSOR4400_STATE_CLOSED,
  SENSOR4400_STATE_OPEN,
  SENSOR4400_STATE_ERROR,
  SENSOR4400_STATE_MISSED,
  SENSOR4400_STATE_WATCHDOG,
  Sensor4400,
};
