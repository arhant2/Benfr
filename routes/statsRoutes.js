const express = require('express');

const statsController = require('../controllers/statsController');

const router = express.Router();

router.get('/', statsController.attachStats, statsController.getStats);

module.exports = router;
