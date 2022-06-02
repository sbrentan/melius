const express = require('express');
const app = express();

app.use('/users', require('./users'));
app.use('/books', require('./books'));
app.use('/copies', require('./copies'));

router.post('/contacts', async function(req, res){
    res.status(200).json({status: 200, message: "Mail sent correctly"})
})

app.use('/', require('./auth'));

module.exports = app
