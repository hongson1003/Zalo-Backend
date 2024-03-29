'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Post extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Post.belongsTo(models.User);
            Post.hasMany(models.Comment, {
                foreignKey: 'postId'
            })
        }
    }
    Post.init({
        id: {
            type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
        },
        content: DataTypes.STRING,
        like: DataTypes.INTEGER,
        love: DataTypes.INTEGER,
        userId: DataTypes.INTEGER,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'Post',
    });
    return Post;
};