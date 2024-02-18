const mongoose = require('mongoose');
const { Schema } = mongoose;

const StoryModel = Schema({
    _id: Schema.Types.ObjectId,
    image: String,
    music: String,
    video: String,
    tags: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true,
}
);

const Story = mongoose.model('Story', StoryModel);

module.exports = Story;