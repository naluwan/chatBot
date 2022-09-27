const { TrainingData, User } = require('../models')
// const { getStoryInfo } = require('../helpers/model-helpers')

const adminServices = {
  getStories: (req, cb) => {
    let stories = true
    return Promise.all([
      User.findAll({ raw: true }),
      req.query.userId
        ? TrainingData.findAll({ where: { userId: req.query.userId }, raw: true })
        : null,
      req.query.storyName ? req.query.storyName : null
    ])
      .then(([users, data, storyName]) => {
        users.map(user => delete user.password)
        if (!data) {
          return cb(null, { users, stories })
        }
        stories = JSON.parse(data.filter(item => item.name === 'fragments')[0].content).stories
        const responses = JSON.parse(
          data.filter(item => item.name === 'domain')[0].content
        ).responses
        const nlu = JSON.parse(data.filter(item => item.name === 'nlu-json')[0].content)
          .rasa_nlu_data.common_examples

        stories.map(item => {
          return item.steps.map(step => {
            // 將資料庫中rasa的機器人回覆格式(  \n)轉成網頁能分段的格式(\r)
            // 抓取機器人回覆
            if (step.action) {
              step.response = JSON.parse(
                JSON.stringify(responses[step.action][0].text).replace(/ \\n/g, '\\r')
              )
            }
            // 抓取使用者例句
            if (step.intent) {
              const examples = nlu.filter(
                nluItem => nluItem.intent === step.intent && nluItem.text !== step.intent
              )
              const currentExample = examples.map((example, index) => {
                let exampleStr = ''
                exampleStr = exampleStr + example.text
                return exampleStr
              })
              step.examples = currentExample
            }
            return step
          })
        })

        if (storyName) {
          const steps = stories.filter(item => item.story === storyName)[0].steps
          return cb(null, {
            users,
            userId: Number(req.query.userId),
            stories,
            steps,
            storyName
          })
        }
        cb(null, { users, userId: Number(req.query.userId), stories })
      })
      .catch(err => cb(err))
  },
  getUsers: (req, cb) => {
    return User.findAll({ raw: true })
      .then(users => {
        users.map(user => delete user.password)
        cb(null, { users })
      })
      .catch(err => cb(err))
  },
  patchUser: (req, cb) => {
    const { id } = req.params
    return User.findByPk(id)
      .then(user => {
        if (!user) throw new Error('查無使用者資料，請重新嘗試')
        if (user.cpnyName === 'admin') throw new Error('禁止變更『admin管理員』權限')
        return user.update({ isAdmin: !user.isAdmin })
      })
      .then(user => {
        user = user.toJSON()
        delete user.password
        cb(null, { user })
      })
      .catch(err => cb(err))
  }
}

module.exports = adminServices
