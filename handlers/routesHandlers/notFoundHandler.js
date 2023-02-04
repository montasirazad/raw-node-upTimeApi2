
const handler = {};

handler.notFoundHandler = (requestedProperties, callback) => {
    callback(404, {
        message: 'This is not found Handler'
    })
}

module.exports = handler;



