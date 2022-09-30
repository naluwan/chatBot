'use strict'
const bcrypt = require('bcryptjs')

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        cpny_id: '0',
        cpny_name: 'admin',
        chatbot_name: 'admin',
        email: 'root@interinfo.com.tw',
        password: await bcrypt.hash('Love0109', 10),
        is_admin: 1,
        created_at: new Date(),
        updated_at: new Date(),
        image: 'https://i.imgur.com/iL6DE9f.png'
      },
      {
        cpny_id: '0109',
        cpny_name: 'testCompany',
        chatbot_name: 'test chat bot',
        email: 'test123@interinfo.com.tw',
        password: await bcrypt.hash('12345', 10),
        is_admin: 0,
        created_at: new Date(),
        updated_at: new Date(),
        image: 'https://i.imgur.com/iL6DE9f.png'
      },
      {
        cpny_id: '123',
        cpny_name: '123',
        chatbot_name: '123',
        email: '123@gmail.com',
        password: await bcrypt.hash('123', 10),
        is_admin: 0,
        created_at: new Date(),
        updated_at: new Date(),
        image: 'https://i.imgur.com/iL6DE9f.png'
      }
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', {})
  }
}
