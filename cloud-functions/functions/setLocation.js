const databaseApi = require('../api/databaseApi');
const particleApi = require('../api/particleApi');

/**
 * Cloud function for location search
 * */
function setLocation(request, response) {
    const deviceId = request.query.deviceId || '';
    const location = request.query.location || '';
    databaseApi
        .changeDeviceLocation(deviceId, location)
        .then(() => {
            particleApi.updateWeather(deviceId).then(() => {
                response.status(200).send("OK");
            }).catch(() => {
                response.status(500).send("Particle Error");
            })
    }).catch(() => {
        response.status(500).send("Firebase Error");
    });

}

exports.setLocation = setLocation;