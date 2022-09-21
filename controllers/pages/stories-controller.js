const { TrainingData } = require('../../models')
const storiesServices = require('../../services/stories-service')

const storiesController = {
  getStories: (req, res, next) => {
    storiesServices.getStories(req, (err, data) =>
      err ? next(err) : res.render('stories', { stories: data.stories })
    )
  },
  getStory: (req, res, next) => {
    const { id } = req.user
    const { storyName } = req.params
    return TrainingData.findAll({ where: { userId: id } })
      .then(data => {
        const stories = JSON.parse(
          data.filter(item => item.name === 'fragments')[0].content
        ).stories
        const responses = JSON.parse(
          data.filter(item => item.name === 'domain')[0].content
        ).responses
        const story = stories.filter(item => item.story === storyName)[0]
        story.steps.map(step => {
          return step.action ? (step.response = responses[step.action][0].text) : step
        })
        res.render('story', { story })
      })
      .catch(err => next(err))
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
