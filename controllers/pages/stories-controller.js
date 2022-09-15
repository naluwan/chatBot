const { TrainingData } = require('../../models')

const storiesController = {
  getStories: (req, res) => {
    const { id } = req.user
    return TrainingData.findAll({ where: { userId: id }, raw: true }).then(data => {
      const stories = JSON.parse(data.filter(item => item.name === 'fragments')[0].content).stories
      return res.render('stories', { stories })
    })
  },
  getAllActions: (req, res, next) => {
    const { id } = req.user
    return TrainingData.findAll({ where: { userId: id }, raw: true })
      .then(data => {
        const actions = JSON.parse(data.filter(item => item.name === 'domain')[0].content).actions
        res.json(actions)
      })
      .catch(err => next(err))
  }
}

module.exports = storiesController
