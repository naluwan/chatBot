const bcrypt = require('bcryptjs')
const { User, TrainingData } = require('../models')
const trainingDataList = require('../data/defaultTrainingData.json')
const { imgurFileHandler } = require('../helpers/file-helpers')

const userServices = {
  signUp: (req, cb) => {
    const { cpnyName, cpnyId, chatbotName, email, password, passwordCheck } = req.body
    if (!cpnyName || !cpnyId || !chatbotName || !email || !password || !passwordCheck) {
      throw new Error('所有欄位都是必填的')
    }
    if (password !== passwordCheck) throw new Error('密碼與驗證密碼不相同')
    const { file } = req
    return User.findOne({ where: { email } })
      .then(user => {
        if (user) throw new Error('Email已註冊過')
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => {
        return imgurFileHandler(file).then(filePath => {
          return User.create({
            cpnyName,
            cpnyId,
            chatbotName,
            email,
            image: filePath || 'https://i.imgur.com/iL6DE9f.png',
            password: hash
          })
        })
      })
      .then(createUser => {
        const user = createUser.toJSON()
        delete user.password
        const trainDataArr = trainingDataList.map(data => {
          const content = JSON.stringify(data.content)

          return {
            name: data.name,
            content,
            userId: user.id
          }
        })

        return TrainingData.bulkCreate(trainDataArr).then(() => cb(null, user))
      })
      .catch(err => cb(err))
  }
}

module.exports = userServices
