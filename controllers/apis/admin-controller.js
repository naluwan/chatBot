const { adminServices, storiesServices } = require('../../services')

const adminController = {
  getStories: (req, res, next) => {
    adminServices.getStories(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  getUsers: (req, res, next) => {
    adminServices.getUsers(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  patchUser: (req, res, next) => {
    adminServices.patchUser(req, (err, data) =>
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
    storiesServices.deleteStory(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  putExamples: (req, res, next) => {
    storiesServices.putExamples(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  }
}

module.exports = adminController
