const { User, TrainingData } = require('../../models')
const adminControllers = {
  getStories: (req, res, next) => {
    let stories = true
    return Promise.all([
      User.findAll({ raw: true }),
      req.query.userId
        ? TrainingData.findAll({ where: { userId: req.query.userId }, raw: true })
        : null,
      req.query.storyName ? req.query.storyName : null
    ])
      .then(([users, data, storyName]) => {
        if (!data) {
          return res.render('admin/stories', { users, stories })
        }
        stories = JSON.parse(data.filter(item => item.name === 'fragments')[0].content).stories
        const responses = JSON.parse(
          data.filter(item => item.name === 'domain')[0].content
        ).responses

        stories.map(item => {
          return item.steps.map(step => {
            if (step.action) {
              step.response = responses[step.action][0].text
            }
            return step
          })
        })

        if (storyName) {
          const steps = stories.filter(item => item.story === storyName)[0].steps
          return res.render('admin/stories', {
            users,
            userId: Number(req.query.userId),
            stories,
            steps,
            storyName
          })
        }

        res.render('admin/stories', { users, userId: Number(req.query.userId), stories })
      })
      .catch(err => next(err))
  },
  getUsers: (req, res, next) => {
    return User.findAll({ raw: true })
      .then(users => res.render('admin/users', { users }))
      .catch(err => next(err))
  },
  patchUser: (req, res, next) => {
    const { id } = req.params
    return User.findByPk(id)
      .then(user => {
        if (user.cpnyName === 'admin') {
          req.flash('error_messages', '禁止變更『admin管理員』權限')
          return res.redirect('back')
        }
        user.update({ isAdmin: !user.isAdmin }).then(() => {
          req.flash('success_messages', '使用者權限變更成功')
          res.redirect('/admin/users')
        })
      })
      .catch(err => next(err))
  },
  putResponse: (req, res, next) => {
    const { botRes } = req.body
    const { userId, storyName, action } = req.params
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
      .then(() => res.redirect(`/admin/stories?userId=${userId}&storyName=${storyName}`))
      .catch(err => next(err))
  },
  createStoryPage: (req, res, next) => {
    return User.findAll({ raw: true })
      .then(users => {
        res.render('admin/create-story', { users })
      })
      .catch(err => next(err))
  },
  postStory: (req, res, next) => {
    const storySteps = []
    const botRes = []
    const nluItems = []

    for (const key in req.body) {
      if (key.includes('_')) {
        storySteps.push({ [key]: req.body[key] })
      }
      if (key.includes('utter')) {
        botRes.push({ [key]: req.body[key] })
      }
      if (key.includes('Step')) {
        nluItems.push(req.body[key])
      }
    }

    const steps = storySteps.map(item => {
      if (Object.keys(item)[0].includes('utter')) {
        return { action: Object.keys(item)[0].slice(0, 15) }
      }
      return { intent: Object.values(item)[0], user: Object.values(item)[0], entities: [] }
    })

    const { userId, storyName } = req.body
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

          stories.map(item => {
            if (item.story === storyName) {
              repeat.push(item)
            }
            return item
          })

          if (repeat.length) {
            req.flash('error_messages', '故事名稱重複')
            return res.redirect('back')
          }

          // 判斷nlu是否有資料，因為刪除故事流程後，如果完全沒有例句資料會變成null，如果檢測到null就代表沒有例句，直接將資料設為空陣列
          if (
            nlu.rasa_nlu_data.common_examples.length === 1 &&
            nlu.rasa_nlu_data.common_examples[0] === null
          ) {
            nlu.rasa_nlu_data.common_examples.length = []
          }
          nlu.rasa_nlu_data.common_examples.map(item => {
            return nluItems.forEach(nluItem => {
              if (nluItem === item.text) {
                repeat.push(item)
              }
            })
          })

          if (repeat.length) {
            req.flash('error_messages', '例句重複')
            return res.redirect('back')
          }

          stories.push({ story: storyName, steps })

          nluItems.map(nluItem => {
            return nlu.rasa_nlu_data.common_examples.push({
              text: nluItem,
              intent: nluItem,
              entities: []
            })
          })

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
      .then(() => res.redirect(`/admin/stories?userId=${userId}&storyName=${storyName}`))
      .catch(err => next(err))
  },
  deleteStory: (req, res, next) => {
    const { userId, storyName } = req.params
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
          const nlu = JSON.parse(nluData.content).rasa_nlu_data.common_examples
          const domain = JSON.parse(domainData.content)
          const hasStory = []
          const intentsArr = []
          const actionsArr = []

          stories.map(item => {
            if (item.story === storyName) {
              hasStory.push(item)
            }
            return item
          })

          if (!hasStory.length) {
            req.flash('error_messages', '查無此故事資訊，請重新嘗試')
            return res.redirect(`/admin/stories?userId=${userId}&storyName=${storyName}`)
          }

          if (hasStory[0].story === '問候語') {
            req.flash('error_messages', '預設問候語故事流程無法刪除')
            return res.redirect(`/admin/stories?userId=${userId}&storyName=${storyName}`)
          }

          hasStory[0].steps?.map(step => {
            if (step.intent) {
              intentsArr.push(step.intent)
            }
            if (step.action) {
              actionsArr.push(step.action)
            }
            return step
          })

          const updateStories = stories.filter(item => item.story !== storyName)

          let updateNlu = nlu
          if (intentsArr.length) {
            updateNlu = intentsArr.map(intent => {
              return nlu.filter(nluItem => nluItem.intent !== intent)[0]
            })
          }

          let updateActions
          if (actionsArr.length) {
            updateActions = actionsArr.map(action => {
              return domain.actions.filter(actionItem => actionItem !== action)[0]
            })
            actionsArr.map(action => {
              return delete domain.responses[action]
            })
            domain.actions = updateActions
          }

          return Promise.all([
            storiesData.update({ content: JSON.stringify({ stories: updateStories }) }),
            nluData.update({
              content: JSON.stringify({ rasa_nlu_data: { common_examples: updateNlu } })
            }),
            domainData.update({ content: JSON.stringify(domain) })
          ])
        })
      })
      .then(() => res.redirect(`/admin/stories?userId=${userId}`))
      .catch(err => next(err))
  }
}

module.exports = adminControllers
