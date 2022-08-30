const express = require('express')
const router = express.Router()
const storiesController = require('../controllers/stories-controller')
const userController = require('../controllers/user-controller')
const admin = require('./modules/admin')
const { generalErrorHandler } = require('../middleware/error-handler')

router.use('/admin', admin)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/stories', storiesController.getFragments)
router.get('/', (req, res) => res.redirect('/stories'))
router.use('/', generalErrorHandler)

module.exports = router
