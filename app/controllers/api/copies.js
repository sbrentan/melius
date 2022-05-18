var express = require('express');
var router = express.Router();
const Copy = require("../../models/copy")

router.get('/', async function(req, res){
    Copy.find({}, async function(err, result) {
    	if(err)
    	res.writeHead(200, { "Content-Type": "text/json"})
    	res.send(result)
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
	result = await new_copy.save(async function (err, copy) {
		if (err){
			console.log(err);
			res.status(500).json({status: 500, message: "Internal server error: " + err})
		}
		else{
			console.log(copy.book + " saved to copy collection.");
			res.status(200).json({status: 200, message: "Copy created successfully"})
			//redirect
			//res.redirect(config.root + "/books")
		}
	});
})

router.get('/:id', async function(req, res){
    Copy.findOne({_id: req.params.id}, async function(err, result) {
    	if(err)
    		res.status(404).json({status: 404, message: "Copy not found"})
    	else
    		res.send(result)
    })
})

router.post('/:id', async function(req, res){
    Copy.findOne({_id: req.params.id}, async function(err, result) {
    	if(err)
    		res.status(404).json({status: 404, message: "Copy not found"})
    	else{
    		update = {
				book: req.body.book,
				owner: req.body.owner,
				price: req.body.price
			}
			Copy.findOneAndUpdate({_id: result._id}, update, {new:true}, async function (err, copy) {
				if (err){
					console.log(err);
					res.status(500).json({status: 500, message: "Internal server error: " + err})
				}
				else{
					console.log("Copy "+ copy.book + " edited.");
					res.status(200).json({status: 200, message: "Copy edited successfully"})
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
    		res.status(404).json({message: "Copy not found"})
    	else{
			result.delete(async function (err, copy) {
				if (err){
					console.log(err);
					res.status(500).json({status: 500, message: "Internal server error: " + err})
				}
				else{
					console.log("Copy "+ copy.book + " deleted.");
					res.status(200).json({status: 200, message: "Copy deleted successfully"})
					//redirect
					//res.redirect(config.root + "/books")
				}
			})
    	}
    })
})

module.exports = router