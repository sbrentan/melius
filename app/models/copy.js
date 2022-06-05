var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Copy', new Schema({
  id: Number,
  book: String,
  owner: String,
  buyer: String,
  price: String
}, { collection: 'copy' }));