var mongoose = require('mongoose');

const superRequest = mongoose.Schema({
    masterAdmin: { type: String, ref: 'MasterAdmin' },
    amount: {type: Number}

});

module.exports = mongoose.model('SuperRequest', superRequest);