const databaseApi = require('../api/databaseApi');

/**
 * Cloud function for retrieving data for all weather clocks
 * */
function getTempLogFunction(request, response) {
    const deviceId = request.query.deviceId || '';
    const limit = parseInt(request.query.limit || '100', 10);
    response.header('Content-Type','application/json');
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', 'Content-Type');
    databaseApi.getLogData(deviceId, limit)
        .then((tempData) => {
            response.status(200).send(tempData);
        })
        .catch((e) => response.status(500).send(e));
}
exports.getTempLogFunction = getTempLogFunction;