var mongoose = require('mongoose');

const masterRequest = mongoose.Schema({
    areaAdmin: { type: String, ref: 'AreaAdmin' },
    masterAdmin: { type: String, ref: 'MasterAdmin' },
    amount: {type: Number}
});

module.exports = mongoose.model('MasterRequest', masterRequest);