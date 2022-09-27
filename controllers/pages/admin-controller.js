const { User } = require('../../models')
const { storiesServices, adminServices } = require('../../services')
const adminControllers = {
  getStories: (req, res, next) => {
    adminServices.getStories(req, (err, data) =>
      err ? next(err) : res.render('admin/stories', data)
    )
  },
  getUsers: (req, res, next) => {
    adminServices.getUsers(req, (err, data) => (err ? next(err) : res.render('admin/users', data)))
  },
  patchUser: (req, res, next) => {
    adminServices.patchUser(req, (err, data) => {
      if (err) return next(err)
      if (data.user.isAdmin) {
        req.flash('success_messages', `成功將使用者『${data.user.cpnyName}』權限改為管理者`)
      } else {
        req.flash('success_messages', `成功將使用者『${data.user.cpnyName}』權限改為一般使用者`)
      }
      res.redirect('/admin/users')
    })
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
