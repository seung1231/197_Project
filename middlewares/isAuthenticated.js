var isAuthenticated = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    next(new Error('You are not authenticated!'))
  }
}

module.exports = isAuthenticated;
