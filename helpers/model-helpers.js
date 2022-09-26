const { TrainingData } = require('../models')

const getStoryInfo = (userId, storyName, cb) => {
  return TrainingData.findAll({ where: { userId } })
    .then(data => {
      const stories = JSON.parse(data.filter(item => item.name === 'fragments')[0].content).stories
      const nlu = JSON.parse(data.filter(item => item.name === 'nlu-json')[0].content).rasa_nlu_data.common_examples
      const responses = JSON.parse(data.filter(item => item.name === 'domain')[0].content).responses
      const storyInfo = stories.filter(item => item.story === storyName)[0]
      if (!storyInfo) throw new Error('查無此故事資料，請重新嘗試')
      storyInfo.steps.map(step => {
        // 抓取機器人回覆
        if (step.action) {
          step.response = JSON.parse(
            JSON.stringify(responses[step.action][0].text).replace(/ \\n/g, '\\r')
          )
        }
        // 抓取使用者例句
        if (step.intent) {
          const examples = nlu.filter(nluItem => nluItem.intent === step.intent && nluItem.text !== step.intent)
          const currentExample = examples.map((example, index) => {
            let exampleStr = ''
            exampleStr = exampleStr + example.text
            return exampleStr
          })
          step.examples = currentExample
        }
        return step
      })

      return storyInfo
    })
    .catch(err => cb(err))
}

module.exports = {
  getStoryInfo
}
