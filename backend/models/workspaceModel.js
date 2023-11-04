const mongoose = require("mongoose");

const WorkSpaceSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    projectId:{
        type: String,
    },
    projectName: {
        type: String,
        required: true,
    },
    projectDesc:{
        type:String,
        required: true,
    }
});

const WorkSpace = mongoose.model("workspace", WorkSpaceSchema);

module.exports = WorkSpace;