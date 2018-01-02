'use strict';

const mongoose = require('mongoose');

const smsProfileSchema = mongoose.Schema ({
  meetupMemberId: {
    type: Number,
  },
  phoneNumber: {
    type: String,
    unique: true,
  },
  categories: [{
    type: String, // use group url name
  }],
});

module.exports = mongoose.model('smsProfile', smsProfileSchema);
