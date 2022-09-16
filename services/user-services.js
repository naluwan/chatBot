const bcrypt = require('bcryptjs')
const { User, TrainingData } = require('../models')
const trainingDataList = require('../data/defaultTrainingData.json')

const userServices = {
  signUp: (req, cb) => {
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
        User.findOne({ where: { email }, raw: true })
          .then(user => {
            const trainDataArr = trainingDataList.map(data => {
              const content = JSON.stringify(data.content)

              return {
                name: data.name,
                content,
                userId: user.id
              }
            })
            return { trainDataArr, user }
          })
          .then(currentData => {
            const user = currentData.user
            return TrainingData.bulkCreate(currentData.trainDataArr)
              .then(() => {
                cb(null, {
                  status: 'success',
                  data: {
                    user
                  }
                })
              })
              .catch(err => cb(err))
          })
          .catch(err => cb(err))
      })
      .catch(err => cb(err))
  }
}

module.exports = userServices
