const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/admin-controller')

router.get('/stories', adminController.getFragments)
router.patch('/users/:id', adminController.patchUser)
router.get('/users', adminController.getUsers)

router.use('/', (req, res) => res.redirect('/admin/users'))

module.exports = router
