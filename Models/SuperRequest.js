var mongoose = require('mongoose');

const superRequest = mongoose.Schema({
    masterAdmin: { type: String, ref: 'MasterAdmin' }
});

module.exports = mongoose.model('SuperRequest', superRequest);