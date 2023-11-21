const mongoose = require("mongoose");

const userInstanceSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    appName:{
        type: String,
        required: true,
    },
    projectId: {
        type: String,
        required: true,
    },
    container_id: {
        type: String,
        required: true,
    },
    instance_name: {
        type: String,
        required: true,
    },
    storage_path:{
        type: String,
        required:true,
    },
    status: {
        type: String
    }
});

const UserInstance = mongoose.model("usersinstance", userInstanceSchema);

module.exports = UserInstance;
