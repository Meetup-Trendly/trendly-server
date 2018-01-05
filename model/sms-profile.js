'use strict';

const mongoose = require('mongoose');

const smsProfileSchema = mongoose.Schema ({
  meetupMemberId: {
    type: Number,
    required: true,
  },
  meetupMemberName: {
    type: String,
  },
  phoneNumber: {
    type: String,
    unique: true,
    required: true,
  },
  meetups: {
    type: Array, // use group url name
  },
  categories: [{
    type: String,
  }],
});

module.exports = mongoose.model('smsProfile', smsProfileSchema);
