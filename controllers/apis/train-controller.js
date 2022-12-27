const { trainServices } = require('../../services')

const trainController = {
  getTrainData: (req, res, next) => {
    trainServices.getTrainData(req, (err, data) => (err ? next(err) : res.json(data)))
  },
  getAllTrainData: (req, res, next) => {
    trainServices.getAllTrainData(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  postAllTrainData: (req, res, next) => {
    trainServices.postAllTrainData(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  getAllStoriesCategories: (req, res, next) => {
    trainServices.getAllStoriesCategories(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  createCategory: (req, res, next) => {
    trainServices.createCategory(req, (err, categories) =>
      err ? next(err) : res.json({ status: 'success', categories })
    )
  }
}

module.exports = trainController
