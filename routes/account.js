var express = require('express');
var User = require('../models/user.js');
var isAuthenticated = require('../middlewares/isAuthenticated')
var router = express.Router();

// Link to sign up page
router.get('/signup', function (req, res) {
  res.render('signup', {message : null});
})

// Sign up
router.post('/signup', function (req, res, next) {
  var fullname = req.body.fullname;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;

  // PW requirements
  if (fullname === '' || email === '' || username === '' || password === '') {
    res.render('signup', { message : "Blank input" });
  } else if (!email.includes("@") || !email.includes(".")) {
		res.render('signup', { message : "Invalid email" });
	} else if (password.length < 6) {
		res.render('signup', { message : "Password must be at least 6 characters" });
	} else {
    // Check if username exists
    User.findOne({ username: username }, function(err, result) {
      if (err) {
        next(new Error('Invalid sign up'));
      } else if (result) {
        res.render('signup', { message : "Username exists" });
      } else {
        // Save new user to DB
        var user = new User({
          username: username,
          password: password,
          fullname: fullname,
          email: email,
          picture: 'https://lh5.ggpht.com/_S0f-AWxKVdM/S5TpU6kRmUI/AAAAAAAAL4Y/wrjx3_23kw4/s72-c/d_silhouette%5B2%5D.jpg',
          status: ''
        });

        user.save(function (err, result) {
          if (!err) {
            req.session.user = username;
            console.log("New User: " + username);
            res.redirect('/home/' + req.session.user);
          } else {
            // Change if disrupts flow
            next(new Error('Invalid signup'));
          }
        });
      }
    });
  }
});

// Edit profile
router.post('/editprofile', function (req, res) {
  var user = req.session.user;
  var pic = req.body.url;
  var sts = req.body.status;
  User.updateOne({ username: user }, { $set: { "picture": pic, "status": sts } },
    function(err, result) {
      if (err) {
        next(new Error('Error in profile edit'));
      } else {
        // Change if disrupts flow
        res.redirect('/home/' + user);
      }
  });
});

// Add new follower
router.post('/follow', function (req, res) {
  var user = req.session.user;
  var owner = req.body.username;
  console.log(user + ' ' + owner);
  User.updateOne({ username: user }, { $push: { follow: { $each: [ { username: owner } ] } } },
    function (err, result) {
      if (err) {
        next(new Error('Follow error'));
      } else {
        User.findOne({ username: owner }, function(err, results) {
          if (err) {
            next(new Error('Error loading spots'));
          } else if (results) {
            var spots = results.locations;
            console.log(spots);
            User.updateOne({ username: user }), { $push: { locations: { $each: spots } } },
              function(err, result) {
                if (err) {
                  next(new Error('Update new spots Error'));
                } else {
                  res.send('sucesss');
                }
              }
          } else {
            res.send(null);
          }
        });
      }
  });
});

router.post('/search', function (req, res) {
  var name = req.body.searchField;
  User.findOne({ fullname: name }, function (err, result) {
    if (result) {
      res.redirect('/home/' + result.username);
    } else {
      res.send(null);
    }
  });
});

// Log Out
router.get('/logout', isAuthenticated, function (req, res, next) {
  req.session = null;
  res.redirect('/')
})

module.exports = router;
