const { TrainingData } = require('../../models')
const storiesServices = require('../../services/stories-service')

const storiesController = {
  getStories: (req, res, next) => {
    storiesServices.getStories(req, (err, data) =>
      err ? next(err) : res.render('stories', { stories: data.stories })
    )
  },
  getStory: (req, res, next) => {
    storiesServices.getStory(req, (err, data) =>
      err ? next(err) : res.render('story', { story: data.story })
    )
  },
  putResponse: (req, res, next) => {
    const { storyName } = req.params
    storiesServices.putResponse(req, (err, data) => {
      if (err) return next(err)

      req.flash('success_message', '更新機器人回覆成功')
      req.session.updateStory = data
      return res.redirect(`/stories/${storyName}`)
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
