const express = require('express');
const app = express();

app.use('/users', require('./users'));
app.use('/books', require('./books'));

module.exports = app
