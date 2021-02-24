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

module.exports = router;