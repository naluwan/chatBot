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
        const nlu = JSON.parse(data.filter(item => item.name === 'nlu-json')[0].content).rasa_nlu_data.common_examples

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
              const examples = nlu.filter(nluItem => nluItem.intent === step.intent)
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

      if (data) {
        req.flash('success_messages', '更新機器人回覆成功')
        req.session.updateStory = data
      }
      return res.redirect(`/admin/stories?userId=${userId}&storyName=${storyName}`)
    })
  },
  putUserSay: (req, res, next) => {
    const { userId, storyName } = req.params
    storiesServices.putUserSay(req, (err, data) => {
      if (err) return next(err)

      if (data) {
        req.flash('success_messages', '更新使用者對話成功')
        req.session.updateStory = data
      }
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
    storiesServices.deleteStory(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', `成功刪除『${storyName}』`)
      req.session.deleteData = data
      return res.redirect(`/admin/stories?userId=${userId}`)
    })
  }
}

module.exports = adminControllers
