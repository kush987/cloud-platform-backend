const { json } = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const UserInstance = require('../models/UsersInstance');
const { execSync } = require('child_process');
const WorkSpace = require('../models/workspaceModel');

class InstanceController {

    createInstance = async (req, res, next) => {

        let instance_name = req.body.instance;
        let resultInstance = await Product.findOne({ 'instance_name': instance_name });
        // let workSpace = await WorkSpace.findOne({'user_id':req.body.user_id})
        let projectId = req.body.projectId;
        const username = resultInstance.toJSON().instance_name + '-' + req.body.username;
        let container_id = '';
        let instance_Name = '';
        if(!projectId){
            res.send({'message':"please select your project workspace"})
        }else{

            try {
                // const result = execSync('docker-compose -f /media/diatoz/New Volume/testAngular/ticketzapp/e-commerce-store/blender-compose.yml up -d');
                if (instance_name ==='blender'){
    
                    const result = execSync(`docker run -d \
                   --name=${username} --network=my_custom_network \
                   --security-opt seccomp=unconfined \
                   -e PUID=1000 \
                   -e PGID=1000 \
                   -e TZ=Etc/UTC \
                   -e SUBFOLDER=/ \
                   -p 3000 \
                   -v /path/to/config:/config \
                   --restart unless-stopped \
                   -P \
                   ${resultInstance.toJSON().image}`)
                }else if (instance_name ==='vscode'){
                    const result = execSync(`docker run -d \
                    --name=${username} \
                    -e PUID=1000 \
                    -e PGID=1000 \
                    -e TZ=Etc/UTC \
                    -e PASSWORD=123456 \
                    -e HASHED_PASSWORD= \
                    -e SUDO_PASSWORD=password \
                    -e SUDO_PASSWORD_HASH= \
                    -e PROXY_DOMAIN=code-server.my.domain \
                    -e DEFAULT_WORKSPACE=/config/workspace \
                    -p 8443 \
                    -v /path/to/appdata/config:/config \
                    --restart unless-stopped \
                    ${resultInstance.toJSON().image}
                  `)
                }
            } catch (error) {
                console.error(`Error executing the command: ${error}`);
            }
            try {
                const result = execSync(`docker ps -qf "name=${username}"`)
                container_id = result.toString().replace(/\s+/g, '');
                instance_Name = resultInstance.toJSON().instance_name;
                await UserInstance.create({ 'user_id': req.body.user_id, 'projectId':projectId, 'container_id': container_id, 'instance_name': resultInstance.toJSON().instance_name,'status':'running' });
    
            } catch (error) {
                res.send("error")
            }
            res.send({ 'user_id': req.body.user_id,'projectId':projectId, 'container_id': container_id , 'instance_name': instance_Name ,'status':'running'})
        }
    }

    startInstance = async (req,res,next) =>{
        let container_id = req.body.container_id;
        try{
            const result = await execSync(`docker start ${container_id}`);
            await UserInstance.findOneAndUpdate({'user_id':req.params.param,'container_id':req.body.container_id},[{$set:{'status':'running'}}])
        } catch (err){
            res.send({message:"error"})
        }
        res.send({message:"Instance is start"})
    }

    stopInstance = async (req,res,next) =>{
       let container_id =  req.body.container_id;
       try {
        const result = await execSync(`docker stop ${container_id}`);
        try{

            await UserInstance.findOneAndUpdate({'user_id':req.params.param,'container_id':req.body.container_id},[{$set:{'status':'stop'}}])
        }catch(err){
            res.send({message: err})
        }
       } catch(err){
        res.send({message:'error',err})
       }
       res.send({message:'Instance is stop', status:"stop"})
    }

    removeInstance = async (req, res, next) => {
        let container_id = req.body.container_id;
        try {

            const result = execSync(`docker stop ${container_id}`)
            await execSync(`docker rm ${container_id}`)
            await UserInstance.findOneAndDelete({ container_id: container_id }, (err, deletedDoc) => {
                if (err) {
                    console.log({message:'Error deleting document:'});
                } else if (deletedDoc) {
                    console.log({message:'Deleted document:'});
                } else {
                    console.log({message:'Document not found'});
                }
            });
        } catch (error) {
            res.send({message:'error',error})
        }
        res.send({message:'Instance is deleted'})
    }

    getInstance = async (req, res, next) =>{
        let containerID = await UserInstance.find({user_id: req.params.param},( err, documents)=>{
            if(err){
                res.send({message:'Error retrieving documents: ',err});
            }
                // res.send('All documents in the collection: ', documents);
        });
        let extractedValues = [];
        for(let i= 0; i<containerID.length;i++){
            const result = await execSync(`docker port ${containerID[i].toJSON().container_id.replace(/\s+/g, '')}`);
            const line = result.toString().split('\n')[0];
            const match = line.match(/\d+\.\d+\.\d+\.\d+:\d+/);
            if(match){
                extractedValues.push({'container_id':containerID[i],'ip_addresss':match[0]})
            }else{
                extractedValues.push({'container_id':containerID[i],'ip_addresss':''})
            }
        }
        res.send({'data':extractedValues});
    }
}

module.exports = new InstanceController;