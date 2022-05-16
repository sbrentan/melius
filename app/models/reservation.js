var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Reservation', new Schema({
    book: String,
    user: String,
    copy: String
}, { collection: 'reservation' }));