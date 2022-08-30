const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const storiesController = require('../controllers/stories-controller')
const userController = require('../controllers/user-controller')
const admin = require('./modules/admin')
const { authenticated } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')

router.use('/admin', admin)

router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/logout', userController.logout)
router.get('/stories', authenticated, storiesController.getFragments)
router.get('/', (req, res) => res.redirect('/stories'))
router.use('/', generalErrorHandler)

module.exports = router
