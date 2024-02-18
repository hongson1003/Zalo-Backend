const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageModel = Schema({
    _id: Schema.Types.ObjectId,
    chatId: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'Chat'
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    content: String,
    videos: [{
        type: String,
    }],
    images: [{
        type: String
    }],
    sticker: String,
    status: Boolean
}, {
    timestamps: true,
}
);

const Message = mongoose.model('Message', MessageModel);

module.exports = Message;