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
        type: Number,
    }],
    groupPhoto: String,
    lastedMessage: {
        type: Schema.Types.ObjectId,
        require: false,
        ref: "Message",
        default: null,
    },
    administrator: {
        type: Number,
        require: false,
    },
    seenBy: [{
        type: Number,
        require: false
    }],
    background: {
        type: Schema.Types.ObjectId,
        ref: "Background",
        require: false
    },
    status: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
}
);

const Chat = mongoose.model('Chat', ChatModel);

module.exports = Chat;