const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environments = require('./helpers/environments');
const data = require('./lib/data')
const { sendTwilioSms } = require('./helpers/notification')

const app = {};

app.config = {
    port: 5000
}



// data.update('test', 'new', { name: 'AAAA', age: 22,job:'coding' }, (err) => {
//     console.log(err);
// })


app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(app.config.port, () => {
        console.log(`listening to port ${environments.port}`);
    })
};

app.handleReqRes = handleReqRes;

app.createServer();