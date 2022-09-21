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
          return step.action ? (step.response = responses[step.action][0].text) : step
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
        domain.responses[action][0].text = botRes
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
  }
}

module.exports = storiesServices
