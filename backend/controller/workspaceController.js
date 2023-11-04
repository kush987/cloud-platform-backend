const { json } = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const UserInstance = require('../models/UsersInstance');
const WorkSpace = require('../models/workspaceModel');
const connectDB = require('../config/db');
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
        let projectDesc = req.body.projectDesc;

        try{
            await client.connect();
            const db = client.db('rcloud');
            const projectsCollection = db.collection('workspace');
            const result = WorkSpace.create({'user_id':user_id,'projectId':projectId,'projectName':projectName,'projectDesc':projectDesc})
            res.send({'message':'done'})
        }catch (err){
            res.send({'message':err})
            console.log(err)
        }
    }

    getAllWorkSpace = async (req,res,next) =>{
        let userId = req.params.param
        WorkSpace.find({ 'user_id': userId }, (err, documents) => {
            if (err) {
                res.status(500).json({ message: "An error occurred while fetching documents" });
            } else {
                if (documents.length === 0) {
                    res.status(404).json({ message: "No documents found for the given user_id" });
                } else {
                    res.status(200).json({ data: documents });
                }
            }
        });
        
    }


    editWorkSpace = async (req,res,next) =>{
        try {
            const filter = { user_id: req.body.user_id, projectId: req.body.projectId };
            const update = { };
    
            // Use Mongoose's findOneAndUpdate method
            const updatedWorkspace = await WorkSpace.findOneAndUpdate(filter, update, { new: true });
    
            if (!updatedWorkspace) {
                return res.status(404).json({ message: "Workspace not found" });
            }
    
            res.json({ message: "Workspace updated", updatedWorkspace });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Error updating workspace" });
        }
    
    }

    deleteWorkSpace = async(req,res,next) =>{
        console.log(req.body,"resbody");
        const result = await WorkSpace.findOneAndDelete({projectId: req.params.id }, function (err, docs) { 
            if (err){ 
                res.send({message:"Error to delete"});
            } 
        }); 
        console.log("-->")
        res.send({message:"Project got Deleted",result});  
    }
}

module.exports = new WorkSpaceController;