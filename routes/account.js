var express = require('express');
var User = require('../models/user.js');
var isAuthenticated = require('../middlewares/isAuthenticated')
var router = express.Router();

router.get('/signup', function (req, res) {
  User.find({}, function(err, results) {
    console.log(results)
  })
  res.render('signup', {message: null});
})

router.post('/signup', function (req, res, next) {
  var username = req.body.username
  var password = req.body.password
  var firstname = req.body.firstname
  var lastname = req.body.lastname
  var email = req.body.email
  var user = new User({
    username: username,
    password: password,
    firstname: firstname,
    lastname: lastname,
    email: email
  })
  user.save(function (err, result) {
    if (!err) {
      res.redirect('home')
    } else {
      next(new Error('invalid signup'))
    }
  })
})

router.get('/login', function (req, res) {
  res.render('login')
})

router.post('/login', function (req, res, next) {
  var username = req.body.userName
  var password = req.body.userPassword
  User.findOne({ username: username, password: password },
    function (err, result) {
      if (result && result.password === password) {
        req.session.user = result.username
        res.redirect('/')
      } else {
        next(new Error('Invalid Credentials'))
      }
  })
})

router.get('/logout', isAuthenticated, function (req, res, next) {
  req.session.user = ''
  res.redirect('/')
})

module.exports = router;
