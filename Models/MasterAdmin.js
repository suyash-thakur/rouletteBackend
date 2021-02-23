var mongoose = require('mongoose');

const masterAdminSchema = mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    coins: { type: Number, default: 0 },
    areaAdmin: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AreaAdmin', validate: {
        validator: function() {
          return this.areaAdmin.length <= 30;
        },
        message: 'Array exceeds max size.'
      } }]
    
});

module.exports = mongoose.model('MasterAdmin', masterAdminSchema);