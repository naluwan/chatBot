const { userServices } = require('../../services')

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
    userServices.getUser(req, (err, data) => {
      if (err) return next(err)
      res.render('users/profile', { user: data })
    })
  },
  editUser: (req, res, next) => {
    userServices.editUser(req, (err, data) => {
      if (err) return next(err)
      res.render('users/edit', { user: data })
    })
  },
  putUser: (req, res, next) => {
    userServices.putUser(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '使用者資料更新成功')
      res.redirect(`/users/${req.params.id}`)
    })
  }
}

module.exports = userController
