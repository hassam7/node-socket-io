const path = require('path');
const express = require("express");
const socketIO = require('socket.io');
const http = require('http');
const {
    generateMessage,
    generateLocationMessage
} = require('./utils/message');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var {
    isRealString
} = require("./utils/validation.js");
var {
    Users
} = require('./utils/users');
const publicPath = path.join(__dirname, "../public");


var users = new Users();
io.on('connection', (socket) => {
    console.log("New User Connected");



    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`));
        }
    });



    socket.on("join", (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback("Invalid room or name");
        }
        params.room = params.room.toLowerCase();
        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);
        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
        socket.emit('newMessage', generateMessage("Admin", "Welcome to the chat room"));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage("Admin", `${params.name} Joined`));
        callback();
    });

    socket.on('createLocationMessage', (coords) => {
        var user = users.getUser(socket.id);
        if(user){
        io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
            
        }        
    });


    socket.on('createMessage', (message, cb) => {
        // console.log('createMessage', message);
        var user = users.getUser(socket.id);
        if (user && isRealString(message.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
            cb();

        }

    })
});
app.get('/chatrooms',(req,res)=>{
    res.status(200).json(users.getRoomsList().map(function(room){
        return {value:room,data:room};
    }));
});
app.use(express.static(publicPath));
server.listen(3000, () => {
    console.log("Server Up and running at 3000");
})