const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Room = require('../models/Room');


// AUTHENTICATE USER
router.get('/roomform', ensureAuthenticated, (req, res) => {
    const userid = req.user._id;
    res.render('roomform', { userid });
});

// CREATE NEW ROOM AND SAVE TO DB
router.post('/roomform/createroom', ensureAuthenticated, (req, res) => {
    const { _id } = req.user;
    const { name, isPrivate, users } = req.body;

    // CREATE ROOM
    const room = new Room({
        name,
        admins: [_id],
        users,
        isPrivate
    });

    // SAVE ROOM
    room.save((error, result) => {
        if (error) {
            return handleError(error);
        }
    });
    res.end();
});


module.exports = router;