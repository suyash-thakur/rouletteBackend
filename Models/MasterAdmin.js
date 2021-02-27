var mongoose = require('mongoose');
var { nanoid } = require('nanoid');

const masterAdminSchema = mongoose.Schema({
    _id: {
        type: String,
        default: () => nanoid(11)
      },
    password: { type: String, required: true },
    coins: { type: Number, default: 0 }
});

module.exports = mongoose.model('MasterAdmin', masterAdminSchema);