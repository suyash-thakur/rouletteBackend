var mongoose = require('mongoose');

const masterRequest = mongoose.Schema({
    areaAdmin: { type: String, ref: 'AreaAdmin' },
    masterAdmin: { type: String, ref: 'MasterAdmin' }
});

module.exports = mongoose.model('MasterRequest', masterRequest);