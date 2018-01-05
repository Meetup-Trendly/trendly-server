'use strict';

const log = require('../logger');

module.exports = (request, response, next) => {
  log('verbose', `Processing: ${request.method} On: ${request.url}`);
  return next();
};