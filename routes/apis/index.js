const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const storiesController = require('../../controllers/apis/stories-controller')
const userController = require('../../controllers/apis/user-controller')
const { authenticated, authenticateAdmin } = require('../../middleware/api-auth')
const { apiErrorHandler } = require('../../middleware/error-handler')
const upload = require('../../middleware/multer')
const admin = require('./modules/admin')
const train = require('./modules/train')

router.use('/admin', authenticated, authenticateAdmin, admin)
router.use('/train', authenticated, train)

router.get('/users/:id/edit', authenticated, userController.editUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)
router.get('/users/:id', authenticated, userController.getUser)

router.put('/stories/response/:storyName/:action', authenticated, storiesController.putResponse)
router.put('/nlu/examples/:storyName', authenticated, storiesController.putExamples)
router.put('/stories/userSay/:storyName', authenticated, storiesController.putUserSay)
router.get('/stories/actions', authenticated, storiesController.getAllActions)
router.delete('/stories/:storyName', authenticated, storiesController.deleteStory)
router.get('/stories/:storyName', authenticated, storiesController.getStory)
router.post('/stories', authenticated, storiesController.postStory)
router.get('/stories', authenticated, storiesController.getStories)
router.post('/signup', upload.single('image'), userController.signUp)
router.get('/auth', authenticated, userController.auth)
router.post(
  '/signin',
  // 加上failWithError: true和userController.signFail來做錯誤處理
  passport.authenticate('local', { session: false, failWithError: true }),
  userController.signIn,
  userController.signInFail
)
router.use('/', apiErrorHandler)

module.exports = router
