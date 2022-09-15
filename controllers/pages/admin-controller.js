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
            userId: req.query.userId,
            stories,
            steps,
            storyName
          })
        }

        res.render('admin/stories', { users, userId: req.query.userId, stories })
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
    const { userId, storyName, botRes } = req.body
    const { action } = req.params
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
        console.log(domain.responses.utter_start[0].text)
        return domainData.update({ content: JSON.stringify(domain) })
      })
      .then(() => res.redirect(`/admin/stories?userId=${userId}&storyName=${storyName}`))
      .catch(err => next(err))
  },
  createStoryPage: (req, res, next) => {
    res.render('admin/create-story')
  }
}

module.exports = adminControllers
