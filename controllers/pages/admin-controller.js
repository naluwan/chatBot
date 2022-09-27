const { User } = require('../../models')
const { storiesServices, adminServices } = require('../../services')
const adminControllers = {
  getStories: (req, res, next) => {
    adminServices.getStories(req, (err, data) =>
      err ? next(err) : res.render('admin/stories', data)
    )
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
  },
  putExamples: (req, res, next) => {
    const { userId, storyName } = req.params
    storiesServices.putExamples(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '新增例句成功')
      return res.redirect(`/admin/stories?userId=${userId}&storyName=${storyName}`)
    })
  }
}

module.exports = adminControllers
