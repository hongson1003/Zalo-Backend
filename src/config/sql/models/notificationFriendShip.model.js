'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class NotificationFriendShip extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            NotificationFriendShip.belongsTo(models.User, {
                foreignKey: 'senderId',
                as: 'sender'
            })

            NotificationFriendShip.belongsTo(models.User, {
                foreignKey: 'receiverId',
                as: 'receiver'
            })
        }
    }
    NotificationFriendShip.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        senderId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'FriendShip',
                key: 'user1Id'
            }
        },
        receiverId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'FriendShip',
                key: 'user2Id'
            }
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: DataTypes.BOOLEAN,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'NotificationFriendShip',
    });
    return NotificationFriendShip;
};