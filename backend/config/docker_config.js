const docker = require('dockerode');

// const dockerConnect = async () =>{
//     const docConnect = new docker({ host: 'http://localhost', port: 2375 });
//     return docConnect;
// }
const dockerAPI = "http://localhost:2375";
module.exports = dockerAPI;