const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageModel = Schema({
    _id: Schema.Types.ObjectId,
    chat: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'Chat'
    },
    sender: {
        type: Number,
        require: true,
    },
    content: String,
    type: String,
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
    sticker: String,
    status: Boolean
}, {
    timestamps: true,
}
);

const Message = mongoose.model('Message', MessageModel);

module.exports = Message;