const express = require('express')

const router = express.Router()

const storiesController = require('../controllers/stories-controller')

router.get('/stories', storiesController.getFragments)

router.get('/', (req, res) => res.redirect('/stories'))

module.exports = router
