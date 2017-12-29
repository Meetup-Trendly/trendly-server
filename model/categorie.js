'use strict';

const mongoose = require('mongoose');

const categorieSchema = mongoose.Schema ({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('categorie', categorieSchema);