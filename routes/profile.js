const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { ensureAuthenticated } = require('../config/auth');
const User = require('../models/User');

// USER PROFILE
router.get('/', ensureAuthenticated, (req, res) => {
    const { user } = req;
    res.render('profile', { user });
});

// USER PROFILE UPDATE PAGE
router.post('/update', ensureAuthenticated, async (req, res) => {
    const { _id, password } = req.user;
    const { name, email } = req.body;
    const userChanges = await User.findOneAndUpdate({ _id }, {
        $set: {
            name,
            email,
            password
        }
    })
    await userChanges.save();
    res.redirect('/dashboard')
});


// RENDER PAGE FOR UPLOADING PROFILE PICTURE
router.get('/profilepic', ensureAuthenticated, (req, res) => {
    res.render('photoupload')
})


const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, callback) => {
        callback(
            null,
            file.fieldname + '-' + req.user._id + path.extname(file.originalname)
        );
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 2000000,
    },
    fileFilter: (req, file, callback) => {
        checkFileType(file, callback);
    },
}).single('profilePic');

const checkFileType = (file, callback) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return callback(null, true);
    } else {
        callback('Error: Images Only!');
    }
};


// CATCHING PROFILE PIC UPLOAD
router.post('/profilepic/update', ensureAuthenticated, (req, res) => {
    const { _id } = req.user;
    upload(req, res, (error) => {
        if (error) {
            res.render('profilepic', {
                msg: error,
            });
        }
        if (req.file) {
            const profilepic = `/uploads/${req.file.filename}`;
            User.findOneAndUpdate({ _id }, { profilepic }, (error) => {
                if (error) {
                    console.log(error);
                }
            });
            res.redirect('/profile');
        } else {
            res.render('profilepic', {
                msg: 'Error: No File Selected',
            });
        }
    });
});


module.exports = router;