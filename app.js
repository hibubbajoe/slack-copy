const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const http = require('http');
const socket = require('socket.io');
const moment = require('moment')
const path = require('path');
const { userJoin, getCurrentUser } = require('./utils/users');
const UserModel = require('./models/User');
const RoomModel = require('./models/Room');
const MessageModel = require('./models/Message');
const app = express();
const server = http.createServer(app);
const io = socket(server);

// PASSPORT CONFIG
require('./config/passport')(passport);


// DB CONFIG
const db = require('./config/keys').MongoURI;
const User = require('./models/User');

// CONNECT TO MONGO
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// EJS 
app.use(expressLayouts);
app.set('view engine', 'ejs');

// SET STATIC FOLDER
app.use(express.static(path.join(__dirname, 'public')));

// BODYPARSER
app.use(express.urlencoded({ extended: false }));

app.use(express.json());

// EXPRESS SESSION
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    //cookie: { secure: true }
}))

// PASSPORT MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

// CONNECT FLASH
app.use(flash());

// GLOBAL VARS
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})


// ROUTES
app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api'));
app.use('/chatroom', require('./routes/chatroom'));
app.use('/users', require('./routes/users'));
app.use('/profile', require('./routes/profile'));
app.use('/room', require('./routes/room'));

// SOCKET CONNECTION
io.on('connection', socket => {

    // ADD USER TO ROOM
    socket.on('join', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        UserModel.updateOne({ username: user.username },
            (error) => { if (error) { console.log(error); } });
        socket.join(user.room);
    });

    // ADD MESSAGE WITH META DATA AND SENDS TO ALL USERS IN ROOM
    socket.on('chatMessage', (message) => {
        const user = getCurrentUser(socket.id);
        const msg = {
            message,
            time: moment().format('YYYY MMMM D, HH:mm'),
            author: user.username,
        };

        io.to(user.room).emit('message', msg);


        // PUSH MESSAGE TO DB 
        UserModel.findOne({ username: user.username }).exec(
            (error, currentUser) => {
                if (error) {
                    throw error;
                }
                // GIVE AUTHOR ID TO ATTACH TO MESSAGE
                msg.author = currentUser._id;
                const newMessage = new MessageModel(msg);
                RoomModel.findOneAndUpdate(
                    { _id: user.room },
                    { $push: { messages: newMessage._id } },
                    (error) => {
                        if (error) {
                            console.log(error);
                        }
                    }
                );
                // SAVE TO DB
                newMessage.save((error, result) => {
                    if (error) {
                        return handleError(error);
                    }
                });
            }
        );
    });

});


const PORT = 3000 || process.env.PORT;
server.listen(PORT, console.log(`Server is connected to port ${PORT}`))