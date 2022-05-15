var express = require('express');
var router = express.Router();
var config = require('../../config')
const User = require("../../models/user")

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
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
  });

  // Save the new model instance, passing a callback
  result = await awesome_instance.save(function (err, u) {
    if (err) console.log(err);
    else{
      console.log(u.name + " saved to user collection.");
    }
  });
  console.log(result)
  res.redirect(config.root)

})


/*router.get("/:id", function(req, res) {
  User.find({_id: req.params.id}, function(err, result){
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  })
});*/


module.exports = router
