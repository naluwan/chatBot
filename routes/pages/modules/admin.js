const express = require('express')
const router = express.Router()
const adminController = require('../../../controllers/pages/admin-controller')

router.get('/stories/create', adminController.createStoryPage)
router.put('/stories/response/:action', adminController.putResponse)
router.get('/stories', adminController.getStories)
router.patch('/users/:id', adminController.patchUser)
router.get('/users', adminController.getUsers)

router.use('/', (req, res) => res.redirect('/admin/users'))

module.exports = router
