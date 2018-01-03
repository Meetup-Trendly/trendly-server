'use strict';

const mongoose = require('mongoose');

const profileSchema = mongoose.Schema ({
  meetupMemberId: {
    type: Number,
  },
  name: {
    type: String,
  },
  phoneNumber: {
    type: String,
    unique: true,
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  meetups: [{
    type: String, // use group url name
  }],
});

module.exports = mongoose.model('profile', profileSchema);
