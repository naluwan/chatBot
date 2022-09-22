const storiesServices = require('../../services/stories-service')

const storiesController = {
  getStories: (req, res, next) => {
    storiesServices.getStories(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  getStory: (req, res, next) => {
    storiesServices.getStory(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  postStory: (req, res, next) => {
    storiesServices.postStory(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  putResponse: (req, res, next) => {
    storiesServices.putResponse(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  putUserSay: (req, res, next) => {
    storiesServices.putUserSay(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  deleteStory: (req, res, next) => {
    storiesServices.deleteStory(req, (err, data) => {
      if (err) return next(err)
      console.log(data)
      res.json({ status: 'success', data })
    })
  }
}

module.exports = storiesController
