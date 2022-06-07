var express = require('express');
var router = express.Router();
const User = require("../../models/user")

router.get('/login', async function(req, res) {
    res.render('login');
})

router.get('/profile', async function(req, res) {
    res.render('profile');
})

router.get('/profile_edit', async function(req, res) {
    res.render('profile_edit');
})

router.get('/signin', async function(req, res) {
    res.render('signin');
})

router.get('/contacts', async function(req, res) {
    res.render('contacts');
})

router.get('/dashboard', async function(req, res) {
    res.render('dashboard');
})

module.exports = router
