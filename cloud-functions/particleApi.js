const Particle = require('particle-api-js');
const particleKey = require('./particle-key');

const particle = new Particle();
const token = particleKey.token;

function listDevices() {
    return particle.listDevices({ auth: token }).then(res => res.body);
}

function pingDevice(deviceId) {
    return particle.callFunction({deviceId: deviceId, name: 'ping', auth: token });
}

function initDevice(deviceId) {
    return particle.callFunction({deviceId: deviceId, name: 'rerunInit', auth: token });
}

function showIcon(deviceId, iconNumber) {
    return particle.callFunction({deviceId: deviceId, name: 'goto', auth: token, argument: ''+iconNumber });
}

exports.listDevices =  listDevices;
exports.pingDevice = pingDevice;
exports.initDevice = initDevice;
exports.showIcon = showIcon;


listDevices().then(r => {
    console.log(r);
    r.forEach(d => pingDevice(d.id));
    r.forEach(d => showIcon(d.id, 5));
    r.forEach(d => initDevice(d.id));
});