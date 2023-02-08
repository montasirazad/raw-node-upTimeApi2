const url = require('url');
const http = require('http');
const https = require('https');
const { parsedJSON } = require('../helpers/utilities');
const data = require('./data');
const { sendTwilioSms } = require('../helpers/notification');

const workers = {};








workers.gatherAllChecks = () => {
    data.list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach(check => {

                data.read('checks', check, (err, originalCheckData) => {
                    if (!err && originalCheckData) {

                        workers.validateCheckData(parsedJSON(originalCheckData));
                    } else {
                        console.log('Error: reading one of the check data')
                    }
                })
            })
        } else {
            console.log('Error : could not find any checks to process')
        }
    })
};

workers.validateCheckData = (originalCheckData) => {

    let originalData = originalCheckData;

    if (originalCheckData && originalCheckData.id) {

        originalData.state = typeof (originalCheckData.state) === 'string' &&
            ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';

        originalData.lastChecked = typeof (originalCheckData.lastChecked) === 'number' &&
            originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

        workers.performCheck(originalData)
    } else {
        console.log('Error:check was invalid or not properly formatted')
    }
};

workers.performCheck = (originalCheckData) => {

    let checkOutCome = {
        error: false,
        responseCode: false
    };

    let outComeSent = false;


    const parsedUrl = url.parse(`${originalCheckData.protocol}://${originalCheckData.url}`, true);
    const hostName = parsedUrl.hostname;
    const path = parsedUrl.path;

    const requestDetails = {

        protocol: `${originalCheckData.protocol}:`,
        hostName: hostName,
        method: originalCheckData.method.toUpperCase(),
        path: path,
        timeout: originalCheckData.timeoutSeconds * 1000
    };

    const protocolToUse = originalCheckData.protocol === 'http' ? http : https;

    let req = protocolToUse.request(requestDetails, (res) => {

        const status = res.statusCode;

        checkOutCome.responseCode = status;

        if (!outComeSent) {
            workers.processCheckOutCome(originalCheckData, checkOutCome);
            outComeSent = true;
        }



    });


    req.on('error', (e) => {

        checkOutCome = {
            error: true,
            value: e
        };

        if (!outComeSent) {
            workers.processCheckOutCome(originalCheckData, checkOutCome);
            outComeSent = true;
        }

    });

    req.on('timeout', (e) => {

        checkOutCome = {
            error: true,
            value: 'timeout'
        };

        if (!outComeSent) {
            workers.processCheckOutCome(originalCheckData, checkOutCome);
            outComeSent = true;
        }

    });

    req.end();

};

workers.processCheckOutCome = (originalCheckData, checkOutCome) => {

    let state = !checkOutCome.error && checkOutCome.responseCode &&
        originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1 ? 'up' : 'down';

    let alertWanted = originalCheckData.lastChecked && originalCheckData.tate !== state ? true : false;

    let newCheckData = originalCheckData;

    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    data.update('checks', newCheckData.id, newCheckData, (err) => {
        if (!err) {
            if (alertWanted) {
                workers.alertUserToStatusChange(newCheckData);
            } else {
                console.log('Alert is not needed as there is no state check!')
            }

        } else {
            console.log('error trying to save check data of one of the checks')
        }
    })

};


workers.alertUserToStatusChange = (newCheckData) => {
    let msg = `Alert: your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} 
    is currently ${newCheckData.state}`;

    sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        if (!err) {
            console.log(`user alerted to a status via sms:${msg}`)
        } else {
            console.log('error sending sms to one of the user')
        }
    })
};

workers.loop = () => {
    setInterval(() => {
        workers.gatherAllChecks();
    }, 5000)
};

workers.init = () => {

    workers.gatherAllChecks();

    workers.loop();

};

module.exports = workers;