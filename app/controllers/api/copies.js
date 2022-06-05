const express 	= require('express');
const Copy 		= require("../../models/copy")
const is_admin  = require("../../middlewares/is_admin")
const auth  	= require("../../middlewares/auth")
const router	= express.Router();

router.get('/', auth, async function(req, res){
    Copy.find({})
    	.then(copies => {
    		res.send(copies)
    	})
    	.catch(err => {
    		res.status(500).json({status: 500, message: "Internal server error:" + err})
    	})
})

router.post('/', auth, async function(req, res){
    var new_copy = new Copy({
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

router.get('/:id', auth, async function(req, res){
    Copy.findOne({_id: req.params.id})
    	.then(copy => {
    		if(!copy)
				res.status(404).json({status: 404, message: "Copy not found"})
			else
	    		res.send(copy)
    	})
    	.catch(err => {
    		res.status(500).json({status: 500, message: "Internal server error: " + err})
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