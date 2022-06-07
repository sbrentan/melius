const express = require('express');
const path = require("path")
const app = express();
const parser = require('body-parser');
const session = require('express-session');
const config = require.main.require('./config')

app.set('views', path.join(__dirname, './views/'));
app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname, './public/'))); 
app.use(parser.json())

const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: config.SESSION_KEY,
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
