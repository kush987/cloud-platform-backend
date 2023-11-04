const express = require('express');
const {verifyUser} = require('../middleware/middleware');
const workSpace = require('../controller/workspaceController');
const router = express.Router();

router.post("/create",verifyUser,workSpace.createSpace);
router.get("/get-workspace/:param",verifyUser,workSpace.getAllWorkSpace);
router.put("/edit-workspace",verifyUser,workSpace.editWorkSpace);
router.delete("/delete-workspace/:id",verifyUser,workSpace.deleteWorkSpace);
module.exports = router