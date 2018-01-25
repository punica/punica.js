/* Demo scenario */
/* Arm/disarm system every 15 seconds */
/* Alarm is triggered if system is armed and any of the sensors becomes not closed (open or error) */
/* System is not armed if any of the sensors are not closed */

const restAPI = require('./8dev_restapi.js');
const sensorAPI = require('./8dev_sensors.js');

const service = new restAPI.Service({ host: 'http://localhost:8888'});
const ids = [ // sensors used in the demo, comment out to disable
  '8dev4400_open',        // always in open state
  '8dev4400_closed',      // always in closed state
  '8dev4400_toggle9s',    // toggles state every 9 seconds
  '8dev4400_toggle47s',   // toggles state every 47 seconds
  '8dev4400_toggle293s',  // toggles state every 293 seconds
  '8dev4400_trigger7s',   // triggers open state every 7 seconds
  '8dev4400_trigger43s',  // triggers open state every 43 seconds
  '8dev4400_trigger251s', // triggers open state every 251 seconds
  '8dev4400_random61s',   // triggers open state randomly (max 61 seconds)
  '8dev4400_random397s',  // triggers open state randomly (max 397 seconds)
];

var sensors = Array(ids.length);
var systemArmed = false;

/* Initialize all sensors, that belong to demo zone */
for (let i = 0; i < ids.length; i++) {
  const sensor = new sensorAPI.Sensor4400(service, ids[i]);

  sensors[i] = sensor;

  sensor.on('state', state => {
    console.log('Sensor "%s" state: %s', sensor.id, state);
    sensor.state = state;

    if (systemArmed && state !== sensorAPI.SENSOR4400_STATE_CLOSED) {
      console.log('ALARM!!!!! System is armed, but the sensor is not closed anymore!');
    }
  });
}

setInterval(() => {
  if (!systemArmed) {
    let triggered = [];
    for (let i = 0; i < sensors.length; i++) {
      if (sensors[i].state !== sensorAPI.SENSOR4400_STATE_CLOSED) {
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

