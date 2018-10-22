const http = require("http");
const parser = require('xml2json');
const agent = new http.Agent({keepAlive: true});

const parseYrForecast = require('./parser').parseYrForecat;
const currentWeather = require('./yrAPI').currentWeather;
const particleApi = require('./particleApi');
const databaseApi = require('./databaseApi');


const devices = {
    '2f0022000947343432313031': 'TORDENSKY',
    '1e0022001647363335343834': 'NORDKAPP',
    '1c0026000347363333343435': 'VÆRKLOKKA',
    '1c0027000f47363336383437': 'DOVREFJELL',
    '220036001247363335343834': 'GLITTERTIND',
    '33003c001447363336383438': 'SPITSBERGEN',
};

function getWeatherLocation(deviceId) {
    return databaseApi.getDevice(deviceId)
        .then(device => device.location || '/sted/Norge/Oslo/Oslo/Oslo/varsel.xml');
}

const getYrDataFn = (request, response) => {
    const deviceId = request.query.coreid;
    const friendlyName = devices[deviceId] || 'UNKNOWN';

    getWeatherLocation(deviceId).then(weatherLocation => {
        console.log('Got a call from ' + friendlyName + ' : ' + deviceId + ' at location ' + weatherLocation);
        currentWeather(weatherLocation)
            .then((res) => {
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
