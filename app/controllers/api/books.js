const express 		= require('express');
const auth 			= require("../../middlewares/auth")
const Book 			= require("../../models/book")
const Copy 			= require("../../models/copy")
const Reservation 	= require("../../models/reservation")
const is_admin      = require("../../middlewares/is_admin")
const router 		= express.Router();

router.get('/', async function(req, res){
	name_filter = ""
	if(req.query && req.query.name)
		name_filter = req.query.name
	
	object_filter = [
		{ "title": { "$regex": name_filter, "$options": "i" } },
		{ "author": { "$regex": name_filter, "$options": "i" } },
		{ "description": { "$regex": name_filter, "$options": "i" } }]

	books = Book.find( { $or : [ { "title": { "$regex": name_filter, "$options": "i" } },
		{ "author": { "$regex": name_filter, "$options": "i" } },
		{ "description": { "$regex": name_filter, "$options": "i" } } ] })
	//console.log(books)
	books.then(books => {
	    	res.send(books);
	    })
	    .catch(error => {
	    	res.status(500).json({status: 500, message: "Internal server error: " + error}) 
	    })
})

router.post('/', auth, is_admin, async function(req, res){
    var new_book = new Book({
		title: req.body.title,
		description: req.body.description,
		author: req.body.author,
		image: ""
	});

	if(!req.body.title || !req.body.description || !req.body.author){
        res.status(400).json({status: 400, message: "Error, empty fields"})
        return;
    }

	// Save the new model instance, passing a callback
	new_book.save(async function (err, book) {
		if (err){
			console.log(err);
			res.status(500).json({status: 500, message: "Internal server error: " + err})
		}
		else{
			console.log(book.title + " saved to book collection.");
			res.status(200).json({status: 200, message: "Book created successfully"})
		}
	});
})

router.get('/:id', async function(req, res){
    Book.findOne({_id: req.params.id})
    	.then(async book => {
    		if(!book){
				res.status(404).json({status: 404, message: "Book not found"})
				return
    		}
    		copies_found = await Copy.find({book: book._id, buyer: ""}).count()
            reserv_found = await Reservation.find({book: book._id, copy: ""}).count()
            if(book.toObject)
            	book = book.toObject()
			book.availability = copies_found - reserv_found;
			if("__v" in book) delete book.__v;

			lowest_copy = await Copy.findOne()
		    	.where({book: book._id})
		    	.sort('price')
		    if(lowest_copy)
		    	book.starting_price = lowest_copy.price;
		   	else
		   		book.starting_price = "?"
    		res.send(book)
    	})
    	.catch(err => {
    		console.log(err)
    		res.status(500).json({status: 500, message: "Internal server error: " + err})
    	})
})

router.put('/:id', auth, is_admin, async function(req, res){

    Book.findOne({_id: req.params.id}, async function(err, book) {
    	if(err)
			res.status(500).json({status: 500, message: "Internal server error: " + err})
		else if(!book)
			res.status(404).json({status: 404, message: "Book not found"})
    	else{
    		update = {
				title: req.body.title,
				description: req.body.description,
				author: req.body.author,
				image: ""
			}
			if(!req.body.title || !req.body.description || !req.body.author){
		        res.status(400).json({status: 400, message: "Error, empty fields"})
		        return;
		    }
			Book.findOneAndUpdate({_id: book._id}, update, {new:true}, async function (err, result) {
				if (err){
					console.log(err);
					res.status(500).json({status: 500, message: "Internal server error: " + err})
				}
				else{
					console.log("Book "+result.title + " edited.");
					res.status(200).json({status: 200, message: "Book edited successfully"})
				}
			})
    	}
    })
})

router.delete('/:id', auth, is_admin, async function(req, res){
    Book.findOne({_id: req.params.id}, async function(err, book) {
    	if(err)
			res.status(500).json({status: 500, message: "Internal server error: " + err})
		else if(!book)
			res.status(404).json({status: 404, message: "Book not found"})
		else{
			book.delete(async function (err, book) {
				if (err){
					console.log(err);
					res.status(500).json({status: 500, message: "Internal server error: " + err})
				}
				else{
					console.log("Book "+book.title + " deleted.");
					res.status(200).json({status: 200, message: "Book deleted successfully"})
				}
			})
    	}
    })
})

module.exports = router
