const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChatModel = Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    type: {
        type: String,
        required: true,
        enum: ['GROUP_CHAT', 'PRIVATE_CHAT'],
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    groupPhoto: String,
    lastedMessage: {
        type: {
            users: [{
                type: Schema.Types.ObjectId,
                ref: 'User',
                require: true
            }],
            id: {
                type: Schema.Types.ObjectId,
                require: true,
                ref: "Message"
            }
        }
    },
    pinnedMessages: {
        type: Schema.Types.ObjectId,
        ref: "Message"
    },
    status: Boolean,
}, {
    timestamps: true,
}
);

const Chat = mongoose.model('Chat', ChatModel);

module.exports = Chat;