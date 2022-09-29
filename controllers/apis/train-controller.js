const { trainServices } = require('../../services')

const trainController = {
  getTrainData: (req, res, next) => {
    trainServices.getTrainData(req, (err, data) => (err ? next(err) : res.json(data)))
  }
}

module.exports = trainController
