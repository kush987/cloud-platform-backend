const { json } = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const UserInstance = require('../models/UsersInstance');
const WorkSpace = require('../models/workspaceModel');
const { MongoClient, ObjectID } = require('mongodb');

class WorkSpaceController{
    generateRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          result += characters.charAt(randomIndex);
        }
        return result;
      }
    createSpace = async (req,res,next) => {
        const client = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true });
        const projectID = new ObjectID();
        let user_id = req.body.user_id;
        let projectId = req.body.projectId? req.body.projectId+'-'+this.generateRandomString(6):projectID+'-'+this.generateRandomString(6);
        let projectName = req.body.projectName;

        try{
            await client.connect();
            const db = client.db('rcloud');
            const projectsCollection = db.collection('workspace');
            const result = WorkSpace.create({'user_id':user_id,'projectId':projectId,'projectName':projectName})
            res.send({'message':'done'})
        }catch (err){
            res.send({'message':err})
            console.log(err)
        }
    }
}

module.exports = new WorkSpaceController;