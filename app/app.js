var express = require('express');
var path = require("path")
var app = express();
var parser = require('body-parser');
var session = require('express-session');

app.set('views', path.join(__dirname, './views/'));
app.set('view engine', 'ejs');

app.use('/public', express.static('public')); 
app.use(parser.urlencoded({extended: false}))

const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: "sessionsecretkeyBOB",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: true
}));

app.use('/ui', require('./controllers/ui/index'))
app.use('/api', require('./controllers/api/index'))

app.get('/', function(req, res) {
    res.render('home');
})

module.exports = app
