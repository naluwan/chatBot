const { adminServices } = require('../../services')

const adminController = {
  getStories: (req, res, next) => {
    adminServices.getStories(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  }
}

module.exports = adminController
