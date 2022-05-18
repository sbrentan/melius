var express = require('express');
var router = express.Router();
var config = require('../../config')
const User = require("../../models/user")
var md5 = require("md5")
var jwt = require('jsonwebtoken')

//login 
router.post("/login", async function(req, res) { 
    
    var user = new User({
        email: req.body.email,
        password: md5(req.body.password)
    });
    
    User.findOne({email: user.email, password: user.password}, async function(err, result){
        if(err){
            console.log("Authentication failed");
            res.status(500).json({status: 500, message: "Authentication failed"});
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
            req.session.tokens.push({id: result._id, token: token, email: user.email})
            
            res.json({
        		success: true,
        		token: token,
        		email: user.email
        	});
        }
    })
});

router.post("/logout", async function(req, res) {
    if(!req.body.token)
        res.status(400).json({status: 400, message: "No token provided"});
    else{
        for(i = 0; i < req.session.tokens.length; i++){
            if(req.session.tokens[i].token == req.body.token){
                req.session.tokens.splice(i, 1);
                res.status(200).json({status: 200, message: "User logged out"});
                return;
            }
        }
        res.status(400).json({status: 400, message: "No token found"});
    }
})

module.exports = router
