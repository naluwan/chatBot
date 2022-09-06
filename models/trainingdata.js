'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class TrainingData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TrainingData.init(
    {
      name: DataTypes.STRING,
      content: DataTypes.TEXT,
      userId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'TrainingData',
      tableName: 'TrainingDatas',
      underscored: true
    }
  )
  return TrainingData
}
