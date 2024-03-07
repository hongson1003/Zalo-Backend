'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class FriendShip extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            FriendShip.belongsTo(models.User, {
                foreignKey: 'user1Id',
                as: 'user1'
            });

            FriendShip.belongsTo(models.User, {
                foreignKey: 'user2Id',
                as: 'user2'
            });

            

        }
    }
    FriendShip.init({
        user1Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        user2Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        status: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'FriendShip',
    });
    return FriendShip;
};