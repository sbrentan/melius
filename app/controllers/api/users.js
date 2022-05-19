const md5 = require("md5")
const auth = require("../../middlewares/auth")
const is_logged_user = require("../../middlewares/is_logged_user")
const User = require("../../models/user")
const Reservation = require("../../models/reservation")

const express = require('express');
const router = express.Router();

//ottiene tutti gli utenti 
router.get("/", async function(req, res) {
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
            res.status(500).json({status: 500, message: "Internal server error: user not created"});
        } else {
            res.status(200).json({status: 200, message: "User created"});
        }
    });
});

//ottiene utente con un certo id
router.get("/:id", auth, is_logged_user, async function(req, res) {
    
    User.findOne({_id: req.params.id}, function(err, result){
        if (err) {
            console.log("User not found");
            res.status(404).json({status: 404, message: "User not found"});
        } else {
            res.send(result);
        }
    })
});

//modifica l'utente
router.post("/:id", auth, is_logged_user, async function(req, res) {
    
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
router.get("/:id/purge", auth, is_logged_user, function(req, res) {
    User.findOne({_id: req.params.id}, async function(err, result){
        if(err)
            res.status(404).json({status: 404, message: "User not found"});
        else {
            User.deleteOne({ _id: result._id }, function(err, result){
                if(err){
                    console.log("Internal server error while deleting user: "+err);
                    res.status(500).json({status: 500, message: "Internal server error: " + err});
                } else {
                    console.log("User deleted");
                    res.status(200).json({status: 200, message: "User deleted"});
                }
            });
        }
    })
});

router.get("/:id/reservations", auth, is_logged_user, async function(req, res) {
    
    User.findOne({_id: req.params.id}, function(err, user){
        if (err)
            res.status(404).json({status: 404, message: "User not found"});
        else {
            Reservation.find({user: user._id}, async function(err, reservations) {
                res.send(reservations)
            })
        }
    })
});

router.get("/:id/reservations/:rid", auth, is_logged_user, async function(req, res) {
    
    User.findOne({_id: req.params.id}, function(err, user){
        if (err)
            res.status(404).json({status: 404, message: "User not found"});
        else {
            Reservation.findOne({_id: req.params.rid}, async function(err, reservation) {
                if (err)
                    res.status(404).json({status: 404, message: "Reservation not found"});
                else 
                    res.send(reservation)
            })
        }
    })
});

router.get("/:id/reservations/:rid/purge", auth, is_logged_user, async function(req, res) {
    
    User.findOne({_id: req.params.id}, function(err, user){
        if (err)
            res.status(404).json({status: 404, message: "User not found"});
        else {
            Reservation.findOne({_id: req.params.rid}, async function(err, reservation) {
                if (err)
                    res.status(404).json({status: 404, message: "Reservation not found"});
                else{
                    Reservation.deleteOne({ _id: req.params.rid }, async function(err, result){
                        if(err){
                            console.log("Internal server error while deleting reservation: "+err);
                            res.status(500).json({status: 500, message: "Internal server error: " + err});
                        } else {
                            console.log("Reservation deleted");
                            res.status(200).json({status: 200, message: "Reservation deleted"});
                        }
                    })
                }
            })
        }
    })
});

module.exports = router
