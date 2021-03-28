const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const moment = require('moment')
const RoomModel = require('../models/Room')

// FINDING ROOM IN DB
router.get('/:id', ensureAuthenticated, (req, res) => {
    const { user } = req;
    const id = req.params.id;
    RoomModel.findOne({ _id: id })
        .populate({ path: 'messages', populate: { path: 'author' } })
        .exec((error, room) => {
            if (error) {
                console.log(error);
            }

            // PICKING OUT DATA TO RENDER
            const { messages } = room;

            const timestamp = moment(messages.time).format('YYYY MMMM D, HH:mm');

            // RENDER CHATROOM
            res.render('chatroom', {
                user,
                messages,
                timestamp,
                room,
            });
        });
});

module.exports = router;