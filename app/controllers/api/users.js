const express         = require('express');
const md5             = require("md5")
const config          = require('../../config')
const auth            = require("../../middlewares/auth")
const is_logged_user  = require("../../middlewares/is_logged_user")
const is_admin        = require("../../middlewares/is_admin")
const User            = require("../../models/user")
const Book            = require("../../models/book")
const Copy            = require("../../models/copy")
const Reservation     = require("../../models/reservation")
const router          = express.Router();

//ottiene tutti gli utenti
router.get("/", auth, is_admin, async function(req, res) {
    User.find({}, function(err, users){
        if(err)
            res.status(500).json({status: 500, message: "Internal server error:" + err})
        else
            res.send(users);
    });
});

//crea un utente
router.post('/', async function(req, res) {

    var user = new User({
        name: req.body.name,
        email: req.body.email,
        password: md5(req.body.password),
        role: "user"
    });

    User.findOne({email: user.email}, async function(err, result){
        if(err)
            res.status(500).json({status: 500, message: "Internal server error:" + err})
        else if(!result || result.length == 0){
            //nessun utente, quindi registra
            await user.save(function (err, u) {
                if (err) {
                    res.status(500).json({status: 500, message: "Internal server error:" + err})
                } else {
                  console.log(u.name + " saved to user collection.");
                  res.status(200).json({status: 200, message: "User created successfully"})
                }
            });
        }
        else {
            res.status(403).json({status: 403, message: "User with that email already exists"})
        }
    })
});

//ottiene utente con un certo id
router.get("/:id", auth, is_logged_user, async function(req, res) {

    User.findOne({_id: req.params.id}, function(err, user){
        if(err)
            res.status(500).json({status: 500, message: "Internal server error:" + err})
        else if(!user)
            res.status(404).json({status: 404, message: "User not found"})
        else {
            res.send(user);
        }
    })
});

//modifica l'utente
router.put("/:id", auth, is_logged_user, async function(req, res) {

    User.findOne({_id: req.params.id}, async function(err, user){
        if(err)
            res.status(500).json({status: 500, message: "Internal server error:" + err})
        else if(!user)
            res.status(404).json({status: 404, message: "User not found"})
        else {
            const filter = { _id: user._id };
            const update = { name: req.body.name, email: req.body.email, password: md5(req.body.password) };

            User.findOneAndUpdate(filter, update, {new: true}, function(err, result){
                if(err){
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
router.delete("/:id", auth, is_logged_user, function(req, res) {
    User.findOne({_id: req.params.id}, async function(err, result){
        if(err)
            res.status(500).json({status: 500, message: "Internal server error:" + err})
        else if(!user)
            res.status(404).json({status: 404, message: "User not found"})
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
        if(err)
            res.status(500).json({status: 500, message: "Internal server error:" + err})
        else if(!user)
            res.status(404).json({status: 404, message: "User not found"})
        else {
            Reservation.find({user: user._id}, function(err, reservations) {
                res.send(reservations)
            })
        }
    })
});

router.post('/:id/reservations', auth, is_logged_user, async function(req, res) {
    if(!req.logged){
        res.status(401).json({status: 401, message: "Cannot reserve book while not logged"})
    } else {
        Book.findOne({_id: req.body.book}, async function(err, book) {
            if(err)
                res.status(500).json({status: 500, message: "Internal server error:" + err})
            else if(!book)
                res.status(404).json({status: 404, message: "Book not found"})
            else {

                copies_found = await Copy.find({book: book._id, buyer: ""}).count()
                reserv_found = await Reservation.find({book: book._id, copy: ""}).count()

                console.log(copies_found)
                console.log(reserv_found)

                if(copies_found - reserv_found > 0){
                    reservation = new Reservation({
                        user: req.user.id,
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
                        }
                    })
                } else
                    res.status(404).json({status: 404, message: "No copies available for this book"})
            }
        })
    }
})

router.get("/:id/reservations/:rid", auth, is_logged_user, async function(req, res) {

    User.findOne({_id: req.params.id}, function(err, user){
        if(err)
            res.status(500).json({status: 500, message: "Internal server error:" + err})
        else if(!user)
            res.status(404).json({status: 404, message: "User not found"})
        else {
            Reservation.findOne({_id: req.params.rid}, async function(err, reservation) {
                if(err)
                    res.status(500).json({status: 500, message: "Internal server error:" + err})
                else if(!reservation)
                    res.status(404).json({status: 404, message: "Reservation not found"})
                else
                    res.send(reservation)
            })
        }
    })
});

router.delete("/:id/reservations/:rid", auth, is_logged_user, async function(req, res) {

    User.findOne({_id: req.params.id}, function(err, user){
        if(err)
            res.status(500).json({status: 500, message: "Internal server error:" + err})
        else if(!user)
            res.status(404).json({status: 404, message: "User not found"})
        else {
            Reservation.findOne({_id: req.params.rid}, async function(err, reservation) {
                if(err)
                    res.status(500).json({status: 500, message: "Internal server error:" + err})
                else if(!reservation)
                    res.status(404).json({status: 404, message: "Reservation not found"})
                else {
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
