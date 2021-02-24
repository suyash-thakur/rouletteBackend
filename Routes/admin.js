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
        name: req.body.name,
        password: req.body.password
    });
    masterAdmin.save().then( async (masterAdmin) => {
        for (var i = 0; i < 30; i++) { 
            var areaAdmin = new AreaAdmin({
                name: rug.generate(),
                password: generatePassword(),
                masterAdmin: masterAdmin._id
            });
            await areaAdmin.save().then((areaAdmin) => {
                var playerArray = [];
                for (var j = 0; j < 30; j++) { 
                    var player = new Player({
                        name: rug.generate(),
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
    MasterAdmin.findOneAndUpdate({ _id: req.body.id }, { name: req.body.name, password: req.body.password }, { new: true }).then(masterAdmin => {
        res.status(200).json({ message: 'Update successful', masterAdmin: masterAdmin });
    }); 
});

module.exports = router;