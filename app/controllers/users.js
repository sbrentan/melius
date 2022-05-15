var express = require('express');
var app = express();
var router = express.Router();
const User = require("../models/user")

router.get('', function(req, res){
  User.find({}, function(err, result) {
    res.render('users', {users:result});
  })
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


router.get("/:id", function(req, res) {
  User.find({_id: req.params.id}, function(err, result){
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  })
});


module.exports = router
