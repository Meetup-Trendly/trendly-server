'use strict';

const mongoose = require('mongoose');

const profileSchema = mongoose.Schema ({
  alias: {type: String},
  location: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('profile', profileSchema);