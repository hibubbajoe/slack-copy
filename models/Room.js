const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    users: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    isPrivate: {
        type: Boolean,
        default: false,
    },
    messages: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Message',
        },
    ],
    admins: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
});

module.exports = mongoose.model('Room', RoomSchema);
