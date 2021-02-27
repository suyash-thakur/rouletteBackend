var mongoose = require('mongoose');
var { nanoid } = require('nanoid');

const playerSchema = mongoose.Schema({
    _id: {
        type: String,
        default: () => nanoid(11)
      },
    password: { type: String, required: true },
    coins: { type: Number, default: 0 },
    areaAdmin: {type: String, ref:'AreaAdmin'}
});

module.exports = mongoose.model('Players', playerSchema);