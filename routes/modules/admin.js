const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/admin-controller')

router.get('/stories', adminController.getFragments)

router.use('/', (req, res) => res.redirect('/admin/stories'))

module.exports = router
