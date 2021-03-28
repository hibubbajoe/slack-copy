const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET ALL MEMBERS BUT ME
router.get('/allbutme', (req, res) => {
    const { user } = req;
    User.find({ _id: { $nin: user._id } }).exec((error, users) => {
        if (users) {
            res.status(200).json(users);
        } else {
            res.status(404);
        }
    });
});

// FINDING OUT ALL USERS
router.get('/allusers', (req, res) => {
    User.find().exec((error, users) => {
        if (users) {
            res.status(200).json(users);
        } else {
            res.status(404);
        }
    });
});

// PICK OUT ME 
router.get('/findme', (req, res) => {
    const { user } = req;
    User.find({ _id: user._id }).exec((error, users) => {
        if (users) {
            res.status(200).json(users);
        } else {
            res.status(404);
        }
    });
});

module.exports = router;