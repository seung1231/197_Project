var mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  fullname: String,
  email: String,
  picture: String,
  status: String,
  follow: [ { username: String } ],
  locations: [{
    name: String,
    owner: String,
    category: String,
    description: String,
    latitude: String,
    longitude: String
  }]
})

module.exports = mongoose.model('User', userSchema);
