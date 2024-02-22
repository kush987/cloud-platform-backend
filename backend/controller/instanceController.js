const { json } = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const UserInstance = require('../models/UsersInstance');
const { execSync } = require('child_process');
const WorkSpace = require('../models/workspaceModel');
const dockerAPI = require('../config/docker_config');
const axios = require('axios');

class InstanceController {


    createInstance = async (req, res, next) => {
        let instance_name = req.body.instance;
        let resultInstance = await Product.findOne({ 'instance_name': instance_name });
        let appName = req.body.appName;
        let projectId = req.body.projectId;
        const username = resultInstance.toJSON().instance_name + '-' + req.body.username;
        let container_id = '';
        let instance_Name = '';
    
        if (!projectId) {
            res.send({ 'message': "please select your project workspace" });
            return;
        }
    
        try {
            let dockerApiEndpoint = dockerAPI; // Replace with your Docker API endpoint
            if (instance_name === 'blender') {
                const response = await axios.post(`${dockerApiEndpoint}/containers/create`, {
                    name: username,
                    Image: resultInstance.toJSON().image,
                    HostConfig: {
                        NetworkMode: 'my_custom_network',
                        SecurityOpt: ['seccomp=unconfined'],
                        PortBindings: { '3000/tcp': [{}] },
                        RestartPolicy: { Name: 'unless-stopped' },
                        Binds: [`/media/diatoz/New Volume/testAngular/nodejs-code-server/${username}:/config`]
                    }
                });
                container_id = response.data.Id;
            } else if (instance_name === 'vscode') {
                const response = await axios.post(`${dockerApiEndpoint}/containers/create`, {
                    name: username,
                    Image: resultInstance.toJSON().image,
                    HostConfig: {
                        PortBindings: { '8443/tcp': [{}] },
                        RestartPolicy: { Name: 'unless-stopped' },
                        Binds: [`/media/diatoz/New Volume/testAngular/nodejs-code-server/${username}:/config`]
                    },
                    Env: [
                        'PUID=1000',
                        'PGID=1000',
                        'TZ=Etc/UTC',
                        'PASSWORD=',
                        'SUDO_PASSWORD=password',
                        'PROXY_DOMAIN=code-server.my.domain',
                        'DEFAULT_WORKSPACE=/config/workspace'
                    ]
                });
                container_id = response.data.Id;
            }
    
            // Start the container
            await axios.post(`${dockerApiEndpoint}/containers/${container_id}/start`);
    
            instance_Name = resultInstance.toJSON().instance_name;
    
            await UserInstance.create({
                'user_id': req.body.user_id,
                'appName': appName,
                'projectId': projectId,
                'container_id': container_id,
                'instance_name': resultInstance.toJSON().instance_name,
                'storage_path': `/media/diatoz/New Volume/testAngular/nodejs-code-server/${username}`,
                'status': 'running'
            });
    
            res.send({
                'user_id': req.body.user_id,
                'appName': appName,
                'projectId': projectId,
                'container_id': container_id,
                'instance_name': instance_Name,
                'storage_path': `/media/diatoz/New Volume/testAngular/nodejs-code-server/${username}`,
                'status': 'running'
            });
        } catch (error) {
            console.error('Error creating or starting container:', error.message);
            res.status(500).send({ error: 'Internal Server Error' });
        }
    }

    startInstance = async (req, res, next) => {
        try {
            const container_id = req.body.container_id;
            const dockerApiEndpoint = dockerAPI; // Replace with your Docker API endpoint
    
            // Send a POST request to start the container
            await axios.post(`${dockerApiEndpoint}/containers/${container_id}/start`);
    
            // Update the status in the database
            await UserInstance.findOneAndUpdate(
                { 'user_id': req.params.param, 'container_id': req.body.container_id },
                { $set: { 'status': 'running' } }
            );
    
            res.send({ message: "Instance is started" });
        } catch (error) {
            console.error('Error starting container:', error.message);
            res.status(500).send({ message: "Error starting instance" });
        }
    }

    stopInstance = async (req, res, next) => {
        try {
            const containerId = req.body.container_id;
            const dockerApiEndpoint = dockerAPI; // Replace with your Docker API endpoint
    
            // Send a POST request to stop the container
            await axios.post(`${dockerApiEndpoint}/containers/${containerId}/stop`);
    
            // Update the status in the database
            await UserInstance.findOneAndUpdate(
                { 'user_id': req.params.param, 'container_id': req.body.container_id },
                { $set: { 'status': 'stopped' } }
            );
    
            res.send({ message: "Instance is stopped", status: "stopped" });
        } catch (error) {
            console.error('Error stopping container:', error.message);
            res.status(500).send({ message: "Error stopping instance" });
        }
    }

    removeInstance = async (req, res, next) => {
        try {
            const containerId = req.body.container_id;
            const dockerApiEndpoint = dockerAPI; // Replace with your Docker API endpoint
    
            // Send a POST request to stop the container
            const inspectResponse = await axios.get(`${dockerApiEndpoint}/containers/${containerId}/json`);
            if (inspectResponse.data.State.Status !== 'exited') {
                // If not already stopped, stop the container
                await axios.post(`${dockerApiEndpoint}/containers/${containerId}/stop`);
            }
    
            // Send a DELETE request to remove the container
            await axios.delete(`${dockerApiEndpoint}/containers/${containerId}`);
    
            // Update the status in the database
            await UserInstance.findOneAndDelete({ container_id: containerId }, (err, deletedDoc) => {
                if (err) {
                    console.error('Error deleting document:', err);
                } else if (deletedDoc) {
                    console.log('Deleted document:', deletedDoc);
                } else {
                    console.log('Document not found');
                }
            });
    
            res.send({ message: 'Instance is deleted' });
        } catch (error) {
            console.error('Error removing container:', error.message);
            res.status(500).send({ message: 'Error removing instance' });
        }
    }

    getInstance = async (req, res, next) => {
        try {
            const userId = req.params.param;
            const dockerApiEndpoint = dockerAPI; // Replace with your Docker API endpoint
    
            // Retrieve containers for the user
            const userContainers = await UserInstance.find({ user_id: userId });
    
            // Extract information for each container
            const extractedValues = [];
            for (const container of userContainers) {
                const containerId = container.container_id;
                
                // Retrieve information about the container from the Docker API
                const inspectResponse = await axios.get(`${dockerApiEndpoint}/containers/${containerId}/json`);
                
                if (inspectResponse.data.State.Running === true) {
                    const portMappings = inspectResponse.data.NetworkSettings.Ports;
                    const key = Object.keys(portMappings)[0]; // Assuming there's only one port mapping
                    
                    const hostPort = portMappings[key][0].HostPort.split('/');
                    const hostIp = portMappings[key][0].HostIp.split('/');
                    
                    const ipAddress = hostPort[0] ? `${hostIp[0]}:${hostPort[0]}` : '';
                    
                    extractedValues.push({ 'container_id': container, 'ip_address': ipAddress });
                } else {
                    extractedValues.push({ 'container_id': container, 'ip_address': '' });
                }
            }

            res.send({ 'data': extractedValues });
        } catch (error) {
            console.error('Error retrieving container information:', error.message);
            res.status(500).send({ message: 'Error retrieving container information' });
        }
    }
    
}

module.exports = new InstanceController;