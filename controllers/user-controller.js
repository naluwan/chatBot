const bcrypt = require('bcryptjs')
const db = require('../models')
const { User, TrainingData } = db
const trainingDataList = require('../data/trainingDataSeeds.json')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    const { cpnyName, cpnyId, email, password, passwordCheck } = req.body
    if (!cpnyName || !cpnyId || !email || !password || !passwordCheck) {
      throw new Error('所有欄位都是必填的')
    }

    if (password !== passwordCheck) throw new Error('密碼與驗證密碼不相同')
    return User.findOne({ where: { email } })
      .then(user => {
        if (user) throw new Error('Email已註冊過')
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash =>
        User.create({
          cpnyName,
          cpnyId,
          email,
          password: hash
        })
      )
      .then(() => {
        User.findOne({ where: { email } })
          .then(user => {
            return trainingDataList.map(data => {
              const content = JSON.stringify(data.content)

              return {
                name: data.name,
                content,
                userId: user.id
              }
            })
          })
          .then(trainDataArr => {
            return TrainingData.bulkCreate(trainDataArr)
          })
          .then(() => {
            req.flash('success_message', '帳號註冊成功')
            res.redirect('/signin')
          })
          .catch(err => next(err))
      })
      .catch(err => next(err))
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res, next) => {
    req.flash('success_messages', '成功登入')
    res.redirect('/stories')
  },
  logout: (req, res, next) => {
    req.flash('success_messages', '登出成功')
    req.logout(err => next(err))
    res.redirect('/signin')
  }
}

module.exports = userController
