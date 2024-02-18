const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChatHistoryModel = Schema({
    _id: Schema.Types.ObjectId,
    chatId: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'Chat'
    },
    messageId: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'Message'
    },
    content: String,
}, {
    timestamps: true,
}
);

const ChatHistory = mongoose.model('Chat', ChatHistoryModel);

module.exports = ChatHistory;