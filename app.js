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
var countdown = 60;
var counting = false;
var table = [];
var isBidExpecting = false;
var RedIndex = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
var blackIndex = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33];
var first = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
var second = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
var third = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
var isAdminResult = false;
var adminIndex = 0;
// Game Function
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createResult(index) {
    var first12bids = table[37].bids;
    var second12bids = table[38].bids;
    var third12Bids = table[39].bids;
    var firstBids = table[40].bids;
    var secondBids = table[41].bids;
    var thirdBids = table[42].bids;
    var evenBids = table[43].bids;
    var oddBids = table[44].bids;
    var blackBids = table[45].bids;
    var redBids = table[46].bids;
    var oneToEighteenBids = table[47].bids;
    var nineteenToThirtySixBids = table[48].bids;
    if (index >= 1 && index <= 12) {
        first12bids.forEach(async function (item) {
            var amount = item.value;
            amount = amount * 3;
            await Player.findOneAndUpdate({ _id: item.player }, { $inc: { 'coins': amount } }).exec();

        });
    }
    if (index >= 13 && index <= 24) {
        second12bids.forEach(async function (item) {
            var amount = item.value;
            amount = amount * 3;
            await Player.findOneAndUpdate({ _id: item.player }, { $inc: { 'coins': amount } }).exec();
        });
    }
    if (index >= 25 && index <= 36) {
        third12Bids.forEach(async function (item) {
            var amount = item.value;
            amount = amount * 3;
            await Player.findOneAndUpdate({ _id: item.player }, { $inc: { 'coins': amount } }).exec();
        });
    }
    if (first.includes(index)) { 
        firstBids.forEach(async function (item) {
            var amount = item.value;
            amount = amount * 3;
            await Player.findOneAndUpdate({ _id: item.player }, { $inc: { 'coins': amount } }).exec();
        });
    }
    if (second.includes(index)) { 
        secondBids.forEach(async function (item) {
            var amount = item.value;
            amount = amount * 3;
            await Player.findOneAndUpdate({ _id: item.player }, { $inc: { 'coins': amount } }).exec();
        });
    }
    if (third.includes(index)) { 
        thirdBids.forEach(async function (item) {
            var amount = item.value;
            amount = amount * 3;
            await Player.findOneAndUpdate({ _id: item.player }, { $inc: { 'coins': amount } }).exec();
        });
    }
    if (index % 2 === 0 && index === 0) {
        evenBids.forEach(async function (item) {
            var amount = item.value;
            amount = amount * 2;
            await Player.findOneAndUpdate({ _id: item.player }, { $inc: { 'coins': amount } }).exec();
        });
    }
    if (index % 2 !== 0 && index === 0) {
        oddBids.forEach(async function (item) {
            var amount = item.value;
            amount = amount * 2;
            await Player.findOneAndUpdate({ _id: item.player }, { $inc: { 'coins': amount } }).exec();
        });
    }
    if (RedIndex.includes(index)) {
        redBids.forEach(async function (item) {
            var amount = item.value;
            amount = amount * 2;
            await Player.findOneAndUpdate({ _id: item.player }, { $inc: { 'coins': amount } }).exec();
        });
    }
    if (blackIndex.includes(index)) {
        blackBids.forEach(async function (item) {
            var amount = item.value;
            amount = amount * 2;
            await Player.findOneAndUpdate({ _id: item.player }, { $inc: { 'coins': amount } }).exec();
        });
    }
    if (index >= 1 && index <= 18) {
        oneToEighteenBids.forEach(async function (item) {
            var amount = item.value;
            amount = amount * 2;
            await Player.findOneAndUpdate({ _id: item.player }, { $inc: { 'coins': amount } }).exec();
        });
    }
    if (index >= 19 && index <= 36) {
        nineteenToThirtySixBids.forEach(async function (item) {
            var amount = item.value;
            amount = amount * 2;
            await Player.findOneAndUpdate({ _id: item.player }, { $inc: { 'coins': amount } }).exec();
        });
    }
}

function startNewGame() { 
    table = [];
    countdown = 60;
    counting = true;
    isAdminResult = false;
    isBidExpecting = true;
    for (var i = 0; i <= 36; i++) {
        var option = new Option(i);
        table.push(option);
    }
    table.push(new Option('1st 12')); // 37
    table.push(new Option('2nd 12')); // 38
    table.push(new Option('3rd 12')); // 39
    table.push(new Option('1st')); // 40
    table.push(new Option('2nd')); // 41
    table.push(new Option('3rd')); // 42
    table.push(new Option('Even')); // 43
    table.push(new Option('Odd')); // 44
    table.push(new Option('Black')); // 45
    table.push(new Option('Red')); // 46
    table.push(new Option('1-18')); // 47
    table.push(new Option('19-36')); // 48
}

async function generateResult() { 
    var index; var minValue
    var tableValue = [];
    for (var l = 0; l <= 36; l++) {
        tableValue.push(table[l]);
    }
    tableValue.sort(function (a, b) {
        return a.totalAmount - b.totalAmount;
    });
    var sortedTable = tableValue;
    var prob = Math.random();
    if (prob <= -6.6) {
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
            if (isAdminResult === false) {
                index = getRandomInt(0, tableValue.length);
            } else if (isAdminResult === true) {
                index = adminIndex;
            }
            await createResult(index);
            io.sockets.emit('result', { result: tableValue[index] });
            startNewGame();
            
        } else {
            if (isAdminResult === false) {
                index = getRandomInt(0, tableValue.length);
            } else if (isAdminResult === true) {
                index = adminIndex;
            }
            await createResult(index);
            io.sockets.emit('result', { result: tableValue[index] });
            startNewGame();
        }
    } else {
         minValue = tableValue[0].totalAmount;
        for (var k = 0; k < tableValue.length; k++) { 
            if (tableValue[k].totalAmount !== minValue) { 
                tableValue.splice(k, 1);
            }
        }
        if (isAdminResult === false) {
            index = getRandomInt(0, tableValue.length);
        } else if (isAdminResult === true) {
            index = adminIndex;
        }
        await createResult(index);
        io.sockets.emit('result', { result: tableValue[index] });
        startNewGame();
    }
}


//Socket Logic
startNewGame();

setInterval(function () {
    if (countdown <= 0) { 
        isBidExpecting = false;
        generateResult();
        return;
    }
    if (!counting) return;
    countdown--;
    io.sockets.emit('timer', { countdown: countdown })
}, 1000);
io.on('connection', (socket) => {
    var thisPlayerID
    console.log(socket.handshake.query.id);
    console.log("Connection Made");

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
        var amount = bid.amount;
        var index = bid.index;
        Player.findOneAndUpdate({ _id: id }, { $inc: { 'coins': -(amount) } }).then(player => {
            if (player) { 
                var newBid = new Bid(amount, id);
                console.log(newBid);
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
        socket.emit('adminBidUpdate', table);
    });
    

    socket.on('changeResult', function (data) {
        isAdminResult = true;
        adminIndex = data.index;
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

