const locationApi = require('../api/locationAPI');

/**
 * Cloud function for location search
 * */
function findLocation(request, response) {
    const deviceId = request.query.search || '';
    const result = locationApi.findLocation(deviceId);
    response.status(200).send(result);
}

exports.findLocation = findLocation;