const jwt = require('jsonwebtoken')
const { userServices } = require('../../services')
const userController = {
  signIn: (req, res, next) => {
    try {
      // expiresIn: '30d' => token有效期為30天
      const userData = req.user.toJSON()
      delete userData.password
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })
      res.json({
        status: 'success',
        token,
        user: userData
      })
    } catch (err) {
      next(err)
    }
  },
  signInFail: (err, req, res, next) => {
    next(err)
  },
  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  auth: (req, res, next) => {
    const user = req.user
    res.json({ status: 'success', data: user })
  },
  getUser: (req, res, next) => {
    userServices.getUser(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  editUser: (req, res, next) => {
    userServices.editUser(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  putUser: (req, res, next) => {
    userServices.putUser(req, (err, data) => {
      if (err) next(err)
      const user = data
      delete user.password
      res.json({ status: 'success', data: user })
    })
  }
}

module.exports = userController
