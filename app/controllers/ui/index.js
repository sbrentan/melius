const express = require('express');
const app = express();

app.get('/', function(req, res){
    res.render('home');
})

app.use('/users', require('./users'));
app.use('/books', require('./books'));
app.use('/copies', require('./copies'));
app.use('/', require('./general'));

module.exports = app
