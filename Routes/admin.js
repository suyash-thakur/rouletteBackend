/* eslint-disable no-unused-vars */
const express = require("express"),
    router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({ message: 'API Working' });
});

module.exports = router;