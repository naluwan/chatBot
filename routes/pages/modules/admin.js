const express = require('express')
const router = express.Router()
const adminController = require('../../../controllers/pages/admin-controller')

router.put('/nlu/examples/:userId/:storyName/:intent', adminController.putExamples)
router.get('/stories/create', adminController.createStoryPage)
router.put('/stories/response/:userId/:storyName/:action', adminController.putResponse)
router.put('/stories/userSay/:userId/:storyName', adminController.putUserSay)
router.delete('/stories/:userId/:storyName', adminController.deleteStory)
router.post('/stories', adminController.postStory)
router.get('/stories', adminController.getStories)
router.patch('/users/:id', adminController.patchUser)
router.get('/users', adminController.getUsers)

router.use('/', (req, res) => res.redirect('/admin/users'))

module.exports = router
