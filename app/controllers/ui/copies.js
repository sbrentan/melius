var express = require('express');
var router = express.Router();
const Copy = require("../../models/copy")

router.get("/", async function(req, res) {
    res.render('copies');
})

router.get('/new', async function(req, res) {
    res.render('copy_edit', {copy: false});
})

router.get('/:id', async function(req, res) {
    res.render('copy_edit', {copy: req.params.id});
})

module.exports = router
