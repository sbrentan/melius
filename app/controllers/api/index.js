const express = require('express');
const app = express();

app.use('/users', require('./users'));
app.use('/books', require('./books'));
app.use('/', require('./auth'));

module.exports = app
