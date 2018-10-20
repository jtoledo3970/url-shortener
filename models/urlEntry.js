'use strict';

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var UrlEntry = new Schema ({
  url : {type: String, required: true},
  index : {type: Number, required: true}
});

module.exports = mongoose.model('UrlEntry', UrlEntry);