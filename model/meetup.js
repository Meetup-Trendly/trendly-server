'use strict';

const mongoose = require('mongoose');

const meetupSchema = mongoose.Schema ({
  location: {type: String},
  profile: {
    type: Date,
    default: () => new Date(),
  },
  body: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('meetup', meetupSchema);