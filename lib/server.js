const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
// const environments = require('../helpers/environments');
// const data = require('../lib/data')
// const { sendTwilioSms } = require('./helpers/notification')

const server = {};

server.config = {
    port: 5000
}



// data.update('test', 'new', { name: 'AAAA', age: 22,job:'coding' }, (err) => {
//     console.log(err);
// })


server.createServer = () => {
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(server.config.port, () => {
        console.log(`listening to port ${server.config.port}`);
    })
};

server.handleReqRes = handleReqRes;

server.init = () => {
    server.createServer();
};

module.exports = server;