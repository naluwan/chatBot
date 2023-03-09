const { TrainingData, User, Category, Conversation, Event } = require('../models')
const yaml = require('js-yaml')

const trainServices = {
  getTrainData: (req, cb) => {
    const userId = req.params.userId ? req.params.userId : req.user.id
    const today = new Date().toLocaleString('zh-Hant', { hour12: false })
    const date = today.split(' ')[0].replace(/\//g, '')
    const time = today.split(' ')[1].replace(/:/g, '')
    return Promise.all([
      TrainingData.findAll({ where: { userId }, raw: true }),
      User.findByPk(userId)
    ])
      .then(([data, user]) => {
        const fragments = yaml.dump(
          JSON.parse(data.filter(item => item.name === 'fragments')[0].content)
        )
        const config = yaml.dump(JSON.parse(data.filter(item => item.name === 'config')[0].content))
        const domain = yaml.dump(JSON.parse(data.filter(item => item.name === 'domain')[0].content))
        const nlu = JSON.parse(data.filter(item => item.name === 'nlu-json')[0].content)
        const model = req.params.userId ? `model-admin-${date}T${time}` : `model-${date}T${time}`
        return {
          config,
          nlu: { nlu },
          domain,
          stories: fragments,
          fixed_model_name: model
        }
      })
      .then(data => cb(null, data))
      .catch(err => cb(err))
  },
  getAllTrainData: (req, cb) => {
    return TrainingData.findAll({ where: { userId: req.user.id } })
      .then(data => {
        const stories = JSON.parse(
          data.filter(item => item.name === 'fragments')[0].content
        ).stories
        const domain = JSON.parse(data.filter(item => item.name === 'domain')[0].content)
        const nlu = JSON.parse(data.filter(item => item.name === 'nlu-json')[0].content)
        const config = JSON.parse(data.filter(item => item.name === 'config')[0].content)
        cb(null, { stories, domain, nlu, config })
      })
      .catch(err => cb(err))
  },
  postAllTrainData: (req, cb) => {
    const userId = req.body.userId ? req.body.userId : req.user.id
    const { stories, nlu, domain } = req.body
    return TrainingData.findAll({ where: { userId } })
      .then(data => {
        const storiesId = data.filter(item => item.name === 'fragments')[0].id
        const nluId = data.filter(item => item.name === 'nlu-json')[0].id
        const domainId = data.filter(item => item.name === 'domain')[0].id
        return Promise.all([
          TrainingData.findByPk(storiesId),
          TrainingData.findByPk(nluId),
          TrainingData.findByPk(domainId)
        ])
      })
      .then(([storiesData, nluData, domainData]) => {
        return Promise.all([
          storiesData.update({ content: JSON.stringify({ stories }) }),
          nluData.update({ content: JSON.stringify(nlu) }),
          domainData.update({ content: JSON.stringify(domain) })
        ])
      })
      .then(([stories, nlu, domain]) =>
        cb(null, {
          stories: JSON.parse(stories.content).stories,
          nlu: JSON.parse(nlu.content),
          domain: JSON.parse(domain.content)
        })
      )
      .catch(err => cb(err))
  },
  getAllStoriesCategories: (req, cb) => {
    return Category.findAll({ where: { cpnyId: req.user.cpnyId } })
      .then(data => cb(null, data))
      .catch(err => cb(err))
  },
  createCategory: (req, cb) => {
    const cpnyId = req.user.cpnyId
    const { name } = req.body
    return Category.findOne({ where: { name, cpnyId } })
      .then(category => {
        if (category) throw new Error('此類別已存在')
        return Category.create({
          name,
          cpnyId
        }).then(() => Category.findAll({ where: { cpnyId } }))
      })
      .then(categories => cb(null, categories))
      .catch(err => cb(err))
  },
  deleteCategory: (req, cb) => {
    const cpnyId = req.user.cpnyId
    const { name } = req.body
    console.log('name ===> ', name)
    console.log('req body ===> ', req.body)
    return Category.findOne({ where: { name, cpnyId } })
      .then(category => {
        if (!category) throw new Error('查無此類別')
        return category.destroy()
      })
      .then(() => Category.findAll({ where: { cpnyId } }))
      .then(categories => cb(null, categories))
      .catch(err => cb(err))
  },
  getAllSenderIds: (req, cb) => {
    const cpnyId = req.user.cpnyId
    return Conversation.findAll({ where: { cpnyId }, order: [['created_at', 'DESC']] })
      .then(senderIds => cb(null, senderIds))
      .catch(err => cb(err))
  },
  getConversationLogs: (req, cb) => {
    return Event.findAll({
      where: { typeName: ['user', 'bot'] },
      order: [['created_at', 'DESC']],
      raw: true
    })
      .then(logs => {
        // 更改為正確的timestamp
        const currentLogs = logs
          .map(log => {
            log.data = JSON.parse(log.data)
            log.timestamp = log.data.timestamp
            return log
          })
          .sort((a, b) => a.timestamp - b.timestamp)

        // 將同個sender id的資料放在一起
        const filteredLogs = []
        filteredLogs.push([currentLogs[0]])
        currentLogs.map((log, idx) => {
          if (idx > 0) {
            let appendIdx
            const hasSameId = filteredLogs.some((filteredItem, filteredIdx) => {
              if (filteredItem.some(logItem => log.senderId === logItem.senderId)) {
                appendIdx = filteredIdx
                return true
              }
              return false
            })
            if (hasSameId) {
              filteredLogs[appendIdx].push(log)
            } else {
              filteredLogs.push([log])
            }
          }
          return log
        })
        return cb(null, filteredLogs)
      })
      .catch(err => cb(err))
  }
}

module.exports = trainServices
