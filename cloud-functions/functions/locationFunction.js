const locationApi = require('../api/locationAPI');

/**
 * Cloud function for location search
 * */
function findLocation(request, response) {
    const query = request.query.search || '';
    const result = locationApi.findLocation(query);

    response.header('Content-Type','application/json');
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', 'Content-Type');
    response.status(200).send(result);
}

exports.findLocation = findLocation;