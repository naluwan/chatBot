const { TrainingData } = require('../models')
const storiesServices = {
  getStories: (req, cb) => {
    const { id } = req.user
    return TrainingData.findAll({ where: { userId: id }, raw: true })
      .then(data => {
        const stories = JSON.parse(
          data.filter(item => item.name === 'fragments')[0].content
        ).stories
        return cb(null, { stories })
      })
      .catch(err => cb(err))
  },
  getStory: (req, cb) => {
    const { id } = req.user
    const { storyName } = req.params
    return TrainingData.findAll({ where: { userId: id } })
      .then(data => {
        const stories = JSON.parse(
          data.filter(item => item.name === 'fragments')[0].content
        ).stories
        const responses = JSON.parse(
          data.filter(item => item.name === 'domain')[0].content
        ).responses
        const story = stories.filter(item => item.story === storyName)[0]
        story.steps.map(step => {
          return step.action
            ? (step.response = JSON.parse(
                JSON.stringify(responses[step.action][0].text).replace(/ \\n/g, '\\r')
              ))
            : step
        })
        return cb(null, { story })
      })
      .catch(err => cb(err))
  },
  putResponse: (req, cb) => {
    const { botRes, oriBotRes } = req.body
    const { userId, storyName, action } = req.params
    if (botRes === oriBotRes) {
      return cb(null)
    }

    console.log('botRes:', JSON.stringify(botRes))
    const botResText = JSON.parse(JSON.stringify(botRes).replace(/\\r\\n/g, '  \\n'))
    console.log('botResText:', JSON.stringify(botResText))
    return TrainingData.findAll({ where: { userId } })
      .then(data => {
        /*
          要使用model.update()，需要使用model.findByPk()來找到資料
          所以要先用model.findAll()來找到全部資料，再篩選出需要更改的那筆資料，然後取出id
          再使用model.findByPk(id)來找到該筆資料做操作
        */
        const domainId = data.filter(item => item.name === 'domain')[0].id
        return TrainingData.findByPk(domainId)
      })
      .then(domainData => {
        const domain = JSON.parse(domainData.content)
        if (!domain.responses[action]) throw new Error('查無此回覆資料，請重新嘗試')
        domain.responses[action][0].text = botResText
        return domainData.update({ content: JSON.stringify(domain) })
      })
      .then(() => {
        return TrainingData.findAll({ where: { userId } }).then(data => {
          const stories = JSON.parse(
            data.filter(item => item.name === 'fragments')[0].content
          ).stories
          const responses = JSON.parse(
            data.filter(item => item.name === 'domain')[0].content
          ).responses
          const updateStory = stories.filter(item => item.story === storyName)[0]
          updateStory.steps.map(step => {
            return step.action ? (step.response = responses[step.action][0].text) : step
          })
          return cb(null, { story: updateStory })
        })
      })
      .catch(err => cb(err))
  },
  putUserSay: (req, cb) => {
    const { userId, storyName } = req.params
    const { userSay, oriUserSay } = req.body
    if (userSay === oriUserSay) {
      return cb(null)
    }
    return TrainingData.findAll({ where: { userId } })
      .then(data => {
        const storiesId = data.filter(item => item.name === 'fragments')[0].id
        const nluId = data.filter(item => item.name === 'nlu-json')[0].id
        return Promise.all([TrainingData.findByPk(storiesId), TrainingData.findByPk(nluId)])
      })
      .then(([storiesData, nluData]) => {
        const stories = JSON.parse(storiesData.content).stories
        const nlu = JSON.parse(nluData.content)
        stories.map(item => {
          if (item.story === storyName) {
            item.steps.map(step => {
              if (step.user === oriUserSay && step.intent === oriUserSay) {
                step.user = userSay
                step.intent = userSay
              }
              return item
            })
          }
          return item
        })

        if (nlu.rasa_nlu_data.common_examples.length) {
          nlu.rasa_nlu_data.common_examples.map(nluItem => {
            if (nluItem.intent === oriUserSay && nluItem.text === oriUserSay) {
              nluItem.text = userSay
              nluItem.intent = userSay
            }
            if (nluItem.intent === oriUserSay) {
              nluItem.intent = userSay
            }
            return nluItem
          })
        }
        return Promise.all([
          storiesData.update({ content: JSON.stringify({ stories }) }),
          nluData.update({ content: JSON.stringify(nlu) })
        ])
      })
      .then(() => {
        return TrainingData.findAll({ where: { userId } }).then(data => {
          const stories = JSON.parse(
            data.filter(item => item.name === 'fragments')[0].content
          ).stories
          const responses = JSON.parse(
            data.filter(item => item.name === 'domain')[0].content
          ).responses
          const updateStory = stories.filter(item => item.story === storyName)[0]
          updateStory.steps.map(step => {
            return step.action ? (step.response = responses[step.action][0].text) : step
          })
          return cb(null, { story: updateStory })
        })
      })
      .catch(err => cb(err))
  }
}

module.exports = storiesServices
