const express = require('express');
const {verifyUser} = require('../middleware/middleware');
const workSpace = require('../controller/workspaceController');
const router = express.Router();

router.post("/create",verifyUser,workSpace.createSpace);

module.exports = router