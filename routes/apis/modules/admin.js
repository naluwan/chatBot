const express = require('express')
const router = express.Router()
const adminController = require('../../../controllers/apis/admin-controller')

router.patch('/users/:id', adminController.patchUser)
router.get('/users', adminController.getUsers)
router.get('/stories', adminController.getStories)

module.exports = router
