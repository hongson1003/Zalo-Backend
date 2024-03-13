const mongoose = require('mongoose');
const connectNoSql = require('../config');
const Background = require('../models/background.model');
connectNoSql();
// Dữ liệu mẫu bạn muốn thêm
const sampleBackgrounds = [
    {
        name: 'Cat 1',
        backgroundUrl: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/cat.1.bg.jpg'
    },
    {
        name: 'Cat 2',
        backgroundUrl: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/cat.2.bg.jpg'
    },
    {
        name: 'Friend 1',
        backgroundUrl: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/friend.1.bg.jpg'
    },
    {
        name: 'Friend 2',
        backgroundUrl: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/friend.2.bg.jpg'
    },
    {
        name: 'Hourse 1',
        backgroundUrl: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/house.1.bg.jpg'
    },
    {
        name: 'Hourse 3',
        backgroundUrl: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/house.3.bg.jpg'
    },
    {
        name: 'Love 1',
        backgroundUrl: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/love.1.bg.jpg'
    },
    {
        name: 'Love 2',
        backgroundUrl: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/love.2.bg.jpg'
    },
    {
        name: 'Panda 1',
        backgroundUrl: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/panda.1.bg.jpg'
    },
    {
        name: 'Panda 3',
        backgroundUrl: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/panda.3.bg.jpg'
    },
    {
        name: 'Thiên nhiên 1',
        backgroundUrl: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/thiennhien.1.bg.jpg'
    },
    {
        name: 'Tym 1',
        backgroundUrl: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/tym.1.bg.jpg'
    },
    {
        name: 'Vũ trụ 1',
        backgroundUrl: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/vutru.1.bg.jpg'
    },
    {
        name: 'Vũ trụ 2',
        backgroundUrl: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/vutru.2.bg.jpg'
    },
    {
        name: 'Vũ trụ 3',
        backgroundUrl: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/vutru.3.bg.jpg'
    },
];

// Thêm dữ liệu vào cơ sở dữ liệu
async function seedBackgrounds() {
    try {
        await Background.deleteMany(); // Xóa tất cả các dữ liệu trong collection trước khi thêm mới
        const createdBackgrounds = await Background.insertMany(sampleBackgrounds); // Thêm dữ liệu vào collection
        console.log('Sample backgrounds created:', createdBackgrounds);
    } catch (error) {
        console.error('Error seeding backgrounds:', error);
    } finally {
        mongoose.disconnect(); // Ngắt kết nối sau khi hoàn thành thêm dữ liệu
    }
}

// Gọi hàm seedBackgrounds để thêm dữ liệu
seedBackgrounds();
