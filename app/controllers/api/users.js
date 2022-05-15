const User = require("../../models/user")

const express = require('express');
const router = express.Router();

router.get('/', function(req, res){
    console.log("users");
    User.find({}, function(err, result) {
        res.render('users', {users: result});
    })
})

router.get('/new', async function(req, res) {
    res.render('user_edit');
})

router.post('/new', async function(req, res) {

  // Create an instance of model SomeModel
  var awesome_instance = new User({
      name: "simone",
      email: "maio",
      password: "pss"
  });

  // Save the new model instance, passing a callback
  result = await awesome_instance.save(function (err, u) {
    if (err) console.log(err);
    else{
      console.log(u.name + " saved to user collection.");
    }
  });
  console.log(result)
  res.end("end")

})

module.exports = router
