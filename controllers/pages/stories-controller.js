const { TrainingData } = require('../../models')

const storiesController = {
  getStories: (req, res) => {
    const { id } = req.user
    return TrainingData.findAll({ where: { userId: id }, raw: true }).then(data => {
      console.log(data)
      const stories = JSON.parse(data.filter(item => item.name === 'fragments')[0].content).stories
      return res.render('stories', { stories })
    })
  }
}

module.exports = storiesController
