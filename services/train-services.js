const { TrainingData, User } = require('../models')
const yaml = require('js-yaml')

const trainServices = {
  getTrainData: (req, cb) => {
    const userId = req.params.userId ? req.params.userId : req.user.id
    const today = new Date().toLocaleString('zh-Hant', { hour12: false })
    const date = today.split(' ')[0].replace(/\//g, '')
    const time = today.split(' ')[1].replace(/:/g, '')
    return Promise.all([
      TrainingData.findAll({ where: { userId }, raw: true }),
      User.findByPk(userId)
    ])
      .then(([data, user]) => {
        const fragments = yaml.dump(
          JSON.parse(data.filter(item => item.name === 'fragments')[0].content)
        )
        const config = yaml.dump(JSON.parse(data.filter(item => item.name === 'config')[0].content))
        const domain = yaml.dump(JSON.parse(data.filter(item => item.name === 'domain')[0].content))
        const nlu = JSON.parse(data.filter(item => item.name === 'nlu-json')[0].content)
        const model = req.params.userId
          ? `model-admin-${user.cpnyName}-${date}T${time}`
          : `model-${user.cpnyName}-${date}T${time}`
        return {
          config,
          nlu: { nlu },
          domain,
          stories: fragments,
          fixed_model_name: model
        }
      })
      .then(data => cb(null, data))
      .catch(err => cb(err))
  },
  getAllTrainData: (req, cb) => {
    return TrainingData.findAll({ where: { userId: req.user.id } })
      .then(data => {
        const stories = JSON.parse(
          data.filter(item => item.name === 'fragments')[0].content
        ).stories
        const domain = JSON.parse(data.filter(item => item.name === 'domain')[0].content)
        const nlu = JSON.parse(data.filter(item => item.name === 'nlu-json')[0].content)
        cb(null, { stories, domain, nlu })
      })
      .catch(err => cb(err))
  }
}

module.exports = trainServices
