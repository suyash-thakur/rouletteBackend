require("dotenv").config();

const express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose");
const admin = require('./Routes/admin');
const app = express();
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', admin);
app.listen(process.env.PORT || 3000, function () {
    console.log('Server listening on port 3000.');
});
