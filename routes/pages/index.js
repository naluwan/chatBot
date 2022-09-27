const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const storiesController = require('../../controllers/pages/stories-controller')
const userController = require('../../controllers/pages/user-controller')
const admin = require('./modules/admin')
const { authenticated, authenticatedAdmin } = require('../../middleware/auth')
const { generalErrorHandler } = require('../../middleware/error-handler')

router.use('/admin', authenticatedAdmin, admin)

router.get('/signin', userController.signInPage)
router.post(
  '/signin',
  passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
  }),
  userController.signIn
)
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/logout', userController.logout)

router.put('/stories/response/:storyName/:action', authenticated, storiesController.putResponse)
router.put('/nlu/examples/:storyName', authenticated, storiesController.putExamples)
router.get('/stories/create', authenticated, storiesController.createStoryPage)
router.put('/stories/userSay/:userId/:storyName', authenticated, storiesController.putUserSay)
router.get('/stories/actions', authenticated, storiesController.getAllActions)
router.delete('/stories/:storyName', authenticated, storiesController.deleteStory)
router.get('/stories/:storyName', authenticated, storiesController.getStory)
router.post('/stories', authenticated, storiesController.postStory)
router.get('/stories', authenticated, storiesController.getStories)
router.get('/', (req, res) => res.redirect('/stories'))
router.use('/', generalErrorHandler)

module.exports = router
