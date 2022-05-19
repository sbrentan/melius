var express = require('express');
var router = express.Router();
var config = require('../../config')
const Book = require("../../models/book")

router.get("/", async function(req, res) {
    Book.find({}, function(err, result) {
        res.render('books', {books: result});
    })
})

router.get('/new', async function(req, res) {
    res.render('book_edit', {book: false});
})

router.get('/:id', async function(req, res) {
    Book.findOne({_id: req.params.id}, async function(err, result) {
        if(err)
            res.status(404).send("Book not found")
        else
            console.log(result)
            if(true){
                res.render('book_default', {book: result});
            }else{
                res.render('book_edit', {book: result});
            }
    })
})

module.exports = router
