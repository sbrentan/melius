var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Book', new Schema({
  title: String,
  description: String,
  author: String
}, { collection: 'book' }));
