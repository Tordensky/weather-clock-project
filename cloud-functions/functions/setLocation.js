const databaseApi = require('../api/databaseApi');
const particleApi = require('../api/particleApi');
const currentWeather = require('../api/yrAPI').currentWeather;


/**
 * Cloud function for location search
 * */
function setLocation(request, response) {
    const deviceId = request.query.deviceId || '';
    const location = request.query.location || '';

    response.header('Content-Type','application/json');
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', 'Content-Type');
    databaseApi
        .changeDeviceLocation(deviceId, location)
        .then(() => {
            particleApi.updateWeather(deviceId).then(() => {
                currentWeather(location)
                    .then((res) => {
                        response.status(200).send(res);
                    })
                    .catch(() => {
                        response.status(200).send("Failed to load YR data");
                    })
                ;
            }).catch(() => {
                response.status(500).send("Particle Error");
            })
    }).catch(() => {
        response.status(500).send("Firebase Error");
    });

}

exports.setLocation = setLocation;