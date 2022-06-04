var express = require('express');
var router = express.Router();
var config = require('../../config')
const Book = require("../../models/book")

router.get("/", async function(req, res) {
    res.render('books');
})

router.get('/new', async function(req, res) {
    res.render('book_edit', {book: false});
})

router.get('/:id', async function(req, res) {
    res.render('book_default', {book: req.params.id});
})

router.get('/edit/:id', async function(req, res) {
    res.render('book_edit', {book: req.params.id});
})

module.exports = router
