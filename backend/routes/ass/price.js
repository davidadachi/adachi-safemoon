const express = require('express');
const router = express.Router();
const Controller = require('../../app/api/controllers/ass/price');

router.get('/', Controller.getPrice);

module.exports = router;