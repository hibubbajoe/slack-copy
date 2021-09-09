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

// CONNECT TO MONGO
mongoose.connect(process.env.MONGO_URI || db, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
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

// SOCKET CONNECTION WHEN ENTERING ROOM
io.on('connection', (socket) => {

    // catching socket on join from client
    socket.on('join', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        UserModel.updateOne(
            { username: user.username },
            { isOnline: true },
            (error) => {
                if (error) {
                    console.log(error);
                }
            }
        );
        // user join on selected room
        socket.join(user.room);

        io.to(user.room).emit('roomUsers');
    });

    // catching message from client 
    socket.on('chatMessage', (message) => {
        const user = getCurrentUser(socket.id);
        const msg = {
            message,
            time: moment().format('YYYY MMMM D, HH:mm'),
            author: user.username,
        };

        // emitting message to client 
        io.to(user.room).emit('message', msg);

        // pushing message to DB 
        UserModel.findOne({ username: user.username }).exec(
            (error, currentUser) => {
                if (error) {
                    throw error;
                }
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
                // saving new message to DB
                newMessage.save((error, result) => {
                    if (error) {
                        return handleError(error);
                    }
                });
            }
        );
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, console.log(`Server is connected to port ${PORT}`))