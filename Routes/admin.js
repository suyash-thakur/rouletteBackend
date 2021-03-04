/* eslint-disable no-unused-vars */
const express = require("express"),
    MasterAdmin = require('../Models/MasterAdmin'),
    AreaAdmin = require("../Models/AreaAdmin"),
    Player = require('../Models/Player'),
    router = express.Router();
var rug = require('random-username-generator');
var generatePassword = require('password-generator');

const AreaRequest = require('../Models/AreaRequest');
const MasterRequest = require('../Models/MasterRequest');
const SuperRequest = require('../Models/SuperRequest');
const { request } = require("express");


router.get('/', (req, res) => {
    res.status(200).json({ message: 'API Working' });
});
var SuperAdminUser = 'superAdm';
var SuperAdminPass = 'superAdmPass';
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
        res.status(201).json(masterAdmin);
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
    console.log(req.body);
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
        res.status(200).json({ masterAdmin });
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
    Player.find({ _id: req.body.payerId }).select('coins').then(payeeCoin => {
        if (payeeCoin[0].coins >= coins) { 
            Player.findOneAndUpdate({ _id: req.body.payerId }, { $inc: { 'coins': -coins } }, { new: true }).then(payer => {
                Player.findByIdAndUpdate({ _id: req.body.payeeId }, { $inc: { 'coins': coins } }, { new: true }).then(payee => {
                    res.status(200).json({ message: 'Coins Transferred', payee: payee, payer: payer });
                });
            });
        } else {
            res.status(401).json({ message: 'Not enough balance' });
        }
    });

});
router.get('/areaAdmin/:id', (req, res) => {
    console.log(req.params.id);
    AreaAdmin.find({ masterAdmin: req.params.id }).select('_id password coins ').then(areaAdmin => {
        res.status(200).json(areaAdmin);
    });
});

router.get('/player/:id', (req, res) => {
    Player.find({ areaAdmin: req.params.id }).then(player => {
        res.status(200).json(player);
    });
});

router.post('/login', (req, res) => {
    console.log(req.body);
    Player.find({ _id: req.body.id }).then(player => {
        if (player.length > 0) {
            if (player[0].password === req.body.password) {
                res.status(200).json('Player');
            } else {
                res.status(401).json('Wrong Password');
            }
        } else {
            AreaAdmin.find({ _id: req.body.id }).then(areaAdmin => {
                if (areaAdmin.length > 0) {
                    if (areaAdmin[0].password === req.body.password) {
                        res.status(200).json('Area Admin');
                    } else {
                        res.status(401).json('Wrong Password');
                    }
                } else {
                    MasterAdmin.find({ _id: req.body.id }).then(masterAdmin => {
                        if (masterAdmin.length > 0) {
                            if (masterAdmin[0].password === req.body.password) {
                                res.status(200).json('Master Admin');
                            }
                            else {
                                res.status(200).json('Wrong Password');
                            }
                        } else if (SuperAdminUser === req.body.id) {
                            if (SuperAdminPass === req.body.password) {
                                res.status(200).json('Super Admin');
                            } else {
                                res.status(200).json('Wrong Password');
                            }
                        } else {
                            console.log('res loop');
                            res.status(200).json('Wrong ID');
                        }
                    });
                }
            });
        }
    });
});

router.post('/playerRequest', async (req, res) => {
    var areaAdminId = await Player.find({ _id: req.body.playerId }).select('areaAdmin').exec();
    console.log(areaAdminId);
    const areaRequest = new AreaRequest({
        player: req.body.playerId,
        areaAdmin: areaAdminId[0].areaAdmin
    });
    areaRequest.save().then(request => {
        res.status(200).json(request);
    });
});

router.get('/areaRequest/:id', (req, res) => {
    AreaRequest.find({ areaAdmin: req.params.id }).then(request => { 
        res.status(200).json(request);
    })
});

router.put('/resolveAreaRequest/:id', (req, res) => {
    AreaAdmin.findOneAndDelete({ _id: req.params.id }).then(request => {
        res.status(200).json("Request Deleted");
    });
});

router.post('/areaRequest', async (req, res) => {
    var masterAdmin = await AreaAdmin.find({ _id: req.body.areaAdminId }).select('masterAdmin').exec();

    const masterRequest = new MasterRequest({
        areaAdmin: req.body.areaAdminId,
        masterAdmin: masterAdmin[0].masterAdmin
    });
    masterRequest.save().then(request => {
        res.status(200).json(request);
    });
});

router.get('/masterRequest/:id', (req, res) => {
    MasterRequest.find({ masterAdmin: req.params.id }).then(request => { 
        res.status(200).json(request);
    })
});

router.put('/resolveMasterRequest/:id', (req, res) => {
    MasterRequest.findOneAndDelete({ _id: req.params.id }).then(request => {
        res.status(200).json("Request Deleted");
    });
});


router.post('/superRequest', (req, res) => {
    const superRequest = new SuperRequest({
        masterAdmin: req.body.masterAdminId
    });
    superRequest.save().then(request => {
        res.status(200).json(request);
    });
});

router.post('/getInfo', (req, res) => {
    if (req.body.type == 'Player') {
        Player.find({ _id: req.body.id }).then(data => {
            res.status(200).json(data);
        });
    }
    else if (req.body.type == 'Area Admin') {
        AreaAdmin.find({ _id: req.body.id }).then(data => {
            res.status(200).json(data);
        });
    }
    else if (req.body.type == 'Master Admin') {
        MasterAdmin.find({ _id: req.body.id }).then(data => {
            res.status(200).json(data);
        });
    }
    else { 
        res.status(200).json('Undefined Type');
    }
});

router.get('/superRequest', (req, res) => {
    SuperRequest.find({ }).then(request => { 
        res.status(200).json(request);
    })
});
router.put('/resolveSuperRequest/:id', (req, res) => {
    SuperRequest.findOneAndDelete({ _id: req.params.id }).then(request => {
        res.status(200).json("Request Deleted");
    });
});

module.exports = router;