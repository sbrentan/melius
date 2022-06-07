const express         = require('express');
const md5             = require("md5")
const config          = require.main.require('./config')
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
    User.find({})
        .then(users => {
            for(i=0; i<users.length; i++){
                delete users[i].password
                if("__v" in users[i]) delete users[i].__v;
            }
            res.status(200).json(users)
        })
        .catch(err => {
            res.status(500).json({status: 500, message: "Internal server error:" + err})
        })
});

//crea un utente
router.post('/', async function(req, res) {

    var user = new User({
        name: req.body.name,
        email: req.body.email,
        password: md5(req.body.password),
        role: "user"
    });

    if(!user.name || !user.email || !req.body.password){
        res.status(400).json({status: 400, message: "Error, empty fields"})
        return;
    }

    User.findOne({email: user.email})
        .then(result => {
            if(!result || result.length == 0){
                //nessun utente, quindi registra
                user.save(function (err, u) {
                    if (err) {
                        res.status(500).json({status: 500, message: "Internal server error:" + err})
                    } else {
                      console.log(u.name + " saved to user collection.");
                      res.status(200).json({status: 200, message: "User created successfully"}) 
                    }
                });
            }
            else
                res.status(409).json({status: 409, message: "User with that email already exists"})
        })
        .catch(err => {
            res.status(500).json({status: 500, message: "Internal server error:" + err})
        })
});

