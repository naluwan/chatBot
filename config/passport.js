const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportJWT = require('passport-jwt')
const bcrypt = require('bcryptjs')
const { User } = require('../models')

const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

passport.use(
  // 選用本地端認證策略
  new LocalStrategy(
    /*
    設定客製化選項
    帳號用email
    密碼用password
    passReqToCallback: true，才可以把callback的第一個參數拿到req裡
    這樣才可以呼叫req.flash()客製化訊息
    */
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    // callback function 驗證使用者
    (req, email, password, cb) => {
      // 查詢User資料庫帳號是否存在
      User.findOne({ where: { email } }).then(user => {
        // 帳號不存在
        if (!user) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤'))
        bcrypt.compare(password, user.password).then(res => {
          // 密碼錯誤
          if (!res) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤'))

          // 驗證通過
          return cb(null, user)
        })
      })
    }
  )
)

const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}

passport.use(
  new JWTStrategy(jwtOptions, (jwtPayload, cb) => {
    User.findByPk(jwtPayload.id)
      .then(user => cb(null, user))
      .catch(err => cb(err))
  })
)

// 序列化 - 將資料轉為可儲存形式的過程(process)
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

// 反序列化 - 在需要的時候，可以將資料恢復原先狀態
passport.deserializeUser((id, cb) => {
  User.findByPk(id)
    .then(user => {
      // 使用toJSON()將資料簡化成容易取用的樣子
      user = user.toJSON()
      return cb(null, user)
    })
    .catch(err => cb(err))
})

module.exports = passport
