var express = require('express');
var router = express.Router();
var config = require('../../config')
const User = require("../../models/user")

router.get('/', function(req, res){
    res.render('users');
})

router.get('/new', async function(req, res) {
    res.render('user_edit');
})

module.exports = router