//ottiene utente con un certo id
router.get("/:id", auth, is_logged_user, async function(req, res) {

    User.findOne({_id: req.params.id})
        .then(user => {
            if(!user)
                res.status(404).json({status: 404, message: "User not found"})
            else {
                if("__v" in user) delete user.__v;
                delete user.password
                res.send(user);
            }
        })
        .catch(err => {
            res.status(500).json({status: 500, message: "Internal server error:" + err})
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
            filter = { _id: user._id };
            if(req.body.password)
                update = { password: md5(req.body.password) };
            else{
                update = { name: req.body.name, email: req.body.email };
                if(!req.body.name || !req.body.email){
                    res.status(400).json({status: 400, message: "Error, empty fields"})
                    return;
                }
            }

            User.findOneAndUpdate(filter, update, {new: true}, async function(err, result){
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
router.delete("/:id", auth, is_logged_user, async function(req, res) {
    User.findOne({_id: req.params.id}, async function(err, result){
        if(err)
            res.status(500).json({status: 500, message: "Internal server error:" + err})
        else if(!result)
            res.status(404).json({status: 404, message: "User not found"})
        else {
            reservations = await Reservation.find({user: result._id})
            for(i=0; i<reservations.length; i++){
                r = await deleteReservation(res, reservations[i]._id)
                console.log("Deleted linked reservation " + reservations[i]._id)
            }

            copies = await Copy.find({user: result._id})
            for(i=0; i<copies.length; i++){
                r = await unlinkCopy(res, result._id, copies[i]._id)
                console.log("Unlinked owned book " + copies[i]._id)
            }

            User.deleteOne({ _id: result._id }, async function(err, result){
                if(err){
                    console.log("Internal server error while deleting user: "+err);
                    res.status(500).json({status: 500, message: "Internal server error: " + err});
                } else {
                    console.log("User deleted");

                    if(req.user.id == result._id)
                        for(i = 0; i < req.session.tokens.length; i++){
                            if(req.session.tokens[i].token == req.query.token){
                                req.session.tokens.splice(i, 1);
                                break;
                            }
                        }

                    res.status(200).json({status: 200, message: "User deleted"});
                }
            });
        }
    })
});

router.post("/:id/check", auth, is_logged_user, async function(req, res) {
    if(!req.body.password){
        res.status(400).json({status: 400, message: "Error, empty fields"})
        return;
    }
    var user = new User({
        email: req.user.email,
        password: md5(req.body.password)
    });
    
    User.findOne({email: user.email, password: user.password}, async function(err, result){
        if(err)
            res.status(500).json({status: 500, message: "Internal server error"});
        else if(!result || result.length == 0)
            res.status(200).json({status: 200, correct: false });
        else
            res.status(200).json({status: 200, correct: true });
    })
})

router.get("/:id/reservations", auth, is_logged_user, async function(req, res) {

    User.findOne({_id: req.params.id}, async function(err, user){
        if(err)
            res.status(500).json({status: 500, message: "Internal server error:" + err})
        else if(!user)
            res.status(404).json({status: 404, message: "User not found"})
        else {
            Reservation.find({user: user._id, copy: ""}, async function(err, reservations) {
                if(err)
                    res.status(500).json({status: 500, message: "Internal server error:" + err})
                else
                    res.send(reservations)
            })
        }
    })
});

router.post('/:id/reservations', auth, is_logged_user, async function(req, res) {
    if(!req.logged){
        res.status(401).json({status: 401, message: "Cannot reserve book while not logged"})
    } else {
        if(!req.body.book){
            res.status(400).json({status: 400, message: "Error, empty fields"})
            return;
        }
        Book.findOne({_id: req.body.book}, async function(err, book) {
            if(err)
                res.status(500).json({status: 500, message: "Internal server error:" + err})
            else if(!book)
                res.status(404).json({status: 404, message: "Book not found"})
            else {

                copies_found = await Copy.find({book: book._id, buyer: ""}).count()
                reserv_found = await Reservation.find({book: book._id, copy: ""}).count()

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

    User.findOne({_id: req.params.id}, async function(err, user){
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

router.post("/:id/reservations/:rid", auth, is_admin, async function(req, res) {
    User.findOne({_id: req.params.id}, async function(err, user){
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
                else{
                    Copy.findOne({_id: req.body.copy}, async function(err, copy) {
                        if(err)
                            res.status(500).json({status: 500, message: "Internal server error:" + err})
                        else if(!copy)
                            res.status(404).json({status: 404, message: "Copy not found"})
                        else{
                            await Copy.findOneAndUpdate({_id: copy._id}, { buyer: req.user.id }, {new:true})
                            await Reservation.findOneAndUpdate({_id: req.params.rid}, { copy: copy._id }, {new:true})
                            res.status(200).json({status: 200, message: "Reservation accepted"});
                            console.log("Accepted reservation "+reservation._id + " with copy "+copy._id)
                        }
                    })
                }
            })
        }
    })
})

router.delete("/:id/reservations/:rid", auth, is_logged_user, async function(req, res) {

    User.findOne({_id: req.params.id}, async function(err, user){
        if(err)
            res.status(500).json({status: 500, message: "Internal server error:" + err})
        else if(!user)
            res.status(404).json({status: 404, message: "User not found"})
        else {
            await deleteReservation(res, req.params.rid)
            res.status(200).json({status: 200, message: "Reservation deleted"});
        }
    })
});


async function unlinkCopy(res, uid ,cid){
    Copy.findOneAndUpdate({_id: cid}, {owner: ""}, async function (err, copy) {
        if (err){
            console.log(err);
            res.status(500).json({status: 500, message: "Internal server error: " + err})
        }
        else{
            console.log("Copy "+ copyBook + " unlinked from user " + uid);
        }
    })
}

async function deleteReservation(res, rid){
    Reservation.findOne({_id: rid}, async function(err, reservation) {
        if(err)
            res.status(500).json({status: 500, message: "Internal server error:" + err})
        else if(!reservation)
            res.status(404).json({status: 404, message: "Reservation not found"})
        else {

            console.log("reservation is "+reservation)
            console.log("reservationcopy is "+reservation.copy)
            Copy.findOne({_id: reservation.copy}, async function(err, copy){
                console.log("copy is " + copy)
                console.log("err is " + err)
                /*if(err){
                    res.status(500).json({status: 500, message: "Internal server error: " + err});
                    console.log("Internal server error: " + err)
                    return;
                }*/

                if(!err && reservation.copy){
                    console.log("Deleting copy linked to reservation...")
                    result = await Copy.deleteOne({_id: copy._id})
                    console.log(result)
                    if(!result || !result.deletedCount){
                        res.status(500).json({status: 500, message: "Internal server error: " + result});
                        return;
                    }
                }


                Reservation.deleteOne({ _id: rid }, async function(err, result){
                    if(err){
                        console.log("Internal server error while deleting reservation: "+err);
                        res.status(500).json({status: 500, message: "Internal server error: " + err});
                    } else {
                        console.log("Reservation " + rid + " deleted");
                    }
                })
            })
        }
    })
}

module.exports = router
