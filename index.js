'use strict';

// require('dotenv').config();

// const server = require('./lib/server');
const googleTrends = require('google-trends-api');

// server.start();

googleTrends.interestOverTime({keyword: 'seattle'})
  .then(results => {
    console.log(results);
  });
