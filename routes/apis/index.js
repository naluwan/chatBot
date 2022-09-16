const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const storiesController = require('../../controllers/apis/stories-controller')
const userController = require('../../controllers/apis/user-controller')
const { apiErrorHandler } = require('../../middleware/error-handler')

router.post('/signin', passport.authenticate('local', { session: false }), userController.singIn)
router.get('/stories', storiesController.getStories)
router.use('/', apiErrorHandler)

module.exports = router
