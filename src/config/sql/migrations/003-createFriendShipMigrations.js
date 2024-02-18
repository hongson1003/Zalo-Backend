'use strict';
const statusFriendShip = require("../../../ultils/types").statusFriendShip;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('FriendShip', {
            user1Id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.INTEGER,
                references: {
                    model: 'user',
                    key: 'id'
                }
            },
            user2Id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.INTEGER,
                references: {
                    model: 'user',
                    key: 'id'
                }
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: statusFriendShip.PENDING,
            },
            createdAt: {
                type: Sequelize.DATE,
            },
            updatedAt: {
                type: Sequelize.DATE,
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('FriendShip');
    }
};