const express = require('express')
const router = express.Router()
const storiesController = require('../controllers/stories-controller')
const userController = require('../controllers/user-controller')
const admin = require('./modules/admin')

router.use('/admin', admin)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/stories', storiesController.getFragments)
router.get('/', (req, res) => res.redirect('/stories'))

module.exports = router
