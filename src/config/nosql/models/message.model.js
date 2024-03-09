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
        type: Number,
        ref: 'User',
        require: true,
    },
    content: String,
    videos: [{
        type: String,
        require: false,
        default: null

    }],
    images: [{
        type: String,
        require: false,
        default: null

    }],
    sticker: {
        type: String,
        require: false,
        default: null
    },
    status: Boolean
}, {
    timestamps: true,
}
);

const Message = mongoose.model('Message', MessageModel);

module.exports = Message;