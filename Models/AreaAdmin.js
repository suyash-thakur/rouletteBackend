var mongoose = require('mongoose');

const areaAdminSchema = mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    coins: { type: Number, default: 0 },
    masterAdmin: {type: mongoose.Schema.Types.ObjectId, ref:'MasterAdmin'}

});

module.exports = mongoose.model('AreaAdmin', areaAdminSchema);