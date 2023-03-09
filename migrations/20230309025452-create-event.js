'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sender_id: {
        type: Sequelize.STRING
      },
      type_name: {
        type: Sequelize.STRING
      },
      timestamp: {
        type: Sequelize.FLOAT
      },
      intent_name: {
        type: Sequelize.STRING
      },
      action_name: {
        type: Sequelize.STRING
      },
      data: {
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Events')
  }
}
