const express = require('express')
const router = express.Router()
const adminController = require('../../../controllers/apis/admin-controller')

router.put('/nlu/examples/:userId/:storyName', adminController.putExamples)
router.put('/stories/userSay/:userId/:storyName', adminController.putUserSay)
router.put('/stories/response/:userId/:storyName/:action', adminController.putResponse)
router.delete('/stories/:userId/:storyName', adminController.deleteStory)
router.post('/stories', adminController.postStory)
router.patch('/users/:id', adminController.patchUser)
router.get('/users', adminController.getUsers)
router.get('/stories', adminController.getStories)

module.exports = router
