const http = require("http");
const parser = require('xml2json');
const agent = new http.Agent({keepAlive: true});
const parseYrForecast = require('./parser').parseYrForecat;

function currentWeather(path = '/sted/Norge/Oslo/Oslo/Oslo/varsel.xml') {
    return new Promise((resolve, reject) => {
        const req = http.request({
            host: 'www.yr.no',
            path: path,
            method: 'GET',
            port: 80,
            agent: agent,
        }, res => {
            let rawData = '';
            res.setEncoding('utf8');
            res.on('data', chunk => { rawData += chunk; });
            res.on('end', () => {
                const json = parser.toJson(rawData);
                const data = JSON.parse(json);
                try {
                    resolve(parseYrForecast(data).forecast[0]);
                } catch (e) {
                    reject({ icon: -1, text: "Error parsing data" });
                }
            });
        });
        req.on('error', e => {
            reject({ icon: -1, text: `Error: ${e.message}` });
        });
        req.end();
    })
}

exports.currentWeather = currentWeather;