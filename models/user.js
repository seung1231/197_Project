var mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  firstname: String,
  lastname: String,
  email: String,
  follows: String
})

module.exports = mongoose.model('User', userSchema);
