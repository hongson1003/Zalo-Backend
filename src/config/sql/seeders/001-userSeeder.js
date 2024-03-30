'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    return queryInterface.bulkInsert('User', [
      {
        userName: 'Hồng Sơn Nguyễn',
        phoneNumber: '0935201508',
        password: '$2b$10$N9x0b4NSvFDunLRsV7zAgejqFN93IV8l.GvRHuwh9t7/e8d2Wy4jy',
        // avatar: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/hsn-avatar.jpg'
      },
      {
        userName: 'Phạm Văn Khoa',
        phoneNumber: '0339331841',
        password: '$2b$10$N9x0b4NSvFDunLRsV7zAgejqFN93IV8l.GvRHuwh9t7/e8d2Wy4jy',
        // avatar: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/pvk-avatar.jpg'
      },
      {
        userName: 'Lưu Trung Nghĩa',
        phoneNumber: '0815950975',
        password: '$2b$10$N9x0b4NSvFDunLRsV7zAgejqFN93IV8l.GvRHuwh9t7/e8d2Wy4jy',
        // avatar: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/ltn-avatar.jpg'
      },
      {
        userName: 'Ngô Nhật Thái',
        phoneNumber: '0961306963',
        password: '$2b$10$N9x0b4NSvFDunLRsV7zAgejqFN93IV8l.GvRHuwh9t7/e8d2Wy4jy',
        // avatar: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/ntt-avatar.jpg'
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
