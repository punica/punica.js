



const SENSOR_STATE_CLOSED = 'closed',
      SENSOR_STATE_OPEN   = 'open',
      SENSOR_STATE_ERROR  = 'error',
      SENSOR_STATE_MISSED = 'missed';

function initializeSensor(sensor) {
  console.log('Initialize sensor', sensor.id);
  sensor.ok = false;

  sensor.observe('/3200/0/5500', (err, value) => {
    console.log('Sensor value:', value, err);
    if (err != 200) {
      console.error('Sensor error! Bad observe response:', err);
      sensor.emit('state', SENSOR_STATE_ERROR);
      return;
    }

    const buf = Buffer.from(value, 'base64');
    let state = buf[3]; // TODO: parse TLV
    let counter = 0; // TODO: implement counter

    // counter difference larger than 1 indicates that hall sensor was triggered,
    // but we didn't get the message.
    if (sensor.lastState !== undefined) {
      if (counter - sensor.lastCounter !== 1) {
        sensor.emit('state', SENSOR_STATE_MISSED);
      }
    }

    sensor.emit('state', state === 0 ? SENSOR_STATE_CLOSED : SENSOR_STATE_OPEN); 
    sensor.lastState = state;
    sensor.lastCounter = counter;
  }).then(id => {
    console.log('Observation id:', id);
  }).catch(err => {
    console.error('Service error! Failed to register observation!');
    console.error('Error:', err);
    sensor.emit('state', 'error');
  });
}

function restartWatchdog(sensor) {
  // This provides a local watchdog, which triggers after a configured time interval of
  // no updates from the sensor. Missing (or late) updates may be caused by packet loss,
  // noisy (busy) channel, sensor or gateway equipment crash or power loss. This may 
  // be used to increase system sensitivity with the drawback of false positive triggers.
  if (sensor.updateTimeout !== undefined) {
    clearTimeout(sensor.updateTimeout);
  }

  sensor.updateTimeout = setTimeout(() => {
    console.error('Missing update from sensor');
    console.error('Trigger alarm if system is armed');
    sensor.ok = false;
    sensor.emit('state', 'watchdog');
  }, 65*1000);
}

var restapi = require('./8dev_restapi.js');

var service = new restapi.Service({ host: 'http://localhost:8888'});
var sensor = service.createNode('eui64-41001f00-76656438');


/* Service sensor events */

// Try to get sensor objects - if it succedes it means that the sensor is already registered
// to the LwM2M server and we won't get a register event, unless it disconnects.
sensor.getObjects().then((objects) => {
  console.log('Sensor is already registered');
  initializeSensor(sensor);
}).catch(console.error);

sensor.on('register', () => {
  console.log('Sensor registered');
  initializeSensor(sensor);
});

sensor.on('update', () => {
  // XXX: should we watchdog updates or value updates???
  restartWatchdog(sensor);
});

sensor.on('deregister', () => {
  console.error('Error! Sensor unregistered!');
  console.error('Trigger alarm if system is armed');
  sensor.emit('state', 'error');
});

/* Demo scenario */
/* Arm/disarm system every 15 seconds */
/* Alarm is triggered if system is armed and any of the sensors becomes not closed (open or error) */
/* System is not armed if any of the sensors are not closed */

var sensors = [sensor, ];
var systemArmed = false;

sensors.forEach((sensor) => {
  sensor.on('state', (state) => {
    console.log('Sensor state:', state);
    sensor.state = state;
  
    if (systemArmed && state !== SENSOR_STATE_CLOSED) {
      console.log('ALARM!!!!! System is armed, but the sensor is not closed anymore!');
    }
  });
});

setInterval(() => {
  if (!systemArmed) {
    var canArm = true;

    for (var i = 0; i < sensors.length; i++) {
      if (sensors[i].state !== SENSOR_STATE_CLOSED) {
        canArm = false;
        break;
      }
    }

    systemArmed = canArm;
    console.log('System arm:', systemArmed ? 'SUCCESS' : 'FAILED');
  } else {
    systemArmed = false;
    console.log('System disarmed');
  }
}, 15*1000);

