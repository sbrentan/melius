const express 	= require('express');
const Copy 		= require("../../models/copy")
const router	= express.Router();

router.get('/', async function(req, res){
    Copy.find({}, async function(err, copies) {
    	if(err)
            res.status(500).json({status: 500, message: "Internal server error:" + err})
        else
            res.send(copies);
    })
})

router.post('/', async function(req, res){
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

router.get('/:id', async function(req, res){
    Copy.findOne({_id: req.params.id}, async function(err, copy) {
    	if(err)
			res.status(500).json({status: 500, message: "Internal server error: " + err})
		else if(!copy)
			res.status(404).json({status: 404, message: "Copy not found"})
		else
    		res.send(copy)
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