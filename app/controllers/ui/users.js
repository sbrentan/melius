var express = require('express');
var router = express.Router();
const User = require("../../models/user")

router.get("/", async function(req, res) {
    res.render('users');
})

router.get('/:id', async function(req, res) {
    res.render('user_edit', {user: req.params.id});
})

module.exports = router
