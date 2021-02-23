var mongoose = require('mongoose');

const areaAdminSchema = mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    coins: { type: Number, default: 0 },
    players: [{type: mongoose.Schema.Types.ObjectId, ref: 'Player',  validate: {
        validator: function() {
          return this.players.length <= 30;
        },
        message: 'Array exceeds max size.'
      }}]
});

module.exports = mongoose.model('MasterAdmin', areaAdminSchema);