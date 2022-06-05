var express = require('express');
var router = express.Router();
var config = require('../../config')
const User = require("../../models/user")
var md5 = require("md5")
const auth = require("../../middlewares/auth")
var jwt = require('jsonwebtoken')

//login 
router.post("/login", async function(req, res) {

    var user = new User({
        email: req.body.email,
        password: md5(req.body.password)
    });
    
    //User.findOne({email: user.email, password: user.password}, async function(err, result){
    User.findOne({email: user.email, password: user.password})
        .then(result => {
            if(!result || result.length == 0){
                console.log("Unauthorized");
                res.status(401).json({status: 401, message: "Unauthorized"});
            } else {
                var payload = {
                    email: user.email,
                    id: user._id
               }
               
                var options = {
                    expiresIn: 86400 //24h
                }
                
                var token = jwt.sign(payload, "ultramegasupersecretkey", options);
                
                req.session.tokens = (req.session.tokens || [])
                req.session.tokens.push({
                    id: result._id,
                    token: token,
                    email: result.email,
                    role: result.role
                })

                res.json({
                    token: token,
                    id: result._id,
                    email: user.email,
                    name: result.name,
                    role: result.role
                });
        }
    })
    .catch(err => {
        console.log(err)
        console.log("Authentication failed");
        res.status(500).json({status: 500, message: "Authentication failed"});
    })
});
//req.params.id
router.post("/logout", auth, async function(req, res) {
    if(!req.query.token)
        res.status(400).json({status: 400, message: "No token provided"});
    else if(!req.session.tokens)
        res.status(400).json({status: 400, message: "No session found"});
    else{
        for(i = 0; i < req.session.tokens.length; i++){
            if(req.session.tokens[i].token == req.query.token){
                req.session.tokens.splice(i, 1);
                res.status(200).json({status: 200, message: "User logged out"});
                return;
            }
        }
        res.status(400).json({status: 400, message: "No token found"});
    }
})

module.exports = router