const express 		= require('express');
const Copy 			= require("../../models/copy")
const Book 			= require("../../models/book")
const Reservation	= require("../../models/reservation")
const is_admin  	= require("../../middlewares/is_admin")
const auth  		= require("../../middlewares/auth")
const router		= express.Router();

router.get('/', auth, is_admin, async function(req, res){
	filter = {buyer: ""}
	if(req.query.book)
		filter = {book: req.query.book, buyer: ""}
    Copy.find(filter)
    	.then(copies => {
    		for(i=0; i<copies.length; i++){
    			if(copies[i].toObject)
					copies[i] = copies[i].toObject();
        		if("__v" in copies[i]) delete copies[i].__v;
        	}
            res.send(copies);
    	})
    	.catch(err => {
    		res.status(500).json({status: 500, message: "Internal server error:" + err})
    	})
})

router.post('/', auth, is_admin, async function(req, res){

	if(!req.body.book || !req.body.owner || !req.body.price){
        res.status(400).json({status: 400, message: "Error, empty fields"})
        return;
    }
    if(!Number(req.body.price) || Number(req.body.price) === NaN){
    	res.status(400).json({status: 400, message: "Error, bad parameters"})
        return;	
    }

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
		console.log(last_copy)
		console.log(newid)
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

router.get('/:id', auth, async function(req, res){
    Copy.findOne({_id: req.params.id})
    	.then(copy => {
    		if(!copy)
				res.status(404).json({status: 404, message: "Copy not found"})
			else{
				if(copy.toObject)
					copy = copy.toObject();
				if("__v" in copy) delete copy.__v;
	    		res.send(copy)
	    	}
    	})
    	.catch(err => {
    		res.status(500).json({status: 500, message: "Internal server error: " + err})
    	})
})

router.put('/:id', auth, is_admin, async function(req, res){
	if(!req.params.id || !req.body.book || !req.body.owner || !req.body.price){
        res.status(400).json({status: 400, message: "Error, empty fields"})
        return;
    }
    console.log(Number(req.body.price))
    if(!Number(req.body.price) || Number(req.body.price) === NaN){
    	res.status(400).json({status: 400, message: "Error, bad parameters"})
        return;	
    }
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

router.delete('/:id', auth, is_admin, async function(req, res){
    Copy.findOne({_id: req.params.id}, async function(err, copy) {
    	if(err)
			res.status(500).json({status: 500, message: "Internal server error: " + err})
		else if(!copy)
			res.status(404).json({status: 404, message: "Copy not found"})
		else{
			copies_found = await Copy.find({book: copy.book, buyer: ""}).count()
			reserv_found = await Reservation.find({book: copy.book, copy: ""}).count()
			avail = copies_found - reserv_found

			if(!copy.buyer){
				//copy not bought
				if(avail <= 0){
					//reservation full
					res.status(400).json({status: 400, message: "Cannot delete copy, already reserved"})
					return
				}
			} else {
				result = await Reservation.deleteOne({ book: copy.book, copy: copy._id })
				console.log(result)
				if(!result || !result.deletedCount){
					res.status(500).json({status: 500, message: "Internal server error: " + result})
					return
				}
			}

			copyBook = copy.book;
			Copy.deleteOne({_id: copy._id}, async function (err, copy) {
				if (err){
					console.log(err);
					res.status(500).json({status: 500, message: "Internal server error: " + err})
				}
				else{
					console.log("Copy "+ copyBook + " deleted.");
					res.status(200).json({status: 200, message: "Copy deleted successfully"})
				}
			})
    	}
    })
})

module.exports = router
