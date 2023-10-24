const express = require('express');
const analyticsController= require('../controller/analyticsController');

const {verifyUser} = require('../middleware/middleware');
const router = express.Router();

router.get('/get-stats/:param',verifyUser,analyticsController.getAnalytics);

module.exports = router