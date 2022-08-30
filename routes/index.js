const express = require('express')
const router = express.Router()
const storiesController = require('../controllers/stories-controller')
const admin = require('./modules/admin')

router.use('/admin', admin)

router.get('/stories', storiesController.getFragments)
router.get('/', (req, res) => res.redirect('/stories'))

module.exports = router
