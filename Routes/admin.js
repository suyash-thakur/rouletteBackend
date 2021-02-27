/* eslint-disable no-unused-vars */
const express = require("express"),
    MasterAdmin = require('../Models/MasterAdmin'),
    AreaAdmin = require("../Models/AreaAdmin"),
    Player = require('../Models/Player'),
    router = express.Router();
var rug = require('random-username-generator');
var generatePassword = require('password-generator');

router.get('/', (req, res) => {
    res.status(200).json({ message: 'API Working' });
});

router.post('/createMaster', (req, res) => {
    const masterAdmin = new MasterAdmin({
        password: req.body.password
    });
    masterAdmin.save().then( async (masterAdmin) => {
        for (var i = 0; i < 30; i++) { 
            var areaAdmin = new AreaAdmin({
                password: generatePassword(),
                masterAdmin: masterAdmin._id
            });
            await areaAdmin.save().then((areaAdmin) => {
                var playerArray = [];
                for (var j = 0; j < 30; j++) { 
                    var player = new Player({
                        password: generatePassword(),
                        areaAdmin: areaAdmin._id
                    });
                    playerArray.push(player);
             
                }
                Player.collection.insertMany(playerArray).then(player => {
                    console.log("Player Created");
                });
            });
        }
        res.status(201).json({ masterAdmin: masterAdmin });
    });
});

router.put('/addCoinMaster', (req, res) => {
    var coinAdd = req.body.coins
    MasterAdmin.findOneAndUpdate({ _id: req.body.id }, { $inc: { 'coins': coinAdd }}, { new: true }, function (err, masterAdmin) {
        if (err) { 
            res.status(500).json(err);
        } if (masterAdmin) { 
            res.status(200).json({ message: "Coin Added", masterAdmin: masterAdmin });
        }
    });
});
router.get('/masterAdmin', (req, res) => {
    MasterAdmin.find({}).then(masterAdmin => { 
        res.status(200).json(masterAdmin);
    })
});
router.post('/deleteMasterAdmin', async (req, res) => {
    const ID = req.body.id;
    var areaAdminIdArray = [];
    await AreaAdmin.find({ masterAdmin: ID }).select('_id').then(areaAdmin => {
        areaAdmin.forEach(item => {
            areaAdminIdArray.push(item._id);
        });
    });
    await Player.deleteMany({ areaAdmin: areaAdminIdArray });

    AreaAdmin.deleteMany({ masterAdmin: ID }).then(areaAdmin => {
        MasterAdmin.deleteOne({ _id: ID }).then(responce => { 
            res.status(200).json({ message: "Master Admin deleted" });
        });
    });
});

router.put('/updateMasterCredential', (req, res) => {
    MasterAdmin.findOneAndUpdate({ _id: req.body.id }, {  password: req.body.password }, { new: true }).then(masterAdmin => {
        res.status(200).json({ message: 'Update successful', masterAdmin: masterAdmin });
    }); 
});
router.post('/addMoneyArea', (req, res) => {
    AreaAdmin.findOneAndUpdate({ _id: req.body.id }, { $inc: { 'coins': req.body.coins } }, { new: true }).then(areaAdmin => {
        MasterAdmin.findOneAndUpdate({ _id: req.body.masterId }, { $inc: { 'coins': -(req.body.coins) } }, { new: true }).then(masterAdmin => {
            res.status(200).json({ message: 'Coin Added', areaAdmin: areaAdmin, masterAdmin: masterAdmin });
        });
    });
});
router.post('/addMoneyPlayer', (req, res) => {
    Player.findOneAndUpdate({ _id: req.body.id }, { $inc: { 'coins': req.body.coins } }, { new: true }).then(player => {
        AreaAdmin.findByIdAndUpdate({ _id: req.body.areaAdminId }, { $inc: { 'coins': -(req.body.coins) } }, { new: true }).then(areaAdmin => { 
            res.status(200).json({ message: 'Coin Added', player: player, areaAdmin: areaAdmin });
        })
    });
});
router.put('/updatePlayer', async (req, res) => {
    var isMoneyRedeem = req.body.isMoneyRollBack;
    if (isMoneyRedeem === 'true') {
        var player = await Player.find({ _id: req.body.playerId }).exec();
        var coins = player[0].coins;
        AreaAdmin.findOneAndUpdate({ _id: req.body.areaAdminId }, { $inc: { 'coins': coins } }, { new: true }).then(areaAdmin => {
            Player.findByIdAndUpdate({ _id: req.body.playerId }, { password: req.body.password, coins: 0 }, { new: true }).then(player => {
                res.status(200).json({ message: 'Player Updated', player: player, areaAdmin: areaAdmin });
            });
        });
    } else { 
        Player.findByIdAndUpdate({ _id: req.body.playerId }, {  password: req.body.password }, { new: true }).then(player => {
            res.status(200).json({ message: 'Player Updated', player: player });
        });
    }
});

router.put('/transferMoneyPlayer', (req, res) => {
    var coins = req.body.coins;
    Player.findOneAndUpdate({ _id: req.body.payerId }, { $inc: { 'coins': -coins } }, { new: true }).then(payer => {
        Player.findByIdAndUpdate({ _id: req.body.payeeId }, { $inc: { 'coins': coins } }, { new: true }).then(payee => {
            res.status(200).json({ message: 'Coins Transferred', payee: payee, payer: payer });
        });
    });
});
router.get('/areaAdmin/:id', (req, res) => {
    console.log(req.params.id);
    AreaAdmin.find({ masterAdmin: req.params.id }).then(areaAdmin => {
        res.status(200).json({ areaAdmin });
    });
});

router.get('/player/:id', (req, res) => {
    Player.find({ areaAdmin: req.params.id }).then(player => {
        res.status(200).json({ player: player });
    });
});
module.exports = router;