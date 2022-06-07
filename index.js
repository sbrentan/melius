const app       = require('./app/app.js');
const config    = require('./config.js')

//Import the mongoose module
var mongoose = require('mongoose');

const port = process.env.PORT || 80;

//Get the default connection
mongoose.connect(config.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
.then ( () => {

    console.log("Connected to Database");

    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });

});

var db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
    console.log("Connection Successful!");
});
