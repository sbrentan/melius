var express = require('express');
var router = express.Router();
var config = require('../../config')
const User = require("../../models/user")

router.get('/login', async function(req, res) {
    res.render('login');
})

router.get('/:id', async function(req, res) {
    res.render('profile');
})

module.exports = router
