var express = require('express');
var User = require('../models/user.js');
var isAuthenticated = require('../middlewares/isAuthenticated')
var router = express.Router();

// Get all my spots from db
router.post('/showmyspots', function (req, res) {
  var pageOwner = req.body.username;
  User.findOne({ username: pageOwner }, function(err, results) {
    if (err) {
      next(new Error('Error loading spots'));
    } else if (results) {
      var spots = results.locations;
      res.send(spots);
    } else {
      res.send(null);
    }
  });
});

// Add new spot to database
router.post('/addspot', function (req, res) {
  var user = req.session.user;
  var spotName = req.body.spot;
  var cat = req.body.category;
  var rev = req.body.review;
  var lat = req.body.latitude;
  var lon = req.body.longitude;
  var location = {
    name: spotName,
    owner: user,
    category: cat,
    description: rev,
    latitude: lat,
    longitude: lon
  };

  User.updateOne({ username: user }, { $push: { locations: { $each: [ location ] } } },
    function(err, result) {
      if (result) {
        res.send('Successfully added a new spot');
      } else {
        res.send('error');
      }
  });
});

// Delete spot
router.post('/deletespot', function (req, res) {
  var user = req.session.user;
  var deleteSpot = req.body.name;
  User.updateOne({ username: user }, { $pull: { locations: { name: deleteSpot } } },
    function(err, result) {
      if (result) {
        res.send('Successfully added a new spot');
      } else {
        res.send('error');
      }
  });
})

module.exports = router;
