let locations = require('../data/yrUrl').locations;

/**
 * Search for Yr location
 * */
function findLocation(query = '') {
    return locations.filter((location) => {
        return location.navn.toLowerCase().includes(query.toLowerCase());
    });
}
exports.findLocation = findLocation;
