const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const storiesController = require('../../controllers/apis/stories-controller')
const userController = require('../../controllers/apis/user-controller')
const { authenticated } = require('../../middleware/api-auth')
const { apiErrorHandler } = require('../../middleware/error-handler')

router.get('/stories', authenticated, storiesController.getStories)
router.post('/signup', userController.signUp)
router.post(
  '/signin',
  passport.authenticate('local', { session: false, failWithError: true }),
  userController.signIn,
  userController.signInFail
)
router.use('/', apiErrorHandler)

module.exports = router
