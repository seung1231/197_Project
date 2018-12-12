// Main Server (app.js)
// imports
var express = require('express');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var mongoose = require('mongoose');
var accountRoutes = require('./routes/account.js');
var mapRoutes = require('./routes/map.js');
var isAuthenticated = require('./middlewares/isAuthenticated');
var User = require('./models/user.js');
var pageOwner;

var app = express();
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project', { useNewUrlParser: true })

app.engine('html', require('ejs').__express);
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({  extended: false }));
app.use(cookieSession({
  name: 'local-session',
  keys: ['australia'],
  maxAge: 24 * 60 * 60 * 10002
}))

// Middleware to sign up and create account
app.use('/account', accountRoutes);

// Middleware to edit map
app.use('/map', mapRoutes);

// First page: Login page
app.get('/', function (req, res) {
  req.session = null;
  res.render('login', { message: null });
});

// Login to user's home
app.post('/', function (req, res, next) {
  var username = req.body.userName
  var password = req.body.userPassword
  User.findOne({ username: username, password: password },
    function (err, result) {
      if (err) {
        res.render('login', { message : 'Missing username or password' });
      } else if (result && result.password === password) {
        req.session.user = result.username
        res.redirect('/home/' + req.session.user)
      } else {
        res.render('login', { message : 'Invalid Credentials' });
      }
  });
});

// Get user currently logged in
app.get('/getuser', function(req, res) {
  if (req.session.user !== '') {
    res.send(req.session.user);
  } else {
    res.redirect('/');
  }
})

// Get owner of the page
app.get('/getowner', function(req, res) {
  if (req.session.user !== '') {
    res.send(pageOwner);
  } else {
    res.redirect('/');
  }
})

// Get User's home page
app.get('/home/:user', isAuthenticated, function (req, res, next) {
  // Double-check params or session
  pageOwner = req.params.user;
  console.log('Currently at homepage of: ' + pageOwner);
  // Check if there is such page
  User.findOne({ username: pageOwner }, function(err, data) {
    if (err) {
      next(new Error('User page does not exist'));
    } else {
      var ownerData = data;
      // Enter my page
      if (ownerData.username === req.session.user) {
        res.render('home', { info : ownerData, other: null });
      } else {
        // Enter another page
        User.find({ username: req.session.user, follow: { $elemMatch: { username: pageOwner } } }, function(err, data) {
          if (err) {
            next(new Error('No access'));
          } else if (data.username === pageOwner) {
            res.render('home', { info: ownerData, other: 'yes' });
          } else {
            res.render('home', { info: ownerData, other: 'no' });
          }
        });
      }
    }
  });
});


app.use(function (err, req, res, next) {
  return res.send('ERROR: ' + err.message);
})

app.listen(process.env.PORT || 3000, function () {
  console.log('App listening on port ' + (process.env.PORT || 3000));
})
