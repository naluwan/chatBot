const { getUser, ensureAuthenticated } = require('../helpers/auth-helpers')
const authenticated = (req, res, next) => {
  if (ensureAuthenticated(req)) {
    res.locals.isAuthenticated = req.isAuthenticated()
    return next()
  }
  res.redirect('/signin')
}
const authenticatedAdmin = (req, res, next) => {
  if (ensureAuthenticated(req)) {
    res.locals.isAuthenticated = req.isAuthenticated()
    if (getUser(req).isAdmin) return next()
    res.redirect('/')
  } else {
    res.redirect('/signin')
  }
}

module.exports = {
  authenticated,
  authenticatedAdmin
}
