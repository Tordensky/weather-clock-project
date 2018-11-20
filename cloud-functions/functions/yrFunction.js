const currentWeather = require('../api/yrAPI').currentWeather;
const particleApi = require('../api/particleApi');
const databaseApi = require('../api/databaseApi');

/**
 * Cloud function: Gets weather data for the device and triggers an update event
 * */
const getYrDataFn = (request, response) => {
    const deviceId = request.query.coreid;

    databaseApi.getDevice(deviceId).then(device => {
        const weatherLocation = device.location || '/sted/Norge/Oslo/Oslo/Oslo/varsel.xml';
        console.log('Got a call from ' + device.name + ' : ' + deviceId + ' at location ' + weatherLocation);
        currentWeather(weatherLocation)
            .then((res) => {
                if (request.query.data) {
                    try {
                        const { temp, humidity } = JSON.parse(request.query.data);
                        databaseApi.logData(deviceId, request.query.published_at, temp, humidity, res);
                    } catch (e) {
                        console.error('Failed to parse sensor data', request.query);
                    }
                }

                particleApi.showIcon(deviceId, res.icon);
                response.status(200).send(res);
            })
            .catch((e) => {
                particleApi.showIcon(deviceId, -1);
                response.status(200).send(e)
            });
    });
};

exports.getYrDataFn = getYrDataFn;
