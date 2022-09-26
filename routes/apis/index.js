const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const storiesController = require('../../controllers/apis/stories-controller')
const userController = require('../../controllers/apis/user-controller')
const { authenticated } = require('../../middleware/api-auth')
const { apiErrorHandler } = require('../../middleware/error-handler')

router.put(
  '/stories/response/:userId/:storyName/:action',
  authenticated,
  storiesController.putResponse
)
router.put('/nlu/examples/:storyName/:intent', authenticated, storiesController.putExamples)
router.put('/stories/userSay/:userId/:storyName', authenticated, storiesController.putUserSay)
router.delete('/stories/:storyName', authenticated, storiesController.deleteStory)
router.get('/stories/:storyName', authenticated, storiesController.getStory)
router.post('/stories', authenticated, storiesController.postStory)
router.get('/stories', authenticated, storiesController.getStories)
router.post('/signup', userController.signUp)
router.post(
  '/signin',
  // 加上failWithError: true和userController.signFail來做錯誤處理
  passport.authenticate('local', { session: false, failWithError: true }),
  userController.signIn,
  userController.signInFail
)
router.use('/', apiErrorHandler)

module.exports = router
