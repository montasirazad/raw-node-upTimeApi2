const environments = {};


environments.staging = {
    port: 8000,
    envName: 'staging',
    secretKey: 'stage',
    maxChecks: 5,
    twilio: {
        fromPhone: '+16292183529',
        accountSid: 'ACb1d51ce9bf4ccfb4a9b24693017bf22f',
        authToken: 'ede58328aba60e19e9534e16e127edc9'
    }
};

environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'production',
    maxChecks: 5,
    twilio: {
        fromPhone: '+16292183529',
        accountSid: 'ACb1d51ce9bf4ccfb4a9b24693017bf22f',
        authToken: 'ede58328aba60e19e9534e16e127edc9'
    }
}


const currentEnvironment = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : 'staging';

const environmentToExport = typeof (environments[currentEnvironment]) === 'object' ?
    environments[currentEnvironment] :

    environments.staging;

module.exports = environmentToExport;