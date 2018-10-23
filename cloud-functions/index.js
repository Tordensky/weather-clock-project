const getYrDataFn = require('./functions/yrFunction');
const particleFunctions = require('./functions/particleFunction');
const locationFunctions = require('./functions/locationFunction');

/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.getYrData = getYrDataFn.getYrDataFn;


/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.getAllParticles = particleFunctions.getAllParticles;


/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.findLocation = locationFunctions.findLocation;

