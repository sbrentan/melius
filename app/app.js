var express = require('express');
var path = require("path")
var app = express();
var parser = require('body-parser');

app.set('views', path.join(__dirname, './views/'));
app.set('view engine', 'ejs');

app.use(parser.urlencoded({extended: false}))
app.use('/ui', require('./controllers/ui/index'))
app.use('/api', require('./controllers/api/index'))

app.get('/', function(req, res) {
    res.render('home');
})

module.exports = app
