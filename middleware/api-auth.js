const passport = require('../config/passport')

const authenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.status(401).json({ status: 'error', message: '無效token' })
    const userData = user.toJSON()
    delete userData.password
    req.user = userData
    next()
  })(req, res, next)
}

const authenticateAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next()

  return res.status(403).json({ status: 'error', message: 'permission denied' })
}

module.exports = {
  authenticated,
  authenticateAdmin
}
