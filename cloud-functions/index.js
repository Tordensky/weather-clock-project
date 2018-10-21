const getWeatherFn = require('./getWeather');
const getYrDataFn = require('./yr');

/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.getWeather = getWeatherFn.getWeatherFn;

/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.getYrData = getYrDataFn.getYrDataFn;