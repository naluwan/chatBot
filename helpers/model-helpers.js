const { TrainingData } = require('../models')

const getUpdateStory = (userId, storyName, cb) => {
  return TrainingData.findAll({ where: { userId } })
    .then(data => {
      const stories = JSON.parse(data.filter(item => item.name === 'fragments')[0].content).stories
      const responses = JSON.parse(data.filter(item => item.name === 'domain')[0].content).responses
      const updateStory = stories.filter(item => item.story === storyName)[0]
      updateStory.steps.map(step => {
        return step.action ? (step.response = responses[step.action][0].text) : step
      })
      return updateStory
    })
    .catch(err => cb(err))
}

module.exports = {
  getUpdateStory
}
