const { TrainingData } = require('../models')
const { getUpdateStory } = require('../helpers/model-helpers')

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
  postStory: (req, cb) => {
    const { storyName } = req.body
    const userId = req.body.userId ? req.body.userId : req.user.id
    if (!storyName) throw new Error('故事名稱是必填的')
    const storySteps = []
    const botRes = []
    const nluItems = []

    // 將req.body裡的東西做分類
    for (const key in req.body) {
      if (key.includes('_')) {
        // 故事流程
        storySteps.push({ [key]: req.body[key] })
      }
      if (key.includes('utter')) {
        // 機器人回覆
        botRes.push({ [key]: req.body[key] })
      }
      if (key.includes('Step')) {
        // 獲取使用者對話的例句和意圖(目前只有例句)
        nluItems.push(req.body[key])
      }
    }

    if (!storySteps.length || !botRes.length) throw new Error('使用者對話和機器人回覆都是必填的')

    // 將故事流程組成步驟
    const steps = storySteps.map(item => {
      if (Object.keys(item)[0].includes('utter')) {
        return { action: Object.keys(item)[0].slice(0, 15) }
      }
      return { intent: Object.values(item)[0], user: Object.values(item)[0], entities: [] }
    })

    return TrainingData.findAll({ where: { userId } })
      .then(data => {
        const storiesId = data.filter(item => item.name === 'fragments')[0].id
        const nluId = data.filter(item => item.name === 'nlu-json')[0].id
        const domainId = data.filter(item => item.name === 'domain')[0].id
        return Promise.all([
          TrainingData.findByPk(storiesId),
          TrainingData.findByPk(nluId),
          TrainingData.findByPk(domainId)
        ]).then(([storiesData, nluData, domainData]) => {
          const stories = JSON.parse(storiesData.content).stories
          const nlu = JSON.parse(nluData.content)
          const domain = JSON.parse(domainData.content)
          const repeat = []

          // 驗證故事名稱是否重複
          stories.map(item => {
            if (item.story === storyName) {
              repeat.push(item)
            }
            return item
          })

          if (repeat.length) throw new Error('故事名稱重複')

          // 判斷nlu是否有資料，因為刪除故事流程後，完全沒有例句資料會變成null，如果檢測到null就代表沒有例句，直接將資料設為空陣列
          if (
            nlu.rasa_nlu_data.common_examples.length === 1 &&
            nlu.rasa_nlu_data.common_examples[0] === null
          ) {
            nlu.rasa_nlu_data.common_examples = []
          }

          // 判斷domain intents是否有資料，因為刪除故事流程後，完全沒有意圖資料會變成null，如果檢測到null就代表沒有意圖，直接將資料設為空陣列
          if (domain.intents.length === 1 && domain.intents[0] === null) {
            domain.intents = []
          }

          // 驗證例句是否重複
          nlu.rasa_nlu_data.common_examples.map(item => {
            return nluItems.forEach(nluItem => {
              if (nluItem === item.text) {
                repeat.push(item)
              }
            })
          })

          if (repeat.length) throw new Error('例句重複')

          // 將故事寫入fragments訓練檔
          stories.push({ story: storyName, steps })

          // 將使用者例句寫入nlu和domain訓練檔
          nluItems.map(nluItem => {
            nlu.rasa_nlu_data.common_examples.push({
              text: nluItem,
              intent: nluItem,
              entities: []
            })
            domain.intents.push(nluItem)
            return nluItem
          })

          // 將機器人回覆寫入domain訓練檔
          if (botRes.length) {
            botRes.forEach(item => {
              domain.actions.push(Object.keys(item)[0].slice(0, 15))
              domain.responses[Object.keys(item)[0].slice(0, 15)] = [
                { text: Object.values(item)[0] }
              ]
            })
          }
          return Promise.all([
            storiesData.update({ content: JSON.stringify({ stories }) }),
            nluData.update({ content: JSON.stringify(nlu) }),
            domainData.update({ content: JSON.stringify(domain) })
          ])
        })
      })
      .then(() => {
        return getUpdateStory(userId, storyName, cb).then(updateStory => {
          cb(null, { story: updateStory })
        })
      })
      .catch(err => cb(err))
  },
  putResponse: (req, cb) => {
    const { botRes, oriBotRes } = req.body
    const { userId, storyName, action } = req.params
    if (botRes === oriBotRes) {
      return cb(null)
    }

    // 將機器人回覆中的換行(\r\n)改成符合rasa機器人回覆的格式(  \n)
    const botResText = JSON.parse(JSON.stringify(botRes).replace(/\\r\\n/g, '  \\n'))

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
        return getUpdateStory(userId, storyName, cb).then(updateStory => {
          cb(null, { story: updateStory })
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
        return getUpdateStory(userId, storyName, cb).then(updateStory => {
          cb(null, { story: updateStory })
        })
      })
      .catch(err => cb(err))
  }
}

module.exports = storiesServices
