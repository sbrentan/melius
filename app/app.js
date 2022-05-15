var express = require('express');
var path = require("path")
var app = express();


app.set('views', path.join(__dirname, './views/'));
app.set('view engine', 'ejs');

app.use('/users', require('./controllers/users'))

app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('Index page');
})

module.exports = app
