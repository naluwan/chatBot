const { userServices } = require('../../services')
const { User } = require('../../models')
const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_message', '帳號註冊成功')
      res.redirect('/signin')
    })
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res, next) => {
    req.flash('success_messages', '成功登入')
    res.redirect('/stories')
  },
  logout: (req, res, next) => {
    // req.logout現在是非同步，所以需要使用callback function來執行
    req.logout(err => {
      if (err) return next(err)
      req.flash('success_messages', '登出成功')
      res.redirect('/signin')
    })
  },
  getUser: (req, res, next) => {
    return User.findByPk(req.params.id, {
      attributes: ['id', 'cpnyName', 'chatbotName', 'email', 'image']
    })
      .then(user => {
        if (!user) {
          req.flash('warning_messages', '查無使用者資料，請重新嘗試')
          return res.redirect('back')
        }
        return res.render('users/profile', { user: user.toJSON() })
      })
      .catch(err => next(err))
  },
  }
}

module.exports = userController
