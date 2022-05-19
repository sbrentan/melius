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
    
    User.findOne({email: user.email, password: user.password}, async function(err, result){ 
        console.log(user.email, user.password)
        
        if(err){
            console.log("Authentication failed");
            res.status(500).json({status: 500, message: "Authentication failed"});
        }
        else if(result.length == 0){
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
            req.session.tokens.push({id: result._id, token: token, email: user.email})

            res.json({
        		token: token,
        		email: user.email,
                name: result.name,
                id: result._id
        	});
        }
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