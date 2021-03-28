const express = require('express');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

// USER MODEL
const user = require('../models/User');

// LOGIN PAGE
router.get('/login', (req, res) => {
    res.render('login')
});
// REGISTER PAGE
router.get('/register', (req, res) => {
    res.render('register')
});

// REGISTER HANDLE
router.post('/register', (req, res) => {
    const { name, username, email, password, password2 } = req.body;
    let errors = [];

    // CHECK REQ FIELDS
    if (!username || !name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    // CHECK PASSWORDS MATCH
    if (password !== password2) {
        errors.push({ msg: 'Password do not match' });
    }

    // CHECK PASS LENGTH
    if (password.length < 6) {
        errors.push({ msg: 'Password needs to be more than 6 characters' })
    }

    if (errors.length > 0) {
        res.render('register', {
            errors, name, email, password, password2
        })
    } else {
        // VALIDATION PASSED
        User.findOne({ $or: [{ email: email }, { username: username }] })
            .then(user => {
                if (user) {
                    // USER EXISTS
                    errors.push({ msg: 'Email and/or username is already registered' });
                    res.render('register', {
                        errors, name, username, email, password, password2
                    });
                }


                else {
                    const newUser = new User({
                        name, email, username, password
                    });
                    // HASH PASSWORD
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            // SET PASSWORD TO HASH
                            newUser.password = hash;
                            // SAVE USER
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered and can log in');
                                    res.redirect('login');
                                })
                                .catch(err => console.log(err));
                        })
                    });
                }
            });
    }
});

// LOGIN HANDLE
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// LOGOUT HANDLE
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out!');
    res.redirect('/users/login')
})


module.exports = router;