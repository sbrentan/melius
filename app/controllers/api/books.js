var express = require('express');
var router = express.Router();
const auth = require("../../middlewares/auth")
const Book = require("../../models/book")
const Copy = require("../../models/copy")
const Reservation = require("../../models/reservation")

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
		image: ""
	});

	// Save the new model instance, passing a callback
	new_book.save(async function (err, book) {
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

router.post('/:id/reserve', auth, async function(req, res) {
    if(!req.logged){
        res.status(401).json({status: 401, message: "Cannot reserve book while not logged"})
    } else {
    	Book.findOne({_id: req.params.id}, async function(err, book) {
    		if(err){
				res.status(404).json({status: 404, message: "Book not found"})
    		} else {
    			Copy.findOne({book: book._id}, async function(err, copy){
    				if(err){
						res.status(404).json({status: 404, message: "No copies available for this book"})
		    		} else {
		    			reservation = new Reservation({
		    				user: req.permission,
		    				book: book._id,
		    				copy: ""
		    			})
		    			reservation.save(async function(err, reservation){
		    				if (err){
								console.log(err);
								res.status(500).json({status: 500, message: "Internal server error: " + err})
							}
							else{
								console.log(book.title + " reserved by " + req.user.email);
								res.status(200).json({status: 200, message: "Book reserved successfully"})
								//redirect
								//res.redirect(config.root + "/books")
							}
		    			})
		    		}
    			})
    		}
    	})
    }
})

module.exports = router