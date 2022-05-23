var express = require('express');
var router = express.Router();
var config = require('../../config')
const User = require("../../models/user")

router.get('/login', async function(req, res) {
    res.render('login');
})

router.get('/profile', async function(req, res) {
    res.render('profile');
})

router.get('/signin', async function(req, res) {
    res.render('signin');
})
router.get('/contacts', async function(req, res) {
    res.render('contacts');
})

module.exports = router
