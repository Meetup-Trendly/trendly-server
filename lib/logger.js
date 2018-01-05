'use strict';

const winston = require('winston');

const logger = new (winston.Logger)({
  levels: { verbose: 0, warn: 1, info: 2, error: 3, debug: 4, silly: 5 },
  
  transports: [
    new (winston.transports.File)({
      filename: 'logs/log.json',
      level: 'silly',  // logs ALL
    }),
    new (winston.transports.Console)({
      level: 'verbose', // 'verbose'
    }),
  ],
});

let log = (method, text) => {
  logger.log(method, text);
};

module.exports = log;