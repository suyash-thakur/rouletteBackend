var mongoose = require('mongoose');

const playerSchema = mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    coins: { type: Number, default: 0 },
    areaAdmin: {type: mongoose.Schema.Types.ObjectId, ref:'AreaAdmin'}
});

module.exports = mongoose.model('Players', playerSchema);