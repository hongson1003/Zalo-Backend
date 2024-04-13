const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageModel = Schema({
    _id: Schema.Types.ObjectId,
    chat: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Chat'
    },
    sender: {
        type: Number,
        required: true,
    },
    content: String,
    type: String,
    videos: [{
        type: String,
        required: false,
        default: null
    }],
    urls: [{
        type: String,
        required: false,
        default: null
    }],
    sticker: String,
    reactions: {
        type: [
            {
                userId: Number,
                icon: String,
                count: {
                    type: Number,
                    default: 1,
                },
            },
        ],
        default: [],
    },
    unViewList: {
        type: [Number],
        default: []
    },
    isDelete: {
        type: Boolean,
        default: false,
    },
    isPin: {
        type: Boolean,
        default: false,
    },
    reply: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
}, {
    timestamps: true,
}
);

const Message = mongoose.model('Message', MessageModel);

module.exports = Message;