const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/admin-controller')
const { authenticatedAdmin } = require('../../middleware/auth')

router.get('/stories', authenticatedAdmin, adminController.getFragments)

router.use('/', (req, res) => res.redirect('/admin/stories'))

module.exports = router
