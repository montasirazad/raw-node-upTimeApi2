const handler = {};

handler.sampleHandler = (requestedProperties, callback) => {
    callback(200, {
        message: 'This is sample Handler'
    })
}


module.exports = handler;