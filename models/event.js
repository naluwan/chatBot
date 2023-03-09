'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Event.init(
    {
      senderId: DataTypes.STRING,
      typeName: DataTypes.STRING,
      timestamp: DataTypes.FLOAT,
      intentName: DataTypes.STRING,
      actionName: DataTypes.STRING,
      data: DataTypes.TEXT
    },
    {
      sequelize,
      modelName: 'Event',
      tableName: 'Events',
      underscored: true
    }
  )
  return Event
}
