var mongoose = require('mongoose');
var { nanoid } = require('nanoid');
const areaAdminSchema = mongoose.Schema({
    _id: {
        type: String,
        default: () => nanoid(11)
      },
    password: { type: String, required: true },
    coins: { type: Number, default: 0 },
    masterAdmin: {type: String, ref:'MasterAdmin'}

});

module.exports = mongoose.model('AreaAdmin', areaAdminSchema);