var mongoose = require('mongoose');

const masterAdminSchema = mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    coins: { type: Number, default: 0 }
});

module.exports = mongoose.model('MasterAdmin', masterAdminSchema);