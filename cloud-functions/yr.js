const http = require("http");
const parser = require('xml2json');
const agent = new http.Agent({keepAlive: true});

const parseYrForecast = require('./parser').parseYrForecat;
const currentWeather = require('./yrAPI').currentWeather;
const particleApi = require('./particleApi');


const devices = {
    '2f0022000947343432313031': 'TORDENSKY',
    '1e0022001647363335343834': 'NORDKAPP',
    '1c0026000347363333343435': 'VÆRKLOKKA',
    '1c0027000f47363336383437': 'DOVREFJELL',
    '220036001247363335343834': 'GLITTERTIND',
    '33003c001447363336383438': 'SPITSBERGEN',
};

function getWeatherLocation(deviceId) {
    if (deviceId === '2f0022000947343432313031') { // TORDENSKY
        return '/sted/Norge/Oslo/Oslo/Holmlia/varsel.xml'
    } else if (deviceId === '1e0022001647363335343834') { // NORDKAPP
        return '/sted/Norge/Troms/Tromsø/Andersdal/varsel.xml'
    } else if (deviceId === '1e0022001647363335343834') { // GLITTERTIND
        return '/sted/Norge/Rogaland/Stavanger/Austbø/varsel.xml'
    }
    return '/sted/Norge/Oslo/Oslo/Oslo/varsel.xml';
}

const getYrDataFn = (request, response) => {
    const deviceId = request.query.coreid;
    const friendlyName = devices[deviceId] || 'UNKNOWN';
    console.log('Got a call from', friendlyName, deviceId);

    const weatherLocation = getWeatherLocation(deviceId);

    currentWeather(weatherLocation)
        .then((res) => {
            particleApi.showIcon(deviceId, res.icon);
            response.status(200).send(res);
        })
        .catch((e) => {
            particleApi.showIcon(deviceId, -1);
            response.status(200).send(e)
        });
};

particleApi.showIcon('1c0026000347363333343435', 2);

exports.getYrDataFn = getYrDataFn;
