// Main Server (app.js)
// imports
var express = require('express')
var bodyParser = require('body-parser')
var cookieSession = require('cookie-session')
var mongoose = require('mongoose')
var accountRoutes = require('./routes/account.js')
var isAuthenticated = require('./middlewares/isAuthenticated')

var app = express();
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hw5-new')

app.engine('html', require('ejs').__express);
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({  extended: false }));
app.use(cookieSession({
  name: 'local-session',
  keys: ['australia'],
  maxAge: 24 * 60 * 60 * 10002
}))

app.use('/account', accountRoutes);

app.get('/', function (req, res, next) {
  console.log(req.session);
  res.render('login', {message: null});
})

app.listen(process.env.PORT || 3000, function () {
  console.log('App listening on port ' + (process.env.PORT || 3000));
})
