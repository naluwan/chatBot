const { User, TrainingData } = require('../../models')
const storiesServices = require('../../services/stories-service')
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
            // 將資料庫中rasa的機器人回覆格式(  \n)轉成網頁能分段的格式(\r)
            return step.action
              ? (step.response = JSON.parse(
                  JSON.stringify(responses[step.action][0].text).replace(/ \\n/g, '\\r')
                ))
              : step
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
    const { userId, storyName } = req.params
    storiesServices.putResponse(req, (err, data) => {
      if (err) return next(err)

      req.flash('success_messages', '更新機器人回覆成功')
      req.session.updateStory = data
      return res.redirect(`/admin/stories?userId=${userId}&storyName=${storyName}`)
    })
  },
  putUserSay: (req, res, next) => {
    const { userId, storyName } = req.params
    storiesServices.putUserSay(req, (err, data) => {
      if (err) return next(err)

      req.flash('success_messages', '更新使用者對話成功')
      req.session.updateStory = data
      return res.redirect(`/admin/stories?userId=${userId}&storyName=${storyName}`)
    })
  },
  createStoryPage: (req, res, next) => {
    return User.findAll({ raw: true })
      .then(users => {
        res.render('admin/create-story', { users })
      })
      .catch(err => next(err))
  },
  postStory: (req, res, next) => {
    const { userId, storyName } = req.body
    storiesServices.postStory(req, (err, data) => {
      if (err) return next(err)

      req.flash('success_messages', `新增故事『${storyName}』成功`)
      return res.redirect(`/admin/stories?userId=${userId}&storyName=${storyName}`)
    })
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
          let updateIntents
          if (intentsArr.length) {
            updateNlu = intentsArr.map(intent => {
              return nlu.filter(nluItem => nluItem.intent !== intent)[0]
            })
            updateIntents = intentsArr.map(intent => {
              return domain.intents.filter(domainIntent => domainIntent !== intent)[0]
            })
          }
          domain.intents = updateIntents

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
