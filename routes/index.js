const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Room = require('../models/Room');

// WELCOME PAGE
router.get('/', (req, res) => res.render('welcome'));

// DASHBOARD
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    const { user } = req;
    Room.find().exec((error, rooms) => {
        res.render('dashboard', {
            user,
            rooms,
        });
    });
});

module.exports = router;