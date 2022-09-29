const express = require('express')
const router = express.Router()
const trainController = require('../../../controllers/pages/train-controller')
const { authenticatedAdmin } = require('../../../middleware/auth')

router.get('/trainData/:userId', authenticatedAdmin, trainController.getTrainData)
router.get('/trainData', trainController.getTrainData)

module.exports = router
