const express 		= require('express');
const Copy 			= require("../../models/copy")
const Book 			= require("../../models/book")
const is_admin  	= require("../../middlewares/is_admin")
const auth  		= require("../../middlewares/auth")
const router		= express.Router();

router.get('/', async function(req, res){
	filter = {buyer: ""}
	if(req.query.book)
		filter = {book: req.query.book, buyer: ""}
    Copy.find(filter, async function(err, copies) {
    	if(err)
            res.status(500).json({status: 500, message: "Internal server error:" + err})
        else{
        	for(i=0; i<copies.length; i++){
        		copies[i] = copies[i].toObject();
        		if("__v" in copies[i]) delete copies[i].__v;
        	}
            res.send(copies);
        }
    })
})

router.post('/', async function(req, res){

	Book.findOne({_id: req.body.book}, async function(err, book){
		if(err || !book){
			res.status(404).json({status: 404, message: "Book not found"})
			return
		}
		var newid = 1;
		last_copy = await Copy.findOne()
		    .where({book: book._id})
		    .sort('-id')
		if(last_copy)
			newid = last_copy.id+1;
	    var new_copy = new Copy({
	    	id: newid,
			book: req.body.book,
			owner: req.body.owner,
			buyer: "",
			price: req.body.price
		});

		// Save the new model instance, passing a callback
		new_copy.save(async function (err, copy) {
			if (err){
				console.log(err);
				res.status(500).json({status: 500, message: "Internal server error: " + err})
			}
			else{
				console.log(copy.book + " saved to copy collection.");
				res.status(200).json({status: 200, message: "Copy created successfully"})
			}
		});
	})
})

router.get('/:id', async function(req, res){
    Copy.findOne({_id: req.params.id}, async function(err, copy) {
    	if(err)
			res.status(500).json({status: 500, message: "Internal server error: " + err})
		else if(!copy)
			res.status(404).json({status: 404, message: "Copy not found"})
		else{
			copy = copy.toObject();
			if("__v" in copy) delete copy.__v;
    		res.send(copy)
		}
    })
})

router.put('/:id', auth, async function(req, res){
    Copy.findOne({_id: req.params.id}, async function(err, copy) {
    	if(err)
			res.status(500).json({status: 500, message: "Internal server error: " + err})
		else if(!copy)
			res.status(404).json({status: 404, message: "Copy not found"})
		else{
    		update = {
				book: req.body.book,
				owner: req.body.owner,
				price: req.body.price
			}
			Copy.findOneAndUpdate({_id: copy._id}, update, {new:true}, async function (err, result) {
				if (err){
					console.log(err);
					res.status(500).json({status: 500, message: "Internal server error: " + err})
				}
				else{
					console.log("Copy "+ result._id + " edited.");
					res.status(200).json({status: 200, message: "Copy edited successfully"})
				}
			})
    	}
    })
})

router.delete('/:id', auth, async function(req, res){
    Copy.findOne({_id: req.params.id}, async function(err, copy) {
    	if(err)
			res.status(500).json({status: 500, message: "Internal server error: " + err})
		else if(!copy)
			res.status(404).json({status: 404, message: "Copy not found"})
		else{
			copy.delete(async function (err, copy) {
				if (err){
					console.log(err);
					res.status(500).json({status: 500, message: "Internal server error: " + err})
				}
				else{
					console.log("Copy "+ copy.book + " deleted.");
					res.status(200).json({status: 200, message: "Copy deleted successfully"})
				}
			})
    	}
    })
})

module.exports = router
