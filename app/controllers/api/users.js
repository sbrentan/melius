const User = require("../../models/user")
var config = require('../../config')
var md5 = require("md5")
var auth = require("../../middlewares/auth")

const express = require('express');
const router = express.Router();

//ottiene tutti gli utenti 
router.get("/", auth, async function(req, res) {
    User.find({}, function(err, result){
        if (err) {
            console.log("Users not found");
            res.status(404).json({status: 404, message: "Users not found"});
        } else {
            res.send(result);
        }
    });
});

//crea un utente
router.post('/', async function(req, res) {
    
    var user = new User({
        name: req.body.name,
        email: req.body.email,
        password: md5(req.body.password)
    });
    
    //attende finchè non finisce il save nel db
    result = await user.save(function (err, u) {
        if (err) {
            console.log(err);
        } else {
          console.log(u.name + " saved to user collection.");
        }
    });
    
    res.redirect(config.root);
});

//ottiene utente con un certo id
router.get("/:id", auth, async function(req, res) {
    if(req.permission != req.params.id){
        console.log("Unathorized");
        res.status(401).json({status: 401, message: "Unathorized"});
        return;
    }  
    
    User.find({_id: req.params.id}, function(err, result){
        if (err) {
            console.log("User not found");
            res.status(404).json({status: 404, message: "User not found"});
        } else {
            res.send(result);
        }
    })
});

//modifica l'utente
router.post("/:id", async function(req, res) {
    
    User.findOne({_id: req.params.id}, async function(err, result){
        if(err){
            console.log("User not found");
            res.status(404).json({status: 404, message: "User not found"});
        } else {
            const filter = { _id: result._id };
            const update = { name: req.body.name, email: req.body.email, password: md5(req.body.password) };
            
            User.findOneAndUpdate(filter, update, {new: true}, function(err, result){
                if(err){
                    console.log("Oops! Something went wrong while updating");
                    res.status(500).json({status: 500, message: "Internal server error while updating"});
                } else {
                    console.log("User updated");
                    res.send(result);
                }
            });
        }
    })
    
});

//elimina utente
router.get("/:id/purge", function(req, res) { 
    User.findOne({_id: req.params.id}, async function(err, result){
        if(err){
            console.log("User not found");
            res.status(404).json({status: 404, message: "User not found"});
        } else {
            
            User.deleteOne({ _id: result._id }, function(err, result){
                if(err){
                    console.log("Oops! Something went wrong while deleting");
                    res.status(500).json({status: 500, message: "Internal server error while deleting"});
                } else {
                    console.log("User deleted");
                    res.status(200).json({status: 200, message: "User deleted"});
                }
            });
        }
    })
});

module.exports = router
