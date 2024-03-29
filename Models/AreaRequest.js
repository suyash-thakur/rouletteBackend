var mongoose = require('mongoose');

const areaRequest = mongoose.Schema({
    player: { type: String, ref: 'Player' },
    areaAdmin: { type: String, ref: 'AreaAdmin' },
    amount: {type: Number}
});

module.exports = mongoose.model('AreaRequest', areaRequest);