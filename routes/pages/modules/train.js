const express = require('express')
const router = express.Router()
const trainController = require('../../../controllers/pages/train-controller')

router.get('/trainData', trainController.getTrainData)

module.exports = router
