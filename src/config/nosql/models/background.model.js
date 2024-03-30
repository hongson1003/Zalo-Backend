const mongoose = require('mongoose');
const { Schema } = mongoose;

const BackgroundModel = Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    headerColor: String,
    messageColor: String,
    url: String,
}, {
    timestamps: true,
}
);

const Background = mongoose.model('Background', BackgroundModel);

module.exports = Background;