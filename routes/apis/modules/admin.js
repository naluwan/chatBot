const express = require('express')
const router = express.Router()
const adminController = require('../../../controllers/apis/admin-controller')

router.put('/stories/response/:userId/:storyName/:action', adminController.putResponse)
router.post('/stories', adminController.postStory)
router.patch('/users/:id', adminController.patchUser)
router.get('/users', adminController.getUsers)
router.get('/stories', adminController.getStories)

module.exports = router
