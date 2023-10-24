const express = require('express');
const instanceController = require('../controller/instanceController');

const {verifyUser} = require('../middleware/middleware');
const router = express.Router();

router.post('/create-instance',verifyUser, instanceController.createInstance);
router.post('/remove-instance',verifyUser, instanceController.removeInstance);
router.post('/start-instance/:param',verifyUser,instanceController.startInstance)
router.post('/stop-instance/:param',verifyUser, instanceController.stopInstance);
router.get('/get-instances/:param',verifyUser, instanceController.getInstance);

module.exports = router