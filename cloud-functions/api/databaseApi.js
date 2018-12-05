const firebase = require('firebase-admin');
const serviceAccount = require('../serviceAccountKeyFirebase-key.json');

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://weather-clock-200715.firebaseio.com"
});

const db = firebase.database();

const mapTolist = res => Object.keys(res.val() || {}).map(k => res.val()[k]);

/**
 * Register new device
 * */
function addDevice(deviceId, name, location = '') {
    return db.ref('devices/' + deviceId).set({
        deviceId,
        name,
        location,
    })
}
exports.addDevice = addDevice;


/**
 * Get a given device by id
 * */
function getDevice(deviceId) {
    return db.ref('devices/' + deviceId).once('value').then(res => res.val());
}
exports.getDevice = getDevice;


/**
 * Get all devices
 * */
function getDeviceByName(deviceName = '') {
    return db.ref('devices')
        .orderByChild('name')
        .equalTo(deviceName)
        .limitToLast(10)
        .once('value')
        .then(r => r.val());
}
exports.getDeviceByName = getDeviceByName;

/**
 * Change weather location for a given device
 * */
function changeDeviceLocation(deviceId, newLocation) {
    return db.ref('devices/' + deviceId).update({
        location: newLocation,
    })
}
exports.changeDeviceLocation = changeDeviceLocation;


/**
 * Get all devices
* */
function getAllDevices() {
    return db.ref('devices').once('value').then(mapTolist)
}
exports.getAllDevices = getAllDevices;

/**
 * Log temp, humidity and weather data
 * */
function logData(deviceId, timestamp, temp, humidity, weatherData = {}) {
    return db.ref(`sensorData/${deviceId}`).push({
        timestamp,
        temp,
        humidity,
        weatherData,
    })
}
exports.logData = logData;


/**
 * Get log entries for device
 * */
function getLogData(deviceId, limitToLast = 100) {
    if (!deviceId) {
        return new Promise(resolve => {
            resolve([]);
        })
    }

    return db.ref(`sensorData/${deviceId}`)
        .limitToLast(limitToLast)
        .once('value')
        .then(mapTolist);
}
exports.getLogData = getLogData;


// addDevice('2f0022000947343432313031', 'TORDENSKY', '/sted/Norge/Rogaland/Stavanger/Austbø/varsel.xml');
// addDevice('1e0022001647363335343834', 'NORDKAPP', '/sted/Norge/Rogaland/Stavanger/Austbø/varsel.xml');
// addDevice('1c0026000347363333343435', 'VÆRKLOKKA', '/sted/Norge/Rogaland/Stavanger/Austbø/varsel.xml');
// addDevice('1c0027000f47363336383437', 'DOVREFJELL', '/sted/Norge/Rogaland/Stavanger/Austbø/varsel.xml');
// addDevice('220036001247363335343834', 'GLITTERTIND', '/sted/Norge/Rogaland/Stavanger/Austbø/varsel.xml');
// addDevice('33003c001447363336383438', 'SPITSBERGEN', '/sted/Norge/Rogaland/Stavanger/Austbø/varsel.xml');


//changeDeviceLocation('2f0022000947343432313031', 'test test test');

//getAllDevices().then(k => console.log(k));

//getDeviceByName('NORDKAPP').then(v => console.log(v));

getLogData('4').then(r => console.log(r));