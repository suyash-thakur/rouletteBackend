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
const Bid = require('./Class/bid');
const Option = require('./Class/option');
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
var countdown = 1000;
var counting = false;
var table = [];


// Game Function
function startNewGame() { 
    players = [];
    countdown = 1000;
    counting = true;
    for (var i = 0; i <= 36; i++) {
        var option = new Option(i);
        this.table.push(option);
    }
    this.table.push(new Option('1st 12'));
    this.table.push(new Option('2nd 12'));
    this.table.push(new Option('3rd 12'));
    this.table.push(new Option('Even'));
    this.table.push(new Option('Odd'));
    this.table.push(new Option('Black'));
    this.table.push(new Option('Red'));
    this.table.push(new Option('1-18'));
    this.table.push(new Option('19-36'));
}
//Socket Logic
setInterval(function () {
    if (countdown <= 0) return;
    if (!counting) return;
    countdown--;
    io.sockets.emit('timer', { countdown: countdown })
}, 1000);
io.on('connection', (socket) => {
    var thisPlayerID
    console.log(socket.handshake.query.id);
    Player.find({ _id: socket.handshake.query.id }).then(player => {
        if (player) {
            var playerLive = new PlayerLive(player[0]._id, player[0].coins);
            players[playerLive.id] = playerLive;
            thisPlayerID = playerLive.id;

            socket.emit('connected', {message: 'Connected'});
        } else { 
            socket.emit('connected', {message: 'ErrorConnecting'});

        }
  
    });

    socket.on('bid', function (bid) {
        var id = bid.id;
        var amount = bid.value;
        Player.findOneAndUpdate({ _id: id }, { $inc: { 'coins': -(amount) } }).then(player => {
            
        });
    });

    socket.on('disconnect', function () {
        console.log('Player Disconnected');
        delete players[thisPlayerID];
    });

});

  // Starting Server
http.listen(process.env.PORT || 3000, function () {
    console.log('Server listening on port 3000.');
});

