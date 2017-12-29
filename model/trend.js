'use strict';

const mongoose = require('mongoose');

const trendSchema = mongoose.Schema ({
  keyword: {type: String},
  timestamp: {
    type: Date,
    default: () => new Date(),
  },
  body: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('trend', trendSchema);