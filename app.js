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
var isBidExpecting = false;


// Game Function
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function startNewGame() { 
    table = [];
    countdown = 1000;
    counting = true;
    isBidExpecting = true;
    for (var i = 0; i <= 36; i++) {
        var option = new Option(i);
        table.push(option);
    }
    table.push(new Option('1st 12'));
    table.push(new Option('2nd 12'));
    table.push(new Option('3rd 12'));
    table.push(new Option('Even'));
    table.push(new Option('Odd'));
    table.push(new Option('Black'));
    table.push(new Option('Red'));
    table.push(new Option('1-18'));
    table.push(new Option('19-36'));
}

function generateResult() { 
    var index; var minValue
    var tableValue = table;
    tableValue.sort(function (a, b) {
        return a.totalAmount - b.totalAmount;
    });
    var sortedTable = tableValue;
    var prob = Math.random();
    if (prob <= 0.6) {
        for (var i = 0; i < tableValue.length; i++) {
            if (tableValue[i].totalAmount !== 0) {
                tableValue.splice(i, 1);
            }
        }
        if (tableValue.length === 0) {
            tableValue = sortedTable;
             minValue = tableValue[0].totalAmount;
            for (var j = 0; j < tableValue.length; j++) { 
                if (tableValue[j].totalAmount !== minValue) { 
                    tableValue.splice(j, 1);
                }
            }
            index = getRandomInt(0, tableValue.length);
            io.sockets.emit('result', { result: tableValue[index] });
            
        } else {
            index = getRandomInt(0, tableValue.length);
            io.sockets.emit('result', { result: tableValue[index] });
        }
    } else {
         minValue = tableValue[0].totalAmount;
        for (var k = 0; k < tableValue.length; k++) { 
            if (tableValue[k].totalAmount !== minValue) { 
                tableValue.splice(k, 1);
            }
        }
        index = getRandomInt(0, tableValue.length);
        io.sockets.emit('result', { result: tableValue[index] });
    }
}
//Socket Logic
setInterval(function () {
    if (countdown <= 0) { 
        isBidExpecting = false;
        return;
    }
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
        if (isBidExpecting == true) {
        
        var id = bid.id;
        var amount = bid.value;
        var index = bid.index;
        Player.findOneAndUpdate({ _id: id }, { $inc: { 'coins': -(amount) } }).then(player => {
            if (player) { 
                var newBid = new Bid(amount, id);
                table[index].bids.push(newBid);
                table[index].totalAmount = table[index].totalAmount + amount;
                socket.emit('bidStatus', { message: 'Bid Placed' });
            } else {
                socket.emit('bidStatus', { message: 'Error Placing Bid' });

            }
           
        });
        } else if (isBidExpecting == false) {
            socket.emit('bidStatus', { message: 'Error Cannot Place Bid Now' });
    }

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

