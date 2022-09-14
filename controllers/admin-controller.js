const { User, TrainingData } = require('../models')
const adminControllers = {
  getStories: (req, res, next) => {
    let stories = true
    return Promise.all([
      User.findAll({ raw: true }),
      req.body.userId
        ? TrainingData.findAll({ where: { userId: req.body.userId }, raw: true })
        : null,
      req.body.storyName ? req.body.storyName : null
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
            userId: req.body.userId,
            stories,
            steps,
            storyName
          })
        }

        res.render('admin/stories', { users, userId: req.body.userId, stories })
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
  }
}

module.exports = adminControllers
