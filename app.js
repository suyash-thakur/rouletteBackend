/* eslint-disable no-unused-vars */

// Global Packages

require("dotenv").config();

const express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose");
const admin = require('./Routes/admin');
const Player = require('./Models/Player');
const app = express();
var cors = require('cors');
const http = require('http').Server(app);
const PlayerLive = require('./Class/player');
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
    }
});
const connection_url = 'mongodb+srv://Admin:Admin@123@cluster0-uwias.mongodb.net/gameBackend?retryWrites=true&w=majority';
mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(() => { 
    console.log("Connected to database!");
}).catch(() => { 
    console.log("Connection failed!");
});
mongoose.set('useFindAndModify', false);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Seperate module for REST API
app.use('/', admin);


//Game Global Variable
var players = [];

//Socket Logic
io.on('connection', (socket) => {
    console.log(socket.handshake.query.id);
    Player.find({ _id: socket.handshake.query.id }).then(player => {
        if (player) {
            var playerLive = new PlayerLive(player[0]._id, player[0].coins);
            players[playerLive.id] = playerLive;
            console.log(players);

            socket.emit('connected', {message: 'Connected'});
        } else { 
            socket.emit('connected', {message: 'ErrorConnecting'});

        }
  
    });

    

    socket.on('disconnect', function () {
        console.log('Player Disconnected');
    });

});

  // Starting Server
http.listen(process.env.PORT || 3000, function () {
    console.log('Server listening on port 3000.');
});

