const jwt = require('jsonwebtoken')
const userController = {
  singIn: (req, res, next) => {
    try {
      // expiresIn: '30d' => token有效期為30天
      const userData = req.user.toJSON()
      delete userData.password
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })
      res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = userController
