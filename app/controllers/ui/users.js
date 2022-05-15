var express = require('express');
var router = express.Router();
var config = require('../../config')
const User = require("../../models/user")

router.get('/', function(req, res){
    console.log("users");
    User.find({}, function(err, result) {
        res.render('users', {users: result});
    })
})

router.get('/new', async function(req, res) {
    res.render('user_edit');
})

router.get('/:id/profile', async function(req, res) {
    User.findOne({_id: req.params.id}, function(err, result) {
        res.render('profile', {user: result});
    })
})


module.exports = router
