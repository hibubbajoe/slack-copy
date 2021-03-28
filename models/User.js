const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        required: true,
    },
    rooms: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Room',
        },
    ],
    profilepic: {
        type: String,
        default: "/uploads/thumb.jpg",
    }
});

module.exports = mongoose.model('User', UserSchema);
