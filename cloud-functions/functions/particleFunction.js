const databaseApi = require('../api/databaseApi');
const currentWeather = require('../api/yrAPI').currentWeather;

/**
 * Cloud function for retrieving data for all weather clocks
 * */
function getAllParticles(request, response) {
    response.header('Content-Type','application/json');
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', 'Content-Type');
    databaseApi.getAllDevices()
        .then((devices) => {
            Promise.all(devices.map(device => currentWeather(device.location)))
                .then((res) => {
                    const result = devices.map((dev, idx) => {
                        dev.weather = res[idx];
                        return dev;
                    });
                    response.status(200).send(result)
                });
        });
}
exports.getAllParticles = getAllParticles;