const express = require('express')
const router = express.Router()
const trainController = require('../../../controllers/apis/train-controller')
const { authenticateAdmin } = require('../../../middleware/api-auth')

router.post('/allTrainData', trainController.postAllTrainData)
router.get('/allTrainData', trainController.getAllTrainData)
router.get('/trainData/:userId', authenticateAdmin, trainController.getTrainData)
router.get('/trainData', trainController.getTrainData)
router.get('/categories', trainController.getAllStoriesCategories)
router.post('/category', trainController.createCategory)
router.delete('/category', trainController.deleteCategory)
router.get('/senderIds', trainController.getAllSenderIds)
router.get('/conversations', trainController.getConversationLogs)

module.exports = router
