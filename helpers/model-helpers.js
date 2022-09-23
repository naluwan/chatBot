const { TrainingData } = require('../models')

const getStoryInfo = (userId, storyName, cb) => {
  return TrainingData.findAll({ where: { userId } })
    .then(data => {
      const stories = JSON.parse(data.filter(item => item.name === 'fragments')[0].content).stories
      const responses = JSON.parse(data.filter(item => item.name === 'domain')[0].content).responses
      const storyInfo = stories.filter(item => item.story === storyName)[0]
      if (!storyInfo) throw new Error('查無此故事資料，請重新嘗試')
      storyInfo.steps.map(step => {
        return step.action
          ? (step.response = JSON.parse(
              JSON.stringify(responses[step.action][0].text).replace(/ \\n/g, '\\r')
            ))
          : step
      })
      return storyInfo
    })
    .catch(err => cb(err))
}

module.exports = {
  getStoryInfo
}
