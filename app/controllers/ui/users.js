var express = require('express');
var router = express.Router();
var config = require.main.require('./config')
const User = require("../../models/user")

router.get("/", async function(req, res) {
    res.render('users');
})

router.get('/new', async function(req, res) {
    res.render('user_edit');
})

router.get('/:id', async function(req, res) {
    res.render('user_edit');
})

module.exports = router
