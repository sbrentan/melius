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
    Copy.findOne({_id: req.params.id}, async function(err, result) {
        if(err)
            res.status(404).send("Copy not found")
        else
            console.log(result)
            res.render('copy_edit', {copy: result});
    })
})

module.exports = router
