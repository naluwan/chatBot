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
  }
}

module.exports = trainController
