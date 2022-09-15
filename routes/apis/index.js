const express = require('express')
const router = express.Router()
const storiesController = require('../../controllers/apis/stories-controller')

router.get('/stories', storiesController.getStories)

module.exports = router
