const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/admin-controller')

router.post('/stories', adminController.getStories)
router.get('/stories', adminController.getStories)
router.patch('/users/:id', adminController.patchUser)
router.get('/users', adminController.getUsers)

router.use('/', (req, res) => res.redirect('/admin/users'))

module.exports = router
