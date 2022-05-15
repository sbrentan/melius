var express = require('express');
var router = express.Router();
const Book = require("../../models/book")

router.get('/', async function(req, res){
    Book.find({}, async function(err, result) {
    	if(err)
    	res.writeHead(200, { "Content-Type": "text/json"})
    	res.send(result)
    })
})

router.post('/', async function(req, res){
    var new_book = new Book({
		title: req.body.title,
		description: req.body.description,
		author: req.body.author,
		price: req.body.price,
		image: ""
	});

	// Save the new model instance, passing a callback
	result = await new_book.save(async function (err, book) {
		if (err){
			console.log(err);
			res.status(500).json({status: 500, message: "Internal server error: " + err})
		}
		else{
			console.log(book.title + " saved to book collection.");
			res.status(200).json({status: 200, message: "Book created successfully"})
			//redirect
			//res.redirect(config.root + "/books")
		}
	});
})

router.get('/:id', async function(req, res){
    Book.findOne({_id: req.params.id}, async function(err, result) {
    	if(err)
    		res.status(404).json({status: 404, message: "Book not found"})
    	else
    		res.send(result)
    })
})

router.post('/:id', async function(req, res){
    Book.findOne({_id: req.params.id}, async function(err, result) {
    	if(err)
    		res.status(404).json({status: 404, message: "Book not found"})
    	else{
    		update = {
				title: req.body.title,
				description: req.body.description,
				author: req.body.author,
				price: req.body.price,
				image: ""
			}
			Book.findOneAndUpdate({_id: result._id}, update, {new:true}, async function (err, book) {
				if (err){
					console.log(err);
					res.status(500).json({status: 500, message: "Internal server error: " + err})
				}
				else{
					console.log("Book "+book.title + " edited.");
					res.status(200).json({status: 200, message: "Book edited successfully"})
					//redirect
					//res.redirect(config.root + "/books")
				}
			})
    	}
    })
})

router.post('/:id/purge', async function(req, res){
    Book.findOne({_id: req.params.id}, async function(err, result) {
    	if(err)
    		res.status(404).json({message: "Book not found"})
    	else{
			result.delete(async function (err, book) {
				if (err){
					console.log(err);
					res.status(500).json({status: 500, message: "Internal server error: " + err})
				}
				else{
					console.log("Book "+book.title + " deleted.");
					res.status(200).json({status: 200, message: "Book deleted successfully"})
					//redirect
					//res.redirect(config.root + "/books")
				}
			})
    	}
    })
})

module.exports = router
