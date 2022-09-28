const { TrainingData } = require('../../models')
const yaml = require('js-yaml')
const trainController = {
  getTrainData: (req, res, next) => {
    const userId = req.user.id
    const today = new Date().toLocaleString('zh-Hant', { hour12: false })
    const date = today.split(' ')[0].replace(/\//g, '')
    const time = today.split(' ')[1].replace(/:/g, '')
    const model = `model-${req.user.cpnyName}-${date}T${time}`
    return TrainingData.findAll({ where: { userId }, raw: true })
      .then(data => {
        const fragments = yaml.dump(
          JSON.parse(data.filter(item => item.name === 'fragments')[0].content)
        )
        const config = yaml.dump(JSON.parse(data.filter(item => item.name === 'config')[0].content))
        const domain = yaml.dump(JSON.parse(data.filter(item => item.name === 'domain')[0].content))
        const nlu = JSON.parse(data.filter(item => item.name === 'fragments')[0].content)

        return {
          config,
          nlu,
          domain,
          stories: fragments,
          fixed_model_name: model
        }
      })
      .then(data => res.json(data))
      .catch(err => next(err))
  }
}

module.exports = trainController
