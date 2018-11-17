const Particle = require('particle-api-js');
const particleKey = require('../particle-key');

const particle = new Particle();
const token = particleKey.token;

/**
 * List all devices from particle cloud
 * */
function listDevices() {
    return particle.listDevices({ auth: token }).then(res => res.body);
}

/**
 * PING a given device
 * */
function pingDevice(deviceId) {
    return particle.callFunction({deviceId: deviceId, name: 'ping', auth: token });
}

/**
 * Rerun init of weather clock
 * */
function initDevice(deviceId) {
    return particle.callFunction({deviceId: deviceId, name: 'rerunInit', auth: token });
}

/**
 * Goto a given icon on weather clock
 * */
function showIcon(deviceId, iconNumber) {
    return particle.callFunction({deviceId: deviceId, name: 'goto', auth: token, argument: ''+iconNumber });
}

/**
 * Goto a given icon on weather clock
 * */
function updateWeather(deviceId) {
    return particle.callFunction({ deviceId: deviceId, name: 'getWeather', auth: token });
}

exports.listDevices =  listDevices;
exports.pingDevice = pingDevice;
exports.initDevice = initDevice;
exports.showIcon = showIcon;
exports.updateWeather = updateWeather;